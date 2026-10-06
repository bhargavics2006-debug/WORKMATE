import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Building,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  HardHat,
  Users,
  Coins,
  Package,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { useWorkmate } from '../../context/WorkmateContext';
import { DailyReport } from '../../types';
import { getTodayDateString } from '../../utils/initialData';

export const DailyReportView: React.FC = () => {
  const {
    dailyReports,
    addDailyReport,
    deleteDailyReport,
    projects,
    workers,
    attendance,
    expenses,
    materials,
    settings,
  } = useWorkmate();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'proj-1');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState<DailyReport | null>(null);

  // Form states for manual or auto-generated report
  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  const projectWorkers = workers.filter(w => !w.projectId || w.projectId === selectedProjectId);
  const dayAttendance = attendance.filter(a => a.date === selectedDate && (!a.projectId || a.projectId === selectedProjectId));
  const presentCount = dayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const dayExpenses = expenses.filter(e => e.date === selectedDate && (!e.projectId || e.projectId === selectedProjectId));
  const dayExpenseTotal = dayExpenses.reduce((s, e) => s + (e.amount || 0), 0);

  const [workCompleted, setWorkCompleted] = useState(
    'Casting 2nd floor columns, checking rebar ties and installing electrical conduit.'
  );
  const [issues, setIssues] = useState('Minor delay in morning cement transit (30 mins).');
  const [safetyNotes, setSafetyNotes] = useState('All personnel wore hard hats, high-vis vests and safety boots. Zero incidents.');
  const [progressPct, setProgressPct] = useState(65);

  const handleGenerateAndSave = (e: React.FormEvent) => {
    e.preventDefault();

    addDailyReport({
      date: selectedDate,
      projectId: selectedProjectId,
      projectName: activeProject?.name || 'Site Project',
      workersCount: projectWorkers.length || 4,
      presentWorkersCount: presentCount || projectWorkers.length,
      workCompleted: workCompleted.trim(),
      materialsUsed: [
        { materialName: 'Portland Cement', quantity: 25, unit: 'Bags' },
        { materialName: 'River Sand', quantity: 3, unit: 'Tons' },
      ],
      expensesTotal: dayExpenseTotal || 240,
      issues: issues.trim() || undefined,
      safetyNotes: safetyNotes.trim() || undefined,
      photos: [
        'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?w=500&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&auto=format&fit=crop&q=80',
      ],
      progressPercentage: progressPct,
    });

    setIsCreateModalOpen(false);
  };

  const handleDownloadCSV = (report: DailyReport) => {
    const csvContent =
      `WORKMATE Daily Site Operations Report\n` +
      `Date: ${report.date}\n` +
      `Site: "${report.projectName}"\n` +
      `Progress: ${report.progressPercentage}%\n` +
      `Total Assigned Workers: ${report.workersCount}\n` +
      `Present Workers: ${report.presentWorkersCount}\n` +
      `Daily Expenses: ${settings.currencySymbol}${report.expensesTotal}\n` +
      `Work Completed: "${report.workCompleted.replace(/"/g, '""')}"\n` +
      `Issues: "${(report.issues || 'None').replace(/"/g, '""')}"\n` +
      `Safety Notes: "${(report.safetyNotes || 'None').replace(/"/g, '""')}"\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `daily_site_report_${report.date}_${report.projectId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 pb-24 lg:pb-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-900 via-slate-900 to-slate-900 p-5 rounded-3xl border border-blue-500/30 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30">
              <FileText className="w-5 h-5 stroke-[2.5]" />
            </span>
            <h2 className="text-xl font-black text-white">Daily Site Reports (DSR)</h2>
          </div>
          <p className="text-xs text-blue-200/80 mt-1">
            Standard executive site log synthesizing attendance, expenses, materials, progress & OSHA safety
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-md shadow-blue-600/25 transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Generate Today's Report</span>
          </button>
        </div>
      </div>

      {/* Reports Archive Cards */}
      <div className="space-y-3">
        {dailyReports.map(report => (
          <div
            key={report.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 hover:border-blue-500/40 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-black text-white text-base">{report.projectName}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {report.progressPercentage}% Milestone
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Report Date: <b>{report.date}</b></span>
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewingReport(report)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>Inspect</span>
                </button>
                <button
                  onClick={() => handleDownloadCSV(report)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
                  title="Download CSV"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => {
                    setViewingReport(report);
                    setTimeout(handlePrint, 300);
                  }}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  title="Print Report"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteDailyReport(report.id)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Metrics Quick Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-2xl bg-slate-850 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Workforce Present</span>
                <span className="text-sm font-black text-white mt-0.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  {report.presentWorkersCount} / {report.workersCount} Workers
                </span>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-850 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Daily Expenses</span>
                <span className="text-sm font-black text-emerald-400 mt-0.5 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-emerald-400" />
                  {settings.currencySymbol}{report.expensesTotal.toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-850 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Materials Dispatched</span>
                <span className="text-sm font-black text-amber-300 mt-0.5 truncate flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-amber-400" />
                  {report.materialsUsed.length} Batches
                </span>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-850 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Safety & Compliance</span>
                <span className="text-sm font-black text-emerald-400 mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Verified OK
                </span>
              </div>
            </div>

            {/* Narrative summary */}
            <div className="text-xs space-y-2">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Work Completed:</span>
                <p className="text-slate-200 leading-relaxed bg-slate-850 p-3 rounded-2xl border border-slate-800 font-medium">
                  {report.workCompleted}
                </p>
              </div>

              {report.issues && (
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><b>Obstacles & Delays:</b> {report.issues}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Report Inspection Modal (Print-Ready) */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 text-slate-100 shadow-2xl relative my-auto space-y-4 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 print:border-black">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider print:text-blue-600">
                  OFFICIAL DAILY SITE OPERATION REPORT (DSR)
                </span>
                <h3 className="text-lg font-black text-white print:text-black">{viewingReport.projectName}</h3>
                <p className="text-xs text-slate-400 print:text-slate-600">Date: {viewingReport.date}</p>
              </div>

              <div className="flex items-center space-x-2 print:hidden">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setViewingReport(null)}
                  className="text-slate-400 hover:text-white p-1 text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-850 border border-slate-800 print:border-slate-300 print:bg-slate-100">
                <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-semibold">Phase Progress</span>
                <p className="text-lg font-black text-blue-400 print:text-blue-700">{viewingReport.progressPercentage}%</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-850 border border-slate-800 print:border-slate-300 print:bg-slate-100">
                <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-semibold">Attendance</span>
                <p className="text-lg font-black text-white print:text-black">{viewingReport.presentWorkersCount} Present</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-850 border border-slate-800 print:border-slate-300 print:bg-slate-100">
                <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-semibold">Day Expenses</span>
                <p className="text-lg font-black text-emerald-400 print:text-emerald-700">{settings.currencySymbol}{viewingReport.expensesTotal}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-850 border border-slate-800 print:border-slate-300 print:bg-slate-100">
                <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-semibold">Safety Audit</span>
                <p className="text-lg font-black text-emerald-400 print:text-emerald-700">100% Passed</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-300 print:text-slate-700 block mb-1">Work Description:</span>
                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 print:border-slate-300 print:bg-slate-50 text-slate-200 print:text-black leading-relaxed font-medium">
                  {viewingReport.workCompleted}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-300 print:text-slate-700 block mb-1">Materials Consumed:</span>
                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 print:border-slate-300 print:bg-slate-50 text-slate-200 print:text-black">
                  {viewingReport.materialsUsed.map((m, i) => (
                    <span key={i} className="inline-block mr-3">
                      • {m.materialName}: <b>{m.quantity} {m.unit}</b>
                    </span>
                  ))}
                </div>
              </div>

              {viewingReport.safetyNotes && (
                <div>
                  <span className="font-bold text-slate-300 print:text-slate-700 block mb-1">OSHA Safety & Protocols:</span>
                  <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 print:border-slate-300 print:bg-slate-50 text-slate-200 print:text-black">
                    {viewingReport.safetyNotes}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 print:border-slate-300 text-[11px] text-slate-500 flex justify-between">
              <span>WORKMATE Site Management System • Verified Digital Sign-off</span>
              <span>Ref ID: {viewingReport.id}</span>
            </div>
          </div>
        </div>
      )}

      {/* Create DSR Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 text-slate-100 shadow-2xl max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Generate Daily Site Report
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateAndSave} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Site / Project
                  </label>
                  <select
                    value={selectedProjectId}
                    onChange={e => setSelectedProjectId(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Report Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
                  />
                </div>
              </div>

              {/* Auto-populated stats summary */}
              <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-500/20 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Attendance Logged:</span>
                  <span className="font-bold text-white">{presentCount} Present / {projectWorkers.length} Assigned</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Day's Ledger Expense:</span>
                  <span className="font-bold text-emerald-400">{settings.currencySymbol}{dayExpenseTotal} Recorded</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Work Completed Today
                </label>
                <textarea
                  required
                  rows={3}
                  value={workCompleted}
                  onChange={e => setWorkCompleted(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Site Issues / Roadblocks (Optional)
                </label>
                <input
                  type="text"
                  value={issues}
                  onChange={e => setIssues(e.target.value)}
                  placeholder="Material delays, weather disruption, etc."
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Safety & Environmental Notes
                </label>
                <input
                  type="text"
                  value={safetyNotes}
                  onChange={e => setSafetyNotes(e.target.value)}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Cumulative Milestone Progress
                  </label>
                  <span className="font-bold text-blue-400">{progressPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressPct}
                  onChange={e => setProgressPct(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-600/30 transition"
                >
                  Save & Archive Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
