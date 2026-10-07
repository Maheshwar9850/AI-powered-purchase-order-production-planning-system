import express from 'express';
import { getPurchaseRequests, getPurchaseRequestById, createPurchaseRequest } from '../controllers/purchaseRequestController.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = express.Router();

router.get('/', getPurchaseRequests);
router.post('/', createPurchaseRequest);
router.get('/:id', validateObjectId('id'), getPurchaseRequestById);

export default router;
