import React, { useState } from 'react';
import {
  User as UserIcon,
  Building,
  Globe,
  DollarSign,
  Bell,
  Shield,
  Download,
  Upload,
  RotateCcw,
  Check,
  Info,
  Sparkles,
} from 'lucide-react';
import { useWorkmate } from '../../context/WorkmateContext';
import { LANGUAGES, getTranslation } from '../../utils/translations';
import { SECTOR_TEMPLATES } from '../../utils/initialData';

export const ProfileView: React.FC = () => {
  const {
    settings,
    updateSettings,
    projects,
    currentProjectId,
    setCurrentProjectId,
    resetToSampleData,
    clearAllData,
    exportDataJSON,
    importDataJSON,
  } = useWorkmate();

  const [userName, setUserName] = useState(settings.currentUser?.name || 'Alex Morgan');
  const [userRole, setUserRole] = useState(settings.currentUser?.role || 'Admin');
  const [userPhone, setUserPhone] = useState(settings.currentUser?.phone || '+1 (555) 100-2020');
  const [savedToast, setSavedToast] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const t = getTranslation(settings.language || 'en');
  const currencies = ['$', '₹', '€', '£', '₦', 'R', '¥', '₱', 'AED', 'KSh'];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      currentUser: {
        id: settings.currentUser?.id || 'usr-admin',
        name: userName.trim(),
        role: userRole as any,
        phone: userPhone.trim(),
        avatarColor: settings.currentUser?.avatarColor || 'bg-amber-600',
        isOnline: true,
      },
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const res = importDataJSON(content);
      if (res.success) {
        setImportStatus('Backup restored successfully!');
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus(`Restore error: ${res.error}`);
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workmate_pro_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <UserIcon className="w-6 h-6 text-amber-400" />
          Profile & System Operations
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your role credentials, active site context, and application preferences
        </p>
      </div>

      {savedToast && (
        <div className="p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Profile preferences saved successfully!</span>
        </div>
      )}

      {importStatus && (
        <div className="p-3 rounded-2xl bg-blue-950/90 border border-blue-500/50 text-blue-200 text-xs font-bold">
          {importStatus}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: User Profile Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center space-x-3.5 pb-4 border-b border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-amber-600/30">
                {userName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">{userName}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {userRole}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">{userPhone}</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Assigned Site Role
                </label>
                <select
                  value={userRole}
                  onChange={e => setUserRole(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value="Admin">Admin (Full Control)</option>
                  <option value="Manager">Manager (Site & Budget Lead)</option>
                  <option value="Supervisor">Supervisor (Field Lead / Foreman)</option>
                  <option value="Worker">Worker (Personnel)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={e => setUserPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md transition"
              >
                Update Profile
              </button>
            </form>
          </div>

          {/* Active Project / Site Selector Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
              <Building className="w-5 h-5 text-cyan-400" />
              <h3 className="font-extrabold text-sm text-white">Active Project / Site Scope</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Filter records or assign new inventory and expenses to a specific construction site:
            </p>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => setCurrentProjectId('all')}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                  currentProjectId === 'all'
                    ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="font-bold">All Projects & Sites</div>
                  <div className="text-[10px] text-slate-400">Consolidated workforce & finances</div>
                </div>
                {currentProjectId === 'all' && <Check className="w-4 h-4 text-amber-400" />}
              </button>

              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => setCurrentProjectId(p.id)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                    currentProjectId === p.id
                      ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{p.location} • Mgr: {p.manager}</div>
                  </div>
                  {currentProjectId === p.id && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: App Settings & Offline Storage (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 text-xs">
            <h3 className="font-extrabold text-sm text-white pb-3 border-b border-slate-800">
              System Preferences
            </h3>

            {/* Language Selector */}
            <div>
              <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Preferred Interface Language (7 Available)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => updateSettings({ language: lang.code })}
                    className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition ${
                      settings.language === lang.code
                        ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <div className="truncate">
                      <div className="font-bold">{lang.nativeName}</div>
                      <div className="text-[10px] text-slate-400">{lang.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Currency Selector */}
            <div>
              <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Currency Symbol
              </label>
              <div className="flex flex-wrap gap-2">
                {currencies.map(curr => (
                  <button
                    key={curr}
                    onClick={() => updateSettings({ currencySymbol: curr })}
                    className={`px-3 py-1.5 rounded-xl font-bold border transition ${
                      settings.currencySymbol === curr
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications Toggle */}
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">In-App Notifications</span>
                <span className="text-[11px] text-slate-400">
                  Receive low inventory alerts and budget limit triggers
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.notificationsEnabled ?? true}
                onChange={e => updateSettings({ notificationsEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500"
              />
            </div>

            {/* Offline Data Backup & Restore */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <label className="block font-semibold text-slate-400 uppercase tracking-wider">
                Full Database Backup & Restore
              </label>
              <p className="text-[11px] text-slate-400">
                All workers, attendance logs, expenses, bills, and materials are stored locally in browser storage. Download a backup anytime to prevent data loss.
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={handleExport}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold border border-slate-700 flex items-center justify-center space-x-1.5"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Download Backup JSON</span>
                </button>

                <label className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold border border-slate-700 flex items-center justify-center space-x-1.5 cursor-pointer">
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>Restore from JSON</span>
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
              </div>
            </div>

            {/* Reset to Demo Data */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  if (confirm('Reload sample demonstration data? Existing records will be refreshed.')) {
                    resetToSampleData();
                  }
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold flex items-center justify-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload Demonstration Records</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Clear all local data and start completely fresh?')) {
                    clearAllData();
                  }
                }}
                className="py-2 px-3 rounded-xl bg-red-950/30 hover:bg-red-900/40 text-red-400 border border-red-800/40 font-bold"
              >
                Clear All Data
              </button>
            </div>
          </div>

          {/* App Metadata Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">WORKMATE – Build & Site Operations</span>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                v3.0 Pro Enterprise
              </span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Progressive Web App (PWA) with persistent offline storage, OSHA emergency protocols, and OCR receipt processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
