import PurchaseOrder from '../models/PurchaseOrder.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import BOM from '../models/BOM.js';
import Document from '../models/Document.js';
import { calculateMaterialRequirements } from '../services/inventoryService.js';
import { generateProductionPlan } from '../services/productionPlanningService.js';
import { generatePurchaseRequest } from '../services/purchaseRequestService.js';
import { createApprovalRequest } from '../services/approvalService.js';
import { getTimeline, logWorkflowEvent } from '../services/workflowService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getPurchaseOrders = async (req, res, next) => {
  try {
    const orders = await PurchaseOrder.find()
      .populate('customerId')
      .populate('items.productId')
      .sort({ createdAt: -1 });
    return sendSuccess(res, 'Purchase orders fetched successfully', orders);
  } catch (error) {
    next(error);
  }
};

export const getPurchaseOrderById = async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id)
      .populate('customerId')
      .populate('documentId')
      .populate('items.productId');
    if (!order) {
      return sendError(res, 'Purchase Order not found', 'PO_NOT_FOUND', 404);
    }
    return sendSuccess(res, 'Purchase Order fetched successfully', order);
  } catch (error) {
    next(error);
  }
};

export const createPurchaseOrder = async (req, res, next) => {
  try {
    const { customerId, items, poNumber } = req.body;

    // Validate Customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return sendError(res, `Customer not found for ID '${customerId}'`, 'CUSTOMER_NOT_FOUND', 400);
    }

    // Validate Items & Products
    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, 'Purchase order must contain at least one item', 'INVALID_ITEMS', 400);
    }

    const validatedItems = [];
    for (const item of items) {
      if (!item.quantity || item.quantity <= 0) {
        return sendError(res, 'Item quantity must be greater than zero', 'INVALID_QUANTITY', 400);
      }
      const product = await Product.findById(item.productId);
      if (!product) {
        return sendError(res, `Product not found for ID '${item.productId}'`, 'PRODUCT_NOT_FOUND', 400);
      }
      validatedItems.push({
        productId: product._id,
        productCode: product.productCode,
        productName: product.name,
        quantity: item.quantity,
        unit: item.unit || 'SET',
        requiredDeliveryDate: item.requiredDeliveryDate || req.body.expectedDeliveryDate
      });
    }

    // Auto-generate PO Number if missing
    let finalPoNumber = poNumber;
    if (!finalPoNumber) {
      const count = await PurchaseOrder.countDocuments();
      finalPoNumber = `PO-CUST-2026-${String(count + 1).padStart(3, '0')}`;
    }

    const order = await PurchaseOrder.create({
      ...req.body,
      poNumber: finalPoNumber,
      customerId: customer._id,
      customerSnapshot: {
        customerCode: customer.customerCode,
        companyName: customer.companyName
      },
      items: validatedItems,
      totalItems: validatedItems.length,
      status: 'RECEIVED'
    });

    // Log initial workflow event
    await logWorkflowEvent({
      purchaseOrderId: order._id,
      eventType: 'PO_RECEIVED',
      actorType: 'SYSTEM',
      description: `Purchase Order ${order.poNumber} received from ${customer.companyName}.`,
      metadata: { poNumber: order.poNumber, totalItems: validatedItems.length }
    });

    return sendSuccess(res, 'Purchase Order created successfully', order, 201);
  } catch (error) {
    next(error);
  }
};

export const updatePurchaseOrder = async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!order) {
      return sendError(res, 'Purchase Order not found', 'PO_NOT_FOUND', 404);
    }
    return sendSuccess(res, 'Purchase Order updated successfully', order);
  } catch (error) {
    next(error);
  }
};

export const updatePurchaseOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = [
      'RECEIVED', 'PROCESSING', 'EXTRACTED', 'VALIDATED',
      'INVENTORY_CHECKED', 'PLANNING', 'AWAITING_APPROVAL',
      'APPROVED', 'REJECTED', 'IN_PRODUCTION', 'COMPLETED', 'CANCELLED'
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return sendError(res, `Invalid status value '${status}'`, 'INVALID_STATUS', 400);
    }

    const order = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return sendError(res, 'Purchase Order not found', 'PO_NOT_FOUND', 404);
    }

    await logWorkflowEvent({
      purchaseOrderId: order._id,
      eventType: `STATUS_UPDATED_${status}`,
      actorType: 'USER',
      description: `PO status updated to ${status}.`,
      metadata: { status }
    });

    return sendSuccess(res, `Purchase Order status updated to ${status}`, order);
  } catch (error) {
    next(error);
  }
};

export const validatePurchaseOrder = async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      return sendError(res, 'Purchase Order not found', 'PO_NOT_FOUND', 404);
    }

    const validationResults = {
      isValid: true,
      customerValid: false,
      productsValid: true,
      bomsValid: true,
      datesValid: true,
      errors: []
    };

    // Verify Customer
    const customer = await Customer.findById(order.customerId);
    if (customer && customer.status === 'ACTIVE') {
      validationResults.customerValid = true;
    } else {
      validationResults.isValid = false;
      validationResults.errors.push('Referenced customer does not exist or is inactive.');
    }

    // Verify Products & BOMs
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        validationResults.productsValid = false;
        validationResults.isValid = false;
        validationResults.errors.push(`Product ${item.productCode} is missing or inactive.`);
        continue;
      }
      if (!product.activeBomId) {
        validationResults.bomsValid = false;
        validationResults.isValid = false;
        validationResults.errors.push(`Product ${item.productCode} does not have an active BOM configured.`);
        continue;
      }
      const bom = await BOM.findById(product.activeBomId);
      if (!bom || bom.status !== 'ACTIVE') {
        validationResults.bomsValid = false;
        validationResults.isValid = false;
        validationResults.errors.push(`Active BOM for ${item.productCode} is invalid or inactive.`);
      }
    }

    // Verify Delivery Dates
    if (new Date(order.expectedDeliveryDate) < new Date(order.poDate)) {
      validationResults.datesValid = false;
      validationResults.isValid = false;
      validationResults.errors.push('Expected delivery date cannot be prior to order date.');
    }

    if (validationResults.isValid) {
      if (['RECEIVED', 'PROCESSING', 'EXTRACTED'].includes(order.status)) {
        order.status = 'VALIDATED';
        await order.save();
      }
      await logWorkflowEvent({
        purchaseOrderId: order._id,
        eventType: 'VALIDATION_COMPLETED',
        actorType: 'SYSTEM',
        description: `PO ${order.poNumber} validation completed successfully.`,
        metadata: validationResults
      });
    }

    return sendSuccess(res, 'Purchase Order validation completed', validationResults);
  } catch (error) {
    next(error);
  }
};

export const processPurchaseOrderWorkflow = async (req, res, next) => {
  try {
    const poId = req.params.id;
    const po = await PurchaseOrder.findById(poId);
    if (!po) {
      return sendError(res, 'Purchase Order not found', 'PO_NOT_FOUND', 404);
    }

    // 1. Inventory Availability Check
    const inventoryReport = await calculateMaterialRequirements(po);
    await logWorkflowEvent({
      purchaseOrderId: po._id,
      eventType: 'INVENTORY_CHECKED',
      actorType: 'SYSTEM',
      description: `Automated BOM exploded and stock checked. Status: ${inventoryReport.overallStatus}.`,
      metadata: { hasShortage: inventoryReport.hasShortage }
    });

    // 2. Generate/Reuse Production Plan
    const productionPlan = await generateProductionPlan(po._id);
    const planApproval = await createApprovalRequest({
      entityType: 'PRODUCTION_PLAN',
      entityId: productionPlan._id,
      comments: 'Awaiting executive manager approval for shop-floor schedule.'
    });

    // 3. Generate/Reuse Purchase Request ONLY IF shortages exist
    let purchaseRequest = null;
    let prApproval = null;

    if (inventoryReport.hasShortage) {
      purchaseRequest = await generatePurchaseRequest({
        purchaseOrderId: po._id,
        productionPlanId: productionPlan._id
      });

      if (purchaseRequest) {
        prApproval = await createApprovalRequest({
          entityType: 'PURCHASE_REQUEST',
          entityId: purchaseRequest._id,
          comments: 'Awaiting executive manager approval for raw material shortage procurement.'
        });
      }
    }

    const workflowSummary = {
      purchaseOrderId: po._id,
      poNumber: po.poNumber,
      inventoryStatus: inventoryReport.overallStatus,
      hasShortage: inventoryReport.hasShortage,
      productionPlan: {
        id: productionPlan._id,
        status: productionPlan.status,
        approvalId: planApproval._id
      },
      purchaseRequest: purchaseRequest ? {
        id: purchaseRequest._id,
        requestNumber: purchaseRequest.requestNumber,
        status: purchaseRequest.status,
        approvalId: prApproval ? prApproval._id : null
      } : null,
      poStatus: po.status
    };

    return sendSuccess(res, 'Purchase Order workflow processed successfully', workflowSummary);
  } catch (error) {
    next(error);
  }
};

export const generatePurchaseRequestForPO = async (req, res, next) => {
  try {
    const poId = req.params.id;
    const pr = await generatePurchaseRequest({ purchaseOrderId: poId });
    if (!pr) {
      return sendSuccess(res, 'No purchase request required (sufficient stock available for all materials)', null);
    }
    return sendSuccess(res, 'Purchase Request generated successfully', pr, 201);
  } catch (error) {
    next(error);
  }
};

export const getPurchaseOrderTimeline = async (req, res, next) => {
  try {
    const poId = req.params.id;
    const events = await getTimeline(poId);
    return sendSuccess(res, 'Purchase Order workflow timeline fetched successfully', events);
  } catch (error) {
    next(error);
  }
};
