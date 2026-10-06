import React from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertTriangle,
  AlertOctagon,
  Package,
  Receipt,
  MessageSquare,
  ShieldAlert,
  Coins,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { useWorkmate, AppTab } from '../../context/WorkmateContext';
import { NotificationType } from '../../types';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotification,
    unreadNotificationsCount,
    setActiveTab,
  } = useWorkmate();

  const getNotifIcon = (type: NotificationType) => {
    switch (type) {
      case 'emergency':
        return <ShieldAlert className="w-5 h-5 text-red-400" />;
      case 'budget_exceeded':
        return <AlertOctagon className="w-5 h-5 text-red-400" />;
      case 'budget_alert':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'out_of_stock':
        return <Package className="w-5 h-5 text-rose-400" />;
      case 'low_stock':
        return <Package className="w-5 h-5 text-amber-400" />;
      case 'chat_message':
        return <MessageSquare className="w-5 h-5 text-blue-400" />;
      case 'bill_scanned':
      case 'expense_added':
        return <Receipt className="w-5 h-5 text-emerald-400" />;
      case 'wage_pending':
        return <Coins className="w-5 h-5 text-yellow-400" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-400" />
            Notifications & System Alerts
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit logs for inventory warnings, budget limits, safety broadcasts, and team updates
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {unreadNotificationsCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 flex items-center space-x-1.5 transition"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-400">
            Activity Feed ({notifications.length})
          </span>
          {unreadNotificationsCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
              {unreadNotificationsCount} Unread
            </span>
          ) : (
            <span className="text-[11px] text-emerald-400 font-semibold">
              All caught up
            </span>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs space-y-2">
            <Bell className="w-8 h-8 mx-auto text-slate-600" />
            <p>No notifications yet. Alerts will appear here automatically.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {notifications.map(item => (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition flex items-start justify-between gap-3 text-xs ${
                  item.read
                    ? 'bg-slate-850/40 border-slate-800 text-slate-400'
                    : 'bg-slate-800/90 border-slate-700 text-white shadow-md'
                }`}
              >
                <div className="flex items-start space-x-3 min-w-0">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                    {getNotifIcon(item.type)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-extrabold text-sm text-white truncate">{item.title}</h4>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">{item.message}</p>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {item.linkTab && (
                    <button
                      onClick={() => {
                        markNotificationRead(item.id);
                        setActiveTab(item.linkTab as AppTab);
                      }}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold flex items-center space-x-1"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => clearNotification(item.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg"
                    title="Dismiss notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
