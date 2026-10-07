import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PurchaseOrders from './pages/PurchaseOrders.jsx';
import PurchaseOrderDetail from './pages/PurchaseOrderDetail.jsx';
import Inventory from './pages/Inventory.jsx';
import ProductionPlans from './pages/ProductionPlans.jsx';
import PurchaseRequests from './pages/PurchaseRequests.jsx';
import Approvals from './pages/Approvals.jsx';
import Timeline from './pages/Timeline.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/purchase-orders" element={<PurchaseOrders />} />
        <Route path="/purchase-orders/:id" element={<PurchaseOrderDetail />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/production-plans" element={<ProductionPlans />} />
        <Route path="/purchase-requests" element={<PurchaseRequests />} />
        <Route path="/approvals" element={<Approvals />} />
        <Route path="/timeline" element={<Timeline />} />
      </Routes>
    </Layout>
  );
}
