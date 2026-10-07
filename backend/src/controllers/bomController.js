import BOM from '../models/BOM.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getBoms = async (req, res, next) => {
  try {
    const boms = await BOM.find().populate('productId').populate('items.materialId').sort({ createdAt: -1 });
    return sendSuccess(res, 'Bill of Materials list fetched successfully', boms);
  } catch (error) {
    next(error);
  }
};

export const getBomById = async (req, res, next) => {
  try {
    const bom = await BOM.findById(req.params.id).populate('productId').populate('items.materialId');
    if (!bom) {
      return sendError(res, 'BOM not found', 'BOM_NOT_FOUND', 404);
    }
    return sendSuccess(res, 'BOM fetched successfully', bom);
  } catch (error) {
    next(error);
  }
};
