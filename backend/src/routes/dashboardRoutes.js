import express from 'express';
import { getDashboardSummary, getDashboardProductionSummary } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/summary', getDashboardSummary);
router.get('/production', getDashboardProductionSummary);

export default router;
