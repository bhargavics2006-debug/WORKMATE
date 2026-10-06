import React from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  TrendingUp,
  Users,
  Coins,
  Receipt,
  PieChart,
  CalendarCheck,
  CheckCircle2,
} from 'lucide-react';
import { useWorkmate } from '../../context/WorkmateContext';
import { getTodayDateString } from '../../utils/initialData';

export const ReportsView: React.FC = () => {
  const {
    workers,
    attendance,
    expenses,
    payouts,
    budget,
    totalExpenses,
    totalOperationalExpenses,
    totalWagePayouts,
    remainingBudget,
    budgetUsedPercent,
    budgetStatus,
    allWorkersWageStats,
    totalWageLiabilityEarned,
    totalWageLiabilityPaid,
    totalWageLiabilityPending,
    settings,
    exportCSV,
  } = useWorkmate();

  const activeWorkers = workers.filter((w) => w.status === 'active');

  // Compute attendance stats
  const totalRecordedAttendance = attendance.length;
  const presentAttendance = attendance.filter((a) => a.status === 'present').length;
  const halfDayAttendance = attendance.filter((a) => a.status === 'half_day').length;
  const absentAttendance = attendance.filter((a) => a.status === 'absent').length;

  const totalPossibleDays = totalRecordedAttendance || 1;
  const overallAttendanceRate = Math.round(
    ((presentAttendance + halfDayAttendance * 0.5) / totalPossibleDays) * 100
  );

  // Category breakdown for expenses
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + (e.amount || 0);
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 pb-20 lg:pb-8">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-cyan-400" />
            Executive Reports & Summaries
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Holistic audit of workforce attendance, payroll obligations, and budget spending
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Quick CSV Export Hub */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center space-x-2">
            <Download className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
              Download CSV Data Spreadsheets
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">Excel / Google Sheets compatible</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => exportCSV('wages')}
            className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 text-xs font-semibold transition"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Wages Ledger CSV</span>
          </button>

          <button
            onClick={() => exportCSV('attendance')}
            className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-300 border border-slate-700 text-xs font-semibold transition"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Attendance Log CSV</span>
          </button>

          <button
            onClick={() => exportCSV('expenses')}
            className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-rose-300 border border-slate-700 text-xs font-semibold transition"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Expenses List CSV</span>
          </button>

          <button
            onClick={() => exportCSV('workers')}
            className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-blue-300 border border-slate-700 text-xs font-semibold transition"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Workers Roster CSV</span>
          </button>
        </div>
      </div>

      {/* Financial Health Summary Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-purple-400" />
          Financial & Budget Position
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">Total Budget Limit</span>
            <span className="text-lg font-black text-white mt-1 block">
              {settings.currencySymbol}{budget.totalBudget.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500">{budget.periodName}</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">Total Expenses Disbursed</span>
            <span className="text-lg font-black text-rose-400 mt-1 block">
              {settings.currencySymbol}{totalExpenses.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500">
              {Math.round(budgetUsedPercent)}% utilized
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">Automatic Remaining Budget</span>
            <span
              className={`text-lg font-black mt-1 block ${
                remainingBudget < 0 ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {remainingBudget < 0 ? '-' : ''}
              {settings.currencySymbol}
              {Math.abs(remainingBudget).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500">
              {remainingBudget < 0 ? 'Over limit' : 'Under limit'}
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">Pending Wage Debt</span>
            <span className="text-lg font-black text-amber-400 mt-1 block">
              {settings.currencySymbol}{totalWageLiabilityPending.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500">Unsettled labor due</span>
          </div>
        </div>
      </div>

      {/* Workforce & Attendance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Attendance Rates */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <h4 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-emerald-400" />
            Workforce Attendance Metrics
          </h4>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Registered Workers:</span>
              <span className="font-bold text-white">{workers.length} ({activeWorkers.length} active)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Attendance Logs:</span>
              <span className="font-bold text-white">{totalRecordedAttendance} entries</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Full Present Days Logged:</span>
              <span className="font-bold text-emerald-400">{presentAttendance}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Half-Days Logged:</span>
              <span className="font-bold text-amber-400">{halfDayAttendance}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Absences Logged:</span>
              <span className="font-bold text-rose-400">{absentAttendance}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-bold">
              <span className="text-slate-300">Overall Attendance Ratio:</span>
              <span className="text-sm text-emerald-400 font-black">{overallAttendanceRate}%</span>
            </div>
          </div>
        </div>

        {/* Expense Category Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <h4 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-rose-400" />
            Expense Breakdown by Category
          </h4>

          <div className="space-y-2.5 text-xs">
            {/* Wages category */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span className="font-semibold">Wages (Disbursed):</span>
                <span className="font-bold">
                  {settings.currencySymbol}{totalWagePayouts.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${totalExpenses > 0 ? (totalWagePayouts / totalExpenses) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Other operational categories */}
            {Object.entries(categoryTotals).map(([cat, amt]) => {
              const pct = totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">{cat}:</span>
                    <span className="font-bold">
                      {settings.currencySymbol}{amt.toLocaleString()}{' '}
                      <span className="text-[10px] text-slate-500">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500/80 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Worker Wage Master Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <h4 className="font-bold text-sm text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            Worker Wage & Liability Ledger
          </h4>
          <span className="text-xs text-slate-400">All active personnel</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="p-2.5">Worker Name</th>
                <th className="p-2.5">Role</th>
                <th className="p-2.5 text-center">Daily Rate</th>
                <th className="p-2.5 text-center">Present / Half</th>
                <th className="p-2.5 text-center">OT Hrs</th>
                <th className="p-2.5 text-right">Gross Earned</th>
                <th className="p-2.5 text-right">Paid Out</th>
                <th className="p-2.5 text-right">Balance Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {allWorkersWageStats.map((item) => (
                <tr key={item.workerId} className="hover:bg-slate-850/50">
                  <td className="p-2.5 font-bold text-white">{item.workerName}</td>
                  <td className="p-2.5 text-amber-400">{item.role}</td>
                  <td className="p-2.5 text-center">
                    {settings.currencySymbol}{item.dailyRate}
                  </td>
                  <td className="p-2.5 text-center">
                    <span className="text-emerald-400 font-bold">{item.presentDays}</span> /{' '}
                    <span className="text-amber-400 font-bold">{item.halfDays}</span>
                  </td>
                  <td className="p-2.5 text-center text-cyan-400 font-bold">
                    {item.overtimeHours}h
                  </td>
                  <td className="p-2.5 text-right font-bold text-white">
                    {settings.currencySymbol}{item.totalEarnedWage.toLocaleString()}
                  </td>
                  <td className="p-2.5 text-right font-bold text-emerald-400">
                    {settings.currencySymbol}{item.totalPaidWage.toLocaleString()}
                  </td>
                  <td
                    className={`p-2.5 text-right font-black ${
                      item.balanceDue > 0 ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  >
                    {settings.currencySymbol}{item.balanceDue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-800/90 font-bold text-white border-t border-slate-700">
                <td className="p-2.5" colSpan={5}>
                  Portfolio Total
                </td>
                <td className="p-2.5 text-right">
                  {settings.currencySymbol}{totalWageLiabilityEarned.toLocaleString()}
                </td>
                <td className="p-2.5 text-right text-emerald-400">
                  {settings.currencySymbol}{totalWageLiabilityPaid.toLocaleString()}
                </td>
                <td className="p-2.5 text-right text-amber-400 font-black">
                  {settings.currencySymbol}{totalWageLiabilityPending.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
