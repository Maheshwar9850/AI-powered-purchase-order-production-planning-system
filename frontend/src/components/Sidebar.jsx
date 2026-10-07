import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Warehouse,
  Factory,
  FileText,
  CheckCircle,
  Clock,
  Hexagon,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
  { to: '/inventory', label: 'Inventory', icon: Warehouse },
  { to: '/production-plans', label: 'Production Plans', icon: Factory },
  { to: '/purchase-requests', label: 'Purchase Requests', icon: FileText },
  { to: '/approvals', label: 'Approvals', icon: CheckCircle },
  { to: '/timeline', label: 'Timeline', icon: Clock },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-[260px] flex-shrink-0 bg-surface-900 text-white flex flex-col h-screen overflow-y-auto border-r border-surface-800">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-surface-800 shrink-0 sticky top-0 bg-surface-900 z-10">
        <Hexagon className="w-6 h-6 text-primary-400" />
        <div className="overflow-hidden">
          <h1 className="text-base font-bold tracking-tight leading-tight text-white truncate">
            MFG Copilot
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive =
            location.pathname === to ||
            (to !== '/dashboard' && location.pathname.startsWith(to));
          return (
            <NavLink
              key={to}
              to={to}
              className={`group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-600/10 text-primary-400'
                  : 'text-surface-400 hover:bg-surface-800 hover:text-surface-200'
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isActive ? 'text-primary-400' : 'text-surface-500 group-hover:text-surface-300'
                }`}
              />
              <span className="truncate">{label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
