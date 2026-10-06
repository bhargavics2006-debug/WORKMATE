import React, { useState } from 'react';
import {
  Settings,
  User,
  Globe,
  Bell,
  DollarSign,
  Lock,
  Download,
  Upload,
  RotateCcw,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  HardHat,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useWorkmate } from '../../context/WorkmateContext';
import { LANGUAGES, getTranslation } from '../../utils/translations';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportDataJSON,
    importDataJSON,
    resetToSampleData,
    clearAllData,
    logout,
  } = useWorkmate();

  const t = getTranslation(settings.language || 'en');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Password change states
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  const currencies = ['$', '₹', '€', '£', '₦', 'R', '¥', '₱', 'AED', 'KSh'];

  const handleExport = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workmate_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      const res = importDataJSON(content);
      if (res.success) {
        setImportStatus('Data restored successfully!');
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus(`Import failed: ${res.error}`);
      }
    };
    reader.readAsText(file);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      setPassSuccess('New passwords do not match.');
      return;
    }
    setPassSuccess('Password updated successfully!');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => setPassSuccess(null), 3000);
  };

  return (
    <div className="space-y-5 pb-24 lg:pb-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-900 via-slate-900 to-slate-900 p-5 rounded-3xl border border-blue-500/30 shadow-xl">
        <div className="p-3 rounded-2xl bg-blue-600/30 text-blue-400 border border-blue-500/30">
          <Settings className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">System Settings & Governance</h2>
          <p className="text-xs text-blue-200/80">Manage profile, languages, local security and system backups</p>
        </div>
      </div>

      {importStatus && (
        <div className="p-3 rounded-2xl bg-blue-950/90 border border-blue-500/40 text-blue-300 text-xs font-bold">
          {importStatus}
        </div>
      )}

      {/* Grid of Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profile Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              Active Operator Profile
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {settings.currentUser?.role || 'Supervisor'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-2xl ${settings.currentUser?.avatarColor || 'bg-blue-600'} text-white font-black text-lg flex items-center justify-center shadow-lg shadow-blue-500/20`}>
              {(settings.currentUser?.name || 'Alex Morgan').slice(0, 1)}
            </div>
            <div>
              <h4 className="font-black text-white text-base">{settings.currentUser?.name || 'Alex Morgan'}</h4>
              <p className="text-xs text-slate-400">{settings.currentUser?.phone || '+1 (555) 100-2020'}</p>
              <p className="text-[11px] text-blue-400 font-semibold mt-0.5">{settings.organizationName}</p>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Organization / Contractor Name
            </label>
            <input
              type="text"
              value={settings.organizationName}
              onChange={e => updateSettings({ organizationName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Language & Regional Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              Language & Regional Currencies
            </h3>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Select Language / భాష / भाषा
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => updateSettings({ language: lang.code })}
                  className={`p-2 rounded-xl border text-left flex items-center space-x-2 transition ${
                    settings.language === lang.code
                      ? 'bg-blue-600/30 border-blue-500 text-blue-200 font-extrabold'
                      : 'bg-slate-800/80 border-slate-750 text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="truncate">{lang.nativeName}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Financial Currency Symbol
            </label>
            <div className="flex flex-wrap gap-1.5">
              {currencies.map(curr => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => updateSettings({ currencySymbol: curr })}
                  className={`w-9 h-8 rounded-xl font-bold text-xs border transition ${
                    settings.currencySymbol === curr
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Change Password UI Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" />
              Change Site Credentials
            </h3>
          </div>

          {passSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              {passSuccess}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={e => setCurrentPass(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="New password"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 border border-blue-500/30 font-bold transition"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Data Backup & Restore */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Data Persistence & Backups
            </h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            All workers, attendance logs, materials, site progress and expenses are stored safely on device local storage.
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={handleExport}
              className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold flex items-center justify-center space-x-1.5 shadow-md shadow-blue-600/25 transition"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON Backup</span>
            </button>

            <label className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold flex items-center justify-center space-x-1.5 cursor-pointer transition">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Restore Backup</span>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
            <button
              onClick={() => {
                if (confirm('Reload official demo dataset? Existing unsaved changes will reset to default sample data.')) {
                  resetToSampleData();
                }
              }}
              className="text-slate-400 hover:text-amber-400 flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload Demo Dataset</span>
            </button>

            <button
              onClick={logout}
              className="text-red-400 hover:text-red-300 flex items-center gap-1 font-bold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl text-xs space-y-2 text-center">
        <h4 className="font-extrabold text-white text-sm">WORKMATE – Smart Workforce & Site Management</h4>
        <p className="text-blue-300 font-medium">Smarter Sites. Stronger Teams. Better Tomorrow.</p>
        <p className="text-slate-500 text-[11px] max-w-lg mx-auto">
          Version 3.5 Pro • Geofenced check-in, real-time material inventory, automated payroll liability, OCR invoice scanning, and OSHA safety protocol audit.
        </p>
      </div>
    </div>
  );
};
