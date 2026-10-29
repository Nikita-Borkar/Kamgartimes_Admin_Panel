import React, { useState, useEffect, useCallback } from 'react';
import {
  Rss, Newspaper, RefreshCw, Loader2, AlertCircle, CalendarClock,
  Tag, User, Info, ArrowRight, Zap, RadioTower, Timer
} from 'lucide-react';
import { fetchLatestNewsTicker } from '../api/liveNews';

const errOf = (e) => e?.message || 'Something went wrong. Please try again.';

const fmtDateTime = (d) => {
  if (!d) return null;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const timeAgo = (d) => {
  if (!d) return '';
  const t = new Date(d).getTime();
  if (Number.isNaN(t)) return '';
  const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const LIMITS = [10, 20, 50];

export default function NewsTickerPage({ categories = [], onManageArticles }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const [limit, setLimit] = useState(20);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [previewAutoRefresh, setPreviewAutoRefresh] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await fetchLatestNewsTicker({
        limit,
        category: categoryFilter || undefined
      });
      setItems(Array.isArray(data) ? data : (data?.articles || []));
      setLastUpdated(new Date());
    } catch (err) {
      setItems([]);
      setLoadError(errOf(err));
    } finally {
      setLoading(false);
    }
  }, [limit, categoryFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!previewAutoRefresh) return undefined;
    const id = setInterval(() => { load(); }, 60 * 1000);
    return () => clearInterval(id);
  }, [previewAutoRefresh, load]);

  const activeCategory = categories.find((c) => String(c._id) === String(categoryFilter));
  const tickerLoop = items.length ? [...items, ...items] : [];

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm dark:shadow-xl transition-colors duration-300">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Rss className="w-6 h-6 text-red-500" /> Latest News Ticker
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Live preview of the reader-site ticker, derived automatically from articles published in the last 24 hours.
          </p>
        </div>

        {onManageArticles && (
          <button
            onClick={onManageArticles}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 transition shrink-0 cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Newspaper className="w-4 h-4" />
            <span>Manage Articles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* How it works */}
      <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/25 text-blue-700 dark:text-blue-300 rounded-2xl px-4 py-3 text-[11px] sm:text-xs">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          There is no separate ticker CRUD. Publishing an article (or setting its status to <strong>PUBLISHED</strong>)
          adds it here automatically, newest first, and it drops off after 24 hours.
          {' '}Preview auto-refresh only reloads this admin screen; the public ticker refreshes independently.
        </p>
      </div>

      {/* Live ticker preview */}
      <div className="rounded-3xl overflow-hidden border border-red-500/30 bg-gradient-to-r from-red-700 via-red-800 to-slate-900 shadow-xl">
        <div className="flex items-center gap-3 px-4 sm:px-5 py-2.5">
          <span className="flex items-center gap-1.5 bg-white text-red-700 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider shrink-0">
            <Zap className="w-3 h-3" /> Live
          </span>

          {loading ? (
            <div className="flex items-center gap-2 text-white/80 text-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading headlines...
            </div>
          ) : items.length === 0 ? (
            <div className="text-white/80 text-xs">No headlines in the last 24 hours.</div>
          ) : (
            <div className="overflow-hidden flex-1">
              <div className="animate-marquee hover:[animation-play-state:paused]">
                {tickerLoop.map((item, idx) => (
                  <span
                    key={`${item._id}-${idx}`}
                    className="inline-flex items-center gap-2 mx-4 text-xs font-semibold text-white/95 align-middle"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    {item.title}
                    <span className="text-white/25">|</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {!loading && items.length > 0 && (
            <span className="hidden sm:inline-flex text-[10px] font-bold text-white/60 shrink-0">
              {items.length} headline{items.length === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm dark:shadow-lg grid grid-cols-1 sm:grid-cols-12 gap-3 items-center transition-colors duration-300">
        <div className="sm:col-span-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 outline-none transition"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={String(limit)}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 outline-none transition"
          >
            {LIMITS.map((n) => <option key={n} value={String(n)}>Show {n}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2">
          <button
            onClick={() => setPreviewAutoRefresh((enabled) => !enabled)}
            className={`w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold border transition ${
              previewAutoRefresh
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
            }`}
            title="Toggle automatic refresh of this admin preview only"
            aria-label={`Admin preview auto-refresh ${previewAutoRefresh ? 'on' : 'off'}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${previewAutoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            {previewAutoRefresh ? 'Preview Auto On' : 'Preview Auto Off'}
          </button>
        </div>

        <div className="sm:col-span-3 flex items-center justify-between sm:justify-end gap-3">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Timer className="w-3 h-3" />
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : 'Not loaded'}
          </span>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Result meta */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>
          <strong className="text-slate-900 dark:text-white">{items.length}</strong> headline{items.length === 1 ? '' : 's'} live
          {activeCategory ? <> in <strong className="text-slate-900 dark:text-white">{activeCategory.name}</strong></> : null}
          {' '}· last 24 hours
        </span>
        <span className="flex items-center gap-1.5 text-[11px]">
          <RadioTower className="w-3.5 h-3.5 text-red-500" /> Public endpoint: GET /public/articles/ticker
        </span>
      </div>

      {loadError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs font-bold">
          <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /> {loadError}</span>
          <button onClick={load} className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white shrink-0">Retry</button>
        </div>
      )}

      {/* Headline cards */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl py-20 flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-red-500" />
          <span className="text-xs">Loading latest headlines...</span>
        </div>
      ) : items.length === 0 && !loadError ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl py-20 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
          <Rss className="w-8 h-8" />
          <span>No published articles in the last 24 hours.</span>
          <span>Publish an article and it will appear here automatically.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map((item) => (
            <article
              key={item._id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl hover:border-red-500/40 dark:hover:border-red-500/40 transition flex flex-col sm:flex-row"
            >
              {item.featuredImage ? (
                <img
                  src={item.featuredImage}
                  alt=""
                  className="w-full sm:w-40 h-40 sm:h-auto object-cover shrink-0"
                />
              ) : (
                <div className="w-full sm:w-40 h-40 sm:h-auto shrink-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-950 flex items-center justify-center">
                  <Newspaper className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                </div>
              )}

              <div className="p-4 flex-1 min-w-0 flex flex-col">
                <div className="flex items-center justify-between gap-2">
                  {item.category?.name ? (
                    <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                      <Tag className="w-3 h-3" /> {item.category.name}
                    </span>
                  ) : <span />}
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-bold flex items-center gap-1 shrink-0">
                    <CalendarClock className="w-3 h-3" /> {timeAgo(item.publishedAt)}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-snug line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 flex-1">
                  {item.summary || 'No summary provided.'}
                </p>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] text-slate-400">
                  {item.author?.name && (
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {item.author.name}</span>
                  )}
                  <span className="flex items-center gap-1"><CalendarClock className="w-3 h-3" /> {fmtDateTime(item.publishedAt)}</span>
                  {item.slug && <span className="truncate max-w-[16rem]">/news/{item.slug}</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

    </div>
  );
}
