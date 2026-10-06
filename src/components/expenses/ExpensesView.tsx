import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  DollarSign,
  AlertTriangle,
  AlertOctagon,
  Trash2,
  Calendar,
  CreditCard,
  Building,
  CheckCircle2,
  ShieldAlert,
  ArrowUpRight,
  TrendingDown,
} from 'lucide-react';
import { useWorkmate } from '../../context/WorkmateContext';
import { Expense, ExpenseCategory } from '../../types';
import { getTodayDateString } from '../../utils/initialData';
import { BudgetAlertBanner } from '../common/BudgetAlertBanner';

export const ExpensesView: React.FC = () => {
  const {
    expenses,
    addExpense,
    deleteExpense,
    remainingBudget,
    budget,
    totalOperationalExpenses,
    totalExpenses,
    budgetStatus,
    settings,
    setActiveTab,
  } = useWorkmate();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState<ExpenseCategory>('Materials & Supplies');
  const [date, setDate] = useState(getTodayDateString());
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'Digital Wallet' | 'Other'>('Cash');
  const [paidTo, setPaidTo] = useState('');
  const [notes, setNotes] = useState('');

  // Validation / Overbudget error state
  const [formError, setFormError] = useState<{
    message: string;
    shortfall: number;
  } | null>(null);

  const categories: ExpenseCategory[] = [
    'Materials & Supplies',
    'Food & Meals',
    'Transport & Fuel',
    'Tools & Equipment',
    'Utilities & Rent',
    'Emergency & Medical',
    'Miscellaneous',
  ];

  // Dynamic real-time calculation while typing
  const enteredAmount = Number(amount) || 0;
  const isOverbudgetLive =
    budget.preventOverbudgetExpenses && enteredAmount > remainingBudget;
  const liveShortfall = Math.max(0, enteredAmount - remainingBudget);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.paidTo && e.paidTo.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat = categoryFilter === 'all' || e.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [expenses, searchQuery, categoryFilter]);

  const handleOpenAdd = () => {
    setTitle('');
    setAmount('');
    setCategory('Materials & Supplies');
    setDate(getTodayDateString());
    setPaymentMethod('Cash');
    setPaidTo('');
    setNotes('');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) return;

    const result = addExpense({
      title: title.trim(),
      amount: Number(amount),
      category,
      date,
      paymentMethod,
      paidTo: paidTo.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    if (!result.success) {
      setFormError({
        message: result.error || 'Expense exceeds remaining budget limit.',
        shortfall: result.shortfall || 0,
      });
      return;
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-8">
      {/* Top Banner */}
      <BudgetAlertBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-rose-400" />
            Expense Tracking & Control
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log site expenditures with strict budget enforcement and auto-calculations
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs shadow-lg shadow-rose-500/20 transition self-stretch sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* Financial Status Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400 font-medium">Remaining Budget Available</div>
          <div
            className={`text-2xl font-black mt-1 ${
              remainingBudget < 0 ? 'text-red-400' : 'text-emerald-400'
            }`}
          >
            <span className="text-lg mr-1">{settings.currencySymbol}</span>
            {remainingBudget.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Hard spending cap enforced
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400 font-medium">Total Operational Expenses</div>
          <div className="text-2xl font-black text-white mt-1">
            <span className="text-rose-400 text-lg mr-1">{settings.currencySymbol}</span>
            {totalOperationalExpenses.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {expenses.length} logged expense items
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400 font-medium">Grand Total Expenditure</div>
          <div className="text-2xl font-black text-slate-200 mt-1">
            <span className="text-amber-400 text-lg mr-1">{settings.currencySymbol}</span>
            {totalExpenses.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Operational spend + wage payouts
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expenses by item, vendor or notes..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
              categoryFilter === 'all'
                ? 'bg-rose-500 text-white font-bold'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Categories ({expenses.length})
          </button>
          {categories.map((cat) => {
            const count = expenses.filter((e) => e.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
                  categoryFilter === cat
                    ? 'bg-rose-500 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
          <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-white font-bold text-sm">No expenses found</h3>
          <p className="text-slate-400 text-xs mt-1">
            {searchQuery || categoryFilter !== 'all'
              ? 'Try adjusting your search criteria.'
              : 'Click "Record New Expense" to track your first operational expense.'}
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-800">
            {filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                className="p-4 hover:bg-slate-850/60 transition flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-extrabold text-sm text-white truncate">{exp.title}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                      {exp.category}
                    </span>
                  </div>

                  <div className="text-slate-400 text-[11px] flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {exp.date}
                    </span>
                    <span>•</span>
                    <span className="text-amber-400/90">{exp.paymentMethod}</span>
                    {exp.paidTo && (
                      <>
                        <span>•</span>
                        <span className="text-slate-300">To: {exp.paidTo}</span>
                      </>
                    )}
                    {exp.notes && (
                      <>
                        <span>•</span>
                        <span className="italic text-slate-400 truncate max-w-xs">{exp.notes}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <div className="font-black text-sm sm:text-base text-rose-400">
                      -{settings.currencySymbol}{exp.amount.toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Delete expense "${exp.title}"? This will return funds to your budget.`)) {
                        deleteExpense(exp.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition"
                    title="Delete Expense"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Expense Modal with Strict Budget Guard */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-5 text-slate-100 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-base text-white">Record Expense</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Remaining Budget Status Indicator in Modal */}
            <div className="mt-3.5 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Available Remaining Budget:</span>
              <span
                className={`font-black text-sm ${
                  remainingBudget < 0 ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {settings.currencySymbol}{remainingBudget.toLocaleString()}
              </span>
            </div>

            {/* Live Overbudget Warning Card */}
            {isOverbudgetLive && (
              <div className="mt-3 p-3.5 rounded-2xl bg-red-950/90 border border-red-500/60 text-red-200 text-xs animate-shake space-y-1.5 shadow-lg">
                <div className="flex items-center space-x-2 font-bold text-red-100">
                  <AlertOctagon className="w-5 h-5 text-red-400 shrink-0" />
                  <span>Budget Limit Exceeded!</span>
                </div>
                <p className="leading-relaxed">
                  This expense ({settings.currencySymbol}{enteredAmount.toLocaleString()}) exceeds
                  your remaining budget of {settings.currencySymbol}
                  {remainingBudget.toLocaleString()} by <b>{settings.currencySymbol}{liveShortfall.toLocaleString()}</b>.
                </p>
                <div className="pt-1 text-[11px] text-red-300 font-medium">
                  ⚠️ Submission is blocked by the WORKMATE budget guard. Please lower the expense amount or increase your budget in the Budget tab.
                </div>
              </div>
            )}

            {formError && !isOverbudgetLive && (
              <div className="mt-3 p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs">
                {formError.message}
              </div>
            )}

            <form onSubmit={handleSaveExpense} className="mt-4 space-y-3.5 text-xs">
              {/* Title */}
              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Expense Description / Item *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 50 bags of cement, Lunch catering, Diesel fuel"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                />
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Amount ({settings.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.5"
                    value={amount}
                    onChange={(e) => {
                      setAmount(Number(e.target.value) || '');
                      setFormError(null);
                    }}
                    placeholder="0.00"
                    className={`w-full bg-slate-800 border rounded-xl px-3 py-2.5 text-white text-base font-extrabold focus:outline-none focus:ring-2 ${
                      isOverbudgetLive
                        ? 'border-red-500 focus:ring-red-500 text-red-300'
                        : 'border-slate-700 focus:ring-rose-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Expense Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method & Paid To */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Digital Wallet">Digital Wallet</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Paid To / Vendor
                  </label>
                  <input
                    type="text"
                    value={paidTo}
                    onChange={(e) => setPaidTo(e.target.value)}
                    placeholder="e.g. Apex Hardware"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Notes / Receipt Number
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Invoice #9982, delivery to site gate"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                {isOverbudgetLive ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setActiveTab('budget');
                    }}
                    className="text-amber-400 hover:underline font-bold text-xs"
                  >
                    Increase Budget →
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isOverbudgetLive}
                    className={`px-5 py-2 rounded-xl font-extrabold shadow-md transition ${
                      isOverbudgetLive
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                        : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
                    }`}
                  >
                    {isOverbudgetLive ? 'Blocked by Budget' : 'Record Expense'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
