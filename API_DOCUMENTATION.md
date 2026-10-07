# REST API Documentation: AI-Powered Manufacturing Operations Copilot

**Domain**: Automotive Brake-Pad Manufacturing for SMEs  
**Base URL**: `http://localhost:5000/api`  
**Authentication**: Open Access (Development Phase 2)  
**Content-Type**: `application/json`  

---

## 1. System Architecture & Flow

```
Client / Postman
       ↓
Express REST API (server.js & app.js)
       ↓
Routes & Middlewares (validateObjectId, errorHandler, notFound)
       ↓
Controllers (HTTP handling & payload formatting)
       ↓
Services (inventoryService, productionPlanningService, purchaseRequestService, approvalService, workflowService)
       ↓
Mongoose Models (13 Collections)
       ↓
MongoDB Atlas Cluster
```

---

## 2. Standardized API Response Formats

### 2.1 Success Response (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "message": "Operation description summary",
  "data": {}
}
```

### 2.2 Error Response (`400 Bad Request`, `404 Not Found`, `409 Conflict`, `500 Server Error`)
```json
{
  "success": false,
  "message": "Human-readable error description",
  "error": {
    "code": "ERROR_CODE_IDENTIFIER",
    "details": null
  }
}
```

#### Standard Error Codes:
* `INVALID_OBJECT_ID`: Provided URL parameter is not a valid 24-character hexadecimal MongoDB ObjectId.
* `PO_NOT_FOUND`: Referenced Purchase Order document does not exist.
* `CUSTOMER_NOT_FOUND`: Referenced Customer document does not exist.
* `PRODUCT_NOT_FOUND`: Referenced Product catalog document does not exist.
* `BOM_NOT_FOUND`: Active Bill of Materials recipe is missing for the product.
* `SUPPLIER_NOT_FOUND`: No active supplier found for shortage raw material.
* `APPROVAL_ALREADY_PROCESSED`: Approval decision has already been executed.
* `VALIDATION_ERROR`: One or more input fields failed validation constraints.
* `DUPLICATE_KEY`: Resource code/number conflicts with an existing record.

---

## 3. Endpoints Catalog

### 3.1 Health & System Information

#### `GET /api/health`
Checks API server and MongoDB connection state.

**Sample Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "AI Manufacturing Copilot API is running",
  "database": "connected",
  "timestamp": "2026-10-05T16:50:00.000Z"
}
```

#### `GET /api`
Returns core service metadata.

---

### 3.2 Master Data APIs

#### `GET /api/customers`
Retrieves all customer OEM records.

#### `GET /api/customers/:id`
Retrieves single customer by ObjectId.

#### `POST /api/customers`
Creates a new customer document.

#### `GET /api/products`
Retrieves all brake-pad product catalog items (populates `activeBomId`).

#### `GET /api/products/:id`
Retrieves single brake-pad product.

#### `GET /api/products/:id/bom`
Retrieves the active Bill of Materials (BOM) recipe for a specific product.

#### `GET /api/materials`
Retrieves raw materials catalog (`MAT-FRM-001`, `MAT-BP-001`, `MAT-ADH-001`, `MAT-SHM-001`, `MAT-PKG-001`).

#### `GET /api/suppliers`
Retrieves approved suppliers and their `suppliedMaterials` array.

#### `GET /api/boms`
Retrieves all Bill of Materials (BOM) version recipes.

---

### 3.3 Inventory APIs

#### `GET /api/inventory`
Retrieves live inventory stock for all raw materials.

#### `GET /api/inventory/material/:materialId`
Retrieves stock record for a specific raw material ObjectId.

#### `POST /api/inventory/check`
Performs dynamic BOM explosion and material stock audit for a Purchase Order.

**Request Body**:
```json
{
  "purchaseOrderId": "65f01a... (24-char ObjectId)"
}
```

**Sample Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Inventory availability check completed successfully",
  "data": {
    "purchaseOrderId": "65f01a...",
    "poNumber": "PO-CUST-2026-001",
    "customerName": "Sunrise Motors Ltd.",
    "overallStatus": "SHORTAGE",
    "hasShortage": true,
    "materials": [
      {
        "materialCode": "MAT-FRM-001",
        "materialName": "Friction Material (Semi-Metallic Compound)",
        "requiredQuantity": 4500,
        "availableQuantity": 1200,
        "reservedQuantity": 300,
        "usableQuantity": 900,
        "shortageQuantity": 3600,
        "unit": "KG",
        "status": "SHORTAGE"
      },
      {
        "materialCode": "MAT-PKG-001",
        "materialName": "Packaging Box (Corrugated Brake Set Box)",
        "requiredQuantity": 10000,
        "availableQuantity": 9000,
        "reservedQuantity": 500,
        "usableQuantity": 8500,
        "shortageQuantity": 1500,
        "unit": "PCS",
        "status": "SHORTAGE"
      }
    ]
  }
}
```

---

### 3.4 Purchase Order APIs

#### `GET /api/purchase-orders`
Lists all customer purchase orders.

#### `GET /api/purchase-orders/:id`
Retrieves single purchase order with populated customer, document, and product details.

#### `POST /api/purchase-orders`
Creates a new purchase order.

#### `POST /api/purchase-orders/:id/validate`
Validates customer, products, active BOMs, and delivery dates for a PO.

#### `POST /api/purchase-orders/:id/process` (Full Workflow Orchestrator)
Orchestrates backend workflow: validates PO $\rightarrow$ checks inventory $\rightarrow$ generates production plan $\rightarrow$ generates purchase request (if shortages exist) $\rightarrow$ creates approval requests $\rightarrow$ logs timeline events.

**Sample Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Purchase order workflow processed successfully",
  "data": {
    "purchaseOrderId": "65f01a...",
    "poNumber": "PO-CUST-2026-001",
    "inventoryStatus": "SHORTAGE",
    "hasShortage": true,
    "productionPlan": {
      "id": "65f01b...",
      "status": "PENDING_APPROVAL",
      "approvalId": "65f01c..."
    },
    "purchaseRequest": {
      "id": "65f01d...",
      "requestNumber": "PR-2026-001",
      "status": "PENDING_APPROVAL",
      "approvalId": "65f01e..."
    },
    "poStatus": "AWAITING_APPROVAL"
  }
}
```

#### `POST /api/purchase-orders/:id/generate-purchase-request`
Generates a Purchase Request if material shortages exist.

#### `GET /api/purchase-orders/:id/timeline`
Retrieves chronological workflow event history for a PO.

---

### 3.5 Production Planning APIs

#### `GET /api/production-plans`
Lists all shop-floor production plans.

#### `POST /api/production-plans/generate`
Generates a daily shift-wise production schedule based on product `dailyProductionCapacity`.

---

### 3.6 Purchase Request APIs

#### `GET /api/purchase-requests`
Lists all procurement purchase requests.

#### `POST /api/purchase-requests`
Generates a Purchase Request for a PO if shortages exist.

---

### 3.7 Approval APIs

#### `GET /api/approvals`
Lists all approval records.

#### `PATCH /api/approvals/:id/approve`
Approves a pending Production Plan or Purchase Request, updating target entity status to `APPROVED`.

#### `PATCH /api/approvals/:id/reject`
Rejects a pending Production Plan or Purchase Request, updating target entity status to `REJECTED`.

---

### 3.8 Dashboard APIs

#### `GET /api/dashboard/summary`
Returns executive KPI metrics:
```json
{
  "success": true,
  "data": {
    "purchaseOrders": { "total": 3, "pending": 1, "approved": 1 },
    "productionPlans": { "total": 3, "pendingApproval": 2 },
    "purchaseRequests": { "total": 2, "pendingApproval": 2 },
    "approvals": { "pending": 3 },
    "shortages": 2
  }
}
```

#### `GET /api/dashboard/production`
Returns active shop-floor scheduling summaries.

---

## 4. Postman Testing Guide

### Environment Variables setup:
Set `baseUrl = http://localhost:5000/api` in Postman.

### Recommended Test Order:
1. `GET {{baseUrl}}/health`
2. `GET {{baseUrl}}/customers`
3. `GET {{baseUrl}}/products`
4. `GET {{baseUrl}}/purchase-orders`
5. `POST {{baseUrl}}/inventory/check` (with PO-001 ID)
6. `POST {{baseUrl}}/purchase-orders/:po1Id/validate`
7. `POST {{baseUrl}}/purchase-orders/:po1Id/process`
8. `GET {{baseUrl}}/purchase-orders/:po1Id/timeline`
9. `PATCH {{baseUrl}}/approvals/:approvalId/approve`
10. `GET {{baseUrl}}/dashboard/summary`
