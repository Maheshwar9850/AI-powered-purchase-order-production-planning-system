import PurchaseOrder from '../models/PurchaseOrder.js';
import Product from '../models/Product.js';
import BOM from '../models/BOM.js';
import Inventory from '../models/Inventory.js';
import Material from '../models/Material.js';

/**
 * Calculates raw material requirements & stock availability for a given Purchase Order.
 * Supports single-product POs and multi-product POs with material aggregation.
 */
export const calculateMaterialRequirements = async (purchaseOrderOrId) => {
  let po = purchaseOrderOrId;
  if (typeof purchaseOrderOrId === 'string' || purchaseOrderOrId instanceof String) {
    po = await PurchaseOrder.findById(purchaseOrderOrId);
  }

  if (!po) {
    const err = new Error('Purchase Order not found for inventory calculation.');
    err.statusCode = 404;
    err.errorCode = 'PO_NOT_FOUND';
    throw err;
  }

  // Material Requirement Aggregator Map: materialCode -> { materialId, materialCode, materialName, unit, requiredQuantity }
  const aggregatedRequirements = {};

  for (const poItem of po.items) {
    const product = await Product.findById(poItem.productId);
    if (!product) {
      const err = new Error(`Product not found for ID ${poItem.productId} in PO item.`);
      err.statusCode = 404;
      err.errorCode = 'PRODUCT_NOT_FOUND';
      throw err;
    }

    if (!product.activeBomId) {
      const err = new Error(`Active BOM not configured for product ${product.productCode} (${product.name}).`);
      err.statusCode = 400;
      err.errorCode = 'BOM_NOT_FOUND';
      throw err;
    }

    const bom = await BOM.findById(product.activeBomId);
    if (!bom || !bom.items || bom.items.length === 0) {
      const err = new Error(`Active BOM content invalid or empty for product ${product.productCode}.`);
      err.statusCode = 400;
      err.errorCode = 'BOM_NOT_FOUND';
      throw err;
    }

    // Explode BOM for this item
    for (const bomItem of bom.items) {
      const matCode = bomItem.materialCode;
      const requiredForLine = poItem.quantity * bomItem.quantityRequired;

      if (!aggregatedRequirements[matCode]) {
        aggregatedRequirements[matCode] = {
          materialId: bomItem.materialId,
          materialCode: bomItem.materialCode,
          materialName: bomItem.materialName,
          unit: bomItem.unit,
          requiredQuantity: 0
        };
      }

      aggregatedRequirements[matCode].requiredQuantity += requiredForLine;
    }
  }

  // Load Inventory for all required materials
  const materialCodes = Object.keys(aggregatedRequirements);
  const inventoryRecords = await Inventory.find({ materialCode: { $in: materialCodes } });
  const invMap = {};
  inventoryRecords.forEach(inv => { invMap[inv.materialCode] = inv; });

  const materialReport = [];
  let overallShortage = false;

  for (const matCode of materialCodes) {
    const req = aggregatedRequirements[matCode];
    const inv = invMap[matCode];

    const availableQuantity = inv ? inv.availableQuantity : 0;
    const reservedQuantity = inv ? inv.reservedQuantity : 0;
    const usableStock = Math.max(0, availableQuantity - reservedQuantity);
    const shortageQuantity = Math.max(0, req.requiredQuantity - usableStock);
    const status = shortageQuantity > 0 ? 'SHORTAGE' : 'SUFFICIENT';

    if (shortageQuantity > 0) {
      overallShortage = true;
    }

    materialReport.push({
      materialId: req.materialId,
      materialCode: req.materialCode,
      materialName: req.materialName,
      requiredQuantity: req.requiredQuantity,
      availableQuantity,
      reservedQuantity,
      usableQuantity: usableStock,
      shortageQuantity,
      unit: req.unit,
      status
    });
  }

  return {
    purchaseOrderId: po._id,
    poNumber: po.poNumber,
    customerName: po.customerSnapshot ? po.customerSnapshot.companyName : '',
    totalItems: po.items.length,
    overallStatus: overallShortage ? 'SHORTAGE' : 'SUFFICIENT',
    hasShortage: overallShortage,
    materials: materialReport
  };
};

export default {
  calculateMaterialRequirements
};
