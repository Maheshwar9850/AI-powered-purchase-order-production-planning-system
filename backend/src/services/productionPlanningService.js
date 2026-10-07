import PurchaseOrder from '../models/PurchaseOrder.js';
import Product from '../models/Product.js';
import ProductionPlan from '../models/ProductionPlan.js';
import { logWorkflowEvent } from './workflowService.js';

export const generateProductionPlan = async (purchaseOrderId) => {
  const po = await PurchaseOrder.findById(purchaseOrderId);
  if (!po) {
    const err = new Error('Purchase Order not found for production planning.');
    err.statusCode = 404;
    err.errorCode = 'PO_NOT_FOUND';
    throw err;
  }

  // State awareness / Idempotency: Return existing plan if already generated
  const existingPlan = await ProductionPlan.findOne({ purchaseOrderId: po._id });
  if (existingPlan) {
    // Update metadata to correct AI references if present
    if (existingPlan.generatedBy === 'AI' || existingPlan.aiModel) {
      existingPlan.generatedBy = 'SYSTEM';
      existingPlan.aiModel = undefined;
      existingPlan.confidenceScore = undefined;
      await existingPlan.save();
    }
    return existingPlan;
  }

  const scheduleSlots = [];
  let totalQuantity = 0;
  // Default start date: 5 days from PO date or 10-Oct-2026 if historical
  const plannedStartDate = new Date(po.poDate ? po.poDate : Date.now());
  plannedStartDate.setDate(plannedStartDate.getDate() + 5);

  let currentDate = new Date(plannedStartDate);

  for (const item of po.items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      const err = new Error(`Product ${item.productCode} not found.`);
      err.statusCode = 404;
      err.errorCode = 'PRODUCT_NOT_FOUND';
      throw err;
    }

    const dailyCap = product.dailyProductionCapacity || 2500;
    let remainingToPlan = item.quantity;
    totalQuantity += item.quantity;

    while (remainingToPlan > 0) {
      const dailyQty = Math.min(remainingToPlan, dailyCap);
      scheduleSlots.push({
        date: new Date(currentDate),
        productId: product._id,
        productCode: product.productCode,
        plannedQuantity: dailyQty,
        shift: 'SHIFT_1',
        status: 'SCHEDULED'
      });
      remainingToPlan -= dailyQty;
      // Advance to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  const plannedEndDate = scheduleSlots.length > 0 ? scheduleSlots[scheduleSlots.length - 1].date : plannedStartDate;
  const totalProductionDays = scheduleSlots.length;

  const plan = await ProductionPlan.create({
    purchaseOrderId: po._id,
    status: 'PENDING_APPROVAL',
    generatedBy: 'SYSTEM',
    totalQuantity,
    plannedStartDate,
    plannedEndDate,
    totalProductionDays,
    schedule: scheduleSlots,
    assumptions: [
      `Shop-floor line capacity allocated dynamically across ${totalProductionDays} production days.`,
      'Material availability subject to stock audit and purchase request approvals.'
    ]
  });

  // Log workflow event
  await logWorkflowEvent({
    purchaseOrderId: po._id,
    eventType: 'PRODUCTION_PLAN_CREATED',
    actorType: 'SYSTEM',
    description: `System-generated shop-floor production plan created for ${totalQuantity.toLocaleString()} SETS over ${totalProductionDays} days.`,
    metadata: {
      planId: plan._id,
      totalQuantity,
      totalProductionDays,
      plannedStartDate,
      plannedEndDate
    }
  });

  // Update PO status to PLANNING or AWAITING_APPROVAL if not already past
  if (['RECEIVED', 'PROCESSING', 'EXTRACTED', 'VALIDATED', 'INVENTORY_CHECKED'].includes(po.status)) {
    po.status = 'PLANNING';
    await po.save();
  }

  return plan;
};

export default {
  generateProductionPlan
};
