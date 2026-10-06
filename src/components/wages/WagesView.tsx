import React, { useState } from 'react';
import {
  Coins,
  CreditCard,
  Printer,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  History,
  FileText,
  DollarSign,
  Download,
  Trash2,
} from 'lucide-react';
import { useWorkmate, WorkerWageStats } from '../../context/WorkmateContext';
import { Worker, WagePayout } from '../../types';
import { getTodayDateString } from '../../utils/initialData';
import { BudgetAlertBanner } from '../common/BudgetAlertBanner';

export const WagesView: React.FC = () => {
  const {
    workers,
    payouts,
    allWorkersWageStats,
    totalWageLiabilityEarned,
    totalWageLiabilityPaid,
    totalWageLiabilityPending,
    recordWagePayout,
    deleteWagePayout,
    settings,
    remainingBudget,
    budget,
  } = useWorkmate();

  const [selectedWorkerForPay, setSelectedWorkerForPay] = useState<Worker | null>(null);
  const [selectedSlipStats, setSelectedSlipStats] = useState<WorkerWageStats | null>(null);
  const [activeTabSub, setActiveTabSub] = useState<'payroll' | 'payoutsHistory'>('payroll');

  // Payout form
  const [amount, setAmount] = useState<number | ''>('');
  const [method, setMethod] = useState<'Cash' | 'Bank Transfer' | 'Digital Wallet' | 'Other'>('Cash');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpenPayModal = (workerId: string) => {
    const worker = workers.find((w) => w.id === workerId);
    const stats = allWorkersWageStats.find((s) => s.workerId === workerId);
    if (!worker) return;

    setSelectedWorkerForPay(worker);
    setAmount(stats?.balanceDue || worker.dailyRate);
    setMethod('Cash');
    setNotes('Regular wage settlement');
    setErrorMsg(null);
  };

  const handleDisburseWage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkerForPay || !amount || Number(amount) <= 0) return;

    const res = recordWagePayout({
      workerId: selectedWorkerForPay.id,
      amount: Number(amount),
      date: getTodayDateString(),
      paymentMethod: method,
      notes,
      periodDescription: 'Wage Payout',
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to disburse wage.');
      return;
    }

    setSelectedWorkerForPay(null);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-8">
      {/* Top Banner */}
      <BudgetAlertBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Coins className="w-6 h-6 text-amber-400" />
            Wage & Payroll Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automatic daily & monthly wage computations, payouts, and printable slips
          </p>
        </div>

        {/* View switcher */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl self-start sm:self-auto text-xs">
          <button
            onClick={() => setActiveTabSub('payroll')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              activeTabSub === 'payroll'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Wage Calculation
          </button>
          <button
            onClick={() => setActiveTabSub('payoutsHistory')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1 ${
              activeTabSub === 'payoutsHistory'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Payout History ({payouts.length})</span>
          </button>
        </div>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Earned */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400 font-medium">Total Wages Earned</div>
          <div className="text-2xl font-black text-white mt-1">
            <span className="text-amber-400 text-lg mr-1">{settings.currencySymbol}</span>
            {totalWageLiabilityEarned.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Computed from all attendance & overtime
          </div>
        </div>

        {/* Total Paid Out */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400 font-medium">Total Paid Out</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            <span className="text-emerald-400 text-lg mr-1">{settings.currencySymbol}</span>
            {totalWageLiabilityPaid.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Disbursed and deducted from budget
          </div>
        </div>

        {/* Balance Pending */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400 font-medium">Outstanding Balance</div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            <span className="text-amber-400 text-lg mr-1">{settings.currencySymbol}</span>
            {totalWageLiabilityPending.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Unpaid wages due to active workers
          </div>
        </div>
      </div>

      {activeTabSub === 'payroll' ? (
        /* Worker Wage List */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Worker Wage Ledgers ({allWorkersWageStats.length})
            </h3>
            <span className="text-xs text-slate-500">
              Tap Pay Wage to disburse funds
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {allWorkersWageStats.map((stats) => {
              const worker = workers.find((w) => w.id === stats.workerId);
              const hasDue = stats.balanceDue > 0;

              return (
                <div
                  key={stats.workerId}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition shadow-sm flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-extrabold text-white text-base">{stats.workerName}</h4>
                        <div className="text-xs text-amber-400 font-semibold">{stats.role}</div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">Daily Rate</span>
                        <span className="text-xs font-bold text-slate-200">
                          {settings.currencySymbol}{stats.dailyRate}/day
                        </span>
                      </div>
                    </div>

                    {/* Attendance stats */}
                    <div className="grid grid-cols-4 gap-1.5 mt-3 py-2 px-2.5 rounded-xl bg-slate-800/40 text-center text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400">Present</div>
                        <div className="font-bold text-emerald-400">{stats.presentDays}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Half Day</div>
                        <div className="font-bold text-amber-400">{stats.halfDays}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Absent</div>
                        <div className="font-bold text-rose-400">{stats.absentDays}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">OT Hours</div>
                        <div className="font-bold text-cyan-400">{stats.overtimeHours}h</div>
                      </div>
                    </div>

                    {/* Financial summary breakdown */}
                    <div className="mt-3 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Gross Earned:</span>
                        <span className="font-bold text-white">
                          {settings.currencySymbol}{stats.totalEarnedWage.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Paid to Date:</span>
                        <span className="font-semibold text-emerald-400">
                          {settings.currencySymbol}{stats.totalPaidWage.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1.5 border-t border-slate-800">
                        <span className="font-bold text-slate-200">Balance Due:</span>
                        <span
                          className={`font-black text-sm ${
                            hasDue ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {settings.currencySymbol}{stats.balanceDue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenPayModal(stats.workerId)}
                      disabled={!hasDue && stats.balanceDue <= 0}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                        hasDue
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{hasDue ? `Pay Due (${settings.currencySymbol}${stats.balanceDue})` : 'Settled'}</span>
                    </button>

                    <button
                      onClick={() => setSelectedSlipStats(stats)}
                      className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition"
                      title="Generate Wage Slip"
                    >
                      <Printer className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Slip</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Payouts History View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h3 className="font-bold text-sm text-white">Wage Payout Transactions</h3>
            <span className="text-xs text-slate-400">Total {payouts.length} payments</span>
          </div>

          {payouts.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No wage payouts logged yet. Use "Pay Wage" on any worker to log disbursements.
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {payouts.map((p) => {
                const worker = workers.find((w) => w.id === p.workerId);
                return (
                  <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white text-sm">
                        {worker?.name || 'Worker'}
                      </div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-1.5 mt-0.5">
                        <span>{p.date}</span>
                        <span>•</span>
                        <span className="text-amber-400 font-semibold">{p.paymentMethod}</span>
                        {p.notes && (
                          <>
                            <span>•</span>
                            <span className="italic truncate max-w-xs">{p.notes}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span className="font-black text-sm text-emerald-400 block">
                          +{settings.currencySymbol}{p.amount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500">Deducted from budget</span>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm('Delete this payout record? The unpaid balance will be restored.')) {
                            deleteWagePayout(p.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition"
                        title="Delete Payout"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Record Wage Payout Modal */}
      {selectedWorkerForPay && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-5 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Disburse Wage Payment</h3>
              </div>
              <button
                onClick={() => setSelectedWorkerForPay(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleDisburseWage} className="mt-4 space-y-3.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-[11px]">Worker:</div>
                  <div className="font-bold text-white text-sm">{selectedWorkerForPay.name}</div>
                  <div className="text-amber-400 text-[11px] font-semibold">{selectedWorkerForPay.role}</div>
                </div>

                <div className="text-right">
                  <div className="text-slate-400 text-[11px]">Remaining Budget:</div>
                  <div
                    className={`font-black text-sm ${
                      remainingBudget < 0 ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {settings.currencySymbol}{remainingBudget.toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Payment Amount ({settings.currencySymbol}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.5"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || '')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-extrabold text-base focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {budget.preventOverbudgetExpenses && Number(amount) > remainingBudget && (
                  <p className="mt-1 text-[11px] text-red-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Exceeds remaining budget ({settings.currencySymbol}{remainingBudget.toLocaleString()})
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Payment Method
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Cash">Cash Handover</option>
                  <option value="Bank Transfer">Bank Transfer / Direct Deposit</option>
                  <option value="Digital Wallet">Digital Wallet (UPI, Venmo, etc.)</option>
                  <option value="Other">Other Voucher</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Notes / Receipt Reference
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Cleared Week 1 wages, receipt signed"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedWorkerForPay(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-extrabold shadow-md"
                >
                  Confirm & Deduct from Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Wage Slip Modal */}
      {selectedSlipStats && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-lg p-6 text-slate-100 shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Action Bar (Not printed) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 print:hidden">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Worker Wage Payslip</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrintSlip}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-extrabold text-xs flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setSelectedSlipStats(null)}
                  className="text-slate-400 hover:text-white p-1 text-base"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Slip Body (Designed for screen & print) */}
            <div className="mt-4 p-5 bg-white text-slate-900 rounded-2xl font-mono text-xs shadow-inner">
              {/* Slip Header */}
              <div className="text-center border-b pb-3 border-slate-300">
                <h2 className="text-base font-extrabold tracking-wider uppercase text-slate-900">
                  {settings.organizationName || 'WORKMATE SYSTEM'}
                </h2>
                <p className="text-[11px] text-slate-600 font-sans">
                  Official Workforce Wage Statement
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Date Generated: {getTodayDateString()}
                </p>
              </div>

              {/* Worker Info */}
              <div className="grid grid-cols-2 gap-2 py-3 border-b border-slate-200 text-[11px] font-sans">
                <div>
                  <span className="text-slate-500 block">Worker Name:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedSlipStats.workerName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Role / Designation:</span>
                  <span className="font-bold text-slate-900">
                    {selectedSlipStats.role}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Base Daily Rate:</span>
                  <span className="font-bold text-slate-900">
                    {settings.currencySymbol}{selectedSlipStats.dailyRate}/day
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Worker ID:</span>
                  <span className="font-bold text-slate-700">
                    {selectedSlipStats.workerId}
                  </span>
                </div>
              </div>

              {/* Attendance & Calculation Breakdown */}
              <div className="py-3 border-b border-slate-200 space-y-1.5 font-sans">
                <div className="flex justify-between">
                  <span>Full Present Days:</span>
                  <span className="font-bold">{selectedSlipStats.presentDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Half Days Worked:</span>
                  <span className="font-bold">{selectedSlipStats.halfDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Absent Days:</span>
                  <span className="font-bold">{selectedSlipStats.absentDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Overtime Hours Logged:</span>
                  <span className="font-bold">{selectedSlipStats.overtimeHours} hrs</span>
                </div>
              </div>

              {/* Financial Totals */}
              <div className="py-3 border-b-2 border-slate-900 space-y-1.5 font-sans">
                <div className="flex justify-between text-slate-700">
                  <span>Gross Earned Wage:</span>
                  <span className="font-bold">
                    {settings.currencySymbol}{selectedSlipStats.totalEarnedWage.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Amount Disbursed (Paid):</span>
                  <span className="font-bold">
                    -{settings.currencySymbol}{selectedSlipStats.totalPaidWage.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-900 text-sm font-black pt-1 border-t border-slate-300">
                  <span>Net Outstanding Balance:</span>
                  <span>
                    {settings.currencySymbol}{selectedSlipStats.balanceDue.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Signature section */}
              <div className="pt-6 grid grid-cols-2 gap-6 text-[10px] text-slate-500 font-sans text-center">
                <div className="border-t border-slate-400 pt-1">
                  Manager / Supervisor Signature
                </div>
                <div className="border-t border-slate-400 pt-1">
                  Worker Signature & Acknowledgement
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
