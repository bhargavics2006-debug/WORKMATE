import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  FileSpreadsheet,
  Menu,
  Coins,
  Receipt,
  PieChart,
  Package,
  TrendingUp,
  FileText,
  Camera,
  MessageSquare,
  ShieldAlert,
  MapPin,
  Settings,
} from 'lucide-react';
import { useWorkmate, AppTab } from '../../context/WorkmateContext';
import { getTranslation } from '../../utils/translations';
import { MoreMenuDrawer } from './MoreMenuDrawer';

export const BottomNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    todayStats,
    budgetStatus,
    settings,
    unreadChatCount,
    unreadNotificationsCount,
    lowStockMaterialsCount,
    isMoreMenuOpen,
    setIsMoreMenuOpen,
  } = useWorkmate();

  const t = getTranslation(settings.language || 'en');

  // Mobile 5 items as strictly required
  const mobileNavItems: {
    id: AppTab | 'more';
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: t.home || 'Home', icon: LayoutDashboard },
    { id: 'workers', label: t.workers || 'Workers', icon: Users, badge: todayStats.totalWorkers || undefined },
    {
      id: 'attendance',
      label: t.attendance || 'Attendance',
      icon: CalendarCheck,
      badge: todayStats.unmarked > 0 ? `${todayStats.unmarked}` : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    },
    { id: 'reports', label: t.reports || 'Reports', icon: FileSpreadsheet },
    {
      id: 'more',
      label: t.more || 'More',
      icon: Menu,
      badge: (unreadNotificationsCount > 0 || unreadChatCount > 0) ? '•' : undefined,
      badgeColor: 'bg-blue-500 text-white font-extrabold',
    },
  ];

  // Desktop navigation items (multi-module access)
  const desktopNavItems: {
    id: AppTab;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: t.home || 'Home', icon: LayoutDashboard },
    { id: 'workers', label: t.workers || 'Workers', icon: Users },
    { id: 'attendance', label: t.attendance || 'Attendance', icon: CalendarCheck },
    { id: 'location_attendance', label: 'Check-in', icon: MapPin },
    { id: 'site_progress', label: 'Site Progress', icon: TrendingUp },
    { id: 'daily_report', label: 'Daily Report', icon: FileText },
    { id: 'wages', label: t.wages || 'Wages', icon: Coins },
    { id: 'expenses', label: t.expenses || 'Expenses', icon: Receipt },
    { id: 'budget', label: t.budget || 'Budget', icon: PieChart },
    {
      id: 'materials',
      label: t.materials || 'Materials',
      icon: Package,
      badge: lowStockMaterialsCount > 0 ? `${lowStockMaterialsCount}` : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    },
    { id: 'scanner', label: t.scanner || 'Scanner', icon: Camera },
    {
      id: 'chat',
      label: t.chat || 'Chat',
      icon: MessageSquare,
      badge: unreadChatCount > 0 ? unreadChatCount : undefined,
      badgeColor: 'bg-blue-500 text-white font-bold',
    },
    { id: 'reports', label: t.reports || 'Reports', icon: FileSpreadsheet },
  ];

  return (
    <>
      {/* Desktop / Tablet Sub-Header Navigation Bar */}
      <nav className="hidden md:block bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-14 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between py-1.5 overflow-x-auto">
          <div className="flex items-center space-x-1">
            {desktopNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all relative shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                        isActive ? 'bg-slate-950 text-white' : item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsMoreMenuOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white border border-slate-700 text-xs font-bold shrink-0 ml-2 transition"
          >
            <Menu className="w-3.5 h-3.5" />
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar (5 Items: Home, Workers, Attendance, Reports, More) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/90 px-3 py-1 shadow-2xl safe-area-bottom">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {mobileNavItems.map(item => {
            const Icon = item.icon;
            const isMore = item.id === 'more';
            const isActive = isMore ? isMoreMenuOpen : activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isMore) {
                    setIsMoreMenuOpen(!isMoreMenuOpen);
                  } else {
                    setActiveTab(item.id as AppTab);
                  }
                }}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all relative flex-1 min-w-[56px] ${
                  isActive ? 'text-blue-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? 'scale-110 stroke-[2.5] text-blue-400' : 'stroke-[1.8]'
                    }`}
                  />
                  {item.badge !== undefined && (
                    <span
                      className={`absolute -top-1 -right-2 text-[9px] font-black min-w-[14px] h-3.5 px-1 rounded-full flex items-center justify-center ${
                        item.badgeColor || 'bg-blue-600 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1 tracking-tight truncate ${
                    isActive ? 'font-black text-blue-400' : 'font-medium text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <div className="w-1.5 h-1 rounded-full bg-blue-500 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* More Operations Menu Drawer */}
      <MoreMenuDrawer
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
      />
    </>
  );
};
