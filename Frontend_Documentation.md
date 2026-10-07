# AI-Powered Purchase Order & Production Planning System - Frontend

This is the frontend application for the AI-Powered Purchase Order & Production Planning System. It provides a clean, modern, and professional enterprise manufacturing operations interface.

## 🚀 Technologies Used

* **Framework:** React 18 with Vite
* **Routing:** React Router v6
* **Styling:** Tailwind CSS v4 (with custom enterprise design tokens)
* **API Client:** Axios
* **Data Visualization:** Recharts
* **Icons:** Lucide React
* **State Management:** React hooks (`useState`, `useEffect`, custom `useFetch`)

## ✨ Features and Pages

The frontend application provides a complete dashboard and workflow interface:

* **Dashboard (`/dashboard`):** High-level overview of total orders, production plans, material shortages, and pending approvals.
* **Purchase Orders (`/purchase-orders`):** List view of all POs with their current workflow status.
* **PO Details (`/purchase-orders/:id`):** In-depth view of a specific purchase order, including extracted line items and its individual timeline.
* **Inventory (`/inventory`):** Real-time tracking of raw materials, available vs. reserved stock, and material shortages.
* **Production Plans (`/production-plans`):** View auto-generated manufacturing schedules derived from validated POs.
* **Purchase Requests (`/purchase-requests`):** Review auto-generated procurement requests created when material shortages are detected.
* **Approvals (`/approvals`):** Centralized hub for managers to review, approve, or reject pending workflows (production plans and purchase requests).
* **Timeline (`/timeline`):** A comprehensive event timeline tracking the lifecycle of POs through the entire system.

## 📁 Directory Structure

```text
frontend/
├── public/               # Static assets
├── src/
│   ├── api/              # Axios client and API route definitions (client.js)
│   ├── components/       # Reusable UI components
│   │   ├── Card.jsx      # Standardized container for metrics and info
│   │   ├── DataTable.jsx # Shared table component
│   │   ├── Loading.jsx   # Loading states and error fallbacks
│   │   ├── Navbar.jsx    # Top navigation bar
│   │   ├── PageHeader.jsx# Consistent header for all pages
│   │   ├── Sidebar.jsx   # Main application side navigation
│   │   └── StatusBadge.jsx # Standardized badges for statuses and priorities
│   ├── hooks/            # Custom React hooks (e.g., useFetch)
│   ├── pages/            # Main application route components
│   ├── utils/            # Helper functions (date formatting, currency, etc.)
│   ├── App.jsx           # Application routing setup
│   ├── Layout.jsx        # Main application shell (Sidebar + Navbar + Content)
│   ├── index.css         # Tailwind configuration and design tokens
│   └── main.jsx          # React entry point
├── index.html
├── package.json
└── vite.config.js
```

## 🎨 Design System

The UI was designed with a focus on an "enterprise SaaS" aesthetic, specifically tailored for manufacturing and operations:

* **Colors:** Light backgrounds (`#f8fafc`), white content cards, and dark navy/charcoal text for high readability. Primary actions use indigo/blue, with semantic colors for success (emerald), warning (amber), and danger (red).
* **Layout:** A fixed sidebar navigation with a responsive main content area. All pages utilize a standard `PageHeader`.
* **Components:** Flat, clean styling with subtle borders (`border-surface-200`) and minimal shadows (`shadow-sm`). Large border radiuses and heavy gradients are avoided in favor of a crisp, professional look.

## 🛠️ Getting Started

### Prerequisites
* Node.js (v18 or higher recommended)
* npm

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the Vite development server:
```bash
npm run dev
```
The application will typically be available at `http://localhost:5173`.

> **Note:** The frontend expects the backend server to be running (usually on `http://localhost:5000`). The Axios client is configured to proxy API requests to this backend.

### Building for Production

To create a production build:
```bash
npm run build
```
This will compile the application into the `dist` folder.
