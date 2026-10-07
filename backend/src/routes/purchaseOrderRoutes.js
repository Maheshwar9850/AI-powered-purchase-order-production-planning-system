import express from 'express';
import {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  updatePurchaseOrderStatus,
  validatePurchaseOrder,
  processPurchaseOrderWorkflow,
  generatePurchaseRequestForPO,
  getPurchaseOrderTimeline
} from '../controllers/purchaseOrderController.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = express.Router();

router.get('/', getPurchaseOrders);
router.post('/', createPurchaseOrder);
router.get('/:id', validateObjectId('id'), getPurchaseOrderById);
router.put('/:id', validateObjectId('id'), updatePurchaseOrder);
router.patch('/:id/status', validateObjectId('id'), updatePurchaseOrderStatus);
router.post('/:id/validate', validateObjectId('id'), validatePurchaseOrder);
router.post('/:id/process', validateObjectId('id'), processPurchaseOrderWorkflow);
router.post('/:id/generate-purchase-request', validateObjectId('id'), generatePurchaseRequestForPO);
router.get('/:id/timeline', validateObjectId('id'), getPurchaseOrderTimeline);

export default router;
