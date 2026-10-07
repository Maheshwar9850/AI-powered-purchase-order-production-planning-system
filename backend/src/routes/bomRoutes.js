import express from 'express';
import { getBoms, getBomById } from '../controllers/bomController.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = express.Router();

router.get('/', getBoms);
router.get('/:id', validateObjectId('id'), getBomById);

export default router;
