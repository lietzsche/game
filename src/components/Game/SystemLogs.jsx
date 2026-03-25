import React, { useRef, useEffect } from 'react';
import { History as HistoryIcon, ArrowLeft, Database } from 'lucide-react';

const SystemLogs = ({ history, onClose }) => {
  const logScrollRef = useRef(null);

  useEffect(() => {
    if (logScrollRef.current) {
      logScrollRef.current.scrollTop = logScrollRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-md p-4 md:p-8 flex flex-col items-center animate-in slide-in-from-bottom-8 duration-500">
      <div className="w-full max-w-2xl h-full flex flex-col bg-black border border-emerald-500/20 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-emerald-900/50 flex justify-between items-center bg-emerald-950/20 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <HistoryIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0" />
            <h3 className="font-black text-sm sm:text-lg tracking-widest text-emerald-400 uppercase truncate">System_Logs</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-emerald-500/10 rounded-xl transition-all text-emerald-700 flex items-center gap-1 sm:gap-2 border border-emerald-900/50 shrink-0">
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="text-[10px] sm:text-xs font-bold uppercase">Back</span>
          </button>
        </div>
        <div ref={logScrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-black/40">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
              <Database className="w-12 h-12" />
              <p className="text-sm font-bold uppercase tracking-[0.3em]">No logs recorded yet</p>
            </div>
          ) : (
            history.map((h, i) => (
              <div key={i} className="animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-bold text-emerald-900 bg-emerald-500/10 px-2 py-0.5 rounded tracking-tighter">{h.timestamp}</span>
                  <div className="h-px flex-1 bg-emerald-900/20" />
                </div>
                <div className="pl-4 border-l-2 border-emerald-900/30">
                  <div className="text-xs font-black text-emerald-700 uppercase mb-1 tracking-widest">{h.stageTitle}</div>
                  <div className="text-blue-400 font-bold italic text-sm">{' > '}{h.actionText}</div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 bg-emerald-950/10 border-t border-emerald-900/30 text-center">
          <p className="text-[9px] uppercase font-bold opacity-30 tracking-[0.2em]">End of encrypted records</p>
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;
