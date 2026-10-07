import express from 'express';
import { getMaterials, getMaterialById } from '../controllers/materialController.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = express.Router();

router.get('/', getMaterials);
router.get('/:id', validateObjectId('id'), getMaterialById);

export default router;
