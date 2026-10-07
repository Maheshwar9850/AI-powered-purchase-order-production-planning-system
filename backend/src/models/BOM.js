import mongoose from 'mongoose';

const bomItemSchema = new mongoose.Schema(
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
    quantityRequired: {
      type: Number,
      required: true,
      min: 0.0001
    },
    unit: {
      type: String,
      enum: ['KG', 'PCS'],
      required: true
    },
    wastagePercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 50
    }
  },
  { _id: false }
);

const bomSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    version: {
      type: String,
      required: true,
      trim: true,
      default: 'v1.0'
    },
    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true
    },
    effectiveFrom: {
      type: Date,
      default: Date.now
    },
    effectiveTo: {
      type: Date,
      default: null
    },
    items: {
      type: [bomItemSchema],
      validate: [array => array.length > 0, 'BOM must contain at least one material item']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

bomSchema.index({ productId: 1, version: 1 }, { unique: true });

export default mongoose.models.BOM || mongoose.model('BOM', bomSchema);
