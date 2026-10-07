import express from 'express';
import { getInventory, getInventoryById, getInventoryByMaterialId, checkInventoryForPO } from '../controllers/inventoryController.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = express.Router();

router.get('/', getInventory);
router.post('/check', checkInventoryForPO);
router.get('/:id', validateObjectId('id'), getInventoryById);
router.get('/material/:materialId', validateObjectId('materialId'), getInventoryByMaterialId);

export default router;
