import React, { useState } from 'react';
import {
  CalendarCheck,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  Minus,
  Check,
  FileSpreadsheet,
  Users,
} from 'lucide-react';
import { useWorkmate } from '../../context/WorkmateContext';
import { AttendanceStatus } from '../../types';
import { getTodayDateString, getOffsetDateString } from '../../utils/initialData';

export const AttendanceView: React.FC = () => {
  const {
    workers,
    attendance,
    selectedDate,
    setSelectedDate,
    markAttendance,
    markAllAttendance,
    todayStats,
    settings,
  } = useWorkmate();

  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [editingNotesWorkerId, setEditingNotesWorkerId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

  const activeWorkers = workers.filter((w) => w.status === 'active');
  const todayStr = getTodayDateString();
  const yesterdayStr = getOffsetDateString(-1);

  // Quick map of attendance for selectedDate
  const currentDayRecords = new Map();
  attendance.forEach((rec) => {
    if (rec.date === selectedDate) {
      currentDayRecords.set(rec.workerId, rec);
    }
  });

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleStatusChange = (workerId: string, status: AttendanceStatus) => {
    const existing = currentDayRecords.get(workerId);
    markAttendance(
      workerId,
      selectedDate,
      status,
      existing ? existing.overtimeHours : 0,
      existing?.note
    );
  };

  const handleOtChange = (workerId: string, delta: number) => {
    const existing = currentDayRecords.get(workerId);
    const currentOt = existing ? existing.overtimeHours || 0 : 0;
    const newOt = Math.max(0, Math.round((currentOt + delta) * 10) / 10);
    const status: AttendanceStatus = existing ? existing.status : 'present';

    markAttendance(workerId, selectedDate, status, newOt, existing?.note);
  };

  const handleSaveNote = (workerId: string) => {
    const existing = currentDayRecords.get(workerId);
    const status: AttendanceStatus = existing ? existing.status : 'present';
    markAttendance(
      workerId,
      selectedDate,
      status,
      existing?.overtimeHours || 0,
      tempNote
    );
    setEditingNotesWorkerId(null);
  };

  // Month grid helpers
  const currentMonthPrefix = selectedDate.slice(0, 7); // e.g. "2026-10"
  const daysInMonth = useMemoDaysInMonth(currentMonthPrefix);

  function useMemoDaysInMonth(monthPrefix: string) {
    const [year, month] = monthPrefix.split('-').map(Number);
    const numDays = new Date(year, month, 0).getDate();
    return Array.from({ length: numDays }, (_, i) => {
      const day = String(i + 1).padStart(2, '0');
      return `${monthPrefix}-${day}`;
    });
  }

  return (
    <div className="space-y-4 pb-20 lg:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-emerald-400" />
            Attendance Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Mark daily presence, track overtime, and auto-calculate daily wage costs
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl self-start sm:self-auto text-xs">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              viewMode === 'daily'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Daily Log
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1 ${
              viewMode === 'monthly'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Monthly Sheet</span>
          </button>
        </div>
      </div>

      {/* Date Navigation Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevDay}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
            <CalendarIcon className="w-4 h-4 text-emerald-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleNextDay}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Date Shortcuts */}
        <div className="flex items-center space-x-1.5 text-xs">
          <button
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              selectedDate === todayStr
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setSelectedDate(yesterdayStr)}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              selectedDate === yesterdayStr
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Yesterday
          </button>
        </div>
      </div>

      {viewMode === 'daily' ? (
        <>
          {/* Daily Status Summary Bar */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-300">
                {selectedDate === todayStr ? "Today's Status:" : `Status for ${selectedDate}:`}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-extrabold border border-emerald-500/30">
                {todayStats.present} Present
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 font-extrabold border border-amber-500/30">
                {todayStats.halfDay} Half Day
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 font-extrabold border border-rose-500/30">
                {todayStats.absent} Absent
              </span>
              {todayStats.unmarked > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 font-semibold border border-slate-700">
                  {todayStats.unmarked} Unmarked
                </span>
              )}
            </div>

            {/* Quick Bulk Actions */}
            <div className="flex items-center space-x-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
              <button
                onClick={() => markAllAttendance(selectedDate, 'present')}
                className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl font-bold transition"
              >
                All Present
              </button>
              <button
                onClick={() => markAllAttendance(selectedDate, 'absent')}
                className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl font-bold transition"
              >
                All Absent
              </button>
            </div>
          </div>

          {/* Day's Wage Liability Strip */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Automatic Wage Liability for this date:
            </span>
            <span className="font-black text-sm text-white">
              {settings.currencySymbol}{todayStats.todayWageLiability.toLocaleString()}
            </span>
          </div>

          {/* Worker Attendance Cards */}
          <div className="space-y-3">
            {activeWorkers.map((worker) => {
              const record = currentDayRecords.get(worker.id);
              const status: AttendanceStatus | 'unmarked' = record ? record.status : 'unmarked';
              const otHours = record?.overtimeHours || 0;
              const wageEarned = record ? record.calculatedWage : 0;

              return (
                <div
                  key={worker.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Worker Info */}
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-xl ${
                          worker.avatarColor || 'bg-amber-600'
                        } flex items-center justify-center text-white font-bold text-xs shrink-0`}
                      >
                        {worker.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{worker.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{worker.role}</span>
                          <span>•</span>
                          <span className="text-amber-400 font-semibold">
                            {settings.currencySymbol}{worker.dailyRate}/day
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Wage preview */}
                    <div className="text-right hidden sm:block">
                      <div className="text-[11px] text-slate-400">Earned Today</div>
                      <div className="text-sm font-extrabold text-white">
                        {settings.currencySymbol}{wageEarned.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Attendance Controls Row */}
                  <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                    {/* Status Buttons */}
                    <div className="flex items-center space-x-1.5 text-xs font-bold w-full sm:w-auto">
                      {/* Present */}
                      <button
                        onClick={() => handleStatusChange(worker.id, 'present')}
                        className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1 px-3 py-2 rounded-xl transition ${
                          status === 'present'
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Present</span>
                      </button>

                      {/* Half Day */}
                      <button
                        onClick={() => handleStatusChange(worker.id, 'half_day')}
                        className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1 px-3 py-2 rounded-xl transition ${
                          status === 'half_day'
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <span>Half Day</span>
                      </button>

                      {/* Absent */}
                      <button
                        onClick={() => handleStatusChange(worker.id, 'absent')}
                        className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1 px-3 py-2 rounded-xl transition ${
                          status === 'absent'
                            ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <span>Absent</span>
                      </button>
                    </div>

                    {/* Overtime Controls */}
                    <div className="flex items-center space-x-2 text-xs w-full sm:w-auto justify-between sm:justify-start">
                      <div className="flex items-center space-x-1.5 bg-slate-800/70 p-1 rounded-xl border border-slate-700/60">
                        <span className="text-[11px] text-slate-400 pl-1.5 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          OT:
                        </span>
                        <button
                          onClick={() => handleOtChange(worker.id, -0.5)}
                          className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center font-bold"
                          title="Minus 0.5 hr"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-extrabold text-white px-1.5 min-w-[32px] text-center">
                          {otHours}h
                        </span>
                        <button
                          onClick={() => handleOtChange(worker.id, 0.5)}
                          className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center font-bold"
                          title="Plus 0.5 hr"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Mobile wage earned display */}
                      <div className="sm:hidden text-right">
                        <span className="text-[11px] text-slate-400">Total: </span>
                        <span className="font-black text-amber-400">
                          {settings.currencySymbol}{wageEarned.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Optional Note or Note Toggle */}
                  <div className="mt-2 text-xs">
                    {editingNotesWorkerId === worker.id ? (
                      <div className="flex items-center space-x-2 mt-1">
                        <input
                          type="text"
                          value={tempNote}
                          onChange={(e) => setTempNote(e.target.value)}
                          placeholder="e.g. Worked late on concrete roof, late arrival..."
                          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveNote(worker.id)}
                          className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-bold rounded-lg"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingNotesWorkerId(null)}
                          className="px-2 py-1 text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1">
                        <span className="italic truncate max-w-[260px]">
                          {record?.note ? `Note: ${record.note}` : 'No notes'}
                        </span>
                        <button
                          onClick={() => {
                            setEditingNotesWorkerId(worker.id);
                            setTempNote(record?.note || '');
                          }}
                          className="text-amber-400 hover:underline font-medium"
                        >
                          {record?.note ? 'Edit note' : '+ Add note'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Monthly Sheet View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h3 className="font-bold text-sm text-white">
              Monthly Attendance Sheet ({currentMonthPrefix})
            </h3>
            <span className="text-xs text-slate-400">Scroll horizontally to view all days</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="p-2.5 sticky left-0 bg-slate-850 z-10 min-w-[130px]">Worker</th>
                  {daysInMonth.map((day) => (
                    <th key={day} className="p-2 text-center min-w-[32px]">
                      {day.slice(8)}
                    </th>
                  ))}
                  <th className="p-2 text-center min-w-[50px] font-bold text-white">Total P</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {activeWorkers.map((worker) => {
                  let presentCount = 0;
                  return (
                    <tr key={worker.id} className="hover:bg-slate-850/50">
                      <td className="p-2.5 font-bold text-white sticky left-0 bg-slate-900 z-10 border-r border-slate-800">
                        {worker.name}
                      </td>
                      {daysInMonth.map((day) => {
                        const rec = attendance.find(
                          (a) => a.workerId === worker.id && a.date === day
                        );
                        if (rec?.status === 'present') presentCount++;
                        return (
                          <td key={day} className="p-1.5 text-center">
                            {rec?.status === 'present' ? (
                              <span className="inline-block w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 font-black leading-5">
                                P
                              </span>
                            ) : rec?.status === 'half_day' ? (
                              <span className="inline-block w-5 h-5 rounded bg-amber-500/20 text-amber-400 font-black leading-5">
                                H
                              </span>
                            ) : rec?.status === 'absent' ? (
                              <span className="inline-block w-5 h-5 rounded bg-rose-500/20 text-rose-400 font-black leading-5">
                                A
                              </span>
                            ) : (
                              <span className="text-slate-700">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-2 text-center font-black text-emerald-400 border-l border-slate-800">
                        {presentCount}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
