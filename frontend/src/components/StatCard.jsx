import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, color = 'indigo', trend }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs relative overflow-hidden transition-all duration-150 hover:border-slate-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-[#0f172a] mt-1.5">{value}</h3>
          {subtext && <p className="text-xs text-slate-500 mt-1 font-medium">{subtext}</p>}
        </div>
        <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-[#0f172a]">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center text-[11px] text-emerald-700 font-semibold">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
