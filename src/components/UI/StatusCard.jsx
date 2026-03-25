import React from 'react';

const StatusCard = ({ label, value, color = "text-emerald-400" }) => (
  <div className="bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-xl shadow-inner">
    <div className="text-[9px] uppercase font-bold opacity-30 mb-1 tracking-widest">{label}</div>
    <div className={`font-black text-[11px] ${color} truncate`}>{value}</div>
  </div>
);

export default StatusCard;
