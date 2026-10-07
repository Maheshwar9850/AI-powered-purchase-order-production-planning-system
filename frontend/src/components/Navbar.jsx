import { useLocation } from 'react-router-dom';
import { Bell, Search, RefreshCw } from 'lucide-react';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/purchase-orders': 'Purchase Orders',
  '/inventory': 'Inventory Management',
  '/production-plans': 'Production Plans',
  '/purchase-requests': 'Purchase Requests',
  '/approvals': 'Approvals',
  '/timeline': 'Workflow Timeline',
};

export default function Navbar({ onRefresh, loading }) {
  const location = useLocation();

  const getTitle = () => {
    for (const [path, title] of Object.entries(pageTitles)) {
      if (location.pathname.startsWith(path)) return title;
    }
    return 'Dashboard';
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-surface-200 h-16 shrink-0 flex items-center justify-between px-6 transition-all">
      {/* Page title */}
      <div>
        <h2 className="text-lg font-semibold text-surface-900 tracking-tight">
          {getTitle()}
        </h2>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-surface-50 rounded-lg px-3 py-1.5 border border-surface-200 focus-within:border-primary-400 focus-within:ring-1 focus-within:ring-primary-400 transition-all">
          <Search className="w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-surface-700 placeholder-surface-400 outline-none w-48"
          />
        </div>

        {/* Refresh */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-lg text-surface-500 hover:text-primary-700 hover:bg-primary-50 transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}

        {/* Notifications */}
        <button className="relative p-1.5 rounded-lg text-surface-500 hover:text-primary-700 hover:bg-primary-50 transition-colors cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger-500 ring-2 ring-white" />
        </button>

        {/* Profile avatar */}
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold cursor-pointer border border-primary-200 hover:bg-primary-200 transition-colors">
          OP
        </div>
      </div>
    </header>
  );
}
