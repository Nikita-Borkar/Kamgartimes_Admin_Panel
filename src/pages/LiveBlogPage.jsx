import React, { useState } from 'react';
import { Radio, PlusCircle, Trash2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LiveBlogPage({ articles, liveUpdates, onAddLiveUpdate, onDeleteLiveUpdate }) {
  const liveBlogArticles = articles.filter(a => a.isLiveBlog);
  const [selectedArticleId, setSelectedArticleId] = useState(liveBlogArticles[0]?.id || articles[0]?.id || '');
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [timestamp, setTimestamp] = useState('11:45 AM');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!headline.trim() || !selectedArticleId) return;

    onAddLiveUpdate({
      id: Date.now(),
      articleId: selectedArticleId,
      timestamp: timestamp || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      headline: headline.trim(),
      description: description.trim()
    });

    setHeadline('');
    setDescription('');
  };

  const filteredUpdates = liveUpdates.filter(u => u.articleId === selectedArticleId);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm dark:shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-300">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Radio className="w-6 h-6 text-red-600 dark:text-red-500 animate-pulse" />
            Live Blog Timeline Coverage (लाइव ब्लॉग अपडेट्स)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Post real-time timestamped live updates to articles marked as Live Blog on the website.
          </p>
        </div>

        <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          {liveBlogArticles.length} Live Blog Articles Running
        </span>
      </div>

      {/* Select Live Article & Add Update */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl space-y-4">
        
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Active Live Blog News Event*</label>
          <select
            value={selectedArticleId}
            onChange={(e) => setSelectedArticleId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none font-serif"
          >
            {articles.map(art => (
              <option key={art.id} value={art.id}>
                {art.isLiveBlog ? '🔴 LIVE: ' : ''}{art.title} ({art.city})
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleAdd} className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4 text-amber-500" /> Post New Live Update Entry
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-3 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Time Stamp</label>
              <input
                type="text"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                placeholder="11:45 AM"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none font-mono"
              />
            </div>

            <div className="sm:col-span-9 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Update Headline (Hindi / English)*</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. महाराष्ट्र कैबिनेट फैसला: ₹500 करोड़ अनुदान स्वीकृत"
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white outline-none font-serif"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Update Description / Details</label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter brief details for this live timeline entry..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none font-serif leading-relaxed"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 transition"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Broadcast Live Update</span>
            </button>
          </div>
        </form>

      </div>

      {/* Live Timeline Entries List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Live Timeline Entries ({filteredUpdates.length})
        </h3>

        <div className="space-y-3">
          {filteredUpdates.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">
              No live updates posted for this article yet. Use the form above to post live entries.
            </p>
          ) : (
            filteredUpdates.map(up => (
              <div key={up.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-start justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition">
                <div className="flex items-start gap-3">
                  <span className="bg-red-600 text-white text-[10px] font-mono font-bold px-2 py-1 rounded shadow shrink-0">
                    {up.timestamp}
                  </span>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white font-serif">{up.headline}</h4>
                    {up.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-serif leading-relaxed">{up.description}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteLiveUpdate(up.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition shrink-0"
                  title="Delete Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
