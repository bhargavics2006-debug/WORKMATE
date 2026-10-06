import React, { useState } from 'react';
import {
  Share2,
  Download,
  Copy,
  Check,
  Smartphone,
  Laptop,
  Apple,
  QrCode,
  ExternalLink,
  X,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { getTranslation } from '../../utils/translations';

interface ShareInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
}

export const ShareInstallModal: React.FC<ShareInstallModalProps> = ({ isOpen, onClose, language }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  const t = getTranslation(language);
  const appUrl =
    typeof window !== 'undefined'
      ? window.location.href.split('?')[0].split('#')[0]
      : 'https://ais-pre-lolw3yo7jxchjmqiz7uu7e-646723047784.asia-southeast1.run.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'WORKMATE - Worker & Budget Management',
          text: 'Manage workers, track daily attendance, calculate wages, and control expenses with WORKMATE.',
          url: appUrl,
        });
      } catch (err) {
        // Fallback to copy link if share was cancelled or failed
      }
    } else {
      handleCopyLink();
    }
  };

  // Generate QR Code URL via public SVG API for instant scanning
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    appUrl
  )}&bgcolor=0F172A&color=F59E0B&margin=1`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 text-slate-100 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">{t.shareTitle}</h3>
              <p className="text-[11px] text-slate-400">Open on laptop, phone or share with your team</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          {/* Quick Copy & Share Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Application Web Link
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="flex-1 bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs font-mono truncate focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shrink-0 ${
                  copied
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                }`}
              >
                {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? t.copied : t.copyLink}</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleWebShare}
                className="text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share via WhatsApp / Email / SMS</span>
              </button>

              <button
                onClick={() => setShowQR(!showQR)}
                className="text-slate-400 hover:text-white font-medium flex items-center space-x-1"
              >
                <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>{showQR ? 'Hide QR' : 'Show QR Code'}</span>
              </button>
            </div>
          </div>

          {/* QR Code Card if toggled */}
          {showQR && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <div className="text-slate-300 font-bold">Scan to Open on Mobile Phone</div>
              <p className="text-[11px] text-slate-500">
                Point your phone camera at the code below to open WORKMATE instantly.
              </p>
              <div className="flex justify-center py-2">
                <img
                  src={qrCodeUrl}
                  alt="WORKMATE QR Code"
                  className="w-44 h-44 rounded-xl border-2 border-amber-500/40 p-1 bg-slate-900"
                />
              </div>
            </div>
          )}

          {/* Direct Install PWA Action */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-850 to-slate-900 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Download className="w-5 h-5 text-amber-400" />
                <span className="font-extrabold text-white text-sm">Download / Install WORKMATE</span>
              </div>
              {isInstalled && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Installed
                </span>
              )}
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed">
              Install WORKMATE as a standalone app on your desktop, laptop, or phone. It opens with its own icon, works offline, and needs no app store download!
            </p>

            {isInstallable && !isInstalled && (
              <button
                onClick={install}
                className="w-full mt-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4 stroke-[3]" />
                <span>Install WORKMATE App Now</span>
              </button>
            )}
          </div>

          {/* Step-by-Step Instructions by Device */}
          <div className="space-y-2.5 pt-1">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              How to Install on Each Device:
            </h4>

            {/* 1. Laptop / Desktop */}
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-start space-x-3">
              <Laptop className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white text-xs">On Laptop / PC (Chrome, Edge, Brave):</div>
                <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                  Look at the top-right of your browser's address bar. Click the <b>Install App</b> icon (screen with down arrow) or click the 3 dots (⋮) ➔ <b>"Save and share" / "Install WORKMATE"</b>.
                </p>
              </div>
            </div>

            {/* 2. Android Phone */}
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-start space-x-3">
              <Smartphone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white text-xs">On Android Phone:</div>
                <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                  Open the link in Chrome. Tap the 3 dots (⋮) in the top-right corner, then tap <b>"Install app"</b> or <b>"Add to Home screen"</b>.
                </p>
              </div>
            </div>

            {/* 3. iPhone / iPad */}
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-start space-x-3">
              <Apple className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white text-xs">On iPhone / iPad (Safari):</div>
                <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                  Open the link in <b>Safari</b>. Tap the <b>Share button</b> (square with an arrow pointing up), scroll down and tap <b>"Add to Home Screen"</b>, then tap <b>Add</b>.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3.5 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
