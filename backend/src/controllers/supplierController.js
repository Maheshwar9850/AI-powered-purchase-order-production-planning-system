import Supplier from '../models/Supplier.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find().populate('suppliedMaterials').sort({ supplierCode: 1 });
    return sendSuccess(res, 'Suppliers fetched successfully', suppliers);
  } catch (error) {
    next(error);
  }
};

export const getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id).populate('suppliedMaterials');
    if (!supplier) {
      return sendError(res, 'Supplier not found', 'SUPPLIER_NOT_FOUND', 404);
    }
    return sendSuccess(res, 'Supplier fetched successfully', supplier);
  } catch (error) {
    next(error);
  }
};
