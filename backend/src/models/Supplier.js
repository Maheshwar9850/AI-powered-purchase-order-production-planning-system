import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema(
  {
    supplierCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true, default: 'India' },
      pincode: { type: String, required: true }
    },
    suppliedMaterials: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material'
      }
    ],
    rating: {
      type: Number,
      min: 1.0,
      max: 5.0,
      default: 4.5
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

export default mongoose.models.Supplier || mongoose.model('Supplier', supplierSchema);
