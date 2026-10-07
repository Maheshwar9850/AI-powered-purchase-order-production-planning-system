import mongoose from 'mongoose';

const scheduleItemSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productCode: {
      type: String,
      required: true,
      trim: true
    },
    plannedQuantity: {
      type: Number,
      required: true,
      min: 1
    },
    shift: {
      type: String,
      default: 'DAY_SHIFT'
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'],
      default: 'SCHEDULED'
    }
  },
  { _id: false }
);

const productionPlanSchema = new mongoose.Schema(
  {
    purchaseOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED'],
      default: 'PENDING_APPROVAL',
      index: true
    },
    generatedBy: {
      type: String,
      default: 'AI'
    },
    aiModel: {
      type: String,
      default: 'gemini'
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 1.0,
      default: 0.91
    },
    totalQuantity: {
      type: Number,
      required: true,
      min: 1
    },
    plannedStartDate: {
      type: Date,
      required: true,
      index: true
    },
    plannedEndDate: {
      type: Date,
      required: true
    },
    totalProductionDays: {
      type: Number,
      required: true,
      min: 1
    },
    schedule: {
      type: [scheduleItemSchema],
      validate: [array => array.length > 0, 'Production plan must contain at least one scheduled day']
    },
    assumptions: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.ProductionPlan || mongoose.model('ProductionPlan', productionPlanSchema);
