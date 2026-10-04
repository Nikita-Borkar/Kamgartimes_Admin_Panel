import React, { useState } from 'react';
import { Flame, PlusCircle, Trash2, CheckCircle2, AlertCircle, Clock, Volume2, ShieldAlert } from 'lucide-react';
import Pagination from '../components/Pagination';

export default function BreakingTickerPage({ 
  breakingList, 
  onAddBreaking, 
  onDeleteBreaking, 
  onToggleBreaking 
}) {
  const [newTitle, setNewTitle] = useState('');
  const [category, setCategory] = useState('Labor News');
  const [priority, setPriority] = useState('High');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddBreaking({
      id: Date.now(),
      title: newTitle.trim(),
      category: category,
      priority: priority,
      time: 'Just now',
      status: 'Active'
    });

    setNewTitle('');
  };

  const totalPages = Math.ceil(breakingList.length / itemsPerPage) || 1;
  const paginatedList = breakingList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm dark:shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-300">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-red-500 animate-bounce" />
            Breaking News Ticker Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage live top ticker scrolling headlines across the main website.
          </p>
        </div>

        <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          {breakingList.filter(b => b.status === 'Active').length} Active Live Headlines
        </span>
      </div>

      {/* Live Preview Box */}
      <div className="bg-slate-950 border border-red-500/40 rounded-2xl p-4 space-y-2 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-widest text-red-500 flex items-center gap-2">
            <Flame className="w-4 h-4" /> Live Ticker Preview
          </span>
          <span className="text-[10px] text-slate-400">Scroll speed: 15s</span>
        </div>
        
        <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-3 flex items-center gap-3 overflow-hidden">
          <span className="bg-gradient-to-r from-red-600 to-amber-500 text-white font-black text-xs px-2.5 py-1 rounded shadow shrink-0">
            BREAKING
          </span>
          <div className="overflow-hidden whitespace-nowrap">
            <p className="text-xs font-serif text-white font-semibold inline-block animate-marquee">
              {breakingList.filter(b => b.status === 'Active').map(b => `🔴 ${b.title} (${b.category})   `).join('  |  ') || 'No active breaking ticker headlines.'}
            </p>
          </div>
        </div>
      </div>

      {/* Add Form (TEXTAREA FOR BREAKING HEADLINE) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-amber-500" /> Add New Breaking Headline
        </h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          
          <div className="sm:col-span-6 space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Breaking Headline Text (Hindi / English)*</label>
            <textarea
              rows="2"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. मजदूरों के न्यूनतम वेतन में 15% की बढ़ोतरी का श्रम मंत्रालय का बड़ा फैसला..."
              required
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl p-3 text-xs text-slate-900 dark:text-white font-serif outline-none leading-snug"
            />
          </div>

          <div className="sm:col-span-3 space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category Tag</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
            >
              <option value="Labor News">Labor News</option>
              <option value="Govt Schemes">Govt Schemes</option>
              <option value="State">State News</option>
              <option value="National">National</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add to Live Ticker</span>
            </button>
          </div>

        </form>
      </div>

      {/* Breaking List Table with S.No. & Pagination */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Ticker Headlines ({breakingList.length})</h3>

        <div className="space-y-2">
          {paginatedList.map((item, idx) => {
            const serialNo = (currentPage - 1) * itemsPerPage + idx + 1;
            return (
              <div 
                key={item.id} 
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                  item.status === 'Active' 
                    ? 'bg-slate-50 dark:bg-slate-950 border-red-500/40' 
                    : 'bg-slate-100 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 self-center">
                    #{serialNo}
                  </span>

                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase shrink-0 ${
                    item.priority === 'High' ? 'bg-red-600 text-white' : 'bg-amber-500 text-slate-950'
                  }`}>
                    {item.priority}
                  </span>

                  <div className="space-y-1">
                    <p className="text-xs text-slate-900 dark:text-white font-serif font-semibold leading-snug">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400">
                      <span>Category: <strong className="text-slate-700 dark:text-slate-300">{item.category}</strong></span>
                      <span>• {item.time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => onToggleBreaking(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      item.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {item.status === 'Active' ? '● Active (Live)' : 'Paused'}
                  </button>

                  <button
                    onClick={() => onDeleteBreaking(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Pagination Bar */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={breakingList.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />

      </div>

    </div>
  );
}
