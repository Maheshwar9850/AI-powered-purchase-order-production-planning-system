import Material from '../models/Material.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getMaterials = async (req, res, next) => {
  try {
    const materials = await Material.find().sort({ materialCode: 1 });
    return sendSuccess(res, 'Materials fetched successfully', materials);
  } catch (error) {
    next(error);
  }
};

export const getMaterialById = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return sendError(res, 'Material not found', 'MATERIAL_NOT_FOUND', 404);
    }
    return sendSuccess(res, 'Material fetched successfully', material);
  } catch (error) {
    next(error);
  }
};
