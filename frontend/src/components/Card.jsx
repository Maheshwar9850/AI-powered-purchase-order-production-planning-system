export default function Card({
  title,
  subtitle,
  value,
  icon: Icon,
  trend,
  trendLabel,
  className = '',
  children,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-surface-200 p-5 transition-shadow duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md' : 'shadow-sm'
      } ${className}`}
    >
      <div className="relative z-10">
        {/* Header row */}
        {(title || Icon) && (
          <div className="flex items-start justify-between mb-3">
            <div>
              {title && (
                <p className="text-sm font-medium text-surface-600">
                  {title}
                </p>
              )}
              {subtitle && (
                <p className="text-xs text-surface-400 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            {Icon && (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-50 text-surface-500">
                <Icon className="w-4 h-4" />
              </div>
            )}
          </div>
        )}

        {/* Value */}
        {value !== undefined && (
          <p className="text-2xl font-semibold text-surface-900 tracking-tight">
            {value}
          </p>
        )}

        {/* Trend */}
        {trend !== undefined && (
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                trend >= 0
                  ? 'bg-success-50 text-success-700'
                  : 'bg-danger-50 text-danger-700'
              }`}
            >
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
            {trendLabel && (
              <span className="text-xs text-surface-500">
                {trendLabel}
              </span>
            )}
          </div>
        )}

        {/* Custom children */}
        {children && <div className={title || value ? 'mt-4' : ''}>{children}</div>}
      </div>
    </div>
  );
}
