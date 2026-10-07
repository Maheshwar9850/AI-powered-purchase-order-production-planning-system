import express from 'express';
import { getSuppliers, getSupplierById } from '../controllers/supplierController.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = express.Router();

router.get('/', getSuppliers);
router.get('/:id', validateObjectId('id'), getSupplierById);

export default router;
