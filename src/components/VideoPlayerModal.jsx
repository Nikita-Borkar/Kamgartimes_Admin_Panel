import React from 'react';
import { X, Youtube, ExternalLink, User, Calendar, Tag } from 'lucide-react';
import { youtubeEmbedUrl } from '../api/videos';

const fmtDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return '—'; }
};

export default function VideoPlayerModal({ video, onClose }) {
  if (!video) return null;
  const embedUrl = youtubeEmbedUrl(video);
  const isPublished = video.status === 'PUBLISHED';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden">

        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-red-600/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 font-bold px-3 py-1 rounded-full text-xs border border-red-500/20 flex items-center gap-1.5">
              <Youtube className="w-3.5 h-3.5" />
              {video.videoType === 'SHORT' ? 'YouTube Short' : 'YouTube Video'}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
              isPublished
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
              {isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition"
            title="Close Player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player */}
        <div className="bg-slate-950 aspect-video">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={video.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">No playable video URL</div>
          )}
        </div>

        {/* Meta */}
        <div className="p-5 space-y-3">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-serif leading-snug">
            {video.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
            {video.category && (
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-red-500" />
                {typeof video.category === 'object' ? video.category.name : 'Category'}
              </span>
            )}
            {video.user?.name && (
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-red-500" /> {video.user.name}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-red-500" /> {fmtDate(video.createdAt)}
            </span>
            <a
              href={video.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-semibold hover:underline ml-auto"
            >
              Open on YouTube <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          {video.altText && (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic border-t border-slate-200 dark:border-slate-800 pt-3">
              Alt text: {video.altText}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
