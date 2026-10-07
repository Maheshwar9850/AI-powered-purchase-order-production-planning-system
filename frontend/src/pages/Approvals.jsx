import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import Card from '../components/Card.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { LoadingTable, ErrorState } from '../components/Loading.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { fetchApprovals, approveRequest, rejectRequest } from '../api/client.js';
import { formatDateTime, timeAgo } from '../utils/formatters.js';

export default function Approvals() {
  const { data: approvals, loading, error, refetch } = useFetch(fetchApprovals, []);
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const handleAction = async (id, action) => {
    setActionLoading(id);
    setFeedback(null);
    try {
      if (action === 'approve') {
        await approveRequest(id);
        setFeedback({ type: 'success', message: 'Approved successfully!' });
      } else {
        await rejectRequest(id);
        setFeedback({ type: 'success', message: 'Rejected successfully.' });
      }
      refetch();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Action failed',
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingTable rows={5} cols={5} />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const items = approvals || [];
  const pending = items.filter((a) => a.status === 'PENDING');
  const processed = items.filter((a) => a.status !== 'PENDING');

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Approvals"
        description="Review and authorize pending workflow actions"
      />

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total Approvals" value={items.length} icon={Shield} />
        <Card
          title="Pending"
          value={pending.length}
          icon={Clock}
        >
          <p className="text-xs mt-1 text-surface-500">
            {pending.length > 0 ? 'Requires your action' : 'All caught up!'}
          </p>
        </Card>
        <Card title="Processed" value={processed.length} icon={CheckCircle}>
          <p className="text-xs mt-1 text-surface-500">Approved or rejected</p>
        </Card>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`rounded-xl border p-4 flex items-center gap-2 shadow-sm ${
            feedback.type === 'success'
              ? 'bg-success-50 border-success-200 text-success-700'
              : 'bg-danger-50 border-danger-200 text-danger-700'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span className="font-medium text-sm">{feedback.message}</span>
        </div>
      )}

      {/* Pending Approvals */}
      {pending.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-surface-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-warning-500" />
            Pending Approvals ({pending.length})
          </h3>
          <div className="space-y-3">
            {pending.map((approval) => (
              <div
                key={approval._id}
                className="bg-white rounded-xl border border-surface-200 p-5 flex items-center justify-between hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-warning-50 border border-warning-200 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-warning-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-surface-900">
                        {approval.entityType?.replace('_', ' ')}
                      </p>
                      <StatusBadge status={approval.status} size="xs" />
                    </div>
                    <p className="text-xs text-surface-500 mt-0.5">
                      Requested {timeAgo(approval.requestedAt || approval.createdAt)} ·{' '}
                      {formatDateTime(approval.requestedAt || approval.createdAt)}
                    </p>
                    {approval.comments && (
                      <p className="text-xs text-surface-600 mt-1">{approval.comments}</p>
                    )}
                    <p className="text-xs text-surface-400 mt-0.5 font-mono">
                      Entity: {approval.entityId?.slice(-8)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(approval._id, 'reject')}
                    disabled={actionLoading === approval._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg text-danger-700 bg-danger-50 hover:bg-danger-100 border border-danger-200 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoading === approval._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Reject
                  </button>
                  <button
                    onClick={() => handleAction(approval._id, 'approve')}
                    disabled={actionLoading === approval._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg text-white bg-success-600 hover:bg-success-700 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoading === approval._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processed Approvals */}
      {processed.length > 0 && (
        <div className={pending.length > 0 ? "pt-4" : ""}>
          <h3 className="text-sm font-semibold text-surface-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success-500" />
            Processed ({processed.length})
          </h3>
          <div className="space-y-3">
            {processed.map((approval) => (
              <div
                key={approval._id}
                className="bg-white rounded-xl border border-surface-200 p-4 flex items-center justify-between opacity-80"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center ${
                      approval.status === 'APPROVED'
                        ? 'bg-success-50 border-success-200'
                        : 'bg-danger-50 border-danger-200'
                    }`}
                  >
                    {approval.status === 'APPROVED' ? (
                      <CheckCircle className="w-5 h-5 text-success-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-danger-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-surface-900">
                        {approval.entityType?.replace('_', ' ')}
                      </p>
                      <StatusBadge status={approval.status} size="xs" />
                    </div>
                    <p className="text-xs text-surface-500 mt-0.5">
                      {approval.status === 'APPROVED' ? 'Approved' : 'Rejected'}{' '}
                      {timeAgo(approval.actionAt)} · {formatDateTime(approval.actionAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-12 text-surface-400 bg-white rounded-xl border border-surface-200">
          <Shield className="w-12 h-12 mx-auto mb-3 text-surface-300" />
          <p className="font-medium text-surface-600">No approvals yet</p>
          <p className="text-sm mt-1">Approvals are created when production plans or purchase requests are generated</p>
        </div>
      )}
    </div>
  );
}
