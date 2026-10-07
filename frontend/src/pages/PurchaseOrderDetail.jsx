import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowLeft,
  Play,
  CheckCircle,
  Package,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import Card from '../components/Card.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { LoadingPage, ErrorState } from '../components/Loading.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useFetch } from '../hooks/useFetch.js';
import {
  fetchPurchaseOrder,
  processPurchaseOrder,
  validatePurchaseOrder,
  fetchPOTimeline,
} from '../api/client.js';
import { formatDate, formatDateTime, formatNumber } from '../utils/formatters.js';

export default function PurchaseOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [processResult, setProcessResult] = useState(null);

  const { data: order, loading, error, refetch } = useFetch(
    () => fetchPurchaseOrder(id),
    [id]
  );
  const { data: timeline, refetch: refetchTimeline } = useFetch(
    () => fetchPOTimeline(id),
    [id]
  );

  const handleProcess = async () => {
    setProcessing(true);
    try {
      const res = await processPurchaseOrder(id);
      setProcessResult(res.data?.data || res.data);
      refetch();
      refetchTimeline();
    } catch (err) {
      setProcessResult({ error: err.response?.data?.message || 'Processing failed' });
    } finally {
      setProcessing(false);
    }
  };

  const handleValidate = async () => {
    setProcessing(true);
    try {
      await validatePurchaseOrder(id);
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <LoadingPage message="Loading purchase order..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!order) return <ErrorState message="Purchase order not found" />;

  const timelineEvents = timeline?.events || timeline || [];

  return (
    <div className="space-y-6">
      {/* Back button + Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/purchase-orders')}
            className="mt-1 p-1.5 rounded-lg text-surface-500 hover:text-surface-900 hover:bg-surface-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-surface-900 tracking-tight">{order.poNumber}</h1>
              <StatusBadge status={order.status} />
              <StatusBadge status={order.priority} />
            </div>
            <p className="text-sm text-surface-500 mt-1">
              Created {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {['RECEIVED', 'EXTRACTED'].includes(order.status) && (
            <button
              onClick={handleValidate}
              disabled={processing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              Validate
            </button>
          )}
          {['RECEIVED', 'VALIDATED', 'EXTRACTED'].includes(order.status) && (
            <button
              onClick={handleProcess}
              disabled={processing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Process Workflow
            </button>
          )}
        </div>
      </div>

      {/* Process Result */}
      {processResult && (
        <div
          className={`rounded-xl border p-4 ${
            processResult.error
              ? 'bg-danger-50 border-danger-200 text-danger-700'
              : 'bg-success-50 border-success-200 text-success-700'
          }`}
        >
          {processResult.error ? (
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium text-sm">{processResult.error}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium text-sm">
                Workflow processed successfully! Status: {processResult.poStatus}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Customer" icon={User}>
          <p className="text-base font-semibold text-surface-900 mt-1">
            {order.customerSnapshot?.companyName || '—'}
          </p>
          <p className="text-xs text-surface-500">{order.customerSnapshot?.customerCode}</p>
        </Card>
        <Card title="Order Date" icon={Calendar}>
          <p className="text-base font-semibold text-surface-900 mt-1">
            {formatDate(order.poDate)}
          </p>
          <p className="text-xs text-surface-500">
            Due: {formatDate(order.expectedDeliveryDate)}
          </p>
        </Card>
        <Card title="Total Items" icon={Package}>
          <p className="text-base font-semibold text-surface-900 mt-1">
            {formatNumber(order.totalItems)}
          </p>
          <p className="text-xs text-surface-500">{order.items?.length} line items</p>
        </Card>
        <Card title="Source" icon={FileText}>
          <p className="text-base font-semibold text-surface-900 mt-1">
            {order.sourceType?.replace('_', ' ')}
          </p>
          <p className="text-xs text-surface-500">
            Confidence: {((order.extractionConfidence || 0) * 100).toFixed(0)}%
          </p>
        </Card>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-surface-900 mb-4">Order Line Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50">
                <th className="text-left py-3 px-4 text-xs font-medium text-surface-500">Product</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-surface-500">Code</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-surface-500">Quantity</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-surface-500">Unit</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-surface-500">Delivery Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {order.items?.map((item, idx) => (
                <tr key={idx} className="hover:bg-surface-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-surface-800">{item.productName}</td>
                  <td className="py-3 px-4 text-surface-500 font-mono text-xs">{item.productCode}</td>
                  <td className="py-3 px-4 text-right font-semibold text-surface-800">
                    {formatNumber(item.quantity)}
                  </td>
                  <td className="py-3 px-4 text-surface-500">{item.unit}</td>
                  <td className="py-3 px-4 text-surface-600">{formatDate(item.requiredDeliveryDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timeline */}
      {Array.isArray(timelineEvents) && timelineEvents.length > 0 && (
        <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-surface-900 mb-6">Workflow Timeline</h3>
          <div className="relative">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-surface-200" />
            <div className="space-y-6">
              {timelineEvents.map((evt, idx) => (
                <div key={idx} className="flex items-start gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-white border border-primary-200 flex items-center justify-center z-10 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-primary-500" />
                  </div>
                  <div className="flex-1 pb-2">
                    <p className="text-sm font-medium text-surface-900">{evt.description}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-surface-500">
                        {formatDateTime(evt.timestamp || evt.createdAt)}
                      </span>
                      <span className="text-[10px] text-surface-600 font-mono bg-surface-100 px-1.5 py-0.5 rounded border border-surface-200">
                        {evt.eventType}
                      </span>
                      <span className="text-xs text-surface-500">{evt.actorType}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {order.notes && (
        <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-surface-900 mb-3">Notes</h3>
          <p className="text-sm text-surface-600 leading-relaxed">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
