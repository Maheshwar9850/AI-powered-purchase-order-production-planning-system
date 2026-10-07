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

export const seedDatabase = async () => {
  console.log('===========================================================');
  console.log(' STARTING MONGODB DATABASE SEEDING ENGINE');
  console.log('===========================================================');

  await connectDB();

  console.log('\n[1/13] Clearing existing development collections...');
  await Promise.all([
    User.deleteMany({}),
    Customer.deleteMany({}),
    Product.deleteMany({}),
    Material.deleteMany({}),
    Supplier.deleteMany({}),
    BOM.deleteMany({}),
    Inventory.deleteMany({}),
    Document.deleteMany({}),
    PurchaseOrder.deleteMany({}),
    ProductionPlan.deleteMany({}),
    PurchaseRequest.deleteMany({}),
    Approval.deleteMany({}),
    WorkflowEvent.deleteMany({})
  ]);
  console.log('✔ All collections cleared safely.');

  // ---------------------------------------------------------
  // 1. SEED USERS
  // ---------------------------------------------------------
  console.log('\n[2/13] Seeding Master Users...');
  const users = await User.insertMany([
    {
      employeeId: 'USR-001',
      name: 'Dr. Rajesh Sharma',
      email: 'admin@brakecopilot.com',
      passwordHash: '$2b$10$e8w5h4i3...placeholder_hash',
      role: 'ADMIN',
      department: 'Executive Operations',
      isActive: true
    },
    {
      employeeId: 'USR-002',
      name: 'Vikram Patel',
      email: 'prod.mgr@brakecopilot.com',
      passwordHash: '$2b$10$e8w5h4i3...placeholder_hash',
      role: 'PRODUCTION_MANAGER',
      department: 'Production & Shop Floor',
      isActive: true
    },
    {
      employeeId: 'USR-003',
      name: 'Anita Verma',
      email: 'inv.mgr@brakecopilot.com',
      passwordHash: '$2b$10$e8w5h4i3...placeholder_hash',
      role: 'INVENTORY_MANAGER',
      department: 'Warehouse & Materials Management',
      isActive: true
    },
    {
      employeeId: 'USR-004',
      name: 'Suresh Kumar',
      email: 'proc.mgr@brakecopilot.com',
      passwordHash: '$2b$10$e8w5h4i3...placeholder_hash',
      role: 'PROCUREMENT_MANAGER',
      department: 'Supply Chain & Procurement',
      isActive: true
    }
  ]);
  const userMap = {};
  users.forEach(u => { userMap[u.role] = u._id; });
  console.log(`✔ Inserted ${users.length} users.`);

  // ---------------------------------------------------------
  // 2. SEED CUSTOMERS
  // ---------------------------------------------------------
  console.log('\n[3/13] Seeding Automotive Customers...');
  const customers = await Customer.insertMany([
    {
      customerCode: 'CUST-001',
      companyName: 'Sunrise Motors Ltd.',
      contactPerson: 'Arun Mehta',
      email: 'purchase@sunrisemotors.com',
      phone: '+91-9820012345',
      address: {
        street: '102 Industrial Expressway, Auto Zone',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        pincode: '411019'
      },
      status: 'ACTIVE'
    },
    {
      customerCode: 'CUST-002',
      companyName: 'Vertex Automotive Pvt. Ltd.',
      contactPerson: 'Priya Nair',
      email: 'procurement@vertexauto.in',
      phone: '+91-9845098765',
      address: {
        street: '45 OEM Supplier Hub, Sector 18',
        city: 'Gurugram',
        state: 'Haryana',
        country: 'India',
        pincode: '122015'
      },
      status: 'ACTIVE'
    },
    {
      customerCode: 'CUST-003',
      companyName: 'Prime Mobility Systems',
      contactPerson: 'Rohan Gupta',
      email: 'orders@primemobility.com',
      phone: '+91-9711054321',
      address: {
        street: '88 Auto Component Complex',
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        pincode: '600032'
      },
      status: 'ACTIVE'
    }
  ]);
  const custMap = {};
  customers.forEach(c => { custMap[c.customerCode] = c; });
  console.log(`✔ Inserted ${customers.length} customers.`);

  // ---------------------------------------------------------
  // 3. SEED MATERIALS
  // ---------------------------------------------------------
  console.log('\n[4/13] Seeding Raw Materials...');
  const materials = await Material.insertMany([
    {
      materialCode: 'MAT-FRM-001',
      name: 'Friction Material (Semi-Metallic Compound)',
      category: 'FRICTION_COMPOUND',
      unit: 'KG',
      reorderLevel: 1000,
      safetyStock: 500,
      leadTimeDays: 7,
      isActive: true
    },
    {
      materialCode: 'MAT-BP-001',
      name: 'Backing Plate (Heavy Duty Stamped Steel)',
      category: 'STEEL_PLATE',
      unit: 'PCS',
      reorderLevel: 5000,
      safetyStock: 2000,
      leadTimeDays: 5,
      isActive: true
    },
    {
      materialCode: 'MAT-ADH-001',
      name: 'Industrial Adhesive (High-Temp Bonding Agent)',
      category: 'CHEMICAL',
      unit: 'KG',
      reorderLevel: 100,
      safetyStock: 50,
      leadTimeDays: 4,
      isActive: true
    },
    {
      materialCode: 'MAT-SHM-001',
      name: 'Anti-noise Shim (Multi-Layer Rubber-Damped)',
      category: 'HARDWARE',
      unit: 'PCS',
      reorderLevel: 3000,
      safetyStock: 1000,
      leadTimeDays: 6,
      isActive: true
    },
    {
      materialCode: 'MAT-PKG-001',
      name: 'Packaging Box (Corrugated Brake Set Box)',
      category: 'PACKAGING',
      unit: 'PCS',
      reorderLevel: 2000,
      safetyStock: 1000,
      leadTimeDays: 3,
      isActive: true
    }
  ]);
  const matMap = {};
  materials.forEach(m => { matMap[m.materialCode] = m; });
  console.log(`✔ Inserted ${materials.length} raw materials.`);

  // ---------------------------------------------------------
  // 4. SEED SUPPLIERS
  // ---------------------------------------------------------
  console.log('\n[5/13] Seeding Suppliers...');
  const suppliers = await Supplier.insertMany([
    {
      supplierCode: 'SUP-001',
      companyName: 'FrictionTech Corp India',
      contactPerson: 'Sanjay Deshmukh',
      email: 'sales@frictiontech.co.in',
      phone: '+91-9822011223',
      address: {
        street: 'Plot 12 Chemical Zone',
        city: 'Vadodara',
        state: 'Gujarat',
        country: 'India',
        pincode: '390001'
      },
      suppliedMaterials: [matMap['MAT-FRM-001']._id],
      rating: 4.8,
      isActive: true
    },
    {
      supplierCode: 'SUP-002',
      companyName: 'SteelPlates & Components Ltd.',
      contactPerson: 'Karan Malhotra',
      email: 'orders@steelplates.in',
      phone: '+91-9811099887',
      address: {
        street: 'GIDC Phase 3',
        city: 'Rajkot',
        state: 'Gujarat',
        country: 'India',
        pincode: '360002'
      },
      suppliedMaterials: [matMap['MAT-BP-001']._id, matMap['MAT-SHM-001']._id],
      rating: 4.6,
      isActive: true
    },
    {
      supplierCode: 'SUP-003',
      companyName: 'ChemicalBond Solutions Pvt. Ltd.',
      contactPerson: 'Dr. Meera Sen',
      email: 'info@chemicalbond.com',
      phone: '+91-9833077665',
      address: {
        street: 'Tech Park B, Navi Mumbai',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        pincode: '400705'
      },
      suppliedMaterials: [matMap['MAT-ADH-001']._id],
      rating: 4.9,
      isActive: true
    },
    {
      supplierCode: 'SUP-004',
      companyName: 'PackRight Packaging & Containers',
      contactPerson: 'Sunil Rao',
      email: 'dispatch@packright.in',
      phone: '+91-9844055443',
      address: {
        street: 'Industrial Estate Block 4',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        pincode: '560058'
      },
      suppliedMaterials: [matMap['MAT-PKG-001']._id],
      rating: 4.5,
      isActive: true
    }
  ]);
  const supMap = {};
  suppliers.forEach(s => { supMap[s.supplierCode] = s; });
  console.log(`✔ Inserted ${suppliers.length} suppliers.`);

  // ---------------------------------------------------------
  // 5. SEED PRODUCTS
  // ---------------------------------------------------------
  console.log('\n[6/13] Seeding Brake-Pad Products...');
  const products = await Product.insertMany([
    {
      productCode: 'BP-FR-001',
      name: 'Front Disc Brake Pad Set (Passenger Sedan)',
      category: 'Brake Pad',
      vehicleType: 'Sedan / Hatchback',
      padType: 'FRONT_DISC',
      unit: 'SET',
      dailyProductionCapacity: 2500,
      productionTimePerUnitMinutes: 2.5,
      isActive: true
    },
    {
      productCode: 'BP-RR-001',
      name: 'Rear Disc Brake Pad Set (Compact Car)',
      category: 'Brake Pad',
      vehicleType: 'Compact Hatchback',
      padType: 'REAR_DISC',
      unit: 'SET',
      dailyProductionCapacity: 2000,
      productionTimePerUnitMinutes: 2.0,
      isActive: true
    },
    {
      productCode: 'BP-SUV-001',
      name: 'SUV Heavy-Duty Front Brake Pad Set',
      category: 'Brake Pad',
      vehicleType: 'SUV / Light Commercial',
      padType: 'SUV_HEAVY_DUTY',
      unit: 'SET',
      dailyProductionCapacity: 1500,
      productionTimePerUnitMinutes: 3.5,
      isActive: true
    }
  ]);
  const prodMap = {};
  products.forEach(p => { prodMap[p.productCode] = p; });
  console.log(`✔ Inserted ${products.length} products.`);

  // ---------------------------------------------------------
  // 6. SEED BOMS & UPDATE PRODUCTS WITH activeBomId
  // ---------------------------------------------------------
  console.log('\n[7/13] Seeding Bill of Materials (BOM) with Versioning...');
  
  // BOM for BP-FR-001
  const bomFR = await BOM.create({
    productId: prodMap['BP-FR-001']._id,
    version: 'v1.0',
    status: 'ACTIVE',
    effectiveFrom: new Date('2026-01-01'),
    items: [
      {
        materialId: matMap['MAT-FRM-001']._id,
        materialCode: 'MAT-FRM-001',
        materialName: matMap['MAT-FRM-001'].name,
        quantityRequired: 0.45,
        unit: 'KG',
        wastagePercentage: 2.0
      },
      {
        materialId: matMap['MAT-BP-001']._id,
        materialCode: 'MAT-BP-001',
        materialName: matMap['MAT-BP-001'].name,
        quantityRequired: 1.0,
        unit: 'PCS',
        wastagePercentage: 0
      },
      {
        materialId: matMap['MAT-ADH-001']._id,
        materialCode: 'MAT-ADH-001',
        materialName: matMap['MAT-ADH-001'].name,
        quantityRequired: 0.02,
        unit: 'KG',
        wastagePercentage: 1.0
      },
      {
        materialId: matMap['MAT-SHM-001']._id,
        materialCode: 'MAT-SHM-001',
        materialName: matMap['MAT-SHM-001'].name,
        quantityRequired: 1.0,
        unit: 'PCS',
        wastagePercentage: 0
      },
      {
        materialId: matMap['MAT-PKG-001']._id,
        materialCode: 'MAT-PKG-001',
        materialName: matMap['MAT-PKG-001'].name,
        quantityRequired: 1.0,
        unit: 'PCS',
        wastagePercentage: 0
      }
    ],
    createdBy: userMap['PRODUCTION_MANAGER']
  });

  // BOM for BP-RR-001
  const bomRR = await BOM.create({
    productId: prodMap['BP-RR-001']._id,
    version: 'v1.0',
    status: 'ACTIVE',
    effectiveFrom: new Date('2026-01-01'),
    items: [
      {
        materialId: matMap['MAT-FRM-001']._id,
        materialCode: 'MAT-FRM-001',
        materialName: matMap['MAT-FRM-001'].name,
        quantityRequired: 0.35,
        unit: 'KG',
        wastagePercentage: 1.5
      },
      {
        materialId: matMap['MAT-BP-001']._id,
        materialCode: 'MAT-BP-001',
        materialName: matMap['MAT-BP-001'].name,
        quantityRequired: 1.0,
        unit: 'PCS',
        wastagePercentage: 0
      },
      {
        materialId: matMap['MAT-ADH-001']._id,
        materialCode: 'MAT-ADH-001',
        materialName: matMap['MAT-ADH-001'].name,
        quantityRequired: 0.015,
        unit: 'KG',
        wastagePercentage: 1.0
      },
      {
        materialId: matMap['MAT-SHM-001']._id,
        materialCode: 'MAT-SHM-001',
        materialName: matMap['MAT-SHM-001'].name,
        quantityRequired: 1.0,
        unit: 'PCS',
        wastagePercentage: 0
      },
      {
        materialId: matMap['MAT-PKG-001']._id,
        materialCode: 'MAT-PKG-001',
        materialName: matMap['MAT-PKG-001'].name,
        quantityRequired: 1.0,
        unit: 'PCS',
        wastagePercentage: 0
      }
    ],
    createdBy: userMap['PRODUCTION_MANAGER']
  });

  // BOM for BP-SUV-001
  const bomSUV = await BOM.create({
    productId: prodMap['BP-SUV-001']._id,
    version: 'v1.0',
    status: 'ACTIVE',
    effectiveFrom: new Date('2026-01-01'),
    items: [
      {
        materialId: matMap['MAT-FRM-001']._id,
        materialCode: 'MAT-FRM-001',
        materialName: matMap['MAT-FRM-001'].name,
        quantityRequired: 0.60,
        unit: 'KG',
        wastagePercentage: 2.5
      },
      {
        materialId: matMap['MAT-BP-001']._id,
        materialCode: 'MAT-BP-001',
        materialName: matMap['MAT-BP-001'].name,
        quantityRequired: 1.0,
        unit: 'PCS',
        wastagePercentage: 0
      },
      {
        materialId: matMap['MAT-ADH-001']._id,
        materialCode: 'MAT-ADH-001',
        materialName: matMap['MAT-ADH-001'].name,
        quantityRequired: 0.025,
        unit: 'KG',
        wastagePercentage: 1.0
      },
      {
        materialId: matMap['MAT-SHM-001']._id,
        materialCode: 'MAT-SHM-001',
        materialName: matMap['MAT-SHM-001'].name,
        quantityRequired: 1.0,
        unit: 'PCS',
        wastagePercentage: 0
      },
      {
        materialId: matMap['MAT-PKG-001']._id,
        materialCode: 'MAT-PKG-001',
        materialName: matMap['MAT-PKG-001'].name,
        quantityRequired: 1.0,
        unit: 'PCS',
        wastagePercentage: 0
      }
    ],
    createdBy: userMap['PRODUCTION_MANAGER']
  });

  // Attach activeBomId to products
  await Product.findByIdAndUpdate(prodMap['BP-FR-001']._id, { activeBomId: bomFR._id });
  await Product.findByIdAndUpdate(prodMap['BP-RR-001']._id, { activeBomId: bomRR._id });
  await Product.findByIdAndUpdate(prodMap['BP-SUV-001']._id, { activeBomId: bomSUV._id });
  console.log('✔ Created 3 BOM versions & linked activeBomId on products.');

  // ---------------------------------------------------------
  // 7. SEED INVENTORY (EXACT PROMPT SCENARIOS)
  // ---------------------------------------------------------
  console.log('\n[8/13] Seeding Inventory (Usable Stock = Available - Reserved)...');
  const inventoryRecords = await Inventory.insertMany([
    {
      materialId: matMap['MAT-FRM-001']._id,
      materialCode: 'MAT-FRM-001',
      availableQuantity: 1200,
      reservedQuantity: 300, // Usable: 900 KG
      warehouse: 'WH-MAIN-01',
      location: 'BAY-FRICTION-01',
      reorderLevel: 1000
    },
    {
      materialId: matMap['MAT-BP-001']._id,
      materialCode: 'MAT-BP-001',
      availableQuantity: 12000,
      reservedQuantity: 2000, // Usable: 10,000 PCS
      warehouse: 'WH-MAIN-01',
      location: 'BAY-STEEL-02',
      reorderLevel: 5000
    },
    {
      materialId: matMap['MAT-ADH-001']._id,
      materialCode: 'MAT-ADH-001',
      availableQuantity: 400,
      reservedQuantity: 50, // Usable: 350 KG
      warehouse: 'WH-MAIN-01',
      location: 'BAY-CHEM-03',
      reorderLevel: 100
    },
    {
      materialId: matMap['MAT-SHM-001']._id,
      materialCode: 'MAT-SHM-001',
      availableQuantity: 11000,
      reservedQuantity: 1000, // Usable: 10,000 PCS
      warehouse: 'WH-MAIN-01',
      location: 'BAY-HARDWARE-04',
      reorderLevel: 3000
    },
    {
      materialId: matMap['MAT-PKG-001']._id,
      materialCode: 'MAT-PKG-001',
      availableQuantity: 9000,
      reservedQuantity: 500, // Usable: 8,500 PCS
      warehouse: 'WH-MAIN-01',
      location: 'BAY-PACKAGING-05',
      reorderLevel: 2000
    }
  ]);
  console.log(`✔ Inserted ${inventoryRecords.length} inventory records with explicit available and reserved levels.`);

  // ---------------------------------------------------------
  // 8. SEED DOCUMENTS
  // ---------------------------------------------------------
  console.log('\n[9/13] Seeding Uploaded PO Document Metadata...');
  const docs = await Document.insertMany([
    {
      fileName: 'sunrise_PO_001.pdf',
      filePath: '/uploads/documents/2026/10/sunrise_PO_001.pdf',
      documentType: 'CUSTOMER_PO_PDF',
      mimeType: 'application/pdf',
      fileSize: 245800,
      ocrText: 'PURCHASE ORDER: PO-CUST-2026-001\nCUSTOMER: Sunrise Motors Ltd.\nPRODUCT: BP-FR-001 Front Disc Brake Pad\nQUANTITY: 10,000 SETS\nDELIVERY DATE: 15-Oct-2026',
      extractionStatus: 'COMPLETED',
      extractionConfidence: 0.98,
      uploadedBy: userMap['PRODUCTION_MANAGER']
    },
    {
      fileName: 'vertex_PO_002.pdf',
      filePath: '/uploads/documents/2026/10/vertex_PO_002.pdf',
      documentType: 'CUSTOMER_PO_PDF',
      mimeType: 'application/pdf',
      fileSize: 189200,
      ocrText: 'PURCHASE ORDER: PO-CUST-2026-002\nCUSTOMER: Vertex Automotive Pvt. Ltd.\nPRODUCT: BP-RR-001 Rear Disc Brake Pad\nQUANTITY: 2,000 SETS\nDELIVERY DATE: 20-Oct-2026',
      extractionStatus: 'COMPLETED',
      extractionConfidence: 0.96,
      uploadedBy: userMap['PRODUCTION_MANAGER']
    },
    {
      fileName: 'prime_PO_003.pdf',
      filePath: '/uploads/documents/2026/10/prime_PO_003.pdf',
      documentType: 'CUSTOMER_PO_PDF',
      mimeType: 'application/pdf',
      fileSize: 312000,
      ocrText: 'PURCHASE ORDER: PO-CUST-2026-003\nCUSTOMER: Prime Mobility Systems\nITEMS:\n1. BP-FR-001 Front Disc Brake Pad - 2,000 SETS\n2. BP-SUV-001 SUV Front Brake Pad - 3,000 SETS\nDELIVERY DATE: 25-Oct-2026',
      extractionStatus: 'COMPLETED',
      extractionConfidence: 0.94,
      uploadedBy: userMap['PRODUCTION_MANAGER']
    }
  ]);
  const docMap = {};
  docs.forEach(d => { docMap[d.fileName] = d; });
  console.log(`✔ Inserted ${docs.length} source document metadata records.`);

  // ---------------------------------------------------------
  // 9. SEED PURCHASE ORDERS (3 SCENARIOS)
  // ---------------------------------------------------------
  console.log('\n[10/13] Seeding Purchase Orders (3 Business Scenarios)...');
  
  // PO 1: Sunrise Motors (10,000 BP-FR-001) -> SHORTAGE SCENARIO
  const po1 = await PurchaseOrder.create({
    poNumber: 'PO-CUST-2026-001',
    customerId: custMap['CUST-001']._id,
    customerSnapshot: {
      customerCode: custMap['CUST-001'].customerCode,
      companyName: custMap['CUST-001'].companyName
    },
    poDate: new Date('2026-10-05'),
    expectedDeliveryDate: new Date('2026-10-15'),
    priority: 'HIGH',
    status: 'AWAITING_APPROVAL',
    sourceType: 'OCR_UPLOAD',
    documentId: docMap['sunrise_PO_001.pdf']._id,
    extractionConfidence: 0.98,
    items: [
      {
        productId: prodMap['BP-FR-001']._id,
        productCode: 'BP-FR-001',
        productName: prodMap['BP-FR-001'].name,
        quantity: 10000,
        unit: 'SET',
        requiredDeliveryDate: new Date('2026-10-15')
      }
    ],
    totalItems: 1,
    notes: 'Urgent OEM shipment for Q4 assembly line.'
  });
  await Document.findByIdAndUpdate(docMap['sunrise_PO_001.pdf']._id, { purchaseOrderId: po1._id });

  // PO 2: Vertex Automotive (2,000 BP-RR-001) -> SUFFICIENT STOCK SCENARIO
  const po2 = await PurchaseOrder.create({
    poNumber: 'PO-CUST-2026-002',
    customerId: custMap['CUST-002']._id,
    customerSnapshot: {
      customerCode: custMap['CUST-002'].customerCode,
      companyName: custMap['CUST-002'].companyName
    },
    poDate: new Date('2026-10-06'),
    expectedDeliveryDate: new Date('2026-10-20'),
    priority: 'MEDIUM',
    status: 'APPROVED',
    sourceType: 'OCR_UPLOAD',
    documentId: docMap['vertex_PO_002.pdf']._id,
    extractionConfidence: 0.96,
    items: [
      {
        productId: prodMap['BP-RR-001']._id,
        productCode: 'BP-RR-001',
        productName: prodMap['BP-RR-001'].name,
        quantity: 2000,
        unit: 'SET',
        requiredDeliveryDate: new Date('2026-10-20')
      }
    ],
    totalItems: 1,
    notes: 'Standard stock replenishment order.'
  });
  await Document.findByIdAndUpdate(docMap['vertex_PO_002.pdf']._id, { purchaseOrderId: po2._id });

  // PO 3: Prime Mobility Systems (2,000 BP-FR-001 + 3,000 BP-SUV-001) -> COMPLEX MULTI-PRODUCT SCENARIO
  const po3 = await PurchaseOrder.create({
    poNumber: 'PO-CUST-2026-003',
    customerId: custMap['CUST-003']._id,
    customerSnapshot: {
      customerCode: custMap['CUST-003'].customerCode,
      companyName: custMap['CUST-003'].companyName
    },
    poDate: new Date('2026-10-07'),
    expectedDeliveryDate: new Date('2026-10-25'),
    priority: 'HIGH',
    status: 'PLANNING',
    sourceType: 'OCR_UPLOAD',
    documentId: docMap['prime_PO_003.pdf']._id,
    extractionConfidence: 0.94,
    items: [
      {
        productId: prodMap['BP-FR-001']._id,
        productCode: 'BP-FR-001',
        productName: prodMap['BP-FR-001'].name,
        quantity: 2000,
        unit: 'SET',
        requiredDeliveryDate: new Date('2026-10-25')
      },
      {
        productId: prodMap['BP-SUV-001']._id,
        productCode: 'BP-SUV-001',
        productName: prodMap['BP-SUV-001'].name,
        quantity: 3000,
        unit: 'SET',
        requiredDeliveryDate: new Date('2026-10-25')
      }
    ],
    totalItems: 2,
    notes: 'Combined fleet order requiring SUV brake pads.'
  });
  await Document.findByIdAndUpdate(docMap['prime_PO_003.pdf']._id, { purchaseOrderId: po3._id });

  console.log('✔ Inserted 3 Purchase Orders representing 3 distinct production scenarios.');

  // ---------------------------------------------------------
  // 10. SEED PRODUCTION PLANS & DAILY SCHEDULES
  // ---------------------------------------------------------
  console.log('\n[11/13] Seeding Production Plans & Shop-Floor Schedules...');
  
  // Production Plan for PO 1 (10,000 sets @ 2,500/day across 4 days)
  const plan1 = await ProductionPlan.create({
    purchaseOrderId: po1._id,
    status: 'PENDING_APPROVAL',
    generatedBy: 'SYSTEM',
    totalQuantity: 10000,
    plannedStartDate: new Date('2026-10-10'),
    plannedEndDate: new Date('2026-10-13'),
    totalProductionDays: 4,
    schedule: [
      { date: new Date('2026-10-10'), productId: prodMap['BP-FR-001']._id, productCode: 'BP-FR-001', plannedQuantity: 2500, shift: 'SHIFT_1', status: 'SCHEDULED' },
      { date: new Date('2026-10-11'), productId: prodMap['BP-FR-001']._id, productCode: 'BP-FR-001', plannedQuantity: 2500, shift: 'SHIFT_1', status: 'SCHEDULED' },
      { date: new Date('2026-10-12'), productId: prodMap['BP-FR-001']._id, productCode: 'BP-FR-001', plannedQuantity: 2500, shift: 'SHIFT_1', status: 'SCHEDULED' },
      { date: new Date('2026-10-13'), productId: prodMap['BP-FR-001']._id, productCode: 'BP-FR-001', plannedQuantity: 2500, shift: 'SHIFT_1', status: 'SCHEDULED' }
    ],
    assumptions: [
      'Line 1 operating at maximum 2,500 sets/day capacity.',
      'Raw material delivery expected by 09-Oct-2026 prior to production start.'
    ]
  });

  // Production Plan for PO 2 (2,000 sets @ 2,000/day for 1 day)
  const plan2 = await ProductionPlan.create({
    purchaseOrderId: po2._id,
    status: 'APPROVED',
    generatedBy: 'SYSTEM',
    totalQuantity: 2000,
    plannedStartDate: new Date('2026-10-12'),
    plannedEndDate: new Date('2026-10-12'),
    totalProductionDays: 1,
    schedule: [
      { date: new Date('2026-10-12'), productId: prodMap['BP-RR-001']._id, productCode: 'BP-RR-001', plannedQuantity: 2000, shift: 'SHIFT_1', status: 'SCHEDULED' }
    ],
    assumptions: ['Stock fully available on shop floor. Single shift batch execution.']
  });

  // Production Plan for PO 3 (5,000 total sets across 3 days)
  const plan3 = await ProductionPlan.create({
    purchaseOrderId: po3._id,
    status: 'PENDING_APPROVAL',
    generatedBy: 'SYSTEM',
    totalQuantity: 5000,
    plannedStartDate: new Date('2026-10-15'),
    plannedEndDate: new Date('2026-10-17'),
    totalProductionDays: 3,
    schedule: [
      { date: new Date('2026-10-15'), productId: prodMap['BP-FR-001']._id, productCode: 'BP-FR-001', plannedQuantity: 2000, shift: 'SHIFT_1', status: 'SCHEDULED' },
      { date: new Date('2026-10-16'), productId: prodMap['BP-SUV-001']._id, productCode: 'BP-SUV-001', plannedQuantity: 1500, shift: 'SHIFT_1', status: 'SCHEDULED' },
      { date: new Date('2026-10-17'), productId: prodMap['BP-SUV-001']._id, productCode: 'BP-SUV-001', plannedQuantity: 1500, shift: 'SHIFT_1', status: 'SCHEDULED' }
    ],
    assumptions: ['Multi-product tooling changeover scheduled between day 1 and day 2.']
  });

  console.log('✔ Created Production Plans with embedded daily schedules matching daily capacities.');

  // ---------------------------------------------------------
  // 11. SEED PURCHASE REQUESTS (SHORTAGES FOR PO 1 & PO 3)
  // ---------------------------------------------------------
  console.log('\n[12/13] Seeding Purchase Requests for Material Shortages...');
  
  // PR for PO 1 Shortages:
  // Required: Friction (10,000 * 0.45 = 4500 KG), Packaging (10,000 * 1 = 10,000 PCS)
  // Inventory: Friction (Avail: 1200, Res: 300 -> Usable: 900 KG -> Shortage: 3600 KG)
  // Inventory: Packaging (Avail: 9000, Res: 500 -> Usable: 8500 PCS -> Shortage: 1500 PCS)
  const pr1 = await PurchaseRequest.create({
    requestNumber: 'PR-2026-001',
    purchaseOrderId: po1._id,
    productionPlanId: plan1._id,
    supplierId: supMap['SUP-001']._id,
    status: 'PENDING_APPROVAL',
    priority: 'URGENT',
    reason: 'Automated shortage detection for PO-CUST-2026-001 (Sunrise Motors Ltd.)',
    items: [
      {
        materialId: matMap['MAT-FRM-001']._id,
        materialCode: 'MAT-FRM-001',
        materialName: matMap['MAT-FRM-001'].name,
        requiredQuantity: 4500,
        availableQuantity: 1200,
        reservedQuantity: 300,
        shortageQuantity: 3600,
        unit: 'KG',
        estimatedCost: 1620000 // 3,600 KG @ ₹450/KG
      },
      {
        materialId: matMap['MAT-PKG-001']._id,
        materialCode: 'MAT-PKG-001',
        materialName: matMap['MAT-PKG-001'].name,
        requiredQuantity: 10000,
        availableQuantity: 9000,
        reservedQuantity: 500,
        shortageQuantity: 1500,
        unit: 'PCS',
        estimatedCost: 37500 // 1,500 PCS @ ₹25/PCS
      }
    ],
    totalEstimatedCost: 1657500,
    requestedBy: userMap['PROCUREMENT_MANAGER']
  });

  // PR for PO 3 Shortage (Friction Material Shortage of 1,800 KG)
  const pr3 = await PurchaseRequest.create({
    requestNumber: 'PR-2026-003',
    purchaseOrderId: po3._id,
    productionPlanId: plan3._id,
    supplierId: supMap['SUP-001']._id,
    status: 'PENDING_APPROVAL',
    priority: 'HIGH',
    reason: 'Shortage detected for combined multi-product fleet order PO-CUST-2026-003',
    items: [
      {
        materialId: matMap['MAT-FRM-001']._id,
        materialCode: 'MAT-FRM-001',
        materialName: matMap['MAT-FRM-001'].name,
        requiredQuantity: 2700,
        availableQuantity: 1200,
        reservedQuantity: 300,
        shortageQuantity: 1800,
        unit: 'KG',
        estimatedCost: 810000
      }
    ],
    totalEstimatedCost: 810000,
    requestedBy: userMap['PROCUREMENT_MANAGER']
  });

  console.log('✔ Inserted Purchase Requests with exact calculated material shortages.');

  // ---------------------------------------------------------
  // 12. SEED APPROVALS & WORKFLOW EVENTS
  // ---------------------------------------------------------
  console.log('\n[13/13] Seeding Approval Records & Workflow History...');

  // Approvals
  await Approval.create({
    entityType: 'PRODUCTION_PLAN',
    entityId: plan1._id,
    status: 'PENDING',
    requestedBy: userMap['PRODUCTION_MANAGER'],
    comments: 'Awaiting executive approval for 4-day shop floor allocation.',
    requestedAt: new Date('2026-10-05T09:15:00Z')
  });

  await Approval.create({
    entityType: 'PRODUCTION_PLAN',
    entityId: plan2._id,
    status: 'APPROVED',
    requestedBy: userMap['PRODUCTION_MANAGER'],
    approvedBy: userMap['ADMIN'],
    comments: 'Sufficient inventory confirmed. Approved for production on 12-Oct-2026.',
    requestedAt: new Date('2026-10-06T10:00:00Z'),
    actionAt: new Date('2026-10-06T10:30:00Z')
  });

  await Approval.create({
    entityType: 'PURCHASE_REQUEST',
    entityId: pr1._id,
    status: 'PENDING',
    requestedBy: userMap['PROCUREMENT_MANAGER'],
    comments: 'Urgent approval needed for 3,600 KG Friction Material & 1,500 Packaging Boxes.',
    requestedAt: new Date('2026-10-05T09:20:00Z')
  });

  // Workflow Events for PO 1
  const po1Events = [
    {
      purchaseOrderId: po1._id,
      eventType: 'PO_RECEIVED',
      actorType: 'SYSTEM',
      actorId: userMap['PRODUCTION_MANAGER'],
      description: 'Purchase Order PDF uploaded by customer Sunrise Motors Ltd.',
      metadata: { fileName: 'sunrise_PO_001.pdf', poNumber: 'PO-CUST-2026-001' },
      timestamp: new Date('2026-10-05T09:00:00Z')
    },
    {
      purchaseOrderId: po1._id,
      eventType: 'OCR_COMPLETED',
      actorType: 'SYSTEM',
      actorId: null,
      description: 'OCR document text extraction finished with 98% confidence.',
      metadata: { confidence: 0.98, pages: 1 },
      timestamp: new Date('2026-10-05T09:02:00Z')
    },
    {
      purchaseOrderId: po1._id,
      eventType: 'DATA_EXTRACTED',
      actorType: 'SYSTEM',
      actorId: null,
      description: 'Extracted PO details: 10,000 sets of BP-FR-001 due 15-Oct-2026.',
      metadata: { productCode: 'BP-FR-001', quantity: 10000 },
      timestamp: new Date('2026-10-05T09:03:00Z')
    },
    {
      purchaseOrderId: po1._id,
      eventType: 'VALIDATION_COMPLETED',
      actorType: 'SYSTEM',
      actorId: null,
      description: 'Customer credit and product catalog parameters validated successfully.',
      metadata: { customerCode: 'CUST-001', status: 'PASSED' },
      timestamp: new Date('2026-10-05T09:05:00Z')
    },
    {
      purchaseOrderId: po1._id,
      eventType: 'INVENTORY_CHECKED',
      actorType: 'SYSTEM',
      actorId: null,
      description: 'Automated BOM exploded and material availability calculated against current stock.',
      metadata: { bomVersion: 'v1.0', itemsChecked: 5 },
      timestamp: new Date('2026-10-05T09:06:00Z')
    },
    {
      purchaseOrderId: po1._id,
      eventType: 'SHORTAGE_DETECTED',
      actorType: 'SYSTEM',
      actorId: null,
      description: 'Material shortage detected: Friction Material shortage of 3,600 KG and Packaging Box shortage of 1,500 PCS.',
      metadata: {
        shortages: [
          { materialCode: 'MAT-FRM-001', required: 4500, available: 1200, reserved: 300, usable: 900, shortage: 3600 },
          { materialCode: 'MAT-PKG-001', required: 10000, available: 9000, reserved: 500, usable: 8500, shortage: 1500 }
        ]
      },
      timestamp: new Date('2026-10-05T09:07:00Z')
    },
    {
      purchaseOrderId: po1._id,
      eventType: 'PRODUCTION_PLAN_CREATED',
      actorType: 'SYSTEM',
      actorId: null,
      description: 'System-generated 4-day shop floor schedule created (2,500 sets/day).',
      metadata: { planId: plan1._id, totalDays: 4, dailyCapacity: 2500 },
      timestamp: new Date('2026-10-05T09:10:00Z')
    },
    {
      purchaseOrderId: po1._id,
      eventType: 'PURCHASE_REQUEST_CREATED',
      actorType: 'SYSTEM',
      actorId: userMap['PROCUREMENT_MANAGER'],
      description: 'Purchase Request PR-2026-001 generated for raw material procurement.',
      metadata: { requestNumber: 'PR-2026-001', totalCost: 1657500 },
      timestamp: new Date('2026-10-05T09:12:00Z')
    },
    {
      purchaseOrderId: po1._id,
      eventType: 'APPROVAL_REQUESTED',
      actorType: 'SYSTEM',
      actorId: userMap['PRODUCTION_MANAGER'],
      description: 'Approval requests submitted to Executive Management for Production Plan and Purchase Request.',
      metadata: { pendingApprovals: ['PRODUCTION_PLAN', 'PURCHASE_REQUEST'] },
      timestamp: new Date('2026-10-05T09:15:00Z')
    }
  ];

  await WorkflowEvent.insertMany(po1Events);
  console.log(`✔ Inserted ${po1Events.length} workflow timeline events for PO-CUST-2026-001.`);

  console.log('\n===========================================================');
  console.log(' SEEDING COMPLETED SUCCESSFULLY WITH ALL RELATIONSHIPS!');
  console.log('===========================================================');
  
  await disconnectDB();
};

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().catch(err => {
    console.error('Fatal error during seed execution:', err);
    process.exit(1);
  });
}
