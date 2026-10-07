const statusConfig = {
  // Purchase Order statuses
  RECEIVED: { label: 'Received', color: 'bg-primary-50 text-primary-700 border-primary-200' },
  PROCESSING: { label: 'Processing', color: 'bg-primary-50 text-primary-700 border-primary-200' },
  EXTRACTED: { label: 'Extracted', color: 'bg-primary-50 text-primary-700 border-primary-200' },
  VALIDATED: { label: 'Validated', color: 'bg-primary-50 text-primary-700 border-primary-200' },
  INVENTORY_CHECKED: { label: 'Inventory Checked', color: 'bg-primary-50 text-primary-700 border-primary-200' },
  PLANNING: { label: 'Planning', color: 'bg-warning-50 text-warning-700 border-warning-200' },
  AWAITING_APPROVAL: { label: 'Awaiting Approval', color: 'bg-warning-50 text-warning-700 border-warning-200' },
  APPROVED: { label: 'Approved', color: 'bg-success-50 text-success-700 border-success-200' },
  REJECTED: { label: 'Rejected', color: 'bg-danger-50 text-danger-700 border-danger-200' },
  IN_PRODUCTION: { label: 'In Production', color: 'bg-primary-50 text-primary-700 border-primary-200' },
  COMPLETED: { label: 'Completed', color: 'bg-success-50 text-success-700 border-success-200' },
  CANCELLED: { label: 'Cancelled', color: 'bg-surface-100 text-surface-600 border-surface-200' },

  // Production Plan statuses
  DRAFT: { label: 'Draft', color: 'bg-surface-100 text-surface-600 border-surface-200' },
  PENDING_APPROVAL: { label: 'Pending Approval', color: 'bg-warning-50 text-warning-700 border-warning-200' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-primary-50 text-primary-700 border-primary-200' },

  // Approval statuses
  PENDING: { label: 'Pending', color: 'bg-warning-50 text-warning-700 border-warning-200' },

  // Purchase Request statuses
  ORDERED: { label: 'Ordered', color: 'bg-primary-50 text-primary-700 border-primary-200' },

  // Inventory statuses
  SUFFICIENT: { label: 'Sufficient', color: 'bg-success-50 text-success-700 border-success-200' },
  SHORTAGE: { label: 'Shortage', color: 'bg-danger-50 text-danger-700 border-danger-200' },

  // Priority levels
  LOW: { label: 'Low', color: 'bg-surface-100 text-surface-600 border-surface-200' },
  MEDIUM: { label: 'Medium', color: 'bg-primary-50 text-primary-700 border-primary-200' },
  HIGH: { label: 'High', color: 'bg-warning-50 text-warning-700 border-warning-200' },
  URGENT: { label: 'Urgent', color: 'bg-danger-50 text-danger-700 border-danger-200' },

  // Schedule statuses
  SCHEDULED: { label: 'Scheduled', color: 'bg-primary-50 text-primary-700 border-primary-200' },
};

export default function StatusBadge({ status, size = 'sm', className = '' }) {
  const config = statusConfig[status] || {
    label: status,
    color: 'bg-surface-100 text-surface-600 border-surface-200',
  };

  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${config.color} ${sizeStyles[size]} ${className}`}
    >
      {config.label}
    </span>
  );
}
