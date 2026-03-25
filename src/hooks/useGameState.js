import { useState, useEffect, useMemo, useCallback } from 'react';
import { INITIAL_STAGES } from '../data/scenario';

const STORAGE_KEY = 'ontological_stages';

export const useGameState = () => {
  // --- Game Data & States ---
  const [stages, setStages] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_STAGES;
  });
  const [currentStageId, setCurrentStageId] = useState('boot');
  const [history, setHistory] = useState([]);
  const [traits, setTraits] = useState([]);
  const [stability, setStability] = useState(100);

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

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stages));
  }, [stages]);

  // --- Actions ---
  const handleOptionClick = useCallback((option) => {
    if (option.requirement) {
      const currentCount = traitStats[option.requirement.trait] || 0;
      if (currentCount < option.requirement.min) return;
    }

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
  }, [currentStage, traitStats]);

  const restartGame = useCallback(() => {
    setCurrentStageId('boot');
    setHistory([]);
    setTraits([]);
    setStability(100);
  }, []);

  // --- Admin Logic ---
  const saveStage = useCallback((updatedStage) => {
    setStages(prev => prev.map(s => s.id === updatedStage.id ? updatedStage : s));
  }, []);

  const addStage = useCallback(() => {
    const newId = `stage_${Date.now()}`;
    const newStage = { id: newId, title: '새로운 스테이지', description: '내용을 입력하세요.', options: [] };
    setStages(prev => [...prev, newStage]);
    return newStage;
  }, []);

  const deleteStage = useCallback((id) => {
    if (id === 'boot') return { error: '부트 스테이지는 삭제할 수 없습니다.' };
    setStages(prev => prev.filter(s => s.id !== id));
    if (currentStageId === id) setCurrentStageId('boot');
    return { success: true };
  }, [currentStageId]);

  return {
    stages, setStages,
    currentStage, currentStageId, setCurrentStageId,
    history, setHistory,
    traits, traitStats,
    stability, setStability,
    handleOptionClick, restartGame,
    saveStage, addStage, deleteStage
  };
};
