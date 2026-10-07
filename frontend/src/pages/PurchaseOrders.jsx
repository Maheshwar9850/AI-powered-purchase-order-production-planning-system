import { useNavigate } from 'react-router-dom';
import { Plus, Eye } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { LoadingTable, ErrorState } from '../components/Loading.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { fetchPurchaseOrders } from '../api/client.js';
import { formatDate, formatNumber } from '../utils/formatters.js';

export default function PurchaseOrders() {
  const navigate = useNavigate();
  const { data: orders, loading, error, refetch } = useFetch(fetchPurchaseOrders, []);

  if (loading) return <LoadingTable rows={8} cols={6} />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const columns = [
    {
      key: 'poNumber',
      label: 'PO Number',
      render: (val) => (
        <span className="font-semibold text-primary-600">{val}</span>
      ),
    },
    {
      key: 'customerSnapshot',
      label: 'Customer',
      render: (val) => (
        <div>
          <p className="font-medium text-surface-800">{val?.companyName || '—'}</p>
          <p className="text-xs text-surface-400">{val?.customerCode || ''}</p>
        </div>
      ),
    },
    {
      key: 'totalItems',
      label: 'Items',
      render: (val) => (
        <span className="font-medium">{formatNumber(val)}</span>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (val) => <StatusBadge status={val} size="xs" />,
    },
    {
      key: 'expectedDeliveryDate',
      label: 'Delivery Date',
      render: (val) => (
        <span className="text-surface-600">{formatDate(val)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: '_id',
      label: 'Actions',
      sortable: false,
      render: (val) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/purchase-orders/${val}`);
          }}
          className="p-1.5 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer"
          title="View details"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Purchase Orders"
        description={`${orders?.length ?? 0} purchase orders found`}
      />

      <DataTable
        columns={columns}
        data={orders || []}
        onRowClick={(row) => navigate(`/purchase-orders/${row._id}`)}
        emptyMessage="No purchase orders found. Create your first PO to get started."
      />
    </div>
  );
}
