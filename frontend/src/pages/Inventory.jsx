import { Warehouse, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import Card from '../components/Card.jsx';
import DataTable from '../components/DataTable.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { LoadingTable, ErrorState } from '../components/Loading.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { fetchInventory } from '../api/client.js';
import { formatNumber } from '../utils/formatters.js';

export default function Inventory() {
  const { data: inventory, loading, error, refetch } = useFetch(fetchInventory, []);

  if (loading) return <LoadingTable rows={6} cols={5} />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const items = inventory || [];

  // Compute summaries
  const totalMaterials = items.length;
  const shortages = items.filter(
    (i) => (i.availableQuantity - i.reservedQuantity) <= (i.reorderLevel || 0)
  ).length;
  const totalStock = items.reduce((s, i) => s + i.availableQuantity, 0);

  // Chart data
  const chartData = items.map((item) => ({
    name: item.materialCode,
    available: item.availableQuantity,
    reserved: item.reservedQuantity,
    usable: Math.max(0, item.availableQuantity - item.reservedQuantity),
    reorder: item.reorderLevel || 0,
  }));

  const columns = [
    {
      key: 'materialCode',
      label: 'Material Code',
      render: (val) => (
        <span className="font-mono text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-md border border-primary-100">
          {val}
        </span>
      ),
    },
    {
      key: 'availableQuantity',
      label: 'Available',
      render: (val) => (
        <span className="font-semibold text-surface-900">{formatNumber(val)}</span>
      ),
    },
    {
      key: 'reservedQuantity',
      label: 'Reserved',
      render: (val) => (
        <span className="text-warning-600 font-medium">{formatNumber(val)}</span>
      ),
    },
    {
      key: 'usableStock',
      label: 'Usable Stock',
      render: (val, row) => {
        const usable = val ?? Math.max(0, row.availableQuantity - row.reservedQuantity);
        return (
          <span className="font-semibold text-surface-900">{formatNumber(usable)}</span>
        );
      },
    },
    {
      key: 'reorderLevel',
      label: 'Reorder Level',
      render: (val) => (
        <span className="text-surface-500">{formatNumber(val || 0)}</span>
      ),
    },
    {
      key: 'warehouse',
      label: 'Location',
      render: (val, row) => (
        <div>
          <p className="font-medium text-surface-800">{val}</p>
          <p className="text-xs text-surface-500">{row.location}</p>
        </div>
      ),
    },
    {
      key: '_status',
      label: 'Status',
      sortable: false,
      render: (_, row) => {
        const usable = Math.max(0, row.availableQuantity - row.reservedQuantity);
        const isShort = usable <= (row.reorderLevel || 0);
        return <StatusBadge status={isShort ? 'SHORTAGE' : 'SUFFICIENT'} />;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Inventory Management"
        description="Monitor raw materials and component stock levels"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Total Materials" value={totalMaterials} icon={Package} />
        <Card
          title="Material Shortages"
          value={shortages}
          icon={AlertTriangle}
        >
          <p className="text-xs mt-1 text-surface-500">
            {shortages > 0 ? 'Below reorder level' : 'All materials adequate'}
          </p>
        </Card>
        <Card title="Total Stock" value={formatNumber(totalStock)} icon={Warehouse} />
        <Card
          title="Healthy Materials"
          value={totalMaterials - shortages}
          icon={CheckCircle}
        >
          <p className="text-xs mt-1 text-surface-500">Above reorder level</p>
        </Card>
      </div>

      {/* Stock Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <Warehouse className="w-4 h-4 text-primary-500" />
            Inventory Levels by Material
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748b' }}
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
              <Bar dataKey="available" fill="#6366f1" radius={[4, 4, 0, 0]} name="Available" />
              <Bar dataKey="reserved" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Reserved" />
              <Bar dataKey="usable" fill="#10b981" radius={[4, 4, 0, 0]} name="Usable" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={items}
        emptyMessage="No inventory records found"
      />
    </div>
  );
}
