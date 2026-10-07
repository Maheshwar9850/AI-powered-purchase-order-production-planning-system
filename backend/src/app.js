import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB, { disconnectDB } from './config/db.js';

// Import Models
import User from './models/User.js';
import Customer from './models/Customer.js';
import Product from './models/Product.js';
import Material from './models/Material.js';
import Supplier from './models/Supplier.js';
import BOM from './models/BOM.js';
import Inventory from './models/Inventory.js';
import Document from './models/Document.js';
import PurchaseOrder from './models/PurchaseOrder.js';
import ProductionPlan from './models/ProductionPlan.js';
import PurchaseRequest from './models/PurchaseRequest.js';
import Approval from './models/Approval.js';
import WorkflowEvent from './models/WorkflowEvent.js';

// Import Routes
import customerRoutes from './routes/customerRoutes.js';
import productRoutes from './routes/productRoutes.js';
import materialRoutes from './routes/materialRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import bomRoutes from './routes/bomRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import purchaseOrderRoutes from './routes/purchaseOrderRoutes.js';
import productionPlanRoutes from './routes/productionPlanRoutes.js';
import purchaseRequestRoutes from './routes/purchaseRequestRoutes.js';
import approvalRoutes from './routes/approvalRoutes.js';
import workflowRoutes from './routes/workflowRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Import Middlewares
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check API
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

  res.status(200).json({
    success: true,
    message: 'AI Manufacturing Copilot API is running',
    database: states[dbState] || 'unknown',
    timestamp: new Date().toISOString()
  });
});

// API Info Endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    name: 'AI-Powered Manufacturing Operations Copilot API',
    version: '1.0.0',
    domain: 'Automotive Brake-Pad Manufacturing',
    status: 'ACTIVE'
  });
});

// Register API Routes
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/boms', bomRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/production-plans', productionPlanRoutes);
app.use('/api/purchase-requests', purchaseRequestRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/workflow-events', workflowRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 & Global Error Handling
app.use(notFound);
app.use(errorHandler);

export {
  app,
  connectDB,
  disconnectDB,
  User,
  Customer,
  Product,
  Material,
  Supplier,
  BOM,
  Inventory,
  Document,
  PurchaseOrder,
  ProductionPlan,
  PurchaseRequest,
  Approval,
  WorkflowEvent
};

export default app;
