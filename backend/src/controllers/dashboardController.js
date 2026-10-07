import PurchaseOrder from '../models/PurchaseOrder.js';
import ProductionPlan from '../models/ProductionPlan.js';
import PurchaseRequest from '../models/PurchaseRequest.js';
import Approval from '../models/Approval.js';
import Inventory from '../models/Inventory.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const [
      totalPOs,
      pendingPOs,
      approvedPOs,
      totalPlans,
      pendingPlans,
      totalPRs,
      pendingPRs,
      pendingApprovals,
      inventoryRecords
    ] = await Promise.all([
      PurchaseOrder.countDocuments(),
      PurchaseOrder.countDocuments({ status: { $in: ['RECEIVED', 'PROCESSING', 'EXTRACTED', 'VALIDATED', 'INVENTORY_CHECKED', 'PLANNING', 'AWAITING_APPROVAL'] } }),
      PurchaseOrder.countDocuments({ status: 'APPROVED' }),
      ProductionPlan.countDocuments(),
      ProductionPlan.countDocuments({ status: 'PENDING_APPROVAL' }),
      PurchaseRequest.countDocuments(),
      PurchaseRequest.countDocuments({ status: 'PENDING_APPROVAL' }),
      Approval.countDocuments({ status: 'PENDING' }),
      Inventory.find()
    ]);

    let totalShortageMaterialsCount = 0;
    inventoryRecords.forEach(inv => {
      const usable = inv.availableQuantity - inv.reservedQuantity;
      if (usable <= inv.reorderLevel) {
        totalShortageMaterialsCount++;
      }
    });

    const summary = {
      purchaseOrders: {
        total: totalPOs,
        pending: pendingPOs,
        approved: approvedPOs
      },
      productionPlans: {
        total: totalPlans,
        pendingApproval: pendingPlans
      },
      purchaseRequests: {
        total: totalPRs,
        pendingApproval: pendingPRs
      },
      approvals: {
        pending: pendingApprovals
      },
      shortages: totalShortageMaterialsCount
    };

    return sendSuccess(res, 'Dashboard summary metrics fetched successfully', summary);
  } catch (error) {
    next(error);
  }
};

export const getDashboardProductionSummary = async (req, res, next) => {
  try {
    const activePlans = await ProductionPlan.find()
      .populate('purchaseOrderId')
      .populate('schedule.productId')
      .sort({ plannedStartDate: 1 });

    const totalScheduledOutput = activePlans.reduce((sum, p) => sum + p.totalQuantity, 0);

    return sendSuccess(res, 'Production dashboard summary fetched successfully', {
      totalActivePlans: activePlans.length,
      totalScheduledOutputSets: totalScheduledOutput,
      plans: activePlans
    });
  } catch (error) {
    next(error);
  }
};
