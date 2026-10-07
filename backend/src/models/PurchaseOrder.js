import mongoose from 'mongoose';

const poItemSchema = new mongoose.Schema(
  {
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
    productName: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unit: {
      type: String,
      default: 'SET'
    },
    requiredDeliveryDate: {
      type: Date,
      required: true
    }
  },
  { _id: false }
);

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true
    },
    customerSnapshot: {
      customerCode: { type: String, required: true },
      companyName: { type: String, required: true }
    },
    poDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    expectedDeliveryDate: {
      type: Date,
      required: true,
      index: true
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'HIGH'
    },
    status: {
      type: String,
      enum: [
        'RECEIVED',
        'PROCESSING',
        'EXTRACTED',
        'VALIDATED',
        'INVENTORY_CHECKED',
        'PLANNING',
        'AWAITING_APPROVAL',
        'APPROVED',
        'REJECTED',
        'IN_PRODUCTION',
        'COMPLETED',
        'CANCELLED'
      ],
      default: 'RECEIVED',
      index: true
    },
    sourceType: {
      type: String,
      enum: ['OCR_UPLOAD', 'MANUAL', 'API'],
      default: 'OCR_UPLOAD'
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null
    },
    extractionConfidence: {
      type: Number,
      min: 0,
      max: 1.0,
      default: 0.95
    },
    items: {
      type: [poItemSchema],
      validate: [array => array.length > 0, 'Purchase Order must have at least one item']
    },
    totalItems: {
      type: Number,
      default: 1
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

purchaseOrderSchema.index({ createdAt: -1 });

export default mongoose.models.PurchaseOrder || mongoose.model('PurchaseOrder', purchaseOrderSchema);
