import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    purchaseOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
      index: true,
      default: null
    },
    fileName: {
      type: String,
      required: true,
      trim: true
    },
    filePath: {
      type: String,
      required: true,
      trim: true
    },
    documentType: {
      type: String,
      enum: ['CUSTOMER_PO_PDF', 'SPEC_SHEET', 'INVOICE'],
      default: 'CUSTOMER_PO_PDF'
    },
    mimeType: {
      type: String,
      default: 'application/pdf'
    },
    fileSize: {
      type: Number,
      required: true,
      min: 1
    },
    ocrText: {
      type: String,
      default: ''
    },
    extractionStatus: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
      index: true
    },
    extractionConfidence: {
      type: Number,
      min: 0,
      max: 1.0,
      default: 0.95
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Document || mongoose.model('Document', documentSchema);
