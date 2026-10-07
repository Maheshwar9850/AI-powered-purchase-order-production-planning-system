import ProductionPlan from '../models/ProductionPlan.js';
import { generateProductionPlan as createPlanService } from '../services/productionPlanningService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getProductionPlans = async (req, res, next) => {
  try {
    const plans = await ProductionPlan.find()
      .populate('purchaseOrderId')
      .populate('schedule.productId')
      .sort({ createdAt: -1 });
    return sendSuccess(res, 'Production plans fetched successfully', plans);
  } catch (error) {
    next(error);
  }
};

export const getProductionPlanById = async (req, res, next) => {
  try {
    const plan = await ProductionPlan.findById(req.params.id)
      .populate('purchaseOrderId')
      .populate('schedule.productId');
    if (!plan) {
      return sendError(res, 'Production plan not found', 'PLAN_NOT_FOUND', 404);
    }
    return sendSuccess(res, 'Production plan fetched successfully', plan);
  } catch (error) {
    next(error);
  }
};

export const generateProductionPlan = async (req, res, next) => {
  try {
    const { purchaseOrderId } = req.body;
    if (!purchaseOrderId) {
      return sendError(res, 'purchaseOrderId is required in request body', 'MISSING_PARAM', 400);
    }

    const plan = await createPlanService(purchaseOrderId);
    return sendSuccess(res, 'Production plan generated successfully', plan, 201);
  } catch (error) {
    next(error);
  }
};