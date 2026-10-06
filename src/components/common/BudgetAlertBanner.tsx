import React from 'react';
import { AlertTriangle, AlertOctagon, Info, ArrowRight } from 'lucide-react';
import { useWorkmate } from '../../context/WorkmateContext';

export const BudgetAlertBanner: React.FC = () => {
  const { budget, remainingBudget, budgetUsedPercent, budgetStatus, settings, setActiveTab } = useWorkmate();

  if (budgetStatus === 'healthy') return null;

  const isExceeded = budgetStatus === 'exceeded';
  const isDanger = budgetStatus === 'danger';

  return (
    <div
      className={`rounded-2xl p-3.5 sm:p-4 mb-4 border transition-all shadow-sm ${
        isExceeded
          ? 'bg-red-950/80 border-red-500/50 text-red-200'
          : isDanger
          ? 'bg-orange-950/80 border-orange-500/50 text-orange-200'
          : 'bg-amber-950/80 border-amber-500/50 text-amber-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="mt-0.5 p-1.5 rounded-lg bg-black/20 shrink-0">
            {isExceeded ? (
              <AlertOctagon className="w-5 h-5 text-red-400 animate-pulse" />
            ) : isDanger ? (
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            ) : (
              <Info className="w-5 h-5 text-amber-400" />
            )}
          </div>

          <div>
            <div className="font-bold text-sm tracking-tight flex items-center gap-2">
              {isExceeded && (
                <span className="text-white bg-red-600 px-2 py-0.5 rounded text-[11px] font-extrabold tracking-wider uppercase">
                  Over Budget Limit
                </span>
              )}
              {isDanger && (
                <span className="text-white bg-orange-600 px-2 py-0.5 rounded text-[11px] font-extrabold tracking-wider uppercase">
                  High Alert
                </span>
              )}
              {budgetStatus === 'warning' && (
                <span className="text-slate-900 bg-amber-400 px-2 py-0.5 rounded text-[11px] font-extrabold tracking-wider uppercase">
                  Budget Warning
                </span>
              )}
              <span>
                {isExceeded
                  ? `Exceeded by ${settings.currencySymbol}${Math.abs(remainingBudget).toLocaleString()}`
                  : `${Math.round(budgetUsedPercent)}% Budget Utilized`}
              </span>
            </div>

            <p className="text-xs mt-1 text-slate-300 leading-normal">
              {isExceeded ? (
                <>
                  Your total spending exceeds the limit of {settings.currencySymbol}
                  {budget.totalBudget.toLocaleString()}. New expenses will be blocked until the budget is increased.
                </>
              ) : isDanger ? (
                <>
                  Only {settings.currencySymbol}
                  {remainingBudget.toLocaleString()} remaining out of {settings.currencySymbol}
                  {budget.totalBudget.toLocaleString()}. Expenses exceeding this remaining amount will be prevented.
                </>
              ) : (
                <>
                  You have spent {settings.currencySymbol}
                  {(budget.totalBudget - remainingBudget).toLocaleString()}. {settings.currencySymbol}
                  {remainingBudget.toLocaleString()} left for this period.
                </>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('budget')}
          className="shrink-0 flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-black/30 hover:bg-black/50 text-xs font-semibold transition border border-white/10"
        >
          <span>Budget</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
