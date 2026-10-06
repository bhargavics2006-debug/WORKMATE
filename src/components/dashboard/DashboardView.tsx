import React from 'react';
import {
  Users,
  CalendarCheck,
  Coins,
  PieChart,
  Receipt,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Plus,
  DollarSign,
  TrendingUp,
  AlertOctagon,
  Sparkles,
  Package,
  Camera,
  MessageSquare,
  ShieldAlert,
  Bell,
  Building,
  ArrowRight,
  Flame,
  UserCheck,
} from 'lucide-react';
import { useWorkmate, AppTab } from '../../context/WorkmateContext';
import { BudgetAlertBanner } from '../common/BudgetAlertBanner';
import { getTranslation } from '../../utils/translations';

export const DashboardView: React.FC = () => {
  const {
    workers,
    budget,
    totalExpenses,
    remainingBudget,
    budgetUsedPercent,
    budgetStatus,
    todayStats,
    allWorkersWageStats,
    totalWageLiabilityEarned,
    totalWageLiabilityPaid,
    totalWageLiabilityPending,
    expenses,
    materials,
    lowStockMaterialsCount,
    outOfStockMaterialsCount,
    totalStockValue,
    unreadChatCount,
    emergencyEvents,
    projects,
    currentProjectId,
    settings,
    selectedDate,
    setActiveTab,
  } = useWorkmate();

  const t = getTranslation(settings.language || 'en');
  const activeWorkersCount = workers.filter((w) => w.status === 'active').length;
  const recentExpenses = expenses.slice(0, 3);
  const activeEmergency = emergencyEvents.find(e => e.status !== 'resolved');

  return (
    <div className="space-y-5 pb-16 lg:pb-8">
      {/* Budget Alert Banner */}
      <BudgetAlertBanner />

      {/* Hero Financial Health Card (Automatic Calculations) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div
          className={`absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20 ${
            remainingBudget < 0 ? 'bg-red-500' : 'bg-amber-500'
          }`}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {budget.periodName} • {t.financialOverview}
              </span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  budgetStatus === 'exceeded'
                    ? 'bg-red-500 text-white animate-pulse'
                    : budgetStatus === 'danger'
                    ? 'bg-orange-500 text-white'
                    : budgetStatus === 'warning'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {budgetStatus === 'exceeded'
                  ? 'Exceeded'
                  : budgetStatus === 'danger'
                  ? 'Critical'
                  : budgetStatus === 'warning'
                  ? 'Warning'
                  : 'On Track'}
              </span>
            </div>

            <div className="mt-2 flex items-baseline space-x-3">
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                <span className="text-amber-400 text-2xl sm:text-3xl mr-1">{settings.currencySymbol}</span>
                {remainingBudget.toLocaleString()}
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {t.remainingBudget}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:self-center">
            <button
              onClick={() => setActiveTab('expenses')}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center space-x-1.5 shadow-md shadow-amber-500/20 transition"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{t.addExpense}</span>
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
            >
              <span>{t.todaysLog}</span>
            </button>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="mt-5 space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-slate-400">
              {t.totalSpent}: <b className="text-white">{settings.currencySymbol}{totalExpenses.toLocaleString()}</b>
            </span>
            <span className="text-slate-400">
              {t.limit}: <b className="text-white">{settings.currencySymbol}{budget.totalBudget.toLocaleString()}</b>
            </span>
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetStatus === 'exceeded'
                  ? 'bg-red-500'
                  : budgetStatus === 'danger'
                  ? 'bg-orange-500'
                  : budgetStatus === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(2, budgetUsedPercent))}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-0.5">
            <span>{Math.round(budgetUsedPercent)}% {t.budgetUtilized}</span>
            {budget.preventOverbudgetExpenses && (
              <span className="text-emerald-400/90 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {t.protectionEnabled}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS SECTION (Mandatory Feature 6) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-300">
              Operations Quick Actions
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">1-Tap Task Launch</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
          {/* 1. Add Worker */}
          <button
            onClick={() => setActiveTab('workers')}
            className="p-2.5 rounded-2xl bg-slate-800/70 hover:bg-slate-750 text-slate-200 border border-slate-700/60 hover:border-blue-500/50 flex flex-col items-center justify-center space-y-1.5 transition text-center"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <span className="font-bold text-[11px] leading-tight">Add Worker</span>
          </button>

          {/* 2. Mark Attendance */}
          <button
            onClick={() => setActiveTab('attendance')}
            className="p-2.5 rounded-2xl bg-slate-800/70 hover:bg-slate-750 text-slate-200 border border-slate-700/60 hover:border-emerald-500/50 flex flex-col items-center justify-center space-y-1.5 transition text-center"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-[11px] leading-tight">Mark Attendance</span>
          </button>

          {/* 3. Add Expense */}
          <button
            onClick={() => setActiveTab('expenses')}
            className="p-2.5 rounded-2xl bg-slate-800/70 hover:bg-slate-750 text-slate-200 border border-slate-700/60 hover:border-rose-500/50 flex flex-col items-center justify-center space-y-1.5 transition text-center"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <span className="font-bold text-[11px] leading-tight">Add Expense</span>
          </button>

          {/* 4. Add Material */}
          <button
            onClick={() => setActiveTab('materials')}
            className="p-2.5 rounded-2xl bg-slate-800/70 hover:bg-slate-750 text-slate-200 border border-slate-700/60 hover:border-amber-500/50 flex flex-col items-center justify-center space-y-1.5 transition text-center"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <span className="font-bold text-[11px] leading-tight">Add Material</span>
          </button>

          {/* 5. Scan Bill */}
          <button
            onClick={() => setActiveTab('scanner')}
            className="p-2.5 rounded-2xl bg-slate-800/70 hover:bg-slate-750 text-slate-200 border border-slate-700/60 hover:border-purple-500/50 flex flex-col items-center justify-center space-y-1.5 transition text-center"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <span className="font-bold text-[11px] leading-tight">Scan Bill</span>
          </button>

          {/* 6. Open Chat */}
          <button
            onClick={() => setActiveTab('chat')}
            className="p-2.5 rounded-2xl bg-slate-800/70 hover:bg-slate-750 text-slate-200 border border-slate-700/60 hover:border-cyan-500/50 flex flex-col items-center justify-center space-y-1.5 transition text-center relative"
          >
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="font-bold text-[11px] leading-tight">Team Chat</span>
            {unreadChatCount > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>

          {/* 7. Emergency SOS */}
          <button
            onClick={() => setActiveTab('emergency')}
            className="p-2.5 rounded-2xl bg-red-950/50 hover:bg-red-900/60 text-red-200 border border-red-500/40 hover:border-red-500 flex flex-col items-center justify-center space-y-1.5 transition text-center"
          >
            <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center animate-pulse">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="font-black text-[11px] leading-tight text-red-300">SOS Safety</span>
          </button>

          {/* 8. View Reports */}
          <button
            onClick={() => setActiveTab('reports')}
            className="p-2.5 rounded-2xl bg-slate-800/70 hover:bg-slate-750 text-slate-200 border border-slate-700/60 hover:border-emerald-500/50 flex flex-col items-center justify-center space-y-1.5 transition text-center"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <span className="font-bold text-[11px] leading-tight">View Reports</span>
          </button>
        </div>
      </div>

      {/* SMART STATUS MONITOR STRIP (Materials, SOS, Unread Chat) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Materials in Stock Card */}
        <div
          onClick={() => setActiveTab('materials')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 cursor-pointer transition shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-400" />
              <span>Materials in Stock</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-xl font-black text-white mt-1">
            {materials.length} <span className="text-xs text-slate-400 font-normal">items ({settings.currencySymbol}{Math.round(totalStockValue).toLocaleString()})</span>
          </div>
          <div className="text-[11px] mt-1 flex items-center gap-2">
            {lowStockMaterialsCount > 0 ? (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {lowStockMaterialsCount} Low Stock
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold">Stock Levels Healthy</span>
            )}
            {outOfStockMaterialsCount > 0 && (
              <span className="text-rose-400 font-black">({outOfStockMaterialsCount} Depleted)</span>
            )}
          </div>
        </div>

        {/* Unread Team Chat Card */}
        <div
          onClick={() => setActiveTab('chat')}
          className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4 cursor-pointer transition shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Team Chat Activity</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-xl font-black text-white mt-1">
            Active Channel
          </div>
          <div className="text-[11px] text-cyan-400 font-bold mt-1">
            {unreadChatCount > 0 ? `${unreadChatCount} new unread messages` : 'Team coordinated on site'}
          </div>
        </div>

        {/* Emergency SOS Status Card */}
        <div
          onClick={() => setActiveTab('emergency')}
          className={`border rounded-2xl p-4 cursor-pointer transition shadow-sm ${
            activeEmergency
              ? 'bg-red-950/60 border-red-500 text-red-100'
              : 'bg-slate-900 border-slate-800 hover:border-red-500/40 text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className={`w-4 h-4 ${activeEmergency ? 'text-red-400 animate-pulse' : 'text-slate-400'}`} />
              <span>Site Safety & SOS</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className={`text-xl font-black mt-1 ${activeEmergency ? 'text-red-300' : 'text-emerald-400'}`}>
            {activeEmergency ? `${activeEmergency.type} ALERT` : 'All Clear (Normal)'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {activeEmergency ? 'Click to coordinate response' : 'Speed-dial responders ready'}
          </div>
        </div>
      </div>

      {/* CORE 6 + NEW MODULES SECTION */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Operations & Management Modules
          </h2>
          <span className="text-xs text-slate-400">Tap any card to open</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* 1. WORKERS */}
          <button
            onClick={() => setActiveTab('workers')}
            className="group text-left bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4.5 transition-all shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-slate-950 transition">
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex items-center space-x-1 text-xs text-slate-400 group-hover:text-amber-400 font-semibold">
                  <span>{t.manage}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition">
                {t.workers}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                Registration, rate configuration & directory
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Registered Crew</span>
              <span className="text-sm font-extrabold text-white">
                {activeWorkersCount} <span className="text-xs font-normal text-slate-400">active</span>
              </span>
            </div>
          </button>

          {/* 2. ATTENDANCE */}
          <button
            onClick={() => setActiveTab('attendance')}
            className="group text-left bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4.5 transition-all shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div className="flex items-center space-x-1 text-xs text-slate-400 group-hover:text-amber-400 font-semibold">
                  <span>{t.track}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition">
                {t.attendance}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                Daily present, half-day, absent & overtime logs
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Today's Status</span>
              <div className="flex items-center space-x-1.5 font-bold">
                <span className="text-emerald-400">{todayStats.present}P</span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-400">{todayStats.halfDay}H</span>
                <span className="text-slate-600">•</span>
                <span className="text-rose-400">{todayStats.absent}A</span>
                {todayStats.unmarked > 0 && (
                  <span className="ml-1 text-[10px] text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/30">
                    {todayStats.unmarked} pending
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* 3. WAGES */}
          <button
            onClick={() => setActiveTab('wages')}
            className="group text-left bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4.5 transition-all shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                  <Coins className="w-5 h-5" />
                </div>
                <div className="flex items-center space-x-1 text-xs text-slate-400 group-hover:text-amber-400 font-semibold">
                  <span>{t.payroll}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition">
                {t.wages}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                Daily & monthly calculations, slips and payouts
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">{t.pendingPayout}</span>
              <span className="text-sm font-extrabold text-amber-400">
                {settings.currencySymbol}{totalWageLiabilityPending.toLocaleString()}
              </span>
            </div>
          </button>

          {/* 4. MATERIALS (NEW) */}
          <button
            onClick={() => setActiveTab('materials')}
            className="group text-left bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4.5 transition-all shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                  <Package className="w-5 h-5" />
                </div>
                <div className="flex items-center space-x-1 text-xs text-slate-400 group-hover:text-amber-400 font-semibold">
                  <span>Stock</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition">
                Materials & Inventory
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                Remaining stock, usage tracking & reorders
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Stock Value</span>
              <span className="text-sm font-extrabold text-white">
                {settings.currencySymbol}{Math.round(totalStockValue).toLocaleString()}
              </span>
            </div>
          </button>

          {/* 5. BILL SCANNER (NEW) */}
          <button
            onClick={() => setActiveTab('scanner')}
            className="group text-left bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-4.5 transition-all shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-slate-950 transition">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="flex items-center space-x-1 text-xs text-slate-400 group-hover:text-purple-400 font-semibold">
                  <span>OCR</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition">
                Bill Scanner
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                Upload receipts & auto-record expenses
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Instant OCR</span>
              <span className="text-xs font-bold text-purple-400">Photo to Expense</span>
            </div>
          </button>

          {/* 6. EXPENSES */}
          <button
            onClick={() => setActiveTab('expenses')}
            className="group text-left bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-rose-500/40 rounded-2xl p-4.5 transition-all shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:bg-rose-500 group-hover:text-slate-950 transition">
                  <Receipt className="w-5 h-5" />
                </div>
                <div className="flex items-center space-x-1 text-xs text-slate-400 group-hover:text-rose-400 font-semibold">
                  <span>{t.records}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-rose-400 transition">
                {t.expenses}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                Material, meal, transport & operational spend
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Recorded Count</span>
              <span className="text-sm font-extrabold text-white">
                {expenses.length} <span className="text-xs font-normal text-slate-400">entries</span>
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Quick Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Attendance Snapshot */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-sm text-white">{t.attendanceSnapshot}</h4>
            </div>
            <button
              onClick={() => setActiveTab('attendance')}
              className="text-xs text-amber-400 hover:underline font-semibold"
            >
              Open Log
            </button>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
              <div className="text-xs text-slate-400">{t.present}</div>
              <div className="text-lg font-black text-emerald-400 mt-0.5">{todayStats.present}</div>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
              <div className="text-xs text-slate-400">{t.halfDay}</div>
              <div className="text-lg font-black text-amber-400 mt-0.5">{todayStats.halfDay}</div>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
              <div className="text-xs text-slate-400">{t.absent}</div>
              <div className="text-lg font-black text-rose-400 mt-0.5">{todayStats.absent}</div>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
              <div className="text-xs text-slate-400">{t.unmarked}</div>
              <div className={`text-lg font-black mt-0.5 ${todayStats.unmarked > 0 ? 'text-amber-300' : 'text-slate-400'}`}>
                {todayStats.unmarked}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">{t.wageLiability}:</span>
            <span className="font-bold text-white">
              {settings.currencySymbol}{todayStats.todayWageLiability.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Recent Expenses List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Receipt className="w-4 h-4 text-rose-400" />
              <h4 className="font-bold text-sm text-white">{t.recentExpenses}</h4>
            </div>
            <button
              onClick={() => setActiveTab('expenses')}
              className="text-xs text-amber-400 hover:underline font-semibold"
            >
              View All
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {recentExpenses.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">No expenses recorded yet.</p>
            ) : (
              recentExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-800 text-xs"
                >
                  <div className="truncate pr-2">
                    <div className="font-semibold text-white truncate">{exp.title}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{exp.category}</span>
                      <span>•</span>
                      <span>{exp.date}</span>
                    </div>
                  </div>
                  <div className="font-extrabold text-sm text-rose-400 shrink-0">
                    -{settings.currencySymbol}{exp.amount.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
