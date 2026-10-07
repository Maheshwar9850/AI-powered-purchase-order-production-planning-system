import express from 'express';
import { getWorkflowEvents } from '../controllers/workflowController.js';

const router = express.Router();

router.get('/', getWorkflowEvents);

export default router;
