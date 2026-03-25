import React, { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import { useTypewriter } from './hooks/useTypewriter';

// Components
import TerminalHeader from './components/UI/TerminalHeader';
import StatusCard from './components/UI/StatusCard';
import StageDisplay from './components/Game/StageDisplay';
import OptionList from './components/Game/OptionList';
import SystemLogs from './components/Game/SystemLogs';
import AdminPanel from './components/Admin/AdminPanel';

const App = () => {
  const {
    stages, setStages,
    currentStage,
    history,
    traitStats,
    stability,
    handleOptionClick, restartGame,
    saveStage, addStage, deleteStage
  } = useGameState();

  const { displayText, isTyping, skipTyping } = useTypewriter(currentStage?.description);
  
  // UI States
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);

  const isGlitched = stability < 40;
  const isCritical = stability < 15;

  // Admin Handlers
  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stages, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `story_v${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (Array.isArray(json)) {
          setStages(json);
          alert('Data loaded successfully.');
        }
      } catch (err) { alert('Invalid format.'); }
    };
    reader.readAsText(file);
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-emerald-500 font-mono p-4 md:p-8 flex flex-col items-center overflow-hidden selection:bg-emerald-500/30 ${isCritical ? 'animate-glitch-heavy' : isGlitched ? 'animate-glitch-light' : ''}`}>
      
      {/* Background Pulse Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
        <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${isCritical ? 'from-red-500' : 'from-emerald-500'} via-transparent to-transparent animate-pulse`} />
      </div>

      <TerminalHeader 
        stability={stability}
        isGlitched={isGlitched}
        isCritical={isCritical}
        onLogOpen={() => setIsLogOpen(true)}
        onAdminOpen={() => setIsAdminOpen(true)}
      />

      {/* Main Container */}
      <div className={`w-full max-w-2xl flex-1 flex flex-col justify-center bg-black/40 backdrop-blur-sm border rounded-3xl p-8 md:p-12 relative z-10 transition-all duration-500 ${isCritical ? 'border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.1)]' : 'border-emerald-900/30 shadow-[0_0_50px_rgba(16,185,129,0.02)]'}`}>
        <StageDisplay 
          stage={currentStage}
          displayText={displayText}
          isTyping={isTyping}
          isGlitched={isGlitched}
          onSkip={skipTyping}
        />

        <OptionList 
          options={currentStage?.options}
          isEnding={currentStage?.isEnding}
          traitStats={traitStats}
          isTyping={isTyping}
          onOptionClick={handleOptionClick}
          onRestart={restartGame}
        />
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-2xl mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 z-10">
        <StatusCard 
          label="Active_Traits" 
          value={Object.keys(traitStats).length > 0 ? Object.keys(traitStats).map(k => `${k}:${traitStats[k]}`).join(', ') : 'Initializing...'} 
          color="text-blue-400" 
        />
        <div className={`p-4 rounded-2xl border transition-all sm:col-span-2 flex flex-col justify-center ${isCritical ? 'bg-red-950/20 border-red-500/50' : 'bg-emerald-950/10 border-emerald-900/20'}`}>
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-[9px] uppercase font-bold opacity-40 tracking-widest text-emerald-500">Stability_Monitor</span>
            <span className={`text-[10px] font-black ${isCritical ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>{stability}%</span>
          </div>
          <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-1000 ${isCritical ? 'bg-red-500 shadow-[0_0_15px_red]' : 'bg-emerald-500 shadow-[0_0_15px_#10b981]'}`} style={{ width: `${stability}%` }} />
          </div>
        </div>
      </div>

      {/* Overlays */}
      {isLogOpen && <SystemLogs history={history} onClose={() => setIsLogOpen(false)} />}
      
      {isAdminOpen && (
        <AdminPanel 
          stages={stages}
          onSave={saveStage}
          onAdd={addStage}
          onDelete={deleteStage}
          onClose={() => setIsAdminOpen(false)}
          onImport={importData}
          onExport={exportData}
        />
      )}
    </div>
  );
};

export default App;
