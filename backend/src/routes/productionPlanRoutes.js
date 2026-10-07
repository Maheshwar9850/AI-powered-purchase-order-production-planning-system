import express from 'express';
import { getProductionPlans, getProductionPlanById, generateProductionPlan } from '../controllers/productionPlanController.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = express.Router();

router.get('/', getProductionPlans);
router.post('/generate', generateProductionPlan);
router.get('/:id', validateObjectId('id'), getProductionPlanById);

export default router;
