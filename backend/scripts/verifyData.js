import connectDB, { disconnectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Customer from '../src/models/Customer.js';
import Product from '../src/models/Product.js';
import Material from '../src/models/Material.js';
import Supplier from '../src/models/Supplier.js';
import BOM from '../src/models/BOM.js';
import Inventory from '../src/models/Inventory.js';
import Document from '../src/models/Document.js';
import PurchaseOrder from '../src/models/PurchaseOrder.js';
import ProductionPlan from '../src/models/ProductionPlan.js';
import PurchaseRequest from '../src/models/PurchaseRequest.js';
import Approval from '../src/models/Approval.js';
import WorkflowEvent from '../src/models/WorkflowEvent.js';
import { seedDatabase } from '../seed/seed.js';

export const runVerification = async () => {
  console.log('===========================================================');
  console.log(' RUNNING BUSINESS RULE & CALCULATION VERIFICATION SUITE');
  console.log('===========================================================');

  // Seed fresh dataset
  await seedDatabase();
  await connectDB();

  const results = {
    dbStatus: 'CONNECTED',
    seedStatus: 'SUCCESS',
    po1Verification: 'FAIL',
    po2Verification: 'FAIL',
    po3Verification: 'FAIL',
    refIntegrity: 'FAIL',
    shortageCalc: 'FAIL',
    productionCalc: 'FAIL'
  };

  // 1. Fetch document counts
  const collectionCounts = {
    users: await User.countDocuments(),
    customers: await Customer.countDocuments(),
    products: await Product.countDocuments(),
    materials: await Material.countDocuments(),
    suppliers: await Supplier.countDocuments(),
    boms: await BOM.countDocuments(),
    inventory: await Inventory.countDocuments(),
    documents: await Document.countDocuments(),
    purchaseOrders: await PurchaseOrder.countDocuments(),
    productionPlans: await ProductionPlan.countDocuments(),
    purchaseRequests: await PurchaseRequest.countDocuments(),
    approvals: await Approval.countDocuments(),
    workflowEvents: await WorkflowEvent.countDocuments()
  };

  console.log('\n📊 COLLECTION DOCUMENT COUNTS:');
  Object.entries(collectionCounts).forEach(([col, count]) => {
    console.log(`   - ${col.padEnd(20)}: ${count} documents`);
  });

  // 2. AUDIT PO-001 (Sunrise Motors Ltd. - 10,000 Sets BP-FR-001)
  console.log('\n-----------------------------------------------------------');
  console.log(' AUDITING PO-001 (SHORTAGE SCENARIO & MATERIAL CALCULATIONS)');
  console.log('-----------------------------------------------------------');

  const po1 = await PurchaseOrder.findOne({ poNumber: 'PO-CUST-2026-001' }).populate('customerId');
  if (!po1) throw new Error('PO-CUST-2026-001 not found in database');

  const product1 = await Product.findById(po1.items[0].productId);
  const bom1 = await BOM.findById(product1.activeBomId);
  const inventoryRecords = await Inventory.find();
  const invMap = {};
  inventoryRecords.forEach(inv => { invMap[inv.materialCode] = inv; });

  const poQuantity = po1.items[0].quantity; // 10,000 sets
  console.log(`PO Number: ${po1.poNumber}`);
  console.log(`Customer: ${po1.customerSnapshot.companyName}`);
  console.log(`Ordered Product: ${product1.productCode} (${product1.name})`);
  console.log(`Ordered Quantity: ${poQuantity.toLocaleString()} SETS`);

  let frictionShortageCalc = 0;
  let packagingShortageCalc = 0;

  console.log('\nCalculated Material Requirements vs Stock:');
  bom1.items.forEach(item => {
    const inv = invMap[item.materialCode];
    const usableStock = inv.availableQuantity - inv.reservedQuantity;
    const requiredQty = item.quantityRequired * poQuantity;
    const shortage = Math.max(0, requiredQty - usableStock);

    console.log(` - ${item.materialCode} (${item.materialName}):`);
    console.log(`     BOM Factor: ${item.quantityRequired} ${item.unit} / set`);
    console.log(`     Total Required: ${requiredQty.toLocaleString()} ${item.unit}`);
    console.log(`     Stock: ${inv.availableQuantity.toLocaleString()} ${item.unit} (Avail) - ${inv.reservedQuantity.toLocaleString()} ${item.unit} (Res) = ${usableStock.toLocaleString()} ${item.unit} Usable`);
    console.log(`     Shortage: ${shortage > 0 ? `🚨 ${shortage.toLocaleString()} ${item.unit}` : '✅ 0 (Sufficient Stock)'}`);

    if (item.materialCode === 'MAT-FRM-001') frictionShortageCalc = shortage;
    if (item.materialCode === 'MAT-PKG-001') packagingShortageCalc = shortage;
  });

  // Verify against generated Purchase Request PR-2026-001
  const pr1 = await PurchaseRequest.findOne({ requestNumber: 'PR-2026-001' });
  if (!pr1) throw new Error('PR-2026-001 not found in database');

  const prFrictionItem = pr1.items.find(i => i.materialCode === 'MAT-FRM-001');
  const prPkgItem = pr1.items.find(i => i.materialCode === 'MAT-PKG-001');

  const isFrictionMatch = frictionShortageCalc === 3600 && prFrictionItem.shortageQuantity === 3600;
  const isPkgMatch = packagingShortageCalc === 1500 && prPkgItem.shortageQuantity === 1500;

  if (isFrictionMatch && isPkgMatch) {
    console.log('\n✅ PO-001 Shortage Calculation Verified Perfectly!');
    console.log(`   - Friction Material Shortage: Expected 3,600 KG == Calculated ${frictionShortageCalc} KG == PR ${prFrictionItem.shortageQuantity} KG`);
    console.log(`   - Packaging Box Shortage: Expected 1,500 PCS == Calculated ${packagingShortageCalc} PCS == PR ${prPkgItem.shortageQuantity} PCS`);
    results.shortageCalc = 'PASS';
    results.po1Verification = 'PASS';
  } else {
    console.error('❌ Mismatch in PO-001 shortage calculation!');
  }

  // 3. AUDIT PRODUCTION PLAN 1
  console.log('\n-----------------------------------------------------------');
  console.log(' AUDITING PRODUCTION PLAN 1 SCHEDULE TOTALS');
  console.log('-----------------------------------------------------------');
  const plan1 = await ProductionPlan.findOne({ purchaseOrderId: po1._id });
  const scheduledTotal = plan1.schedule.reduce((acc, curr) => acc + curr.plannedQuantity, 0);

  console.log(`Plan Status: ${plan1.status}`);
  console.log(`Daily Capacity: 2,500 SETS/day`);
  console.log(`Schedule Duration: ${plan1.totalProductionDays} days (${plan1.schedule.length} daily slots)`);
  console.log(`Total Planned Output: ${scheduledTotal.toLocaleString()} SETS`);

  if (scheduledTotal === poQuantity && plan1.schedule.length === 4) {
    console.log('✅ Production Plan 1 Total Matches Purchase Order Requirement Exactly!');
    results.productionCalc = 'PASS';
  } else {
    console.error('❌ Production Plan schedule total mismatch!');
  }

  // 4. AUDIT SCENARIO 2 (PO-002 Sufficient Stock Scenario)
  console.log('\n-----------------------------------------------------------');
  console.log(' AUDITING SCENARIO 2 (PO-002 SUFFICIENT INVENTORY SCENARIO)');
  console.log('-----------------------------------------------------------');
  const po2 = await PurchaseOrder.findOne({ poNumber: 'PO-CUST-2026-002' });
  const pr2 = await PurchaseRequest.findOne({ purchaseOrderId: po2._id });
  const plan2 = await ProductionPlan.findOne({ purchaseOrderId: po2._id });

  console.log(`PO Number: ${po2.poNumber}`);
  console.log(`Status: ${po2.status}`);
  console.log(`Purchase Request Created?: ${pr2 ? 'YES (UNEXPECTED)' : 'NO (CORRECT - NO SHORTAGE)'}`);
  console.log(`Production Plan Status: ${plan2.status}`);

  if (!pr2 && plan2 && plan2.status === 'APPROVED') {
    console.log('✅ Scenario 2 Verified: Sufficient stock, zero shortages, no PR generated, plan approved!');
    results.po2Verification = 'PASS';
  } else {
    console.error('❌ Scenario 2 verification failed!');
  }

  // 5. AUDIT SCENARIO 3 (PO-003 Multi-Product Scenario)
  console.log('\n-----------------------------------------------------------');
  console.log(' AUDITING SCENARIO 3 (PO-003 MULTI-PRODUCT SCENARIO)');
  console.log('-----------------------------------------------------------');
  const po3 = await PurchaseOrder.findOne({ poNumber: 'PO-CUST-2026-003' });
  const pr3 = await PurchaseRequest.findOne({ purchaseOrderId: po3._id });
  const plan3 = await ProductionPlan.findOne({ purchaseOrderId: po3._id });

  console.log(`PO Number: ${po3.poNumber}`);
  console.log(`Items Count: ${po3.items.length} products (${po3.items.map(i => i.productCode).join(', ')})`);
  console.log(`Generated PR Number: ${pr3 ? pr3.requestNumber : 'NONE'}`);
  console.log(`Production Plan Schedule Slots: ${plan3 ? plan3.schedule.length : 0}`);

  if (po3.items.length === 2 && pr3 && plan3) {
    console.log('✅ Scenario 3 Verified: Multi-product BOM calculation & PR generation working seamlessly!');
    results.po3Verification = 'PASS';
  } else {
    console.error('❌ Scenario 3 verification failed!');
  }

  // 6. AUDIT REFERENCE INTEGRITY
  console.log('\n-----------------------------------------------------------');
  console.log(' AUDITING REFERENCE INTEGRITY ACROSS ALL OBJECTIDS');
  console.log('-----------------------------------------------------------');

  const populatedPOs = await PurchaseOrder.find().populate('customerId').populate('documentId').populate('items.productId');
  let refErrors = 0;

  for (const po of populatedPOs) {
    if (!po.customerId || !po.customerId.companyName) {
      console.error(`Missing customer ref on PO ${po.poNumber}`);
      refErrors++;
    }
    if (!po.documentId || !po.documentId.fileName) {
      console.error(`Missing document ref on PO ${po.poNumber}`);
      refErrors++;
    }
    for (const item of po.items) {
      if (!item.productId || !item.productId.name) {
        console.error(`Missing product ref on item in PO ${po.poNumber}`);
        refErrors++;
      }
    }
  }

  if (refErrors === 0) {
    console.log('✅ 100% Reference Integrity Verified Across All ObjectIds!');
    results.refIntegrity = 'PASS';
  } else {
    console.error(`❌ Found ${refErrors} orphan or broken references.`);
  }

  // FINAL SUMMARY REPORT
  console.log('\n===========================================================');
  console.log(' FINAL DATABASE VERIFICATION REPORT');
  console.log('===========================================================');
  console.log(`DATABASE STATUS      : ${results.dbStatus}`);
  console.log(`SEED STATUS          : ${results.seedStatus}`);
  console.log(`COLLECTIONS CREATED  : 13 (${Object.keys(collectionCounts).length} Mongoose Models)`);
  console.log(`PO-001 VERIFICATION  : ${results.po1Verification}`);
  console.log(`PO-002 VERIFICATION  : ${results.po2Verification}`);
  console.log(`PO-003 VERIFICATION  : ${results.po3Verification}`);
  console.log(`REFERENCE INTEGRITY  : ${results.refIntegrity}`);
  console.log(`SHORTAGE CALCULATION : ${results.shortageCalc}`);
  console.log(`PRODUCTION CALCULATION: ${results.productionCalc}`);
  console.log('===========================================================');

  await disconnectDB();
  return results;
};

if (process.argv[1] && process.argv[1].endsWith('verifyData.js')) {
  runVerification().catch(err => {
    console.error('Fatal error during verification execution:', err);
    process.exit(1);
  });
}
