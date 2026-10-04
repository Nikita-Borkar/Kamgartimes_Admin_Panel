import React, { useState } from 'react';
import { 
  Newspaper, Flame, Eye, Users, FileText, CheckCircle2, 
  Clock, AlertTriangle, TrendingUp, PlusCircle, ArrowUpRight, ShieldAlert, Sparkles, MessageSquare
} from 'lucide-react';
import StatCard from '../components/StatCard';
import ArticleViewModal from '../components/ArticleViewModal';

export default function DashboardHome({ 
  stats, 
  articles, 
  breakingNews, 
  onNavigate,
  onApproveArticle,
  onRejectArticle,
  onOpenAddModal
}) {
  const [viewingArticle, setViewingArticle] = useState(null);
  const pendingArticles = articles.filter(a => a.status === 'Pending');
  const recentArticles = articles.slice(0, 5);

  const trafficData = [
    { day: "Mon", views: 240 },
    { day: "Tue", views: 320 },
    { day: "Wed", views: 290 },
    { day: "Thu", views: 410 },
    { day: "Fri", views: 380 },
    { day: "Sat", views: 520 },
    { day: "Sun (Today)", views: 640 }
  ];

  const maxViews = Math.max(...trafficData.map(d => d.views));

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-red-900 via-slate-900 to-amber-900 text-white border border-red-500/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5" /> Kamgar Times Control Hub
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-serif tracking-tight">
            Welcome back, <span className="text-red-400">Suresh Verma</span> (Chief Admin)
          </h2>
          <p className="text-xs text-slate-200 max-w-xl">
            18 articles published today. 6 articles are pending editorial review.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">
          <button 
            onClick={onOpenAddModal}
            className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Write Article</span>
          </button>
          
          <button 
            onClick={() => onNavigate('breaking')}
            className="bg-slate-950/80 hover:bg-slate-800 border border-red-500/40 text-red-400 hover:text-red-300 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer"
          >
            <Flame className="w-4 h-4 text-red-500 animate-pulse" />
            <span>Live Breaking Ticker</span>
          </button>
        </div>

        {/* Background glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Published News" 
          value={stats.totalArticles} 
          change="+18 today" 
          icon={Newspaper} 
          color="red"
          subtitle="Live on portal" 
        />
        <StatCard 
          title="Monthly Views" 
          value={stats.monthlyViews} 
          change="+14.2%" 
          icon={Eye} 
          color="amber"
          subtitle="Digital Traffic" 
        />
        <StatCard 
          title="Pending Reviews" 
          value={stats.pendingApprovals} 
          change="Action required" 
          icon={Clock} 
          color="blue"
          subtitle="Submitted by reporters" 
        />
        <StatCard 
          title="Daily e-Paper Readers" 
          value={stats.epaperSubscribers} 
          change="+8.5%" 
          icon={FileText} 
          color="emerald"
          subtitle="Digital Editions" 
        />
      </div>

      {/* Main Grid: Traffic Chart & Pending Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Visitor Traffic Analytics Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm dark:shadow-xl transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-500" /> Reader Traffic Analytics (Weekly)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Daily Page Views (in Thousands)</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              ● Live Analytics Active
            </span>
          </div>

          {/* Bar Chart Visualizer */}
          <div className="h-48 pt-8 flex items-end justify-between gap-2 sm:gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
            {trafficData.map((item, idx) => {
              const heightPercent = Math.round((item.views / maxViews) * 100);
              const isToday = idx === trafficData.length - 1;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded border border-slate-700 shadow-md whitespace-nowrap z-20">
                    {item.views}K Views
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-t-xl overflow-hidden h-36 flex items-end">
                    <div 
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-lg transition-all duration-500 group-hover:brightness-125 ${
                        isToday 
                          ? 'bg-gradient-to-t from-red-600 via-red-500 to-amber-400 shadow-lg shadow-red-600/50' 
                          : 'bg-gradient-to-t from-slate-300 to-slate-400 dark:from-slate-800 dark:to-slate-700'
                      }`}
                    />
                  </div>
                  <span className={`text-[11px] font-medium ${isToday ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
            <span>Average Daily Readers: <strong className="text-slate-900 dark:text-white">380K</strong></span>
            <span>Top Category: <strong className="text-red-600 dark:text-red-400">Labor & Union</strong></span>
          </div>
        </div>

        {/* Right: Pending Approvals Queue */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm dark:shadow-xl flex flex-col transition-colors duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" /> Pending Approvals ({pendingArticles.length})
            </h3>
            <button 
              onClick={() => onNavigate('news')}
              className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold"
            >
              View All →
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-80">
            {pendingArticles.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
                No articles pending for review.
              </div>
            ) : (
              pendingArticles.map(art => (
                <div key={art.id} className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      {art.category}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{art.date}</span>
                  </div>
                  <p 
                    onClick={() => setViewingArticle(art)}
                    className="text-xs text-slate-900 dark:text-white font-medium line-clamp-2 leading-snug cursor-pointer hover:text-red-600 dark:hover:text-red-400 transition"
                  >
                    {art.title}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Reporter: {art.reporter}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800/80">
                    <button 
                      onClick={() => setViewingArticle(art)}
                      className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onRejectArticle(art.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-red-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => onApproveArticle(art.id)}
                        className="px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow transition flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Recent Articles Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm dark:shadow-xl transition-colors duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-red-600 dark:text-red-500" /> Recent Published News
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live articles on portal</p>
          </div>
          <button 
            onClick={() => onNavigate('news')}
            className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-bold self-start sm:self-auto"
          >
            Manage All Articles →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-3 rounded-l-xl">Article Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Reporter</th>
                <th className="p-3">Views</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentArticles.map(art => (
                <tr key={art.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white max-w-md">
                    <div className="flex items-center gap-3">
                      <img 
                        src={art.image} 
                        alt="" 
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0 cursor-pointer" 
                        onClick={() => setViewingArticle(art)}
                      />
                      <div>
                        <span 
                          onClick={() => setViewingArticle(art)}
                          className="line-clamp-1 cursor-pointer hover:text-red-600 dark:hover:text-red-400 transition"
                        >
                          {art.title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {art.isBreaking && <span className="text-[9px] bg-red-600 text-white font-bold px-1.5 rounded">BREAKING</span>}
                          {art.isFeatured && <span className="text-[9px] bg-amber-500 text-slate-950 font-bold px-1.5 rounded">FEATURED</span>}
                          <span className="text-[10px] text-slate-400">{art.date}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-[11px]">
                      {art.category}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">{art.reporter}</td>
                  <td className="p-3 font-bold text-amber-600 dark:text-amber-400">{art.views ? art.views.toLocaleString() : 0}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      art.status === 'Published' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                      art.status === 'Pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                      'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {art.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button 
                      onClick={() => setViewingArticle(art)}
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => onNavigate('news')}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline font-semibold"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Article View Modal */}
      {viewingArticle && (
        <ArticleViewModal
          article={viewingArticle}
          onClose={() => setViewingArticle(null)}
          onEdit={() => onNavigate('news')}
        />
      )}

    </div>
  );
}

