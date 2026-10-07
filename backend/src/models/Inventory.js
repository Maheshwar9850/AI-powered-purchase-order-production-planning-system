import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: true,
      index: true
    },
    materialCode: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: 0
    },
    reservedQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    warehouse: {
      type: String,
      required: true,
      default: 'WH-MAIN-01',
      index: true
    },
    location: {
      type: String,
      required: true,
      default: 'BAY-A1'
    },
    reorderLevel: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

inventorySchema.virtual('usableStock').get(function () {
  return Math.max(0, this.availableQuantity - this.reservedQuantity);
});

inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

export default mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);
