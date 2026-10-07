import Approval from '../models/Approval.js';
import ProductionPlan from '../models/ProductionPlan.js';
import PurchaseRequest from '../models/PurchaseRequest.js';
import User from '../models/User.js';
import { logWorkflowEvent } from './workflowService.js';

export const createApprovalRequest = async ({
  entityType,
  entityId,
  requestedByUserId = null,
  comments = ''
}) => {
  // Prevent duplicate active pending approvals for the same entity
  const existingApproval = await Approval.findOne({ entityType, entityId, status: 'PENDING' });
  if (existingApproval) {
    return existingApproval;
  }

  let requestedBy = requestedByUserId;
  if (!requestedBy) {
    const defaultUser = await User.findOne({ role: { $in: ['PRODUCTION_MANAGER', 'PROCUREMENT_MANAGER', 'ADMIN'] } });
    requestedBy = defaultUser ? defaultUser._id : (await User.findOne())._id;
  }

  const approval = await Approval.create({
    entityType,
    entityId,
    status: 'PENDING',
    requestedBy,
    comments,
    requestedAt: new Date()
  });

  // Resolve associated PO for logging workflow event
  let poId = null;
  if (entityType === 'PRODUCTION_PLAN') {
    const plan = await ProductionPlan.findById(entityId);
    if (plan) poId = plan.purchaseOrderId;
  } else if (entityType === 'PURCHASE_REQUEST') {
    const pr = await PurchaseRequest.findById(entityId);
    if (pr) poId = pr.purchaseOrderId;
  }

  if (poId) {
    await logWorkflowEvent({
      purchaseOrderId: poId,
      eventType: 'APPROVAL_REQUESTED',
      actorType: 'USER',
      actorId: requestedBy,
      description: `Approval requested for ${entityType} (${entityId}).`,
      metadata: { approvalId: approval._id, entityType, entityId }
    });
  }

  return approval;
};

export const approveEntity = async ({ approvalId, approvedByUserId = null, comments = '' }) => {
  const approval = await Approval.findById(approvalId);
  if (!approval) {
    const err = new Error('Approval record not found.');
    err.statusCode = 404;
    err.errorCode = 'APPROVAL_NOT_FOUND';
    throw err;
  }

  if (approval.status !== 'PENDING') {
    const err = new Error(`Approval has already been processed with status '${approval.status}'.`);
    err.statusCode = 400;
    err.errorCode = 'APPROVAL_ALREADY_PROCESSED';
    throw err;
  }

  let approvedBy = approvedByUserId;
  if (!approvedBy) {
    const adminUser = await User.findOne({ role: 'ADMIN' });
    approvedBy = adminUser ? adminUser._id : (await User.findOne())._id;
  }

  approval.status = 'APPROVED';
  approval.approvedBy = approvedBy;
  if (comments) approval.comments = comments;
  approval.actionAt = new Date();
  await approval.save();

  // Update target entity status
  let poId = null;
  if (approval.entityType === 'PRODUCTION_PLAN') {
    const plan = await ProductionPlan.findByIdAndUpdate(
      approval.entityId,
      { status: 'APPROVED' },
      { new: true }
    );
    if (plan) poId = plan.purchaseOrderId;
  } else if (approval.entityType === 'PURCHASE_REQUEST') {
    const pr = await PurchaseRequest.findByIdAndUpdate(
      approval.entityId,
      { status: 'APPROVED' },
      { new: true }
    );
    if (pr) poId = pr.purchaseOrderId;
  }

  if (poId) {
    await logWorkflowEvent({
      purchaseOrderId: poId,
      eventType: 'APPROVAL_APPROVED',
      actorType: 'USER',
      actorId: approvedBy,
      description: `Approval decision APPROVED for ${approval.entityType}.`,
      metadata: { approvalId: approval._id, entityType: approval.entityType, entityId: approval.entityId }
    });
  }

  return approval;
};

export const rejectEntity = async ({ approvalId, rejectedByUserId = null, comments = '' }) => {
  const approval = await Approval.findById(approvalId);
  if (!approval) {
    const err = new Error('Approval record not found.');
    err.statusCode = 404;
    err.errorCode = 'APPROVAL_NOT_FOUND';
    throw err;
  }

  if (approval.status !== 'PENDING') {
    const err = new Error(`Approval has already been processed with status '${approval.status}'.`);
    err.statusCode = 400;
    err.errorCode = 'APPROVAL_ALREADY_PROCESSED';
    throw err;
  }

  let rejectedBy = rejectedByUserId;
  if (!rejectedBy) {
    const adminUser = await User.findOne({ role: 'ADMIN' });
    rejectedBy = adminUser ? adminUser._id : (await User.findOne())._id;
  }

  approval.status = 'REJECTED';
  approval.approvedBy = rejectedBy;
  if (comments) approval.comments = comments;
  approval.actionAt = new Date();
  await approval.save();

  // Update target entity status
  let poId = null;
  if (approval.entityType === 'PRODUCTION_PLAN') {
    const plan = await ProductionPlan.findByIdAndUpdate(
      approval.entityId,
      { status: 'REJECTED' },
      { new: true }
    );
    if (plan) poId = plan.purchaseOrderId;
  } else if (approval.entityType === 'PURCHASE_REQUEST') {
    const pr = await PurchaseRequest.findByIdAndUpdate(
      approval.entityId,
      { status: 'REJECTED' },
      { new: true }
    );
    if (pr) poId = pr.purchaseOrderId;
  }

  if (poId) {
    await logWorkflowEvent({
      purchaseOrderId: poId,
      eventType: 'APPROVAL_REJECTED',
      actorType: 'USER',
      actorId: rejectedBy,
      description: `Approval decision REJECTED for ${approval.entityType}.`,
      metadata: { approvalId: approval._id, entityType: approval.entityType, entityId: approval.entityId, comments }
    });
  }

  return approval;
};

export default {
  createApprovalRequest,
  approveEntity,
  rejectEntity
};
