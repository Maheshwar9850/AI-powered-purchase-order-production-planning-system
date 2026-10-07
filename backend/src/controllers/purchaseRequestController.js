import PurchaseRequest from '../models/PurchaseRequest.js';
import { generatePurchaseRequest as createPRService } from '../services/purchaseRequestService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getPurchaseRequests = async (req, res, next) => {
  try {
    const requests = await PurchaseRequest.find()
      .populate('purchaseOrderId')
      .populate('productionPlanId')
      .populate('supplierId')
      .populate('requestedBy', 'name email role department')
      .sort({ createdAt: -1 });
    return sendSuccess(res, 'Purchase requests fetched successfully', requests);
  } catch (error) {
    next(error);
  }
};

export const getPurchaseRequestById = async (req, res, next) => {
  try {
    const request = await PurchaseRequest.findById(req.params.id)
      .populate('purchaseOrderId')
      .populate('productionPlanId')
      .populate('supplierId')
      .populate('requestedBy', 'name email role department');
    if (!request) {
      return sendError(res, 'Purchase request not found', 'PR_NOT_FOUND', 404);
    }
    return sendSuccess(res, 'Purchase request fetched successfully', request);
  } catch (error) {
    next(error);
  }
};

export const createPurchaseRequest = async (req, res, next) => {
  try {
    const { purchaseOrderId, productionPlanId, requestedBy } = req.body;
    if (!purchaseOrderId) {
      return sendError(res, 'purchaseOrderId is required in request body', 'MISSING_PARAM', 400);
    }

    const pr = await createPRService({
      purchaseOrderId,
      productionPlanId,
      requestedByUserId: requestedBy
    });

    if (!pr) {
      return sendSuccess(res, 'No purchase request generated as inventory is 100% sufficient', null);
    }

    return sendSuccess(res, 'Purchase request created successfully', pr, 201);
  } catch (error) {
    next(error);
  }
};