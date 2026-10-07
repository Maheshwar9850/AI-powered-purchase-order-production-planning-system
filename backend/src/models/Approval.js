import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ['PRODUCTION_PLAN', 'PURCHASE_REQUEST'],
      required: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    comments: {
      type: String,
      default: ''
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    actionAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

approvalSchema.index({ entityType: 1, entityId: 1 });

export default mongoose.models.Approval || mongoose.model('Approval', approvalSchema);
