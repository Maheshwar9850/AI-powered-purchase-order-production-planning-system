import Approval from '../models/Approval.js';
import { createApprovalRequest, approveEntity, rejectEntity } from '../services/approvalService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getApprovals = async (req, res, next) => {
  try {
    const approvals = await Approval.find()
      .populate('requestedBy', 'name email role department')
      .populate('approvedBy', 'name email role department')
      .sort({ createdAt: -1 });
    return sendSuccess(res, 'Approvals list fetched successfully', approvals);
  } catch (error) {
    next(error);
  }
};

export const getApprovalById = async (req, res, next) => {
  try {
    const approval = await Approval.findById(req.params.id)
      .populate('requestedBy', 'name email role department')
      .populate('approvedBy', 'name email role department');
    if (!approval) {
      return sendError(res, 'Approval record not found', 'APPROVAL_NOT_FOUND', 404);
    }
    return sendSuccess(res, 'Approval record fetched successfully', approval);
  } catch (error) {
    next(error);
  }
};

export const createApproval = async (req, res, next) => {
  try {
    const { entityType, entityId, requestedBy, comments } = req.body;
    if (!entityType || !entityId) {
      return sendError(res, 'entityType and entityId are required', 'MISSING_PARAM', 400);
    }
    if (!['PRODUCTION_PLAN', 'PURCHASE_REQUEST'].includes(entityType)) {
      return sendError(res, 'entityType must be PRODUCTION_PLAN or PURCHASE_REQUEST', 'INVALID_ENTITY_TYPE', 400);
    }

    const approval = await createApprovalRequest({
      entityType,
      entityId,
      requestedByUserId: requestedBy,
      comments
    });
    return sendSuccess(res, 'Approval request submitted successfully', approval, 201);
  } catch (error) {
    next(error);
  }
};

export const approveApprovalRequest = async (req, res, next) => {
  try {
    const approvalId = req.params.id;
    const { approvedBy, comments } = req.body;

    const updatedApproval = await approveEntity({
      approvalId,
      approvedByUserId: approvedBy,
      comments
    });
    return sendSuccess(res, `Entity approved successfully`, updatedApproval);
  } catch (error) {
    next(error);
  }
};

export const rejectApprovalRequest = async (req, res, next) => {
  try {
    const approvalId = req.params.id;
    const { rejectedBy, comments } = req.body;

    const updatedApproval = await rejectEntity({
      approvalId,
      rejectedByUserId: rejectedBy,
      comments
    });
    return sendSuccess(res, `Entity rejected successfully`, updatedApproval);
  } catch (error) {
    next(error);
  }
};
