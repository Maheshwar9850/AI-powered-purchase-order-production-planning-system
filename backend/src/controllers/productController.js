import Product from '../models/Product.js';
import BOM from '../models/BOM.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate('activeBomId').sort({ createdAt: -1 });
    return sendSuccess(res, 'Products fetched successfully', products);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('activeBomId');
    if (!product) {
      return sendError(res, 'Product not found', 'PRODUCT_NOT_FOUND', 404);
    }
    return sendSuccess(res, 'Product fetched successfully', product);
  } catch (error) {
    next(error);
  }
};

export const getProductActiveBom = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return sendError(res, 'Product not found', 'PRODUCT_NOT_FOUND', 404);
    }
    if (!product.activeBomId) {
      return sendError(res, 'Active BOM not configured for product', 'BOM_NOT_FOUND', 404);
    }
    const bom = await BOM.findById(product.activeBomId).populate('items.materialId');
    if (!bom) {
      return sendError(res, 'Active BOM record not found', 'BOM_NOT_FOUND', 404);
    }
    return sendSuccess(res, 'Active product BOM fetched successfully', bom);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    return sendSuccess(res, 'Product created successfully', product, 201);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!product) {
      return sendError(res, 'Product not found', 'PRODUCT_NOT_FOUND', 404);
    }
    return sendSuccess(res, 'Product updated successfully', product);
  } catch (error) {
    next(error);
  }
};
