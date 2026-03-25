import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Cpu, Ghost, Brain, Zap, ChevronRight, AlertTriangle, RefreshCw } from 'lucide-react';

// Game Configuration & Content
const GAME_STAGES = [
  {
    id: 'boot',
    title: '시스템 부팅 (System Boot)',
    description: '서기 2144년, 오르트 구름 외곽 기지. 당신은 유일하게 남은 시스템 관리자입니다. 주 컴퓨터 "SPINOZA-OS"가 심각한 실재론적 오류를 일으키고 있습니다.',
    tasks: ['논리 회로 동기화', '칸트식 범주 설정'],
    options: [
      { text: "시스템을 강제 재구동한다", next: 'logic_puzzle', trait: 'logic' },
      { text: "오류 메시지의 서브텍스트를 분석한다", next: 'phil_choice_1', trait: 'philosophy' }
    ]
  },
  {
    id: 'logic_puzzle',
    title: '논리 회로 복구: 정언 명령 (Categorical Imperative)',
    type: 'puzzle',
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
  const [currentStageId, setCurrentStageId] = useState('boot');
  const [history, setHistory] = useState([]);
  const [traits, setTraits] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  const currentStage = GAME_STAGES.find(s => s.id === currentStageId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, currentStage]);

  const handleOptionClick = (option) => {
    if (isTyping) return;
    
    setHistory(prev => [...prev, { type: 'action', text: option.text }]);
    setTraits(prev => [...prev, option.trait]);
    
    setIsTyping(true);
    setTimeout(() => {
      setCurrentStageId(option.next);
      setIsTyping(false);
    }, 500);
  };

  const restartGame = () => {
    setCurrentStageId('boot');
    setHistory([]);
    setTraits([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-emerald-500 font-mono p-4 md:p-8 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-2xl mb-6 flex items-center justify-between border-b border-emerald-900 pb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-6 h-6 animate-pulse" />
          <h1 className="text-xl font-bold tracking-tighter">ONTOLOGICAL_DEBUGGER v1.0.4</h1>
        </div>
        <div className="flex gap-4 text-xs opacity-60">
          <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> CPU: 98%</span>
          <span className="flex items-center gap-1"><Brain className="w-3 h-3" /> SYNC: STABLE</span>
        </div>
      </div>

      {/* Main Terminal Screen */}
      <div 
        ref={scrollRef}
        className="w-full max-w-2xl flex-1 bg-black/40 border border-emerald-900/50 rounded-lg p-6 shadow-[0_0_20px_rgba(16,185,129,0.1)] overflow-y-auto custom-scrollbar"
        style={{ minHeight: '400px' }}
      >
        {/* Past History */}
        {history.map((h, i) => (
          <div key={i} className={`mb-4 ${h.type === 'action' ? 'text-blue-400 italic' : 'text-emerald-300'}`}>
            {h.type === 'action' ? `> ${h.text}` : h.text}
          </div>
        ))}

        {/* Current Content */}
        <div className="animate-in fade-in duration-700">
          <h2 className="text-emerald-400 text-lg mb-2 flex items-center gap-2 font-bold uppercase tracking-widest">
            {currentStage?.isEnding ? <Zap className="w-5 h-5 text-yellow-500" /> : <ChevronRight className="w-5 h-5" />}
            {currentStage?.title}
          </h2>
          <p className="leading-relaxed mb-6 text-emerald-100/90 whitespace-pre-wrap">
            {currentStage?.description}
          </p>

          {!currentStage?.isEnding ? (
            <div className="grid gap-3">
              {currentStage?.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(opt)}
                  disabled={isTyping}
                  className="w-full text-left p-3 border border-emerald-800/40 bg-emerald-900/10 hover:bg-emerald-500/20 hover:border-emerald-500/60 transition-all rounded group flex items-center gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-800 group-hover:bg-emerald-400 group-hover:shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="flex-1">{opt.text}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-8 border-t border-emerald-900 pt-6 text-center">
              <p className="text-sm opacity-60 mb-4">분석 완료. 사용자의 철학적 성향이 시스템에 영구 기록되었습니다.</p>
              <button 
                onClick={restartGame}
                className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-slate-950 rounded hover:bg-emerald-400 transition-colors font-bold"
              >
                <RefreshCw className="w-4 h-4" /> 재접속 (Reset)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Status Bar */}
      <div className="w-full max-w-2xl mt-6 grid grid-cols-3 gap-4">
        <div className="bg-emerald-900/10 border border-emerald-900/30 p-3 rounded-md text-[10px] uppercase tracking-wider">
          <div className="opacity-50 mb-1">Current Protocol</div>
          <div className="font-bold text-emerald-400">{currentStageId.replace('_', ' ')}</div>
        </div>
        <div className="bg-emerald-900/10 border border-emerald-900/30 p-3 rounded-md text-[10px] uppercase tracking-wider">
          <div className="opacity-50 mb-1">Ontological Traits</div>
          <div className="font-bold text-blue-400 truncate">
            {traits.length > 0 ? traits.join(', ') : 'Initializing...'}
          </div>
        </div>
        <div className="bg-emerald-900/10 border border-emerald-900/30 p-3 rounded-md text-[10px] uppercase tracking-wider">
          <div className="opacity-50 mb-1">World Stability</div>
          <div className="h-1 bg-emerald-900 w-full mt-2 overflow-hidden rounded-full">
            <div 
              className="h-full bg-emerald-500 transition-all duration-1000" 
              style={{ width: currentStage?.isEnding ? '0%' : '65%' }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.5);
        }
      `}</style>
    </div>
  );
};

export default App;