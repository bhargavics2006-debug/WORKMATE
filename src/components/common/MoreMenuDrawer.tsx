import React from 'react';
import {
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
  Bell,
  Settings,
  Mic,
  X,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useWorkmate, AppTab } from '../../context/WorkmateContext';
import { getTranslation } from '../../utils/translations';

interface MoreMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MoreMenuDrawer: React.FC<MoreMenuDrawerProps> = ({ isOpen, onClose }) => {
  const {
    activeTab,
    setActiveTab,
    unreadNotificationsCount,
    unreadChatCount,
    lowStockMaterialsCount,
    budgetStatus,
    setIsVoiceModalOpen,
    settings,
  } = useWorkmate();

  const t = getTranslation(settings.language || 'en');

  if (!isOpen) return null;

  const moreItems: {
    id: AppTab | 'voice';
    label: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
    isEmergency?: boolean;
    isSpecialAction?: boolean;
  }[] = [
    {
      id: 'wages',
      label: t.wages || 'Wages & Salary',
      description: 'Payroll calculations, worker payouts & printable wage slips',
      icon: Coins,
    },
    {
      id: 'expenses',
      label: t.expenses || 'Expense Management',
      description: 'Track cement, equipment, fuel, and operational spending',
      icon: Receipt,
    },
    {
      id: 'budget',
      label: t.budget || 'Budget & Guards',
      description: 'Budget utilization, 80%/95% warnings & cost breakdown',
      icon: PieChart,
      badge: budgetStatus === 'exceeded' ? 'EXCEEDED' : budgetStatus === 'danger' ? 'CRITICAL' : undefined,
      badgeColor: 'bg-red-500 text-white font-extrabold',
    },
    {
      id: 'materials',
      label: t.materials || 'Materials & Stock',
      description: 'Inventory levels, stock deductions & low-stock alerts',
      icon: Package,
      badge: lowStockMaterialsCount > 0 ? `${lowStockMaterialsCount} Low` : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    },
    {
      id: 'site_progress',
      label: t.siteProgress || 'Site Progress',
      description: 'Milestone tracker, deliverable checklists & photo gallery',
      icon: TrendingUp,
    },
    {
      id: 'daily_report',
      label: t.dailyReport || 'Daily Site Report',
      description: 'Formal executive logs, attendance, materials & OSHA safety',
      icon: FileText,
    },
    {
      id: 'scanner',
      label: t.scanner || 'Bill Scanner',
      description: 'Camera capture, invoice details & automatic expense entry',
      icon: Camera,
    },
    {
      id: 'chat',
      label: t.chat || 'Team Chat',
      description: 'Crew messaging, field channels & direct shift communications',
      icon: MessageSquare,
      badge: unreadChatCount > 0 ? unreadChatCount : undefined,
      badgeColor: 'bg-blue-500 text-white font-bold',
    },
    {
      id: 'emergency',
      label: t.emergency || 'Emergency SOS',
      description: 'Immediate crisis response, speed dial (tel:/sms:) & incident log',
      icon: ShieldAlert,
      isEmergency: true,
    },
    {
      id: 'location_attendance',
      label: t.locationAttendance || 'Location Check-in',
      description: 'Geofenced GPS radar verification & site proximity stamping',
      icon: MapPin,
    },
    {
      id: 'voice',
      label: t.voiceCommands || 'Voice Assistant',
      description: 'Telugu, Hindi & English hands-free voice operations',
      icon: Mic,
      isSpecialAction: true,
    },
    {
      id: 'notifications',
      label: t.notifications || 'Notifications',
      description: 'System alerts, low inventory, wage & safety notices',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    },
    {
      id: 'settings',
      label: t.settings || 'Settings & Tools',
      description: 'Languages, backup JSON, password, currency & profiles',
      icon: Settings,
    },
  ];

  const handleSelect = (item: typeof moreItems[0]) => {
    onClose();
    if (item.id === 'voice') {
      setIsVoiceModalOpen(true);
    } else {
      setActiveTab(item.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
      {/* Drawer Container */}
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col justify-between shadow-2xl text-slate-100 animate-slide-left">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
              WM
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Operations Menu</h3>
              <p className="text-[11px] text-blue-300">All Site Management Modules</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modules List */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-2 flex-1">
          {moreItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between group ${
                  item.isEmergency
                    ? 'bg-red-950/40 border-red-500/40 hover:bg-red-900/40 hover:border-red-500'
                    : isActive
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-slate-850/80 hover:bg-slate-800 border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0 pr-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      item.isEmergency
                        ? 'bg-red-600 text-white'
                        : isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-blue-400 group-hover:bg-blue-600/20'
                    }`}
                  >
                    <Icon className="w-4 h-4 stroke-[2.2]" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className={`font-black text-xs ${item.isEmergency ? 'text-red-300' : 'text-white'}`}>
                        {item.label}
                      </span>
                      {item.badge !== undefined && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${item.badgeColor || 'bg-slate-700 text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 text-center">
          <p className="text-[10px] text-slate-500">
            WORKMATE • Smart Workforce & Site Management
          </p>
        </div>
      </div>
    </div>
  );
};
