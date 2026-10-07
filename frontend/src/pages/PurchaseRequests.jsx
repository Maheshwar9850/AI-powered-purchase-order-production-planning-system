import { FileText, Package, AlertTriangle, DollarSign } from 'lucide-react';
import Card from '../components/Card.jsx';
import DataTable from '../components/DataTable.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { LoadingTable, ErrorState } from '../components/Loading.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { fetchPurchaseRequests } from '../api/client.js';
import { formatDate, formatNumber, formatCurrency } from '../utils/formatters.js';

export default function PurchaseRequests() {
  const { data: requests, loading, error, refetch } = useFetch(fetchPurchaseRequests, []);

  if (loading) return <LoadingTable rows={5} cols={5} />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const items = requests || [];
  const totalCost = items.reduce((s, r) => s + (r.totalEstimatedCost || 0), 0);
  const pendingCount = items.filter((r) => r.status === 'PENDING_APPROVAL').length;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Purchase Requests"
        description="Auto-generated procurement requests for material shortages"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Total Requests" value={items.length} icon={FileText} />
        <Card
          title="Pending Approval"
          value={pendingCount}
          icon={AlertTriangle}
        >
          <p className="text-xs mt-1 text-surface-500">
            {pendingCount > 0 ? 'Needs review' : 'All processed'}
          </p>
        </Card>
        <Card title="Est. Total Cost" value={formatCurrency(totalCost)} icon={DollarSign}>
          <p className="text-xs mt-1 text-surface-500">Combined procurement cost</p>
        </Card>
        <Card title="Shortage Items" value={items.reduce((s, r) => s + (r.items?.length || 0), 0)} icon={Package} />
      </div>

      {/* Request cards */}
      {items.map((req) => (
        <div key={req._id} className="bg-white rounded-xl border border-surface-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-50 border border-surface-200 flex items-center justify-center">
                <FileText className="w-5 h-5 text-surface-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-surface-900">
                  {req.requestNumber}
                </h3>
                <p className="text-xs text-surface-500 mt-0.5">
                  {req.reason}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={req.priority} size="xs" />
              <StatusBadge status={req.status} size="md" />
            </div>
          </div>

          {/* Material shortage items */}
          {req.items && req.items.length > 0 && (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm border border-surface-200 rounded-lg">
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50">
                    <th className="text-left py-2 px-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Material</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Code</th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Required</th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Available</th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Shortage</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Unit</th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Est. Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {req.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-surface-50 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-surface-800">{item.materialName}</td>
                      <td className="py-2.5 px-3 font-mono text-xs text-surface-500">{item.materialCode}</td>
                      <td className="py-2.5 px-3 text-right text-surface-600">{formatNumber(item.requiredQuantity)}</td>
                      <td className="py-2.5 px-3 text-right text-surface-600">{formatNumber(item.availableQuantity)}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-danger-600">{formatNumber(item.shortageQuantity)}</td>
                      <td className="py-2.5 px-3 text-surface-500">{item.unit}</td>
                      <td className="py-2.5 px-3 text-right text-surface-600">{formatCurrency(item.estimatedCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-200">
            <p className="text-xs text-surface-500">
              Created {formatDate(req.createdAt)}
            </p>
            <p className="text-sm font-semibold text-surface-900">
              Total: {formatCurrency(req.totalEstimatedCost)}
            </p>
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <div className="text-center py-12 text-surface-400 bg-white rounded-xl border border-surface-200">
          <FileText className="w-12 h-12 mx-auto mb-3 text-surface-300" />
          <p className="font-medium text-surface-600">No purchase requests yet</p>
          <p className="text-sm mt-1">Purchase requests are auto-generated when material shortages are detected</p>
        </div>
      )}
    </div>
  );
}
