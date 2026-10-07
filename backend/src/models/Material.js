import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema(
  {
    materialCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: ['FRICTION_COMPOUND', 'STEEL_PLATE', 'CHEMICAL', 'HARDWARE', 'PACKAGING'],
      trim: true
    },
    unit: {
      type: String,
      required: true,
      enum: ['KG', 'PCS']
    },
    reorderLevel: {
      type: Number,
      required: true,
      min: 0
    },
    safetyStock: {
      type: Number,
      required: true,
      min: 0
    },
    leadTimeDays: {
      type: Number,
      required: true,
      min: 1
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Material || mongoose.model('Material', materialSchema);
