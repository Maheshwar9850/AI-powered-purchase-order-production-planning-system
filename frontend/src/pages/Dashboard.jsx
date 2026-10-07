import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Factory,
  FileText,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Package,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import Card from '../components/Card.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { LoadingCard, ErrorState } from '../components/Loading.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { fetchDashboardSummary, fetchDashboardProduction, fetchPurchaseOrders } from '../api/client.js';
import { formatDate, formatNumber } from '../utils/formatters.js';

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: summary, loading: summaryLoading, error: summaryError, refetch: refetchSummary } =
    useFetch(fetchDashboardSummary, []);
  const { data: production, loading: prodLoading } =
    useFetch(fetchDashboardProduction, []);
  const { data: orders, loading: ordersLoading } =
    useFetch(fetchPurchaseOrders, []);

  if (summaryLoading) return <LoadingCard count={8} />;
  if (summaryError) return <ErrorState message={summaryError} onRetry={refetchSummary} />;

  const kpiCards = [
    {
      title: 'Purchase Orders',
      value: summary?.purchaseOrders?.total ?? 0,
      icon: ShoppingCart,
      onClick: () => navigate('/purchase-orders'),
      sub: `${summary?.purchaseOrders?.pending ?? 0} pending`,
    },
    {
      title: 'Production Plans',
      value: summary?.productionPlans?.total ?? 0,
      icon: Factory,
      onClick: () => navigate('/production-plans'),
      sub: `${summary?.productionPlans?.pendingApproval ?? 0} awaiting approval`,
    },
    {
      title: 'Purchase Requests',
      value: summary?.purchaseRequests?.total ?? 0,
      icon: FileText,
      onClick: () => navigate('/purchase-requests'),
      sub: `${summary?.purchaseRequests?.pendingApproval ?? 0} pending`,
    },
    {
      title: 'Pending Approvals',
      value: summary?.approvals?.pending ?? 0,
      icon: CheckCircle,
      onClick: () => navigate('/approvals'),
      sub: summary?.approvals?.pending > 0 ? 'Action required' : 'All clear',
    },
    {
      title: 'Material Shortages',
      value: summary?.shortages ?? 0,
      icon: AlertTriangle,
      onClick: () => navigate('/inventory'),
      sub: summary?.shortages > 0 ? 'Check inventory' : 'Stock adequate',
    },
    {
      title: 'Approved POs',
      value: summary?.purchaseOrders?.approved ?? 0,
      icon: TrendingUp,
      sub: 'Ready for production',
    },
  ];

  // Build chart data from orders
  const poStatusData = (() => {
    if (!orders || !Array.isArray(orders)) return [];
    const counts = {};
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  // Production schedule chart
  const productionChartData = (() => {
    if (!production?.plans || !Array.isArray(production.plans)) return [];
    return production.plans.slice(0, 6).map((plan) => ({
      name: plan.purchaseOrderId?.poNumber || 'N/A',
      quantity: plan.totalQuantity,
      days: plan.totalProductionDays,
    }));
  })();

  // Recent orders
  const recentOrders = orders && Array.isArray(orders) ? orders.slice(0, 5) : [];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        description="Overview of manufacturing operations and key metrics." 
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card, i) => (
          <Card
            key={i}
            title={card.title}
            value={card.value}
            icon={card.icon}
            onClick={card.onClick}
          >
            <p className="text-xs mt-2 text-surface-500">
              {card.sub}
            </p>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PO Status Distribution */}
        <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-surface-700 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-primary-500" />
            Purchase Order Status Distribution
          </h3>
          {poStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={poStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {poStatusData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs text-surface-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-surface-400 text-sm">
              No purchase orders yet
            </div>
          )}
        </div>

        {/* Production Output Chart */}
        <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-surface-700 mb-4 flex items-center gap-2">
            <Factory className="w-4 h-4 text-primary-500" />
            Production Plan Output (Sets)
          </h3>
          {productionChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={productionChartData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="quantity" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-surface-400 text-sm">
              No production plans yet
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-surface-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-500" />
            Recent Purchase Orders
          </h3>
          <button
            onClick={() => navigate('/purchase-orders')}
            className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
          >
            View All →
          </button>
        </div>

        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-surface-500">PO Number</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-surface-500">Customer</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-surface-500">Items</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-surface-500">Delivery</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-surface-500">Priority</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-surface-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    onClick={() => navigate(`/purchase-orders/${order._id}`)}
                    className="cursor-pointer hover:bg-surface-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-primary-600">{order.poNumber}</td>
                    <td className="py-3 px-4 text-surface-600">{order.customerSnapshot?.companyName || '—'}</td>
                    <td className="py-3 px-4 text-surface-600">{order.totalItems}</td>
                    <td className="py-3 px-4 text-surface-600">{formatDate(order.expectedDeliveryDate)}</td>
                    <td className="py-3 px-4"><StatusBadge status={order.priority} size="xs" /></td>
                    <td className="py-3 px-4"><StatusBadge status={order.status} size="xs" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-surface-400 text-sm">
            No purchase orders yet
          </div>
        )}
      </div>
    </div>
  );
}
