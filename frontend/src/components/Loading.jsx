import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <Loader2
      className={`animate-spin text-primary-500 ${sizeStyles[size]} ${className}`}
    />
  );
}

export function LoadingPage({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-surface-200" />
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
      </div>
      <p className="text-sm text-surface-500 font-medium">{message}</p>
    </div>
  );
}

export function LoadingCard({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-surface-200 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="h-3 w-20 rounded animate-shimmer" />
            <div className="w-10 h-10 rounded-xl animate-shimmer" />
          </div>
          <div className="h-7 w-16 rounded animate-shimmer mt-2" />
          <div className="h-3 w-24 rounded animate-shimmer mt-3" />
        </div>
      ))}
    </div>
  );
}

export function LoadingTable({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
      <div className="bg-surface-50/80 px-5 py-3.5 border-b border-surface-200">
        <div className="flex gap-12">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-3 w-20 rounded animate-shimmer" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-5 py-4 border-b border-surface-100 last:border-0">
          <div className="flex gap-12">
            {Array.from({ length: cols }).map((_, j) => (
              <div
                key={j}
                className="h-4 rounded animate-shimmer"
                style={{ width: `${60 + Math.random() * 60}px` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 bg-white rounded-2xl border border-surface-200 p-8">
      <div className="w-16 h-16 rounded-2xl bg-danger-50 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-danger-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>
      <p className="text-surface-600 font-medium text-center">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors cursor-pointer"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
