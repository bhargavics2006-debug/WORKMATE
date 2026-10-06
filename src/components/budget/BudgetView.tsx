import React, { useState } from 'react';
import {
  PieChart,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Sliders,
  DollarSign,
  TrendingDown,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useWorkmate } from '../../context/WorkmateContext';
import { ExpenseCategory } from '../../types';
import { BudgetAlertBanner } from '../common/BudgetAlertBanner';

export const BudgetView: React.FC = () => {
  const {
    budget,
    updateBudget,
    totalExpenses,
    totalOperationalExpenses,
    totalWagePayouts,
    remainingBudget,
    budgetUsedPercent,
    budgetStatus,
    settings,
    setActiveTab,
  } = useWorkmate();

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState(budget.totalBudget);
  const [periodName, setPeriodName] = useState(budget.periodName);
  const [warningThreshold, setWarningThreshold] = useState(budget.warningThresholdPercent || 80);
  const [preventOverbudget, setPreventOverbudget] = useState(budget.preventOverbudgetExpenses ?? true);

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    updateBudget({
      totalBudget: Number(budgetAmount) || 0,
      periodName,
      warningThresholdPercent: Number(warningThreshold) || 80,
      preventOverbudgetExpenses: preventOverbudget,
    });
    setIsEditingBudget(false);
  };

  const wagePercentOfBudget = budget.totalBudget > 0 ? (totalWagePayouts / budget.totalBudget) * 100 : 0;
  const opPercentOfBudget = budget.totalBudget > 0 ? (totalOperationalExpenses / budget.totalBudget) * 100 : 0;
  const remainingPercent = Math.max(0, 100 - budgetUsedPercent);

  return (
    <div className="space-y-4 pb-20 lg:pb-8">
      {/* Banner */}
      <BudgetAlertBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <PieChart className="w-6 h-6 text-purple-400" />
            Budget Management & Limits
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Set budget ceilings, prevent overdrafts, and track automatic remaining funds
          </p>
        </div>

        <button
          onClick={() => setIsEditingBudget(!isEditingBudget)}
          className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition self-start sm:self-auto"
        >
          <Sliders className="w-4 h-4" />
          <span>{isEditingBudget ? 'Close Settings' : 'Configure Budget'}</span>
        </button>
      </div>

      {/* Main Budget Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {budget.periodName} Ceiling
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white mt-1">
              <span className="text-purple-400 mr-1">{settings.currencySymbol}</span>
              {budget.totalBudget.toLocaleString()}
            </div>
          </div>

          {/* Automatic Remaining Calculation Badge */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 sm:text-right">
            <div className="text-xs font-semibold text-slate-400">
              Automatic Remaining Budget
            </div>
            <div
              className={`text-2xl sm:text-3xl font-black mt-1 ${
                remainingBudget < 0
                  ? 'text-red-400'
                  : budgetStatus === 'danger'
                  ? 'text-orange-400'
                  : 'text-emerald-400'
              }`}
            >
              {remainingBudget < 0 ? '-' : ''}
              {settings.currencySymbol}
              {Math.abs(remainingBudget).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {remainingBudget < 0 ? 'Deficit over limit' : 'Available to spend'}
            </div>
          </div>
        </div>

        {/* Visual Progress Meter */}
        <div className="mt-5 space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-300">
              Budget Utilization: {Math.round(budgetUsedPercent)}%
            </span>
            <span
              className={
                remainingBudget < 0
                  ? 'text-red-400 font-extrabold'
                  : 'text-emerald-400 font-extrabold'
              }
            >
              {remainingBudget < 0 ? 'Exceeded' : `${Math.round(remainingPercent)}% Available`}
            </span>
          </div>

          {/* Multi-segment progress bar */}
          <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden flex p-0.5 border border-slate-700">
            {/* Paid Wages segment */}
            <div
              className="bg-amber-500 h-full rounded-l-full transition-all duration-500"
              style={{ width: `${Math.min(100, wagePercentOfBudget)}%` }}
              title={`Paid Wages: ${Math.round(wagePercentOfBudget)}%`}
            />
            {/* Operational Expenses segment */}
            <div
              className="bg-rose-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(100 - wagePercentOfBudget, opPercentOfBudget)}%` }}
              title={`Operational Expenses: ${Math.round(opPercentOfBudget)}%`}
            />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
            <div className="flex items-center space-x-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span>Paid Wages ({settings.currencySymbol}{totalWagePayouts.toLocaleString()})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span>Operational ({settings.currencySymbol}{totalOperationalExpenses.toLocaleString()})</span>
              </span>
            </div>
            <div className="font-semibold text-slate-300">
              Total Spent: {settings.currencySymbol}{totalExpenses.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Overbudget Protection Callout */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start space-x-3">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 mt-0.5 shrink-0">
            {budget.preventOverbudgetExpenses ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            )}
          </div>
          <div className="text-xs">
            <div className="font-bold text-white flex items-center gap-2">
              <span>Automatic Overbudget Prevention:</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                  budget.preventOverbudgetExpenses
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {budget.preventOverbudgetExpenses ? 'Active & Enforced' : 'Disabled'}
              </span>
            </div>
            <p className="text-slate-400 mt-1 leading-relaxed">
              When active, WORKMATE strictly prevents recording any expense or wage payout that
              exceeds your remaining budget balance of {settings.currencySymbol}
              {Math.max(0, remainingBudget).toLocaleString()}. This ensures your team never accidentally
              overspends.
            </p>
          </div>
        </div>
      </div>

      {/* Edit Budget Form Modal/Drawer */}
      {isEditingBudget && (
        <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-5 text-xs space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              Configure Budget Ceiling & Rules
            </h3>
            <button
              onClick={() => setIsEditingBudget(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSaveBudget} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Total Budget Limit ({settings.currencySymbol}) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="50"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(Number(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-extrabold text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Budget Period / Project Label
                </label>
                <input
                  type="text"
                  value={periodName}
                  onChange={(e) => setPeriodName(e.target.value)}
                  placeholder="e.g. October 2026, Phase 1"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Warning Alert Threshold (%)
                </label>
                <input
                  type="number"
                  min="50"
                  max="99"
                  value={warningThreshold}
                  onChange={(e) => setWarningThreshold(Number(e.target.value) || 80)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Alerts you when spending reaches this percent (currently {warningThreshold}%)
                </span>
              </div>

              {/* Prevent overbudget toggle */}
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">Prevent Over-Budget Expenses</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Block expense if it exceeds remaining budget
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preventOverbudget}
                  onChange={(e) => setPreventOverbudget(e.target.checked)}
                  className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 bg-slate-700 border-slate-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsEditingBudget(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-extrabold shadow-md"
              >
                Save Budget Ceiling
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Breakdown by Category Guidance */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
            Budget Math Explanation (Beginner Friendly)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
            <div className="font-bold text-white mb-1">1. Set Your Limit</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Define the maximum funds allocated for your project or payroll period.
            </p>
          </div>

          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
            <div className="font-bold text-white mb-1">2. Auto-Deductions</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Every logged expense and paid wage automatically reduces your remaining balance in real time.
            </p>
          </div>

          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
            <div className="font-bold text-white mb-1">3. Hard Protection</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              If an expense exceeds the remaining amount, WORKMATE immediately prevents the entry to protect your wallet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
