import mongoose from 'mongoose';

const workflowEventSchema = new mongoose.Schema(
  {
    purchaseOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
      required: true,
      index: true
    },
    eventType: {
      type: String,
      required: true,
      index: true
    },
    actorType: {
      type: String,
      enum: ['SYSTEM', 'USER', 'AI'],
      default: 'SYSTEM'
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    description: {
      type: String,
      required: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.WorkflowEvent || mongoose.model('WorkflowEvent', workflowEventSchema);
