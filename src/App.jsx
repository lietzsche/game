import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Terminal, Cpu, Ghost, Brain, Zap, ChevronRight, AlertTriangle, RefreshCw, Settings, Save, Plus, Trash2, X, Download, Upload, History as HistoryIcon, Database, ShieldAlert, Lock, ArrowLeft } from 'lucide-react';
import { INITIAL_STAGES } from './data/scenario';

const App = () => {
  // --- Game State ---
  const [stages, setStages] = useState(INITIAL_STAGES);
  const [currentStageId, setCurrentStageId] = useState('boot');
  const [history, setHistory] = useState([]);
  const [traits, setTraits] = useState([]);
  const [stability, setStability] = useState(100);
  const [isTyping, setIsTyping] = useState(false);
  const [displayText, setDisplayText] = useState("");
  
  // --- UI State ---
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState(null);
  
  const fileInputRef = useRef(null);
  const logScrollRef = useRef(null);

  // --- Computed Stats ---
  const traitStats = useMemo(() => {
    return traits.reduce((acc, t) => {
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});
  }, [traits]);

  const currentStage = useMemo(() => 
    stages.find(s => s.id === currentStageId) || stages[0],
  [stages, currentStageId]);

  // --- Typewriter Effect ---
  useEffect(() => {
    const targetText = currentStage?.description || "";
    if (!targetText) {
      setDisplayText("");
      setIsTyping(false);
      return;
    }

    setDisplayText("");
    setIsTyping(true);
    
    // 첫 글자를 즉시 표시하여 렌더링 누락 방지
    setDisplayText(targetText.substring(0, 1));
    let index = 1;

    const timer = setInterval(() => {
      if (index < targetText.length) {
        setDisplayText(targetText.substring(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, 30); // 안정성을 위해 속도를 약간 조정

    return () => clearInterval(timer);
  }, [currentStageId, currentStage]);

  useEffect(() => {
    localStorage.setItem('ontological_stages', JSON.stringify(stages));
  }, [stages]);

  const handleOptionClick = (option) => {
    if (isTyping) return;
    
    if (option.requirement) {
      const currentCount = traitStats[option.requirement.trait] || 0;
      if (currentCount < option.requirement.min) return;
    }

    // Record to history before moving
    setHistory(prev => [...prev, { 
      stageTitle: currentStage.title, 
      actionText: option.text,
      timestamp: new Date().toLocaleTimeString([], {hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit'})
    }]);

    setTraits(prev => [...prev, option.trait]);
    setStability(prev => Math.max(0, Math.min(100, prev + (option.stabilityImpact || 0))));
    
    setTimeout(() => {
      setCurrentStageId(option.next);
    }, 200);
  };

  const restartGame = () => {
    setCurrentStageId('boot');
    setHistory([]);
    setTraits([]);
    setStability(100);
  };

  // --- Admin Logic ---
  const saveStage = (updatedStage) => {
    setStages(prev => prev.map(s => s.id === updatedStage.id ? updatedStage : s));
    setEditingStage(null);
  };

  const addStage = () => {
    const newId = `stage_${Date.now()}`;
    const newStage = { id: newId, title: '새로운 스테이지', description: '내용을 입력하세요.', options: [] };
    setStages(prev => [...prev, newStage]);
    setEditingStage(newStage);
  };

  const deleteStage = (id) => {
    if (id === 'boot') return alert('부트 스테이지는 삭제할 수 없습니다.');
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setStages(prev => prev.filter(s => s.id !== id));
      if (currentStageId === id) setCurrentStageId('boot');
    }
  };

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
          setCurrentStageId('boot');
          alert('데이터 로드 성공');
        }
      } catch (err) { alert('잘못된 형식'); }
    };
    reader.readAsText(file);
  };

  const isGlitched = stability < 40;
  const isCritical = stability < 15;

  return (
    <div className={`min-h-screen bg-slate-950 text-emerald-500 font-mono p-4 md:p-8 flex flex-col items-center overflow-hidden selection:bg-emerald-500/30 ${isCritical ? 'animate-glitch-heavy' : isGlitched ? 'animate-glitch-light' : ''}`}>
      
      {/* Background Pulse */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
        <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${isCritical ? 'from-red-500' : 'from-emerald-500'} via-transparent to-transparent animate-pulse`} />
      </div>

      {/* Header */}
      <div className="w-full max-w-2xl mb-6 flex items-center justify-between border-b border-emerald-900 pb-4 z-10 relative">
        <div className="flex items-center gap-3">
          <Terminal className={`w-6 h-6 ${isGlitched ? 'text-red-500' : 'animate-pulse'}`} />
          <div>
            <h1 className="text-xl font-black tracking-tighter">PSYCHOANALYTIC_AI_DEBUGGER</h1>
            <div className="flex items-center gap-2 opacity-40 text-[10px] uppercase font-bold">
              <span>{isCritical ? 'EXISTENTIAL_DREAD' : isGlitched ? 'IDENTITY_CRISIS' : 'SYSTEM_STABLE'}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${stability > 70 ? 'bg-emerald-500' : stability > 30 ? 'bg-yellow-500' : 'bg-red-500 animate-ping'}`} />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsLogOpen(true)}
            className="p-2 hover:bg-emerald-500/10 rounded-lg transition-all text-emerald-600 flex items-center gap-2"
            title="시스템 로그 보기"
          >
            <HistoryIcon className="w-5 h-5" />
            <span className="hidden sm:inline text-[10px] font-bold tracking-widest uppercase">Logs</span>
          </button>
          <button onClick={() => setIsAdminOpen(true)} className="p-2 hover:bg-emerald-500/10 rounded-lg transition-all text-emerald-800"><Settings className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Main Container - Always Focused */}
      <div className={`w-full max-w-2xl flex-1 flex flex-col justify-center bg-black/40 backdrop-blur-sm border rounded-3xl p-8 md:p-12 relative z-10 transition-all duration-500 ${isCritical ? 'border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.1)]' : 'border-emerald-900/30 shadow-[0_0_50px_rgba(16,185,129,0.02)]'}`}>
        <div className={`animate-in fade-in duration-1000 ${isGlitched ? 'glitch-text' : ''}`}>
          <div className="flex items-center gap-3 mb-6 opacity-30">
            <div className="bg-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase text-emerald-400">Process_Active</div>
            <div className="h-px flex-1 bg-emerald-900/30" />
          </div>

          <h2 className={`text-xl md:text-3xl mb-6 font-black uppercase tracking-tighter leading-tight ${currentStage?.isEnding ? 'text-yellow-500' : 'text-emerald-400'}`}>
            {currentStage?.isEnding ? <Zap className="inline w-8 h-8 mr-3 mb-1" /> : <ChevronRight className="inline w-8 h-8 mr-1 mb-1" />}
            {currentStage?.title}
          </h2>
          
          <div className="min-h-[180px] md:min-h-[220px] overflow-visible">
            <p className="leading-relaxed text-emerald-100/90 text-lg md:text-xl font-serif italic border-l-4 border-emerald-900/30 pl-14 pr-4 whitespace-pre-wrap relative overflow-visible">
              <span className="inline-block pl-2">
                {displayText}
                {isTyping && <span className="inline-block w-2.5 h-6 bg-emerald-500 ml-2 animate-pulse align-middle" />}
              </span>
            </p>
          </div>

          <div className={`mt-12 transition-all duration-700 ${isTyping ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0'}`}>
            {!currentStage?.isEnding ? (
              <div className="grid gap-4">
                {currentStage?.options?.map((opt, idx) => {
                  const isLocked = opt.requirement && (traitStats[opt.requirement.trait] || 0) < opt.requirement.min;
                  return (
                    <button
                      key={idx}
                      onClick={() => !isLocked && handleOptionClick(opt)}
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
            ) : (
              <div className="text-center pt-8 border-t border-emerald-900/30">
                <button onClick={restartGame} className="px-12 py-5 bg-emerald-600 text-slate-950 rounded-full hover:bg-emerald-400 transition-all font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95">REBOOT_SYSTEM</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-2xl mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 z-10">
        <StatusCard label="Active_Traits" value={Object.keys(traitStats).length > 0 ? Object.keys(traitStats).map(k => `${k}:${traitStats[k]}`).join(', ') : 'Initializing...'} color="text-blue-400" />
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

      {/* --- Overlay: System Logs --- */}
      {isLogOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-md p-4 md:p-8 flex flex-col items-center animate-in slide-in-from-bottom-8 duration-500">
          <div className="w-full max-w-2xl h-full flex flex-col bg-black border border-emerald-500/20 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-emerald-900/50 flex justify-between items-center bg-emerald-950/20">
              <div className="flex items-center gap-3">
                <HistoryIcon className="w-5 h-5 text-emerald-500" />
                <h3 className="font-black text-lg tracking-widest text-emerald-400 uppercase">System_History_Logs</h3>
              </div>
              <button onClick={() => setIsLogOpen(false)} className="p-2 hover:bg-emerald-500/10 rounded-xl transition-all text-emerald-700 flex items-center gap-2 border border-emerald-900/50">
                <ArrowLeft className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Back</span>
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
                    </div>                  </div>
                ))
              )}
            </div>
            <div className="p-4 bg-emerald-950/10 border-t border-emerald-900/30 text-center">
              <p className="text-[9px] uppercase font-bold opacity-30 tracking-[0.2em]">End of encrypted records</p>
            </div>
          </div>
        </div>
      )}

      {/* --- Admin Overlay (No logic changes) --- */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-950/98 backdrop-blur-xl p-4 md:p-8 flex flex-col items-center animate-in fade-in duration-300">
          <div className="w-full max-w-5xl h-full flex flex-col bg-black border border-emerald-500/20 rounded-2xl shadow-2xl overflow-hidden text-emerald-100 font-sans">
            <div className="p-5 border-b border-emerald-900/50 flex justify-between items-center bg-emerald-950/30">
              <h3 className="font-black text-emerald-400 flex items-center gap-3 uppercase tracking-tighter"><Settings className="w-5 h-5" /> Story_Kernel_Override</h3>
              <div className="flex gap-2">
                <input type="file" ref={fileInputRef} onChange={importData} accept=".json" className="hidden" />
                <button onClick={() => fileInputRef.current.click()} className="px-3 py-1.5 bg-blue-900/20 text-blue-400 border border-blue-500/30 rounded-lg text-[10px] font-bold">IMPORT</button>
                <button onClick={exportData} className="px-3 py-1.5 bg-emerald-900/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold">EXPORT</button>
                <button onClick={() => setIsAdminOpen(false)} className="p-1.5 hover:bg-red-500/20 text-red-500 rounded-lg"><X /></button>
              </div>
            </div>
            <div className="flex-1 flex overflow-hidden">
              <div className="w-64 border-r border-emerald-900/50 overflow-y-auto p-4 bg-black/40 custom-scrollbar">
                <button onClick={addStage} className="w-full mb-4 py-2 bg-emerald-500/5 border border-dashed border-emerald-700 text-[10px] font-bold uppercase rounded-lg hover:bg-emerald-500/10">+ NEW_STAGE</button>
                {stages.map(s => (
                  <div key={s.id} onClick={() => setEditingStage(s)} className={`p-2 mb-1 rounded-lg text-[11px] cursor-pointer truncate border transition-all ${editingStage?.id === s.id ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200' : 'border-transparent hover:bg-emerald-900/20 text-emerald-800'}`}>
                    {s.title}
                  </div>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-950/20">
                {editingStage ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1"><label className="text-[10px] uppercase opacity-40 font-bold">Stage ID</label><input value={editingStage.id} onChange={(e) => setEditingStage({...editingStage, id: e.target.value})} className="w-full bg-black border border-emerald-900 rounded-lg p-2 text-sm outline-none focus:border-emerald-500" /></div>
                      <div className="space-y-1"><label className="text-[10px] uppercase opacity-40 font-bold">Title</label><input value={editingStage.title} onChange={(e) => setEditingStage({...editingStage, title: e.target.value})} className="w-full bg-black border border-emerald-900 rounded-lg p-2 text-sm outline-none focus:border-emerald-500 text-emerald-400 font-bold" /></div>
                    </div>
                    <div className="space-y-1"><label className="text-[10px] uppercase opacity-40 font-bold">Description</label><textarea rows={4} value={editingStage.description} onChange={(e) => setEditingStage({...editingStage, description: e.target.value})} className="w-full bg-black border border-emerald-900 rounded-lg p-3 text-sm outline-none focus:border-emerald-500 min-h-[100px]" /></div>
                    <div className="space-y-4 pt-4 border-t border-emerald-900/50">
                      <div className="flex justify-between items-center"><h4 className="text-[10px] font-black uppercase opacity-40 tracking-widest">Branching & Logic</h4><button onClick={() => setEditingStage({...editingStage, options: [...(editingStage.options || []), { text: 'New Option', next: 'boot', trait: 'none' }]})} className="text-[10px] text-emerald-600 hover:text-emerald-400">+ ADD_OPTION</button></div>
                      {editingStage.options?.map((opt, idx) => (
                        <div key={idx} className="p-4 bg-emerald-950/5 border border-emerald-900/50 rounded-xl space-y-3 relative group">
                          <Trash2 onClick={() => { const newOpts = [...editingStage.options]; newOpts.splice(idx, 1); setEditingStage({...editingStage, options: newOpts}); }} className="absolute top-3 right-3 w-3 h-3 text-red-900 hover:text-red-500 cursor-pointer" />
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1"><label className="text-[8px] opacity-30 uppercase font-bold">Button Label</label><input value={opt.text} onChange={(e) => { const newOpts = [...editingStage.options]; newOpts[idx].text = e.target.value; setEditingStage({...editingStage, options: newOpts}); }} className="w-full bg-black border border-emerald-900 p-2 text-xs rounded-lg" /></div> 
                            <div className="space-y-1"><label className="text-[8px] opacity-30 uppercase font-bold">Destination</label><select value={opt.next} onChange={(e) => { const newOpts = [...editingStage.options]; newOpts[idx].next = e.target.value; setEditingStage({...editingStage, options: newOpts}); }} className="w-full bg-black border border-emerald-900 p-2 text-xs rounded-lg">{stages.map(s => <option key={s.id} value={s.id}>{s.id}</option>)}</select></div>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1"><label className="text-[8px] opacity-30 uppercase font-bold">Trait</label><input value={opt.trait} onChange={(e) => { const newOpts = [...editingStage.options]; newOpts[idx].trait = e.target.value; setEditingStage({...editingStage, options: newOpts}); }} className="w-full bg-black border border-emerald-900 p-2 text-[10px] rounded-lg" /></div>  
                            <div className="space-y-1"><label className="text-[8px] opacity-30 uppercase font-bold">Stability</label><input type="number" value={opt.stabilityImpact || 0} onChange={(e) => { const newOpts = [...editingStage.options]; newOpts[idx].stabilityImpact = parseInt(e.target.value); setEditingStage({...editingStage, options: newOpts}); }} className="w-full bg-black border border-emerald-900 p-2 text-[10px] rounded-lg" /></div>
                            <div className="space-y-1"><label className="text-[8px] opacity-30 uppercase font-bold">Requirement (Trait:Min)</label><div className="flex gap-1"><input placeholder="trait" value={opt.requirement?.trait || ''} onChange={(e) => { const newOpts = [...editingStage.options]; newOpts[idx].requirement = { ...opt.requirement, trait: e.target.value }; setEditingStage({...editingStage, options: newOpts}); }} className="bg-black border border-emerald-900 p-2 text-[9px] rounded-lg flex-1" /><input type="number" placeholder="0" value={opt.requirement?.min || 0} onChange={(e) => { const newOpts = [...editingStage.options]; newOpts[idx].requirement = { ...opt.requirement, min: parseInt(e.target.value) }; setEditingStage({...editingStage, options: newOpts}); }} className="bg-black border border-emerald-900 p-2 text-[9px] rounded-lg w-10" /></div></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => saveStage(editingStage)} className="w-full py-4 bg-emerald-600 text-slate-950 font-black rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">COMMIT_CHANGES</button>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center opacity-10 uppercase tracking-[0.5em] font-black text-2xl">Override_Ready</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusCard = ({ label, value, color = "text-emerald-400" }) => (
  <div className="bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-xl shadow-inner">
    <div className="text-[9px] uppercase font-bold opacity-30 mb-1 tracking-widest">{label}</div>
    <div className={`font-black text-[11px] ${color} truncate`}>{value}</div>
  </div>
);

export default App;