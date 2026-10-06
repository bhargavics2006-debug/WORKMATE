import React, { useState } from 'react';
import {
  Users,
  Settings as SettingsIcon,
  RotateCcw,
  Download,
  Upload,
  Sparkles,
  HelpCircle,
  Briefcase,
  DollarSign,
  Share2,
  Globe,
  Check,
  ShieldAlert,
  Bell,
  User as UserIcon,
  Mic,
} from 'lucide-react';
import { useWorkmate } from '../../context/WorkmateContext';
import { SECTOR_TEMPLATES } from '../../utils/initialData';
import { ShareInstallModal } from './ShareInstallModal';
import { LANGUAGES, getTranslation } from '../../utils/translations';

export const Header: React.FC = () => {
  const {
    settings,
    updateSettings,
    budget,
    totalExpenses,
    remainingBudget,
    budgetStatus,
    resetToSampleData,
    clearAllData,
    exportDataJSON,
    importDataJSON,
    setActiveTab,
    unreadNotificationsCount,
    setIsAuthModalOpen,
    setShowSplash,
    setIsVoiceModalOpen,
  } = useWorkmate();

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const currentLang = settings.language || 'en';
  const t = getTranslation(currentLang);
  const activeLangObj = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  const currencies = ['$', '₹', '€', '£', '₦', 'R', '¥', '₱', 'AED', 'KSh'];

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
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

  return (
    <>
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-black text-lg sm:text-xl tracking-wider shrink-0">
              WM
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center">
                  WORKMATE
                </h1>
                <span className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-semibold bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 uppercase tracking-wider">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-[130px] sm:max-w-xs">
                {settings.organizationName || 'Workforce & Budget Ops'}
              </p>
            </div>
          </div>

          {/* Quick Stats & Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5">
            {/* Language Quick Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/80 transition"
                title="Change Language / भाषा बदलें"
              >
                <span className="text-sm">{activeLangObj.flag}</span>
                <span className="hidden sm:inline uppercase text-[11px] font-bold">{activeLangObj.code}</span>
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-1.5 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 mb-1">
                    Select Language / भाषा
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        updateSettings({ language: lang.code });
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-800 transition ${
                        currentLang === lang.code ? 'text-amber-400 font-bold bg-slate-800/60' : 'text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </div>
                      {currentLang === lang.code && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Share & Install Button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center space-x-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 transition"
              title="Share or Download App"
            >
              <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Share / Install</span>
              <span className="sm:hidden">Share</span>
            </button>

            {/* Emergency SOS Button (Header Quick Action) */}
            <button
              onClick={() => setActiveTab('emergency')}
              className="flex items-center space-x-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-md shadow-red-600/30 transition animate-pulse"
              title="Emergency SOS / आपातकालीन"
            >
              <ShieldAlert className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>SOS</span>
            </button>

            {/* In-App Notifications Bell */}
            <button
              onClick={() => setActiveTab('notifications')}
              className="relative p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700/60"
              title="Notifications & Alerts"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-bounce">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Budget Summary Badge (on medium screens) */}
            <div className="hidden lg:flex items-center space-x-1 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60 text-xs">
              <span className="text-slate-400">Budget:</span>
              <span className="font-bold text-slate-200">
                {settings.currencySymbol}{budget.totalBudget.toLocaleString()}
              </span>
              <span className="text-slate-500 mx-1">|</span>
              <span className={`font-semibold ${remainingBudget < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {remainingBudget < 0 ? 'Over: ' : 'Left: '}
                {settings.currencySymbol}{Math.abs(remainingBudget).toLocaleString()}
              </span>
            </div>

            {/* Help Button */}
            <button
              onClick={() => setShowHelpModal(true)}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700/60"
              title="How to use WORKMATE"
              aria-label="Help"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-1.5 sm:p-2 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition border border-slate-700/60 text-xs font-semibold flex items-center space-x-1"
              title="Settings & Tools"
            >
              <SettingsIcon className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">{t.settings}</span>
            </button>

            {/* User Account / Role Pill */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center space-x-1.5 px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-semibold transition"
              title={`Logged in as ${settings.currentUser?.name || 'Alex Morgan'} (${settings.currentUser?.role || 'Admin'}) - Click to switch role or login`}
            >
              <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">
                {(settings.currentUser?.name || 'A')[0]}
              </div>
              <span className="hidden sm:inline font-bold text-[11px]">
                {settings.currentUser?.role || 'Admin'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Share & Download Modal */}
      <ShareInstallModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        language={currentLang}
      />

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <SettingsIcon className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base sm:text-lg text-white">Application Settings</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            {importStatus && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
                {importStatus}
              </div>
            )}

            <div className="mt-4 space-y-4 text-xs">
              {/* Language Selector in Settings */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Language / भाषा / Idioma
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => updateSettings({ language: lang.code })}
                      className={`p-2 rounded-xl text-left border flex items-center space-x-2 transition ${
                        currentLang === lang.code
                          ? 'bg-amber-950/40 border-amber-500 text-white font-bold'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <div className="truncate">
                        <div className="text-xs text-white leading-tight">{lang.nativeName}</div>
                        <div className="text-[10px] text-slate-400 leading-tight">{lang.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Organization Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Team / Business Name
                </label>
                <input
                  type="text"
                  value={settings.organizationName}
                  onChange={(e) => updateSettings({ organizationName: e.target.value })}
                  placeholder="e.g. Metro Construction & Co."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Currency Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Currency Symbol
                </label>
                <div className="flex flex-wrap gap-2">
                  {currencies.map((curr) => (
                    <button
                      key={curr}
                      onClick={() => updateSettings({ currencySymbol: curr })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
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

              {/* Sector Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Sector / Industry Template
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SECTOR_TEMPLATES.map((sector) => (
                    <button
                      key={sector.id}
                      onClick={() => updateSettings({ sectorPreset: sector.id })}
                      className={`p-2.5 rounded-xl text-left border transition ${
                        settings.sectorPreset === sector.id
                          ? 'bg-amber-950/40 border-amber-500 text-white'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div className="font-semibold text-xs text-white">{sector.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {sector.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Authentication & Tools Quick Access */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Access & Tools
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setShowSettingsModal(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold transition"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>User Login / Roles</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowSettingsModal(false);
                      setShowSplash(true);
                    }}
                    className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Splash Intro</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowSettingsModal(false);
                      setIsVoiceModalOpen(true);
                    }}
                    className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition"
                  >
                    <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Voice Assistant</span>
                  </button>
                </div>
              </div>

              {/* Data Backup & Restore */}
              <div className="pt-3 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Backup & Restore (Offline Storage)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleExport}
                    className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold transition"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Backup Data</span>
                  </button>

                  <label className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold cursor-pointer transition">
                    <Upload className="w-4 h-4 text-blue-400" />
                    <span>Restore Backup</span>
                    <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Reset / Sample Data */}
              <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
                <button
                  onClick={() => {
                    if (confirm('Load sample demonstration data? Any existing records will be refreshed.')) {
                      resetToSampleData();
                      setShowSettingsModal(false);
                    }
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reload Demonstration Data</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all data and start completely fresh? This cannot be undone unless you have a backup.')) {
                      clearAllData();
                      setShowSettingsModal(false);
                    }
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-red-950/30 hover:bg-red-900/40 text-red-400 border border-red-800/40 text-xs font-semibold transition"
                >
                  Clear All Data (Start Blank)
                </button>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help / Guide Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">WORKMATE Guide</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <div className="font-bold text-amber-400 text-sm mb-1">1. Workers ({t.workers})</div>
                Register your workforce with daily wage rates and overtime hourly rates. Add phone numbers and roles.
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <div className="font-bold text-emerald-400 text-sm mb-1">2. Attendance ({t.attendance})</div>
                Select any date and tap <b>{t.present}</b>, <b>{t.halfDay}</b>, or <b>{t.absent}</b>. Daily wage liability is calculated automatically.
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <div className="font-bold text-blue-400 text-sm mb-1">3. Wages ({t.wages})</div>
                View calculated wages for every worker. Log wage payouts when you hand out cash or bank transfers. Print individual payslips anytime.
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <div className="font-bold text-purple-400 text-sm mb-1">4. Budget & Expenses ({t.budget} & {t.expenses})</div>
                Set a monthly or project budget. WORKMATE automatically calculates remaining funds. <b>Expenses that exceed remaining budget are strictly prevented</b> to protect your cash flow.
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <div className="font-bold text-rose-400 text-sm mb-1">5. Persistent Offline Storage & Installation</div>
                All data is saved locally on your device. Install it as a PWA app on your phone, tablet, or laptop via the <b>Share / Install</b> button.
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
