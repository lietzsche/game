import React from 'react';
import { ChevronRight, Lock } from 'lucide-react';

const OptionList = ({ options, isEnding, traitStats, isTyping, onOptionClick, onRestart }) => {
  if (isEnding) {
    return (
      <div className="text-center pt-8 border-t border-emerald-900/30">
        <button onClick={onRestart} className="px-12 py-5 bg-emerald-600 text-slate-950 rounded-full hover:bg-emerald-400 transition-all font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95">REBOOT_SYSTEM</button>
      </div>
    );
  }

  return (
    <div className={`mt-12 transition-all duration-700 ${isTyping ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0'}`}>
      <div className="grid gap-4">
        {options?.map((opt, idx) => {
          const isLocked = opt.requirement && (traitStats[opt.requirement.trait] || 0) < opt.requirement.min;
          return (
            <button
              key={idx}
              disabled={isLocked}
              onClick={() => onOptionClick(opt)}
              className={`w-full text-left p-5 border transition-all rounded-2xl flex items-center gap-5 group relative overflow-hidden ${isLocked ? 'opacity-30 border-slate-800 bg-slate-900/20 cursor-not-allowed' : 'border-emerald-800/20 bg-emerald-900/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 active:scale-[0.98]'}`}
            >
              {isLocked ? <Lock className="w-5 h-5 text-slate-600" /> : <div className="w-2 h-2 rounded-full bg-emerald-900 group-hover:bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
              <span className={`flex-1 text-base font-bold tracking-tight ${isLocked ? 'text-slate-600' : 'text-emerald-400/80 group-hover:text-emerald-300'}`}>
                {opt.text}
              </span>
              {!isLocked && <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OptionList;
