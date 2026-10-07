import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    employeeId: {
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
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: [
        'ADMIN',
        'PRODUCTION_MANAGER',
        'INVENTORY_MANAGER',
        'PROCUREMENT_MANAGER',
        'MANAGER'
      ],
      required: true,
      index: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.User || mongoose.model('User', userSchema);
