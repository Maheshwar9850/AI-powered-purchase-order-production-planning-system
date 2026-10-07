import { useState } from 'react';
import { Search, Clock, Filter } from 'lucide-react';
import StatusBadge from '../components/StatusBadge.jsx';
import { LoadingPage, ErrorState } from '../components/Loading.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { fetchPurchaseOrders, fetchPOTimeline } from '../api/client.js';
import { formatDateTime, timeAgo } from '../utils/formatters.js';

const eventColors = {
  PO_RECEIVED: 'bg-info-500',
  PO_VALIDATED: 'bg-primary-500',
  INVENTORY_CHECK: 'bg-warning-500',
  INVENTORY_CHECKED: 'bg-warning-500',
  PRODUCTION_PLAN_GENERATED: 'bg-primary-600',
  PURCHASE_REQUEST_GENERATED: 'bg-warning-600',
  APPROVAL_REQUESTED: 'bg-warning-500',
  APPROVAL_APPROVED: 'bg-success-500',
  APPROVAL_REJECTED: 'bg-danger-500',
  PO_STATUS_UPDATED: 'bg-info-500',
  PO_PROCESSING: 'bg-info-400',
  WORKFLOW_COMPLETE: 'bg-success-600',
};

export default function Timeline() {
  const { data: orders, loading: ordersLoading, error: ordersError, refetch } =
    useFetch(fetchPurchaseOrders, []);
  const [selectedPO, setSelectedPO] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [filter, setFilter] = useState('');

  const handleSelectPO = async (order) => {
    setSelectedPO(order);
    setEventsLoading(true);
    try {
      const res = await fetchPOTimeline(order._id);
      const data = res.data?.data || res.data;
      setEvents(Array.isArray(data) ? data : data?.events || []);
    } catch {
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  if (ordersLoading) return <LoadingPage message="Loading orders..." />;
  if (ordersError) return <ErrorState message={ordersError} onRetry={refetch} />;

  const orderList = orders || [];
  const filteredOrders = filter
    ? orderList.filter(
        (o) =>
          o.poNumber?.toLowerCase().includes(filter.toLowerCase()) ||
          o.customerSnapshot?.companyName?.toLowerCase().includes(filter.toLowerCase())
      )
    : orderList;

  return (
    <div className="space-y-6 min-h-[600px] flex flex-col">
      <PageHeader 
        title="Workflow Timeline"
        description="Track the lifecycle of purchase orders through the system"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left: PO List */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-surface-200 overflow-hidden flex flex-col shadow-sm">
          <div className="p-4 border-b border-surface-200">
            <div className="flex items-center gap-2 bg-surface-50 rounded-lg px-3 py-2 border border-surface-200 focus-within:border-primary-400 transition-colors">
              <Search className="w-4 h-4 text-surface-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-transparent text-sm text-surface-700 placeholder-surface-400 outline-none w-full"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 max-h-[600px]">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-surface-400 text-sm">No orders found</div>
            ) : (
              filteredOrders.map((order) => (
                <button
                  key={order._id}
                  onClick={() => handleSelectPO(order)}
                  className={`w-full text-left px-4 py-3 border-b border-surface-100 transition-colors cursor-pointer hover:bg-surface-50 ${
                    selectedPO?._id === order._id ? 'bg-primary-50 hover:bg-primary-50 border-l-2 border-l-primary-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-surface-900">{order.poNumber}</span>
                    <StatusBadge status={order.status} size="xs" />
                  </div>
                  <p className="text-xs text-surface-500 mt-0.5">
                    {order.customerSnapshot?.companyName}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Timeline */}
        <div className="lg:col-span-8 flex flex-col">
          {!selectedPO ? (
            <div className="bg-white rounded-xl border border-surface-200 flex-1 flex items-center justify-center shadow-sm">
              <div className="text-center p-8">
                <Clock className="w-12 h-12 mx-auto mb-4 text-surface-300" />
                <h3 className="text-base font-semibold text-surface-700">Select a Purchase Order</h3>
                <p className="text-sm text-surface-500 mt-1">
                  Choose a PO from the list to view its workflow timeline
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-sm flex-1">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-surface-100">
                <div>
                  <h3 className="text-lg font-bold text-surface-900">{selectedPO.poNumber}</h3>
                  <p className="text-sm text-surface-500 mt-0.5">
                    {selectedPO.customerSnapshot?.companyName} · Workflow Events
                  </p>
                </div>
                <StatusBadge status={selectedPO.status} size="md" />
              </div>

              {eventsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-12 text-surface-400">
                  <p className="font-medium text-surface-600">No workflow events yet</p>
                  <p className="text-sm mt-1">Process this PO to generate timeline events</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-2 bottom-2 w-px bg-surface-200" />
                  <div className="space-y-6">
                    {events.map((evt, idx) => {
                      const dotColor = eventColors[evt.eventType] || 'bg-surface-400';
                      return (
                        <div key={idx} className="flex items-start gap-4 relative animate-fade-in" style={{ animationDelay: `${idx * 60}ms` }}>
                          <div className={`w-8 h-8 rounded-full ${dotColor} flex items-center justify-center z-10 shrink-0 border-2 border-white`}>
                            <Clock className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 bg-surface-50 rounded-lg p-4 border border-surface-200 hover:shadow-sm transition-shadow">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-sm text-surface-900">{evt.description}</p>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  <span className="text-[10px] font-mono bg-white border border-surface-200 text-surface-600 px-1.5 py-0.5 rounded">
                                    {evt.eventType}
                                  </span>
                                  <span className="text-xs text-surface-500">{evt.actorType}</span>
                                </div>
                              </div>
                              <span className="text-xs text-surface-500 whitespace-nowrap">
                                {timeAgo(evt.timestamp || evt.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs text-surface-400 mt-2">
                              {formatDateTime(evt.timestamp || evt.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
