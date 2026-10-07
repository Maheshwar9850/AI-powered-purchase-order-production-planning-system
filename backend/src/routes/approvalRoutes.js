import express from 'express';
import { getApprovals, getApprovalById, createApproval, approveApprovalRequest, rejectApprovalRequest } from '../controllers/approvalController.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = express.Router();

router.get('/', getApprovals);
router.post('/', createApproval);
router.get('/:id', validateObjectId('id'), getApprovalById);
router.patch('/:id/approve', validateObjectId('id'), approveApprovalRequest);
router.patch('/:id/reject', validateObjectId('id'), rejectApprovalRequest);

export default router;
