import WorkflowEvent from '../models/WorkflowEvent.js';

/**
 * Logs a workflow event with idempotency protection.
 * Prevents duplicate events for the same purchaseOrderId and eventType combination.
 * 
 * Events that should only occur once per PO will not be duplicated:
 * - PO_RECEIVED, OCR_COMPLETED, DATA_EXTRACTED, VALIDATION_COMPLETED
 * - INVENTORY_CHECKED, SHORTAGE_DETECTED
 * - PRODUCTION_PLAN_CREATED, PURCHASE_REQUEST_CREATED
 * 
 * @param {Object} params - Event parameters
 * @param {boolean} params.forceCreate - If true, bypass idempotency check (default: false)
 */
export const logWorkflowEvent = async ({
  purchaseOrderId,
  eventType,
  actorType = 'SYSTEM',
  actorId = null,
  description,
  metadata = {},
  forceCreate = false
}) => {
  try {
    // Idempotency check: prevent duplicate events for the same PO and event type
    if (!forceCreate) {
      const existingEvent = await WorkflowEvent.findOne({
        purchaseOrderId,
        eventType
      });
      
      if (existingEvent) {
        // Event already logged, return existing event instead of creating duplicate
        return existingEvent;
      }
    }

    const event = await WorkflowEvent.create({
      purchaseOrderId,
      eventType,
      actorType,
      actorId,
      description,
      metadata,
      timestamp: new Date()
    });
    return event;
  } catch (error) {
    console.error(`[WorkflowService] Error logging event ${eventType} for PO ${purchaseOrderId}:`, error.message);
    // Silent fail or non-blocking log so workflow execution is not halted
    return null;
  }
};

export const getTimeline = async (purchaseOrderId) => {
  return await WorkflowEvent.find({ purchaseOrderId }).sort({ timestamp: 1 });
};

export default {
  logWorkflowEvent,
  getTimeline
};
