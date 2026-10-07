import mongoose from 'mongoose';

const prItemSchema = new mongoose.Schema(
  {
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: true
    },
    materialCode: {
      type: String,
      required: true,
      trim: true
    },
    materialName: {
      type: String,
      required: true,
      trim: true
    },
    requiredQuantity: {
      type: Number,
      required: true,
      min: 0
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: 0
    },
    reservedQuantity: {
      type: Number,
      required: true,
      min: 0
    },
    shortageQuantity: {
      type: Number,
      required: true,
      min: 0.0001
    },
    unit: {
      type: String,
      enum: ['KG', 'PCS'],
      required: true
    },
    estimatedCost: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const purchaseRequestSchema = new mongoose.Schema(
  {
    requestNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    purchaseOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
      required: true,
      index: true
    },
    productionPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductionPlan',
      default: null
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      default: null
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ORDERED', 'COMPLETED'],
      default: 'PENDING_APPROVAL',
      index: true
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'HIGH'
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    items: {
      type: [prItemSchema],
      validate: [array => array.length > 0, 'Purchase request must specify at least one shortage item']
    },
    totalEstimatedCost: {
      type: Number,
      default: 0
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.PurchaseRequest || mongoose.model('PurchaseRequest', purchaseRequestSchema);
