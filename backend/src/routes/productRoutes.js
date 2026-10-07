import express from 'express';
import { getProducts, getProductById, getProductActiveBom, createProduct, updateProduct } from '../controllers/productController.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = express.Router();

router.get('/', getProducts);
router.post('/', createProduct);
router.get('/:id', validateObjectId('id'), getProductById);
router.put('/:id', validateObjectId('id'), updateProduct);
router.get('/:id/bom', validateObjectId('id'), getProductActiveBom);

export default router;
