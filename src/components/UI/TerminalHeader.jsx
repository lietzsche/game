import React from 'react';
import { Terminal, History as HistoryIcon, Settings } from 'lucide-react';

const TerminalHeader = ({ stability, isGlitched, isCritical, onLogOpen, onAdminOpen }) => {
  return (
    <div className="w-full max-w-2xl mb-6 flex items-center justify-between border-b border-emerald-900 pb-4 z-10 relative gap-2">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Terminal className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${isGlitched ? 'text-red-500' : 'animate-pulse'}`} />
        <div className="min-w-0">
          <h1 className="text-sm sm:text-xl font-black tracking-tighter truncate">PSYCHOANALYTIC_AI_DEBUGGER</h1>
          <div className="flex items-center gap-2 opacity-40 text-[8px] sm:text-[10px] uppercase font-bold">
            <span className="truncate">{isCritical ? 'EXISTENTIAL_DREAD' : isGlitched ? 'IDENTITY_CRISIS' : 'SYSTEM_STABLE'}</span>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${stability > 70 ? 'bg-emerald-500' : stability > 30 ? 'bg-yellow-500' : 'bg-red-500 animate-ping'}`} />
          </div>
        </div>
      </div>
      <div className="flex gap-1 sm:gap-2 shrink-0">
        <button 
          onClick={onLogOpen}
          className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 hover:bg-emerald-500/10 rounded-lg transition-all text-emerald-600 border border-emerald-900/20 sm:border-transparent"
          title="시스템 로그 보기"
        >
          <HistoryIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[8px] sm:text-[10px] font-bold tracking-widest uppercase">Logs</span>
        </button>
        <button onClick={onAdminOpen} className="p-2 hover:bg-emerald-500/10 rounded-lg transition-all text-emerald-800 flex items-center justify-center border border-emerald-900/20 sm:border-transparent">
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};

export default TerminalHeader;
