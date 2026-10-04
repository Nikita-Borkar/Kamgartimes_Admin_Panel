import React from 'react';

export default function StatCard({ title, value, change, icon: Icon, color = 'red', subtitle }) {
  const colorMap = {
    red: 'from-red-500/10 to-red-900/5 dark:from-red-600/20 dark:to-red-900/10 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-500',
    amber: 'from-amber-500/10 to-amber-900/5 dark:from-amber-600/20 dark:to-amber-900/10 border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-500',
    blue: 'from-blue-500/10 to-blue-900/5 dark:from-blue-600/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-500',
    emerald: 'from-emerald-500/10 to-emerald-900/5 dark:from-emerald-600/20 dark:to-emerald-900/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-500',
    purple: 'from-purple-500/10 to-purple-900/5 dark:from-purple-600/20 dark:to-purple-900/10 border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-500'
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-br ${colorMap[color]} bg-white dark:bg-slate-900 border backdrop-blur-md shadow-sm dark:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{value}</h3>
          {subtitle && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>
        
        <div className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 ${colorMap[color]} group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {change && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold">
          <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
            {change}
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-[10px]">vs last period</span>
        </div>
      )}
    </div>
  );
}
