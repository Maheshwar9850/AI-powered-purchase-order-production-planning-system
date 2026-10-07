import PurchaseOrder from '../models/PurchaseOrder.js';
import PurchaseRequest from '../models/PurchaseRequest.js';
import Supplier from '../models/Supplier.js';
import User from '../models/User.js';
import { calculateMaterialRequirements } from './inventoryService.js';
import { logWorkflowEvent } from './workflowService.js';

export const generatePurchaseRequest = async ({
  purchaseOrderId,
  productionPlanId = null,
  requestedByUserId = null
}) => {
  const po = await PurchaseOrder.findById(purchaseOrderId);
  if (!po) {
    const err = new Error('Purchase Order not found for Purchase Request generation.');
    err.statusCode = 404;
    err.errorCode = 'PO_NOT_FOUND';
    throw err;
  }

  // Idempotency check: Return existing PR if already generated
  const existingPR = await PurchaseRequest.findOne({ purchaseOrderId: po._id });
  if (existingPR) {
    return existingPR;
  }

  // Calculate material requirements & stock availability
  const invReport = await calculateMaterialRequirements(po);
  const shortageItems = invReport.materials.filter(m => m.shortageQuantity > 0);

  // CRITICAL RULE: If zero shortages, do NOT create a purchase request!
  if (shortageItems.length === 0) {
    return null;
  }

  // Log SHORTAGE_DETECTED event
  await logWorkflowEvent({
    purchaseOrderId: po._id,
    eventType: 'SHORTAGE_DETECTED',
    actorType: 'SYSTEM',
    description: `Material shortage detected for PO ${po.poNumber}: ${shortageItems.map(s => `${s.materialCode} (${s.shortageQuantity} ${s.unit})`).join(', ')}.`,
    metadata: {
      shortages: shortageItems
    }
  });

  // Resolve active supplier for the shortage materials
  const shortageMaterialIds = shortageItems.map(s => s.materialId);
  const supplier = await Supplier.findOne({
    suppliedMaterials: { $in: shortageMaterialIds },
    isActive: true
  });

  if (!supplier) {
    const err = new Error(`Supplier not found for shortage materials: ${shortageItems.map(s => s.materialCode).join(', ')}.`);
    err.statusCode = 400;
    err.errorCode = 'SUPPLIER_NOT_FOUND';
    throw err;
  }

  // Resolve requestedBy user (default to Procurement Manager if not provided)
  let requestedBy = requestedByUserId;
  if (!requestedBy) {
    const procUser = await User.findOne({ role: 'PROCUREMENT_MANAGER' });
    requestedBy = procUser ? procUser._id : (await User.findOne())._id;
  }

  // TEMPORARY: Hardcoded unit cost map for Phase 2 development/demo purposes only.
  // TODO: In future phases, move pricing to Material model or dedicated Pricing collection.
  // This is NOT production-ready pricing data.
  const unitCostMap = {
    'MAT-FRM-001': 450, // ₹450 / KG
    'MAT-BP-001': 85,   // ₹85 / PCS
    'MAT-ADH-001': 1200,// ₹1,200 / KG
    'MAT-SHM-001': 45,  // ₹45 / PCS
    'MAT-PKG-001': 25   // ₹25 / PCS
  };

  let totalCost = 0;
  const prItems = shortageItems.map(s => {
    const unitPrice = unitCostMap[s.materialCode] || 100;
    const itemCost = s.shortageQuantity * unitPrice;
    totalCost += itemCost;

    return {
      materialId: s.materialId,
      materialCode: s.materialCode,
      materialName: s.materialName,
      requiredQuantity: s.requiredQuantity,
      availableQuantity: s.availableQuantity,
      reservedQuantity: s.reservedQuantity,
      shortageQuantity: s.shortageQuantity,
      unit: s.unit,
      estimatedCost: itemCost
    };
  });

  // Generate Request Number: PR-2026-XXX
  const prCount = await PurchaseRequest.countDocuments();
  const requestNumber = `PR-2026-${String(prCount + 1).padStart(3, '0')}`;

  const purchaseRequest = await PurchaseRequest.create({
    requestNumber,
    purchaseOrderId: po._id,
    productionPlanId,
    supplierId: supplier._id,
    status: 'PENDING_APPROVAL',
    priority: 'HIGH',
    reason: `Automated material shortage detection for Purchase Order ${po.poNumber} (${po.customerSnapshot ? po.customerSnapshot.companyName : ''})`,
    items: prItems,
    totalEstimatedCost: totalCost,
    requestedBy
  });

  // Log PURCHASE_REQUEST_CREATED event
  await logWorkflowEvent({
    purchaseOrderId: po._id,
    eventType: 'PURCHASE_REQUEST_CREATED',
    actorType: 'SYSTEM',
    actorId: requestedBy,
    description: `Purchase Request ${requestNumber} generated for raw material procurement.`,
    metadata: {
      requestNumber,
      totalEstimatedCost: totalCost,
      itemsCount: prItems.length
    }
  });

  // Update PO status to AWAITING_APPROVAL
  po.status = 'AWAITING_APPROVAL';
  await po.save();

  return purchaseRequest;
};

export default {
  generatePurchaseRequest
};
