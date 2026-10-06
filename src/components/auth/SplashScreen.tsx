import React, { useEffect, useState } from 'react';
import { ShieldCheck, HardHat, Sparkles, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onDismiss: () => void;
  appName?: string;
  tagline?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onDismiss,
  appName = 'WORKMATE',
  tagline = 'Smarter Sites. Stronger Teams. Better Tomorrow.',
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onDismiss, 200);
          return 100;
        }
        return prev + 25;
      });
    }, 180);

    return () => clearInterval(timer);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 flex flex-col items-center justify-between p-6 text-white select-none">
      <div className="w-full flex justify-end pt-2">
        <button
          onClick={onDismiss}
          className="text-xs text-blue-200/80 hover:text-white bg-blue-800/40 hover:bg-blue-700/60 px-3 py-1.5 rounded-full border border-blue-500/30 transition flex items-center space-x-1"
        >
          <span>Skip</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="flex flex-col items-center text-center max-w-sm space-y-4 my-auto">
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-500 flex items-center justify-center shadow-2xl shadow-blue-500/40 border border-blue-400/40">
            <HardHat className="w-10 h-10 sm:w-12 sm:h-12 text-white stroke-[2.2]" />
          </div>
          <span className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-emerald-500 text-white shadow-md">
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
          </span>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>{appName}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Smart
            </span>
          </h1>
          <p className="text-xs sm:text-sm font-medium text-blue-200/90 leading-snug">
            {tagline}
          </p>
        </div>

        <div className="flex items-center space-x-1.5 text-[11px] text-blue-300/80 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-800/50">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Workforce • Materials • Budget • Site Ops</span>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-2 pb-6 text-center">
        <div className="w-full h-1.5 bg-blue-950/80 rounded-full overflow-hidden border border-blue-800/40">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[11px] text-blue-300/70 font-medium">Initializing smart site tools...</p>
      </div>
    </div>
  );
};
