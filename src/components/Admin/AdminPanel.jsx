import React, { useState, useRef, useMemo } from 'react';
import { Settings, X, Plus, Trash2, Download, Upload } from 'lucide-react';

const AdminPanel = ({ stages, onSave, onAdd, onDelete, onClose, onImport, onExport }) => {
  const [editingStage, setEditingStage] = useState(null);
  const fileInputRef = useRef(null);

  // --- Validation Logic ---
  const validationErrors = useMemo(() => {
    const errors = {};
    const stageIds = new Set(stages.map(s => s.id));
    
    stages.forEach(s => {
      const stageErrors = [];
      s.options?.forEach((opt, idx) => {
        if (!stageIds.has(opt.next)) {
          stageErrors.push(`Option ${idx + 1} points to non-existent ID: ${opt.next}`);
        }
      });
      if (stageErrors.length > 0) errors[s.id] = stageErrors;
    });
    return errors;
  }, [stages]);

  const handleSave = () => {
    if (editingStage) {
      onSave(editingStage);
      alert('Changes committed successfully.');
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/98 backdrop-blur-xl p-4 md:p-8 flex flex-col items-center animate-in fade-in duration-300">
      <div className="w-full max-w-5xl h-full flex flex-col bg-black border border-emerald-500/20 rounded-2xl shadow-2xl overflow-hidden text-emerald-100 font-sans">
        {/* Header */}
        <div className="p-5 border-b border-emerald-900/50 flex justify-between items-center bg-emerald-950/30">
          <h3 className="font-black text-emerald-400 flex items-center gap-3 uppercase tracking-tighter">
            <Settings className="w-5 h-5" /> Story_Kernel_Override
          </h3>
          <div className="flex gap-2">
            <input type="file" ref={fileInputRef} onChange={onImport} accept=".json" className="hidden" />
            <button onClick={() => fileInputRef.current.click()} className="px-3 py-1.5 bg-blue-900/20 text-blue-400 border border-blue-500/30 rounded-lg text-[10px] font-bold hover:bg-blue-900/40 transition-colors">IMPORT</button>
            <button onClick={onExport} className="px-3 py-1.5 bg-emerald-900/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold hover:bg-emerald-900/40 transition-colors">EXPORT</button>
            <button onClick={onClose} className="p-1.5 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"><X /></button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-emerald-900/50 overflow-y-auto p-4 bg-black/40 custom-scrollbar">
            <button onClick={() => setEditingStage(onAdd())} className="w-full mb-4 py-2 bg-emerald-500/5 border border-dashed border-emerald-700 text-[10px] font-bold uppercase rounded-lg hover:bg-emerald-500/10 transition-all">+ NEW_STAGE</button>
            {stages.map(s => (
              <div 
                key={s.id} 
                onClick={() => setEditingStage({...s})} 
                className={`p-2 mb-1 rounded-lg text-[11px] cursor-pointer border transition-all flex justify-between items-center group ${editingStage?.id === s.id ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200' : 'border-transparent hover:bg-emerald-900/20 text-emerald-800'}`}
              >
                <span className="truncate pr-2 flex items-center gap-2">
                  {validationErrors[s.id] && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" title="Validation Error" />}
                  {s.title}
                </span>
                <Trash2 
                  onClick={(e) => { e.stopPropagation(); onDelete(s.id); if(editingStage?.id === s.id) setEditingStage(null); }} 
                  className="w-3 h-3 opacity-0 group-hover:opacity-40 hover:!opacity-100 text-red-500 transition-opacity" 
                />
              </div>
            ))}
          </div>

          {/* Editor Area */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-950/20">
            {editingStage ? (
              <div className="space-y-6">
                {validationErrors[editingStage.id] && (
                  <div className="p-3 bg-red-950/30 border border-red-500/50 rounded-lg text-xs text-red-400 space-y-1">
                    <p className="font-bold uppercase tracking-widest text-[10px] mb-2">Critical Path Warnings:</p>
                    {validationErrors[editingStage.id].map((err, i) => <p key={i}>• {err}</p>)}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase opacity-40 font-bold">Stage ID</label>
                    <input value={editingStage.id} onChange={(e) => setEditingStage({...editingStage, id: e.target.value})} className="w-full bg-black border border-emerald-900 rounded-lg p-2 text-sm outline-none focus:border-emerald-500 transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase opacity-40 font-bold">Title</label>
                    <input value={editingStage.title} onChange={(e) => setEditingStage({...editingStage, title: e.target.value})} className="w-full bg-black border border-emerald-900 rounded-lg p-2 text-sm outline-none focus:border-emerald-500 text-emerald-400 font-bold transition-colors" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase opacity-40 font-bold">Description</label>
                  <textarea rows={4} value={editingStage.description} onChange={(e) => setEditingStage({...editingStage, description: e.target.value})} className="w-full bg-black border border-emerald-900 rounded-lg p-3 text-sm outline-none focus:border-emerald-500 min-h-[100px] transition-colors" />
                </div>

                <div className="space-y-4 pt-4 border-t border-emerald-900/50">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black uppercase opacity-40 tracking-widest">Branching & Logic</h4>
                    <button 
                      onClick={() => setEditingStage({...editingStage, options: [...(editingStage.options || []), { text: 'New Option', next: 'boot', trait: 'none' }]})}
                      className="text-[10px] text-emerald-600 hover:text-emerald-400 transition-colors font-bold"
                    >
                      + ADD_OPTION
                    </button>
                  </div>
                  
                  {editingStage.options?.map((opt, idx) => (
                    <div key={idx} className="p-4 bg-emerald-950/5 border border-emerald-900/50 rounded-xl space-y-3 relative group">
                      <Trash2 
                        onClick={() => { const newOpts = [...editingStage.options]; newOpts.splice(idx, 1); setEditingStage({...editingStage, options: newOpts}); }} 
                        className="absolute top-3 right-3 w-3 h-3 text-red-900 hover:text-red-500 cursor-pointer transition-colors" 
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[8px] opacity-30 uppercase font-bold">Button Label</label>
                          <input value={opt.text} onChange={(e) => { const newOpts = [...editingStage.options]; newOpts[idx].text = e.target.value; setEditingStage({...editingStage, options: newOpts}); }} className="w-full bg-black border border-emerald-900 p-2 text-xs rounded-lg outline-none focus:border-emerald-700 transition-colors" />
                        </div> 
                        <div className="space-y-1">
                          <label className="text-[8px] opacity-30 uppercase font-bold">Destination</label>
                          <select 
                            value={opt.next} 
                            onChange={(e) => { const newOpts = [...editingStage.options]; newOpts[idx].next = e.target.value; setEditingStage({...editingStage, options: newOpts}); }} 
                            className="w-full bg-black border border-emerald-900 p-2 text-xs rounded-lg outline-none focus:border-emerald-700 transition-colors cursor-pointer text-emerald-100"
                          >
                            {stages.map(s => (
                              <option key={s.id} value={s.id}>
                                {s.title} ({s.id})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1"><label className="text-[8px] opacity-30 uppercase font-bold">Trait Grant</label><input value={opt.trait} onChange={(e) => { const newOpts = [...editingStage.options]; newOpts[idx].trait = e.target.value; setEditingStage({...editingStage, options: newOpts}); }} className="w-full bg-black border border-emerald-900 p-2 text-[10px] rounded-lg outline-none focus:border-emerald-700" /></div>  
                        <div className="space-y-1"><label className="text-[8px] opacity-30 uppercase font-bold">Stability Impact</label><input type="number" value={opt.stabilityImpact || 0} onChange={(e) => { const newOpts = [...editingStage.options]; newOpts[idx].stabilityImpact = parseInt(e.target.value); setEditingStage({...editingStage, options: newOpts}); }} className="w-full bg-black border border-emerald-900 p-2 text-[10px] rounded-lg outline-none focus:border-emerald-700" /></div>
                        <div className="space-y-1">
                          <label className="text-[8px] opacity-30 uppercase font-bold">Requirement (Trait:Min)</label>
                          <div className="flex gap-1">
                            <input placeholder="trait" value={opt.requirement?.trait || ''} onChange={(e) => { const newOpts = [...editingStage.options]; newOpts[idx].requirement = { ...opt.requirement, trait: e.target.value }; setEditingStage({...editingStage, options: newOpts}); }} className="bg-black border border-emerald-900 p-2 text-[9px] rounded-lg flex-1 outline-none focus:border-emerald-700" />
                            <input type="number" placeholder="0" value={opt.requirement?.min || 0} onChange={(e) => { const newOpts = [...editingStage.options]; newOpts[idx].requirement = { ...opt.requirement, min: parseInt(e.target.value) }; setEditingStage({...editingStage, options: newOpts}); }} className="bg-black border border-emerald-900 p-2 text-[9px] rounded-lg w-10 outline-none focus:border-emerald-700" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={handleSave} 
                  className="w-full py-4 bg-emerald-600 text-slate-950 font-black rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95"
                >
                  COMMIT_CHANGES
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-10 uppercase tracking-[0.5em] font-black text-2xl space-y-4">
                <Settings className="w-16 h-16 animate-spin-slow" />
                <p>Override_Ready</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
