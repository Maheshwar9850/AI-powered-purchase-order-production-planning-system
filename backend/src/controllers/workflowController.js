import WorkflowEvent from '../models/WorkflowEvent.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getWorkflowEvents = async (req, res, next) => {
  try {
    const { purchaseOrderId, eventType } = req.query;
    const query = {};

    if (purchaseOrderId) {
      query.purchaseOrderId = purchaseOrderId;
    }
    if (eventType) {
      query.eventType = eventType;
    }

    const events = await WorkflowEvent.find(query).sort({ timestamp: 1 });
    return sendSuccess(res, 'Workflow events retrieved successfully', events);
  } catch (error) {
    next(error);
  }
};
