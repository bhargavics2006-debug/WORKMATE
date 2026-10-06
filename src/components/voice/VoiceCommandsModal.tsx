import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  CheckCircle2,
  X,
  Play,
  ArrowRight,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { useWorkmate, AppTab } from '../../context/WorkmateContext';
import { getTodayDateString } from '../../utils/initialData';

interface VoiceCommandsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceCommandsModal: React.FC<VoiceCommandsModalProps> = ({ isOpen, onClose }) => {
  const {
    setActiveTab,
    workers,
    markAttendance,
    addExpense,
    settings,
  } = useWorkmate();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang =
        settings.language === 'te'
          ? 'te-IN'
          : settings.language === 'hi'
          ? 'hi-IN'
          : settings.language === 'ta'
          ? 'ta-IN'
          : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setFeedback(null);
      };

      recognition.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setTranscript(text);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setFeedback(`Microphone alert: ${event.error || 'Please speak clearly'}`);
      };

      recognitionRef.current = recognition;
    } catch {
      setIsSupported(false);
    }
  }, [settings.language]);

  if (!isOpen) return null;

  const toggleListening = () => {
    if (!isSupported) {
      setFeedback('Browser speech recognition not available. Tap any sample command below to execute!');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      setFeedback('Listening for site instruction...');
      try {
        recognitionRef.current?.start();
      } catch {
        recognitionRef.current?.stop();
        setTimeout(() => recognitionRef.current?.start(), 150);
      }
    }
  };

  const processCommand = (phrase: string) => {
    const lower = phrase.toLowerCase().trim();

    // 1. Navigation Commands
    if (lower.includes('workers') || lower.includes('worker') || lower.includes('కూలీలు') || lower.includes('మజ్దూర్')) {
      setActiveTab('workers');
      setFeedback('Navigated to Workers list');
      setTimeout(onClose, 900);
      return;
    }

    if (lower.includes('attendance') || lower.includes('హాజరు') || lower.includes('हाजिरी')) {
      setActiveTab('attendance');
      setFeedback('Navigated to Attendance tracker');
      setTimeout(onClose, 900);
      return;
    }

    if (lower.includes('budget') || lower.includes('బడ్జెట్') || lower.includes('बजट')) {
      setActiveTab('budget');
      setFeedback('Opened Budget overview');
      setTimeout(onClose, 900);
      return;
    }

    if (lower.includes('materials') || lower.includes('material') || lower.includes('సామగ్రి') || lower.includes('सामान')) {
      setActiveTab('materials');
      setFeedback('Opened Materials inventory');
      setTimeout(onClose, 900);
      return;
    }

    if (lower.includes('site progress') || lower.includes('progress') || lower.includes('పురోగతి')) {
      setActiveTab('site_progress');
      setFeedback('Opened Site Progress');
      setTimeout(onClose, 900);
      return;
    }

    if (lower.includes('report') || lower.includes('daily report') || lower.includes('నివేదిక')) {
      setActiveTab('daily_report');
      setFeedback('Opened Daily Site Report');
      setTimeout(onClose, 900);
      return;
    }

    // 2. Mark attendance command: "Ravi present mark cheyyi" / "Carlos present"
    if (lower.includes('present') || lower.includes('మార్క్') || lower.includes('mark')) {
      const targetWorker = workers.find(
        w => lower.includes(w.name.toLowerCase().split(' ')[0]) || lower.includes(w.name.toLowerCase())
      ) || workers[0];

      if (targetWorker) {
        markAttendance(targetWorker.id, getTodayDateString(), 'present', 0, 'Marked via Voice Assistant');
        setFeedback(`✓ Marked ${targetWorker.name} as PRESENT today!`);
        setTimeout(onClose, 1200);
        return;
      }
    }

    // 3. Add expense command: "Cement 5000 expense add cheyyi"
    if (lower.includes('expense') || lower.includes('ఖర్చు') || lower.includes('add') || lower.includes('cement')) {
      const amounts = phrase.match(/\d+/g);
      const amount = amounts ? Number(amounts[0]) : 500;
      addExpense({
        title: lower.includes('cement') ? 'Cement Bags Purchase (Voice)' : 'Material & Operational Expense (Voice)',
        amount,
        category: lower.includes('cement') ? 'Cement' : 'Materials & Supplies',
        date: getTodayDateString(),
        paymentMethod: 'Cash',
        notes: `Recorded via WORKMATE Voice Command: "${phrase}"`,
      });
      setFeedback(`✓ Recorded ${settings.currencySymbol}${amount} expense for Cement / Materials!`);
      setTimeout(onClose, 1200);
      return;
    }

    setFeedback(`Executed: "${phrase}". Tab ready.`);
    setTimeout(onClose, 1000);
  };

  const sampleCommands = [
    { label: 'Ravi present mark cheyyi', desc: 'Mark worker attendance in Telugu/English', action: 'Carlos present mark cheyyi' },
    { label: 'Cement 5000 expense add cheyyi', desc: 'Record construction supply expense', action: 'Cement 5000 expense add cheyyi' },
    { label: 'Open workers', desc: 'Navigate to workforce directory', action: 'Open workers' },
    { label: 'Open attendance', desc: 'Open daily attendance ledger', action: 'Open attendance' },
    { label: 'Show budget', desc: 'Inspect financial health & limits', action: 'Show budget' },
    { label: 'Open materials', desc: 'Inspect inventory stock levels', action: 'Open materials' },
    { label: 'Site progress', desc: 'Review daily milestone deliverables', action: 'Site progress' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 text-slate-100 shadow-2xl relative space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center space-x-2">
            <span className="p-2 rounded-2xl bg-blue-600/30 text-blue-400 border border-blue-500/30">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </span>
            <h3 className="text-lg font-black text-white">WORKMATE Voice Command</h3>
          </div>
          <p className="text-xs text-blue-200/80">
            Natural speech control for hands-free on-site operations
          </p>
        </div>

        {/* Central Mic Button */}
        <div className="flex flex-col items-center justify-center py-4 space-y-3">
          <div className="relative">
            {isListening && (
              <span className="absolute -inset-3 rounded-full bg-blue-500/30 animate-ping" />
            )}
            <button
              onClick={toggleListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition transform active:scale-95 ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse shadow-red-600/50'
                  : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/40 hover:scale-105'
              }`}
              title={isListening ? 'Stop listening' : 'Start speaking'}
            >
              {isListening ? (
                <Mic className="w-8 h-8 stroke-[2.5]" />
              ) : (
                <Mic className="w-8 h-8 stroke-[2.2]" />
              )}
            </button>
          </div>

          <span className="text-xs font-bold text-slate-300">
            {isListening ? 'Listening... Speak now' : 'Tap Microphone to Speak'}
          </span>

          {transcript && (
            <div className="p-3 bg-slate-850 rounded-2xl border border-slate-700 text-center max-w-sm w-full">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Heard Transcript</span>
              <p className="text-xs font-black text-white mt-0.5">"{transcript}"</p>
              <button
                onClick={() => processCommand(transcript)}
                className="mt-2 px-3 py-1 rounded-xl bg-blue-600 text-white font-bold text-[11px]"
              >
                Execute Heard Command
              </button>
            </div>
          )}

          {feedback && (
            <div className="p-2.5 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center gap-1.5 text-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}
        </div>

        {/* Fallback & Supported notice */}
        {!isSupported && (
          <div className="p-2.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Speech recognition is not active in this browser. You can click any sample command below to execute instantly!</span>
          </div>
        )}

        {/* 1-Tap Sample Commands */}
        <div className="space-y-2">
          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">
            Click-to-Execute Voice Presets:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {sampleCommands.map((cmd, i) => (
              <button
                key={i}
                onClick={() => processCommand(cmd.action)}
                className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 hover:border-blue-500 text-left transition space-y-0.5 group"
              >
                <div className="font-extrabold text-blue-300 group-hover:text-white flex items-center justify-between">
                  <span>"{cmd.label}"</span>
                  <Play className="w-3 h-3 text-slate-500 group-hover:text-blue-400" />
                </div>
                <p className="text-[10px] text-slate-400">{cmd.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
