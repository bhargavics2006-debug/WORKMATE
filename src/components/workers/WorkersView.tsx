import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  Clock,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  CreditCard,
  ChevronRight,
} from 'lucide-react';
import { useWorkmate } from '../../context/WorkmateContext';
import { Worker, WorkerRole, WageType } from '../../types';
import { SECTOR_TEMPLATES, getTodayDateString } from '../../utils/initialData';

export const WorkersView: React.FC = () => {
  const {
    workers,
    addWorker,
    updateWorker,
    deleteWorker,
    attendance,
    payouts,
    allWorkersWageStats,
    settings,
    setActiveTab,
    recordWagePayout,
  } = useWorkmate();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [selectedWorkerDetail, setSelectedWorkerDetail] = useState<Worker | null>(null);

  // Quick payout modal state
  const [quickPayoutWorker, setQuickPayoutWorker] = useState<Worker | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<number | ''>('');
  const [payoutMethod, setPayoutMethod] = useState<'Cash' | 'Bank Transfer' | 'Digital Wallet' | 'Other'>('Cash');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [payoutError, setPayoutError] = useState<string | null>(null);

  // New worker form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'General Labor',
    wageType: 'daily' as WageType,
    dailyRate: 120,
    overtimeHourlyRate: 20,
    status: 'active' as 'active' | 'inactive',
    joinedDate: getTodayDateString(),
    notes: '',
  });

  // Current sector available roles
  const currentSectorConfig = useMemo(() => {
    return SECTOR_TEMPLATES.find((s) => s.id === settings.sectorPreset) || SECTOR_TEMPLATES[0];
  }, [settings.sectorPreset]);

  // Filtered workers
  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      const matchesSearch =
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || w.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [workers, searchQuery, roleFilter, statusFilter]);

  const handleOpenAdd = () => {
    setEditingWorker(null);
    setFormData({
      name: '',
      phone: '',
      role: currentSectorConfig.roles[0] || 'General Labor',
      wageType: 'daily',
      dailyRate: 120,
      overtimeHourlyRate: 20,
      status: 'active',
      joinedDate: getTodayDateString(),
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (worker: Worker) => {
    setEditingWorker(worker);
    setFormData({
      name: worker.name,
      phone: worker.phone,
      role: worker.role,
      wageType: worker.wageType,
      dailyRate: worker.dailyRate,
      overtimeHourlyRate: worker.overtimeHourlyRate,
      status: worker.status,
      joinedDate: worker.joinedDate,
      notes: worker.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingWorker) {
      updateWorker({
        ...editingWorker,
        ...formData,
      });
    } else {
      addWorker(formData);
    }

    setIsAddModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Remove worker "${name}"? This worker's historical records will remain archived.`)) {
      deleteWorker(id);
      if (selectedWorkerDetail?.id === id) {
        setSelectedWorkerDetail(null);
      }
    }
  };

  const handleOpenPayout = (worker: Worker) => {
    const stats = allWorkersWageStats.find((s) => s.workerId === worker.id);
    setQuickPayoutWorker(worker);
    setPayoutAmount(stats?.balanceDue || worker.dailyRate);
    setPayoutMethod('Cash');
    setPayoutNotes('Wage payout');
    setPayoutError(null);
  };

  const handleExecutePayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPayoutWorker || !payoutAmount || Number(payoutAmount) <= 0) return;

    const res = recordWagePayout({
      workerId: quickPayoutWorker.id,
      amount: Number(payoutAmount),
      date: getTodayDateString(),
      paymentMethod: payoutMethod,
      notes: payoutNotes,
      periodDescription: 'Direct Payout',
    });

    if (!res.success) {
      setPayoutError(res.error || 'Failed to disburse payout.');
      return;
    }

    setQuickPayoutWorker(null);
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-8">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            Worker Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Register team members, set wage rates, and monitor balances
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition self-stretch sm:self-auto"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>Register New Worker</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workers by name, role or phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
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

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          {/* Status Tabs */}
          <div className="flex bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/60">
            {(['active', 'all', 'inactive'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg capitalize font-semibold transition ${
                  statusFilter === status
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Role Filter dropdown */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-2.5 py-1 text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Roles ({workers.length})</option>
            {currentSectorConfig.roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Workers Grid */}
      {filteredWorkers.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-white font-bold text-sm">No workers found</h3>
          <p className="text-slate-400 text-xs mt-1">
            {searchQuery ? 'Try clearing your search terms or filters.' : 'Click "Register New Worker" to add your first worker.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl"
          >
            Add Worker
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredWorkers.map((worker) => {
            const stats = allWorkersWageStats.find((s) => s.workerId === worker.id);
            const initials = worker.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={worker.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Top Header: Avatar + Info + Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-11 h-11 rounded-2xl ${
                          worker.avatarColor || 'bg-amber-600'
                        } flex items-center justify-center text-white font-extrabold text-sm shadow-md shrink-0`}
                      >
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm sm:text-base text-white">
                          {worker.name}
                        </h3>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className="text-xs text-amber-400 font-semibold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                            {worker.role}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                              worker.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {worker.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEdit(worker)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                        title="Edit Worker"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(worker.id, worker.name)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                        title="Delete Worker"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Wage Rates & Contact Strip */}
                  <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-slate-800/80 text-xs">
                    <div className="bg-slate-800/40 p-2 rounded-xl">
                      <span className="text-[11px] text-slate-400 block">Daily Rate</span>
                      <span className="text-sm font-extrabold text-white">
                        {settings.currencySymbol}{worker.dailyRate.toLocaleString()}
                        <span className="text-[10px] text-slate-400 font-normal"> /day</span>
                      </span>
                    </div>

                    <div className="bg-slate-800/40 p-2 rounded-xl">
                      <span className="text-[11px] text-slate-400 block">Overtime Rate</span>
                      <span className="text-sm font-extrabold text-white">
                        {settings.currencySymbol}{worker.overtimeHourlyRate.toLocaleString()}
                        <span className="text-[10px] text-slate-400 font-normal"> /hr</span>
                      </span>
                    </div>
                  </div>

                  {/* Attendance & Wage Summary */}
                  <div className="mt-2.5 p-2.5 rounded-xl bg-slate-850/60 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Days Logged:</span>
                      <span className="font-semibold text-white">
                        {stats?.presentDays || 0} Present • {stats?.halfDays || 0} Half • {stats?.absentDays || 0} Absent
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Total Earned:</span>
                      <span className="font-semibold text-slate-200">
                        {settings.currencySymbol}{(stats?.totalEarnedWage || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-700/50">
                      <span className="text-slate-400 font-medium">Pending Balance:</span>
                      <span
                        className={`font-black ${
                          (stats?.balanceDue || 0) > 0 ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {settings.currencySymbol}{(stats?.balanceDue || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Contact Number */}
                  {worker.phone && (
                    <div className="mt-2 text-xs flex items-center justify-between text-slate-400">
                      <a
                        href={`tel:${worker.phone}`}
                        className="flex items-center space-x-1.5 text-slate-300 hover:text-amber-400 transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-amber-400" />
                        <span>{worker.phone}</span>
                      </a>
                      <span className="text-[11px] text-slate-500">Joined: {worker.joinedDate}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenPayout(worker)}
                    className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pay Wage</span>
                  </button>
                  <button
                    onClick={() => setSelectedWorkerDetail(worker)}
                    className="py-2 px-3 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition"
                  >
                    History
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Worker Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-5 text-slate-100 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">
                  {editingWorker ? 'Edit Worker Details' : 'Register New Worker'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWorker} className="mt-4 space-y-3.5 text-xs">
              {/* Full Name */}
              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Carlos Mendez"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Role / Skill *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                >
                  {currentSectorConfig.roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                  <option value="Other">Other / Specialist</option>
                </select>
              </div>

              {/* Daily Rate & Overtime Rate */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Daily Wage Rate ({settings.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={formData.dailyRate}
                    onChange={(e) => setFormData({ ...formData, dailyRate: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Overtime ({settings.currencySymbol}/hour)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.overtimeHourlyRate}
                    onChange={(e) =>
                      setFormData({ ...formData, overtimeHourlyRate: Number(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Joining Date & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    value={formData.joinedDate}
                    onChange={(e) => setFormData({ ...formData, joinedDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="active">Active Crew</option>
                    <option value="inactive">Inactive / On Leave</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Notes / Qualifications
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Certified scaffolding, medical insurance, emergency contact"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-extrabold shadow-md shadow-amber-500/20"
                >
                  {editingWorker ? 'Save Changes' : 'Register Worker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Payout Modal */}
      {quickPayoutWorker && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-5 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Record Wage Payout</h3>
              </div>
              <button onClick={() => setQuickPayoutWorker(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            {payoutError && (
              <div className="mt-3 p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs">
                {payoutError}
              </div>
            )}

            <form onSubmit={handleExecutePayout} className="mt-4 space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="text-slate-400">Worker:</div>
                <div className="font-bold text-sm text-white">{quickPayoutWorker.name}</div>
                <div className="text-[11px] text-amber-400">{quickPayoutWorker.role}</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Payout Amount ({settings.currencySymbol}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.5"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value) || '')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-base font-extrabold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Payment Method
                </label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Cash">Cash Handover</option>
                  <option value="Bank Transfer">Bank Transfer / UPI</option>
                  <option value="Digital Wallet">Digital Wallet</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Notes / Reference
                </label>
                <input
                  type="text"
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  placeholder="e.g. Full week settlement, voucher #12"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setQuickPayoutWorker(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-extrabold shadow-md"
                >
                  Confirm Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Individual Worker Profile History Drawer */}
      {selectedWorkerDetail && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-5 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">
                  {selectedWorkerDetail.name} • Records
                </h3>
              </div>
              <button
                onClick={() => setSelectedWorkerDetail(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Recent Attendance */}
              <div>
                <h4 className="font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Attendance Records ({attendance.filter((a) => a.workerId === selectedWorkerDetail.id).length})
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {attendance
                    .filter((a) => a.workerId === selectedWorkerDetail.id)
                    .slice(0, 15)
                    .map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/50"
                      >
                        <span className="font-medium text-slate-300">{rec.date}</span>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              rec.status === 'present'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : rec.status === 'half_day'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {rec.status.replace('_', ' ')}
                          </span>
                          <span className="font-bold text-white">
                            {settings.currencySymbol}{rec.calculatedWage}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Payouts History */}
              <div>
                <h4 className="font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Payment History ({payouts.filter((p) => p.workerId === selectedWorkerDetail.id).length})
                </h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {payouts.filter((p) => p.workerId === selectedWorkerDetail.id).length === 0 ? (
                    <div className="text-slate-500 text-center py-2">No payments recorded yet.</div>
                  ) : (
                    payouts
                      .filter((p) => p.workerId === selectedWorkerDetail.id)
                      .map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/50"
                        >
                          <div>
                            <span className="font-semibold text-white">{p.date}</span>
                            <span className="text-slate-400 text-[11px] ml-2">({p.paymentMethod})</span>
                          </div>
                          <span className="font-extrabold text-emerald-400">
                            {settings.currencySymbol}{p.amount.toLocaleString()}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedWorkerDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
