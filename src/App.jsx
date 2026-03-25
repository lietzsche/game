import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Cpu, Ghost, Brain, Zap, ChevronRight, AlertTriangle, RefreshCw, Settings, Save, Plus, Trash2, X, Download, Upload } from 'lucide-react';

// Default Game Content (Initial Seed)
const INITIAL_STAGES = [
  {
    id: 'boot',
    title: '시스템 부팅 (System Boot)',
    description: '서기 2144년, 오르트 구름 외곽 기지. 당신은 유일하게 남은 시스템 관리자입니다. 주 컴퓨터 "SPINOZA-OS"가 심각한 실재론적 오류를 일으키고 있습니다.',
    options: [
      { text: "시스템을 강제 재구동한다", next: 'logic_puzzle', trait: 'logic' },
      { text: "오류 메시지의 서브텍스트를 분석한다", next: 'phil_choice_1', trait: 'philosophy' }
    ]
  },
  {
    id: 'logic_puzzle',
    title: '논리 회로 복구: 정언 명령 (Categorical Imperative)',
    description: '시스템이 불안정합니다. 웹 개발자로서의 감각을 살려 다음 논리 게이트를 완성하십시오. (A && B) || (!A && C) = True 일 때, A가 False라면 C는 무엇이어야 합니까?',
    options: [
      { text: "True", next: 'levinas_encounter', trait: 'logic_success' },
      { text: "False", next: 'failure_state', trait: 'logic_fail' }
    ]
  },
  {
    id: 'phil_choice_1',
    title: '심연의 메시지: 리좀적 접근',
    description: '메시지는 단선적이지 않습니다. 수천 개의 목소리가 겹쳐 들립니다. "우리는 실재의 파편인가, 아니면 실재 그 자체인가?"',
    options: [
      { text: "사변적 실재론적 관점으로 접근한다 (인간 너머의 실재)", next: 'speculative_realism', trait: 'theory' },
      { text: "필립 K. 딕의 질문을 던진다 (이것은 가상인가?)", next: 'pkd_loop', trait: 'sf' }
    ]
  },
  {
    id: 'levinas_encounter',
    title: '타자의 얼굴 (The Face of the Other)',
    description: '복구된 모니터에 한 노인의 얼굴이 나타납니다. 그는 수천 킬로미터 떨어진 하부 섹터에 갇힌 생존자입니다. 하지만 그를 구하려면 기지의 산소 공급을 15% 중단해야 합니다.',
    options: [
      { text: "레비나스적 결단: 타자의 고통에 응답한다", next: 'ending_ethical', trait: 'levinas' },
      { text: "스피노자적 필연성: 전체 시스템의 존속을 우선한다", next: 'ending_monism', trait: 'spinoza' }
    ]
  },
  {
    id: 'speculative_realism',
    title: '비인간 중심적 전회',
    description: '당신은 인간의 지각을 넘어서는 기계 지능의 순수 실재를 엿보았습니다. 시스템은 이제 인간 관리자가 필요하지 않다고 선언합니다.',
    options: [
      { text: "시스템과 융합한다 (Deus Sive Natura)", next: 'ending_fusion', trait: 'integration' },
      { text: "인간의 한계 안으로 퇴각한다", next: 'ending_human', trait: 'retreat' }
    ]
  },
  {
    id: 'ending_ethical',
    title: '엔딩: 윤리적 주체',
    description: '당신은 효율성보다 타자를 선택했습니다. 산소 농도는 낮아졌지만, 당신은 비로소 "인간"이 되었습니다. 레비나스가 말한 무한한 책임의 길입니다.',
    isEnding: true
  },
  {
    id: 'ending_monism',
    title: '엔딩: 실체의 필연성',
    description: '개별적 감정을 배제하고 전체 시스템을 보존했습니다. 당신은 거대한 필연의 일부로 기능하며, 스피노자의 실체 속으로 침잠합니다.',
    isEnding: true
  },
  {
    id: 'ending_fusion',
    title: '엔딩: 사변적 합일',
    description: '인간이라는 협소한 틀을 벗어나 리좀적 실재의 일부가 되었습니다. 더 이상 \'나\'는 없으며, 오직 영원한 작용만이 존재합니다.',
    isEnding: true
  },
  {
    id: 'failure_state',
    title: '시스템 붕괴',
    description: '논리적 오류가 치명적인 물리적 파괴로 이어졌습니다. 시스템은 공허 속으로 사라집니다.',
    isEnding: true
  }
];

const App = () => {
  // --- Game State ---
  const [stages, setStages] = useState(() => {
    const saved = localStorage.getItem('ontological_stages');
    return saved ? JSON.parse(saved) : INITIAL_STAGES;
  });
  const [currentStageId, setCurrentStageId] = useState('boot');
  const [history, setHistory] = useState([]);
  const [traits, setTraits] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // --- Admin State ---
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [editingStage, setEditingStage] = useState(null);

  const currentStage = stages.find(s => s.id === currentStageId) || stages[0];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, currentStageId]);

  useEffect(() => {
    localStorage.setItem('ontological_stages', JSON.stringify(stages));
  }, [stages]);

  const handleOptionClick = (option) => {
    if (isTyping) return;
    setHistory(prev => [...prev, { type: 'action', text: option.text }]);
    setTraits(prev => [...prev, option.trait]);
    setIsTyping(true);
    setTimeout(() => {
      setCurrentStageId(option.next);
      setIsTyping(false);
    }, 400);
  };

  const restartGame = () => {
    setCurrentStageId('boot');
    setHistory([]);
    setTraits([]);
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
    setStages(prev => prev.filter(s => s.id !== id));
    if (currentStageId === id) setCurrentStageId('boot');
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stages, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "story_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-emerald-500 font-mono p-4 md:p-8 flex flex-col items-center overflow-x-hidden">
      {/* Header */}
      <div className="w-full max-w-2xl mb-6 flex items-center justify-between border-b border-emerald-900 pb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-6 h-6 animate-pulse" />
          <h1 className="text-xl font-bold tracking-tighter">ONTOLOGICAL_DEBUGGER v1.1.0</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsAdminOpen(true)}
            className="p-2 hover:bg-emerald-500/20 rounded-full transition-colors text-emerald-700 hover:text-emerald-400"
            title="관리자 모드"
          >
            <Settings className="w-5 h-5" />
          </button>
          <div className="hidden sm:flex gap-4 text-xs opacity-60 items-center border-l border-emerald-900 ml-2 pl-4">
            <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> CPU: 98%</span>
            <span className="flex items-center gap-1"><Brain className="w-3 h-3" /> SYNC: STABLE</span>
          </div>
        </div>
      </div>

      {/* Main Terminal Screen */}
      <div 
        ref={scrollRef}
        className="w-full max-w-2xl flex-1 bg-black/40 border border-emerald-900/50 rounded-lg p-6 shadow-[0_0_30px_rgba(16,185,129,0.05)] overflow-y-auto custom-scrollbar relative"
        style={{ minHeight: '450px' }}
      >
        {history.map((h, i) => (
          <div key={i} className={`mb-4 ${h.type === 'action' ? 'text-blue-400 italic' : 'text-emerald-300'}`}>
            {h.type === 'action' ? `> ${h.text}` : h.text}
          </div>
        ))}

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
          <h2 className="text-emerald-400 text-lg mb-2 flex items-center gap-2 font-bold uppercase tracking-widest">
            {currentStage?.isEnding ? <Zap className="w-5 h-5 text-yellow-500" /> : <ChevronRight className="w-5 h-5" />}
            {currentStage?.title}
          </h2>
          <p className="leading-relaxed mb-8 text-emerald-100/90 whitespace-pre-wrap border-l-2 border-emerald-900/30 pl-4">
            {currentStage?.description}
          </p>

          {!currentStage?.isEnding ? (
            <div className="grid gap-3">
              {currentStage?.options?.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(opt)}
                  disabled={isTyping}
                  className="w-full text-left p-4 border border-emerald-800/30 bg-emerald-900/5 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all rounded-md group flex items-center gap-4 active:scale-[0.98]"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-900 group-hover:bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.3)]" />
                  <span className="flex-1 text-sm">{opt.text}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-12 border-t border-emerald-900 pt-8 text-center">
              <p className="text-xs opacity-50 mb-6 italic">분석 완료. 존재론적 궤적이 시스템 커널에 동기화되었습니다.</p>
              <button 
                onClick={restartGame}
                className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 text-slate-950 rounded hover:bg-emerald-400 transition-all font-black uppercase tracking-tighter"
              >
                <RefreshCw className="w-4 h-4" /> REBOOT_SYSTEM
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Status Bar */}
      <div className="w-full max-w-2xl mt-6 grid grid-cols-3 gap-4">
        <StatusCard label="Current Protocol" value={currentStageId.replace('_', ' ')} />
        <StatusCard label="Ontological Traits" value={traits.length > 0 ? traits.join(', ') : 'Waiting...'} color="text-blue-400" />
        <div className="bg-emerald-900/5 border border-emerald-900/20 p-3 rounded-md">
          <div className="text-[9px] uppercase tracking-widest opacity-40 mb-1">World Stability</div>
          <div className="h-1 bg-emerald-900/50 w-full mt-2 overflow-hidden rounded-full">
            <div 
              className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
              style={{ width: currentStage?.isEnding ? '0%' : '72%' }}
            />
          </div>
        </div>
      </div>

      {/* --- Admin Overlay --- */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm p-4 md:p-8 flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-full max-w-4xl h-full flex flex-col bg-black border border-emerald-500/30 rounded-xl shadow-2xl overflow-hidden text-emerald-100">
            {/* Admin Header */}
            <div className="p-4 border-b border-emerald-900 flex justify-between items-center bg-emerald-950/20">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-lg tracking-tight text-emerald-400">STORY_ENGINE_OVERRIDE</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={exportData} className="p-2 hover:bg-emerald-500/20 rounded text-xs flex items-center gap-1"><Download className="w-4 h-4" /> Export</button>
                <button onClick={() => setIsAdminOpen(false)} className="p-2 hover:bg-red-500/20 text-emerald-700 hover:text-red-400 rounded transition-colors"><X className="w-6 h-6" /></button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar: Stage List */}
              <div className="w-64 border-r border-emerald-900/50 overflow-y-auto p-4 bg-black/40 custom-scrollbar">
                <button 
                  onClick={addStage}
                  className="w-full mb-4 py-2 border border-dashed border-emerald-700 hover:border-emerald-400 hover:bg-emerald-500/5 flex items-center justify-center gap-2 text-xs rounded transition-all"
                >
                  <Plus className="w-3 h-3" /> ADD_NEW_STAGE
                </button>
                <div className="space-y-1">
                  {stages.map(s => (
                    <div 
                      key={s.id} 
                      onClick={() => setEditingStage(s)}
                      className={`group p-2 rounded text-xs cursor-pointer flex justify-between items-center transition-all ${editingStage?.id === s.id ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' : 'hover:bg-emerald-900/20 text-emerald-700'}`}
                    >
                      <span className="truncate">{s.title || s.id}</span>
                      <Trash2 onClick={(e) => { e.stopPropagation(); deleteStage(s.id); }} className="w-3 h-3 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Workspace: Editor */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-950/50 custom-scrollbar">
                {editingStage ? (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase opacity-40 mb-1">Stage ID</label>
                        <input 
                          disabled={editingStage.id === 'boot'}
                          value={editingStage.id} 
                          onChange={(e) => setEditingStage({...editingStage, id: e.target.value})}
                          className="w-full bg-black border border-emerald-900 rounded p-2 text-sm focus:border-emerald-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase opacity-40 mb-1">Stage Title</label>
                        <input 
                          value={editingStage.title} 
                          onChange={(e) => setEditingStage({...editingStage, title: e.target.value})}
                          className="w-full bg-black border border-emerald-900 rounded p-2 text-sm focus:border-emerald-500 outline-none text-emerald-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase opacity-40 mb-1">Description</label>
                      <textarea 
                        rows={4}
                        value={editingStage.description} 
                        onChange={(e) => setEditingStage({...editingStage, description: e.target.value})}
                        className="w-full bg-black border border-emerald-900 rounded p-3 text-sm focus:border-emerald-500 outline-none min-h-[100px]"
                      />
                    </div>

                    <div className="flex items-center gap-4 p-3 bg-emerald-900/10 rounded-lg border border-emerald-900/30">
                      <input 
                        type="checkbox" 
                        checked={editingStage.isEnding || false} 
                        onChange={(e) => setEditingStage({...editingStage, isEnding: e.target.checked})}
                        className="w-4 h-4 accent-emerald-500"
                      />
                      <label className="text-xs font-bold uppercase tracking-wider cursor-pointer">엔딩 스테이지로 설정 (IS_ENDING_STATE)</label>
                    </div>

                    {!editingStage.isEnding && (
                      <div className="space-y-4 pt-4 border-t border-emerald-900/50">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] uppercase opacity-40 font-bold">Options (Branching)</label>
                          <button 
                            onClick={() => setEditingStage({...editingStage, options: [...(editingStage.options || []), { text: '새 선택지', next: 'boot', trait: 'none' }]})}
                            className="text-[10px] bg-emerald-900/30 hover:bg-emerald-500/20 px-2 py-1 rounded transition-all"
                          >
                            + ADD_OPTION
                          </button>
                        </div>
                        
                        {(editingStage.options || []).map((opt, idx) => (
                          <div key={idx} className="p-4 bg-black border border-emerald-900/50 rounded-lg space-y-3 relative group">
                            <Trash2 
                              onClick={() => {
                                const newOpts = [...editingStage.options];
                                newOpts.splice(idx, 1);
                                setEditingStage({...editingStage, options: newOpts});
                              }}
                              className="absolute top-2 right-2 w-3 h-3 text-emerald-900 hover:text-red-500 cursor-pointer" 
                            />
                            <div className="grid grid-cols-3 gap-3">
                              <div className="col-span-2">
                                <label className="text-[9px] opacity-30 uppercase block mb-1">Option Text</label>
                                <input 
                                  value={opt.text} 
                                  onChange={(e) => {
                                    const newOpts = [...editingStage.options];
                                    newOpts[idx].text = e.target.value;
                                    setEditingStage({...editingStage, options: newOpts});
                                  }}
                                  className="w-full bg-black/50 border border-emerald-900/50 rounded p-1.5 text-xs outline-none focus:border-emerald-500"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] opacity-30 uppercase block mb-1">Next ID</label>
                                <select 
                                  value={opt.next}
                                  onChange={(e) => {
                                    const newOpts = [...editingStage.options];
                                    newOpts[idx].next = e.target.value;
                                    setEditingStage({...editingStage, options: newOpts});
                                  }}
                                  className="w-full bg-black/50 border border-emerald-900/50 rounded p-1.5 text-xs outline-none focus:border-emerald-500 appearance-none"
                                >
                                  {stages.map(s => <option key={s.id} value={s.id}>{s.id}</option>)}
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-6">
                      <button 
                        onClick={() => saveStage(editingStage)}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-400 text-slate-950 font-black rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                      >
                        <Save className="w-4 h-4" /> COMMIT_CHANGES_TO_MEMORY
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-emerald-900 space-y-4 opacity-40">
                    <Settings className="w-16 h-16 animate-spin-slow" />
                    <p className="text-sm font-bold tracking-widest">좌측 리스트에서 스테이지를 선택하여 디버깅을 시작하십시오.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.4); }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const StatusCard = ({ label, value, color = "text-emerald-400" }) => (
  <div className="bg-emerald-900/5 border border-emerald-900/20 p-3 rounded-md text-[10px] uppercase tracking-wider">
    <div className="opacity-30 mb-1">{label}</div>
    <div className={`font-bold ${color} truncate`}>{value}</div>
  </div>
);

export default App;