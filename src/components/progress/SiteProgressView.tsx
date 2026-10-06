import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  Camera,
  CheckCircle2,
  Clock,
  Building,
  Image as ImageIcon,
  Trash2,
  Calendar,
  Sparkles,
  Layers,
  ChevronRight,
  UploadCloud,
} from 'lucide-react';
import { useWorkmate } from '../../context/WorkmateContext';
import { SiteProgress } from '../../types';
import { getTodayDateString } from '../../utils/initialData';

export const SiteProgressView: React.FC = () => {
  const {
    siteProgress,
    addSiteProgress,
    deleteSiteProgress,
    projects,
    currentProjectId,
    setCurrentProjectId,
    settings,
  } = useWorkmate();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    currentProjectId !== 'all' ? currentProjectId : projects[0]?.id || 'proj-1'
  );
  const [progressPercent, setProgressPercent] = useState<number>(65);
  const [workDescription, setWorkDescription] = useState('');
  const [completedTaskInput, setCompletedTaskInput] = useState('');
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [pendingTaskInput, setPendingTaskInput] = useState('');
  const [pendingTasks, setPendingTasks] = useState<string[]>([]);
  const [status, setStatus] = useState<SiteProgress['status']>('in_progress');
  const [photoUrls, setPhotoUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?w=500&auto=format&fit=crop&q=80',
  ]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);

  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const filteredLogs = siteProgress.filter(
    p => currentProjectId === 'all' || p.projectId === currentProjectId
  );

  const latestProjectLog = siteProgress.find(
    p => p.projectId === (currentProjectId === 'all' ? projects[0]?.id : currentProjectId)
  ) || siteProgress[0];

  const handleAddCompletedTask = () => {
    if (!completedTaskInput.trim()) return;
    setCompletedTasks(prev => [...prev, completedTaskInput.trim()]);
    setCompletedTaskInput('');
  };

  const handleAddPendingTask = () => {
    if (!pendingTaskInput.trim()) return;
    setPendingTasks(prev => [...prev, pendingTaskInput.trim()]);
    setPendingTaskInput('');
  };

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    setPhotoUrls(prev => [...prev, newPhotoUrl.trim()]);
    setNewPhotoUrl('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const res = ev.target?.result as string;
      if (res) {
        setPhotoUrls(prev => [...prev, res]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workDescription.trim()) return;

    addSiteProgress({
      projectId: selectedProjectId,
      projectName: activeProject?.name || 'Site Project',
      date: getTodayDateString(),
      overallProgress: progressPercent,
      todayWorkDescription: workDescription.trim(),
      completedTasks: completedTasks.length > 0 ? completedTasks : ['Standard milestone checklist verified'],
      pendingTasks: pendingTasks.length > 0 ? pendingTasks : ['Awaiting inspection approval'],
      photos: photoUrls,
      status,
      recordedBy: `${settings.currentUser?.name || 'Alex Morgan'} (${settings.currentUser?.role || 'Supervisor'})`,
    });

    setIsAddModalOpen(false);
    setWorkDescription('');
    setCompletedTasks([]);
    setPendingTasks([]);
  };

  return (
    <div className="space-y-5 pb-24 lg:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-900 via-slate-900 to-slate-900 p-5 rounded-3xl border border-blue-500/30 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </span>
            <h2 className="text-xl font-black text-white">Site Progress Tracker</h2>
          </div>
          <p className="text-xs text-blue-200/80 mt-1">
            Real-time milestone tracking, photographic evidence gallery, and construction deliverables
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Site Filter */}
          <select
            value={currentProjectId}
            onChange={e => setCurrentProjectId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Sites & Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-md shadow-blue-600/25 transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Log Progress</span>
          </button>
        </div>
      </div>

      {/* Main Status & Progress Overview Card */}
      {latestProjectLog && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                Active Site Focus
              </span>
              <h3 className="text-lg font-black text-white mt-0.5">
                {latestProjectLog.projectName}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                <span>Logged by {latestProjectLog.recordedBy}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {latestProjectLog.date}
                </span>
              </p>
            </div>

            <div className="flex items-center space-x-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                  Overall Completion
                </span>
                <span className="text-2xl font-black text-blue-400">
                  {latestProjectLog.overallProgress}%
                </span>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-blue-500 border-r-blue-500 flex items-center justify-center font-black text-xs text-white">
                {latestProjectLog.overallProgress}%
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Phase Completion Meter</span>
              <span className="text-blue-400 font-bold">{latestProjectLog.overallProgress}% Completed</span>
            </div>
            <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-400 rounded-full transition-all duration-700"
                style={{ width: `${latestProjectLog.overallProgress}%` }}
              />
            </div>
          </div>

          {/* Today's Work Summary */}
          <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/20 text-xs space-y-1.5">
            <span className="font-extrabold uppercase text-[10px] tracking-wider text-blue-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Latest Work Log & Field Notes
            </span>
            <p className="text-slate-200 leading-relaxed font-medium">
              {latestProjectLog.todayWorkDescription}
            </p>
          </div>

          {/* Completed vs Pending Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Completed Tasks */}
            <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Completed Deliverables
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300">
                  {latestProjectLog.completedTasks.length} Done
                </span>
              </div>
              <ul className="space-y-1.5">
                {latestProjectLog.completedTasks.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pending Tasks */}
            <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Pending / In-Progress Tasks
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300">
                  {latestProjectLog.pendingTasks.length} In Pipeline
                </span>
              </div>
              <ul className="space-y-1.5">
                {latestProjectLog.pendingTasks.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Photo Gallery */}
          {latestProjectLog.photos && latestProjectLog.photos.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-400" />
                  Site Visual Gallery ({latestProjectLog.photos.length} Captured Images)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {latestProjectLog.photos.map((url, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedPhotoPreview(url)}
                    className="relative group rounded-2xl overflow-hidden aspect-video bg-slate-800 border border-slate-700/60 cursor-pointer shadow-sm hover:border-blue-500 transition"
                  >
                    <img
                      src={url}
                      alt={`Site photo ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[11px] font-bold">
                      View Full Photo
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Historical Logs List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            Milestone Audit Logs
          </h3>
          <span className="text-xs text-slate-400">{filteredLogs.length} Records</span>
        </div>

        <div className="space-y-3">
          {filteredLogs.map(log => (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-slate-850 hover:bg-slate-800/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-black text-white text-sm">{log.projectName}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {log.overallProgress}% Done
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    log.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : log.status === 'in_progress'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    {log.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-slate-300 line-clamp-1">{log.todayWorkDescription}</p>
                <p className="text-[11px] text-slate-500">Date: {log.date} • {log.recordedBy}</p>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center">
                <button
                  onClick={() => deleteSiteProgress(log.id)}
                  className="p-2 text-slate-500 hover:text-red-400 rounded-xl hover:bg-slate-750 transition"
                  title="Delete record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Progress Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 text-slate-100 shadow-2xl max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Log Site Progress Milestone
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Target Project / Site
                </label>
                <select
                  value={selectedProjectId}
                  onChange={e => setSelectedProjectId(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-blue-500"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Overall Project Progress
                  </label>
                  <span className="font-black text-blue-400 text-sm">{progressPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressPercent}
                  onChange={e => setProgressPercent(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Work Completed Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={workDescription}
                  onChange={e => setWorkDescription(e.target.value)}
                  placeholder="Detail daily structural work, pouring, framing, or electrical logs..."
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Completed Tasks List Adder */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Completed Tasks
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={completedTaskInput}
                    onChange={e => setCompletedTaskInput(e.target.value)}
                    placeholder="e.g. Columns poured and vibrated"
                    className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCompletedTask}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold"
                  >
                    Add
                  </button>
                </div>
                {completedTasks.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {completedTasks.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 rounded-lg text-[11px] flex items-center gap-1">
                        <span>✓ {t}</span>
                        <button type="button" onClick={() => setCompletedTasks(completedTasks.filter((_, i) => i !== idx))}>✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Tasks List Adder */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Pending / Next Shift Tasks
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pendingTaskInput}
                    onChange={e => setPendingTaskInput(e.target.value)}
                    placeholder="e.g. Facade scaffold tie-ins"
                    className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddPendingTask}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold"
                  >
                    Add
                  </button>
                </div>
                {pendingTasks.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {pendingTasks.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-amber-950/70 text-amber-300 border border-amber-500/40 rounded-lg text-[11px] flex items-center gap-1">
                        <span>• {t}</span>
                        <button type="button" onClick={() => setPendingTasks(pendingTasks.filter((_, i) => i !== idx))}>✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Photos upload / URL */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Site Photos / Evidence
                </label>
                <div className="flex gap-2">
                  <label className="cursor-pointer px-3 py-2 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/40 hover:bg-blue-600/30 font-bold flex items-center gap-1.5">
                    <Camera className="w-4 h-4" />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <input
                    type="text"
                    value={newPhotoUrl}
                    onChange={e => setNewPhotoUrl(e.target.value)}
                    placeholder="or paste image URL..."
                    className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhoto}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold"
                  >
                    Add URL
                  </button>
                </div>
                {photoUrls.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {photoUrls.map((url, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden aspect-video border border-slate-750 bg-slate-800">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhotoUrls(photoUrls.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-md p-0.5 text-[9px]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-600/30 transition"
                >
                  Save Milestone Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Preview Modal */}
      {selectedPhotoPreview && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full">
            <button
              onClick={() => setSelectedPhotoPreview(null)}
              className="absolute -top-10 right-0 text-white hover:text-blue-400 font-bold text-sm bg-slate-800 px-3 py-1 rounded-full"
            >
              Close ✕
            </button>
            <img
              src={selectedPhotoPreview}
              alt="Full preview"
              className="w-full h-auto max-h-[80vh] object-contain rounded-2xl border border-slate-700"
            />
          </div>
        </div>
      )}
    </div>
  );
};
