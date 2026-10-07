import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    productCode: {
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
      default: 'Brake Pad',
      trim: true
    },
    vehicleType: {
      type: String,
      required: true,
      trim: true
    },
    padType: {
      type: String,
      required: true,
      enum: ['FRONT_DISC', 'REAR_DISC', 'SUV_HEAVY_DUTY'],
      trim: true
    },
    unit: {
      type: String,
      required: true,
      default: 'SET'
    },
    dailyProductionCapacity: {
      type: Number,
      required: true,
      min: 1
    },
    productionTimePerUnitMinutes: {
      type: Number,
      required: true,
      min: 0.1
    },
    activeBomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BOM',
      default: null,
      index: true
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

export default mongoose.models.Product || mongoose.model('Product', productSchema);
