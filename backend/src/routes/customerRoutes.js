import express from 'express';
import { getCustomers, getCustomerById, createCustomer, updateCustomer } from '../controllers/customerController.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = express.Router();

router.get('/', getCustomers);
router.post('/', createCustomer);
router.get('/:id', validateObjectId('id'), getCustomerById);
router.put('/:id', validateObjectId('id'), updateCustomer);

export default router;
