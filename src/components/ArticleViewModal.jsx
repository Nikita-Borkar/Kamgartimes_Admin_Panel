import React, { useState } from 'react';
import { 
  X, Eye, ThumbsUp, Calendar, MapPin, User, Volume2, 
  Sparkles, Tag, Edit3, CheckCircle2, Flame, Share2, MessageSquare, Play, Pause
} from 'lucide-react';

export default function ArticleViewModal({ 
  article, 
  onClose, 
  onEdit, 
  onToggleStatus 
}) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [likesCount, setLikesCount] = useState(article?.likes || 120);
  const [hasLiked, setHasLiked] = useState(false);

  if (!article) return null;

  const handleLikeToggle = () => {
    if (hasLiked) {
      setLikesCount(prev => prev - 1);
      setHasLiked(false);
    } else {
      setLikesCount(prev => prev + 1);
      setHasLiked(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-3xl sm:max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden transition-colors duration-300">
        
        {/* Modal Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-red-600/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 font-bold px-3 py-1 rounded-full text-xs border border-red-500/20 uppercase tracking-wider">
              {article.categoryLabel || article.category}
            </span>
            {article.city && (
              <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-2.5 py-1 rounded-full text-xs flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-500" /> {article.city}
              </span>
            )}
            <button
              onClick={() => onToggleStatus && onToggleStatus(article.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                article.status === 'Published' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
                article.status === 'Pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
                'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
              }`}
              title="Click to change publication status"
            >
              <span className={`w-2 h-2 rounded-full ${article.status === 'Published' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {article.status}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => { onClose(); onEdit(article); }}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit Article</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Article Content */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200 font-sans">
          
          {/* Article Badges */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {article.isHero && (
              <span className="font-extrabold bg-red-700 text-white px-2.5 py-0.5 rounded shadow">
                🔥 HERO ARTICLE
              </span>
            )}
            {article.isBreaking && (
              <span className="font-extrabold bg-red-600 text-white px-2.5 py-0.5 rounded shadow flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> BREAKING NEWS
              </span>
            )}
            {article.isFeatured && (
              <span className="font-bold bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded shadow">
                ⭐ FEATURED
              </span>
            )}
            {article.isLiveBlog && (
              <span className="font-bold bg-purple-600 text-white px-2.5 py-0.5 rounded flex items-center gap-1 shadow">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" /> LIVE BLOG
              </span>
            )}
          </div>

          {/* Main Headline */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black font-serif text-slate-900 dark:text-white leading-tight">
            {article.title}
          </h1>

          {/* Subheadline / Dek */}
          {article.subheadline && (
            <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300 font-serif border-l-4 border-red-600 pl-3 py-1 bg-slate-50 dark:bg-slate-950/50 rounded-r-xl">
              {article.subheadline}
            </p>
          )}

          {/* Author Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 p-0.5 shrink-0">
                <img 
                  src={article.reporterAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} 
                  alt="" 
                  className="w-full h-full object-cover rounded-full bg-slate-900"
                />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">{article.reporter || 'Reporter'}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Kamgar Times Media Network</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-red-500" /> {article.date || 'Today'}
              </span>
              <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                <Eye className="w-4 h-4" /> {article.views ? article.views.toLocaleString() : 0} Views
              </span>
            </div>
          </div>

          {/* Featured Image */}
          {article.image && (
            <div className="space-y-2">
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                <img 
                  src={article.image || article.imageUrl} 
                  alt={article.title} 
                  className="w-full max-h-96 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
              </div>
              {article.imageCaption && (
                <p className="text-xs text-center text-slate-500 dark:text-slate-400 italic">
                  📷 {article.imageCaption}
                </p>
              )}
            </div>
          )}

          {/* Audio Podcast Player Bar (If audio available) */}
          {(article.hasAudio || article.audioUrl) && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg transition active:scale-95 cursor-pointer"
                >
                  {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <div>
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5" /> Audio News Podcast Preview
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    {isPlayingAudio ? "Playing audio recording..." : "Listen to article audio summary"}
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-xl border border-emerald-500/20">
                02:45 Min
              </span>
            </div>
          )}

          {/* Summary / Highlights Box */}
          {article.summary && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-1.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Quick Article Summary
              </h4>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-serif">
                {article.summary}
              </p>
            </div>
          )}

          {/* Main Article Content Body */}
          <div className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed space-y-4 font-serif text-slate-800 dark:text-slate-200">
            {(article.content || 'कोई अतिरिक्त विवरण उपलब्ध नहीं है।').split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Tags Section */}
          {article.tags && article.tags.length > 0 && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Tags:
              </span>
              {article.tags.map((tag, i) => (
                <span key={i} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer Interactive Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleLikeToggle}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  hasLiked 
                    ? 'bg-red-600 text-white shadow-md' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{likesCount} Likes</span>
              </button>

              <button
                onClick={() => alert("Article share link copied to clipboard!")}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 transition"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>

            <div className="text-xs text-slate-400">
              ID: <code className="font-mono text-slate-500">{article.id}</code>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
