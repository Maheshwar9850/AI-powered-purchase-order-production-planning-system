import Inventory from '../models/Inventory.js';
import { calculateMaterialRequirements } from '../services/inventoryService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getInventory = async (req, res, next) => {
  try {
    const inventory = await Inventory.find().populate('materialId').sort({ materialCode: 1 });
    return sendSuccess(res, 'Inventory records fetched successfully', inventory);
  } catch (error) {
    next(error);
  }
};

export const getInventoryById = async (req, res, next) => {
  try {
    const record = await Inventory.findById(req.params.id).populate('materialId');
    if (!record) {
      return sendError(res, 'Inventory record not found', 'INVENTORY_NOT_FOUND', 404);
    }
    return sendSuccess(res, 'Inventory record fetched successfully', record);
  } catch (error) {
    next(error);
  }
};

export const getInventoryByMaterialId = async (req, res, next) => {
  try {
    const record = await Inventory.findOne({ materialId: req.params.materialId }).populate('materialId');
    if (!record) {
      return sendError(res, 'Inventory record not found for material ID', 'INVENTORY_NOT_FOUND', 404);
    }
    return sendSuccess(res, 'Material inventory fetched successfully', record);
  } catch (error) {
    next(error);
  }
};

export const checkInventoryForPO = async (req, res, next) => {
  try {
    const { purchaseOrderId } = req.body;
    if (!purchaseOrderId) {
      return sendError(res, 'purchaseOrderId is required in request body', 'MISSING_PARAM', 400);
    }

    const report = await calculateMaterialRequirements(purchaseOrderId);
    return sendSuccess(res, 'Inventory availability check completed successfully', report);
  } catch (error) {
    next(error);
  }
};
