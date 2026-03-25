import React from 'react';
import { Zap, ChevronRight } from 'lucide-react';

const StageDisplay = ({ stage, displayText, isTyping, isGlitched, onSkip }) => {
  return (
    <div className={`animate-in fade-in duration-1000 ${isGlitched ? 'glitch-text' : ''}`} onClick={onSkip}>
      <div className="flex items-center gap-3 mb-6 opacity-30">
        <div className="bg-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase text-emerald-400">Process_Active</div>
        <div className="h-px flex-1 bg-emerald-900/30" />
      </div>

      <h2 className={`text-xl md:text-3xl mb-6 font-black uppercase tracking-tighter leading-tight ${stage?.isEnding ? 'text-yellow-500' : 'text-emerald-400'}`}>
        {stage?.isEnding ? <Zap className="inline w-8 h-8 mr-3 mb-1" /> : <ChevronRight className="inline w-8 h-8 mr-1 mb-1" />}
        {stage?.title}
      </h2>
      
      <div className="min-h-[180px] md:min-h-[220px] overflow-visible cursor-pointer group">
        <p className="leading-relaxed text-emerald-100/90 text-lg md:text-xl font-serif italic border-l-4 border-emerald-900/30 pl-14 pr-4 whitespace-pre-wrap relative overflow-visible">
          <span className="inline-block pl-2">
            {displayText}
            {isTyping && <span className="inline-block w-2.5 h-6 bg-emerald-500 ml-2 animate-pulse align-middle" />}
          </span>
          {isTyping && (
            <span className="absolute -bottom-6 right-0 text-[8px] uppercase opacity-0 group-hover:opacity-40 transition-opacity">
              Click to skip
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default StageDisplay;
