import React, { useState } from 'react';
import { X, Save, Loader2, AlertCircle, Image as ImageIcon, Youtube } from 'lucide-react';
import {
  createVideo, updateVideo, extractYoutubeId, youtubeThumbUrl, YOUTUBE_URL_RE
} from '../api/videos';

const errOf = (e) => e?.message || 'Something went wrong. Please try again.';

// Shared create/edit modal used by both the Shorts page and the Full Videos
// page. `videoType` is pre-set by the calling page but stays editable.
export default function VideoFormModal({
  video,
  videoType = 'VIDEO',
  categories,
  onClose,
  onSaved,
  showToast
}) {
  const isEdit = Boolean(video?._id);
  const catRef = video?.category;
  const initialCategoryId = typeof catRef === 'object' && catRef?._id ? catRef._id : (catRef || '');

  const [form, setForm] = useState({
    title: video?.title || '',
    youtubeUrl: video?.youtubeUrl || '',
    altText: video?.altText || '',
    videoType: video?.videoType || videoType,
    category: initialCategoryId,
    status: video?.status || 'DRAFT'
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const activeCategories = (categories || []).filter(c => c.isActive !== false);
  const mainCategories = activeCategories.filter(c => !c.parent);
  const sectionsOf = (parentId) => activeCategories.filter(c => c.parent === parentId);

  const previewId = extractYoutubeId(form.youtubeUrl);

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required.';
    else if (form.title.trim().length > 200) next.title = 'Title must be 200 characters or fewer.';
    if (!form.youtubeUrl.trim()) next.youtubeUrl = 'YouTube URL is required.';
    else if (!YOUTUBE_URL_RE.test(form.youtubeUrl.trim())) next.youtubeUrl = 'Must be a valid youtube.com or youtu.be URL.';
    else if (!extractYoutubeId(form.youtubeUrl)) next.youtubeUrl = 'Could not find a video ID in this URL — check the link.';
    if (!form.category) next.category = 'Please choose a category.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (saving || !validate()) return;
    const payload = {
      title: form.title.trim(),
      youtubeUrl: form.youtubeUrl.trim(),
      altText: form.altText.trim(),
      videoType: form.videoType,
      category: form.category,
      status: form.status
    };
    setSaving(true);
    try {
      if (isEdit) {
        await updateVideo(video._id, payload);
        showToast?.('Video updated successfully.', 'success');
      } else {
        await createVideo(payload);
        showToast?.(form.status === 'PUBLISHED' ? 'Video added & published.' : 'Video saved as draft.', 'success');
      }
      onSaved?.();
    } catch (err) {
      showToast?.(errOf(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const fieldCls = (bad) =>
    `w-full bg-slate-50 dark:bg-slate-950 border ${bad ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} focus:border-red-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full">

        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Youtube className="w-4 h-4 text-red-600" />
            {isEdit ? 'Edit Video' : form.videoType === 'SHORT' ? 'Add YouTube Short' : 'Add YouTube Video'}
          </h3>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">

          {/* Live thumbnail preview */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 h-40 flex items-center justify-center">
            {previewId ? (
              <img src={youtubeThumbUrl(previewId)} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="text-xs text-slate-400 flex flex-col items-center gap-2">
                <ImageIcon className="w-7 h-7" />
                <span>Paste a YouTube link to preview the thumbnail</span>
              </div>
            )}
            <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow">
              {form.videoType === 'SHORT' ? 'SHORT' : 'FULL VIDEO'}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Video Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. नागपुर मेट्रो फेज़ 2 की नई तस्वीरें..."
              maxLength={200}
              className={fieldCls(errors.title)}
            />
            {errors.title && <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">YouTube URL *</label>
            <input
              type="url"
              value={form.youtubeUrl}
              onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
              placeholder={form.videoType === 'SHORT' ? 'https://youtube.com/shorts/...' : 'https://www.youtube.com/watch?v=...'}
              className={`${fieldCls(errors.youtubeUrl)} font-mono`}
            />
            {errors.youtubeUrl && <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.youtubeUrl}</p>}
            <p className="text-[10px] text-slate-400">Supports watch, youtu.be, /shorts/, /embed/ and /live/ links.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Alt Text (optional)</label>
            <input
              type="text"
              value={form.altText}
              onChange={(e) => setForm({ ...form, altText: e.target.value })}
              placeholder="Describe the video for accessibility / SEO"
              maxLength={300}
              className={fieldCls(false)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Video Type</label>
              <select
                value={form.videoType}
                onChange={(e) => setForm({ ...form, videoType: e.target.value })}
                className={fieldCls(false)}
              >
                <option value="VIDEO">Full Video (16:9)</option>
                <option value="SHORT">Short / Reel (9:16)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={fieldCls(false)}
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published (Live)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={fieldCls(errors.category)}
            >
              <option value="">— Choose category —</option>
              {mainCategories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
              {mainCategories.map(c => (
                sectionsOf(c._id).length > 0 && (
                  <optgroup key={`s-${c._id}`} label={`${c.name} — Sections`}>
                    {sectionsOf(c._id).map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </optgroup>
                )
              ))}
            </select>
            {errors.category && <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.category}</p>}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-lg shadow-red-900/30 flex items-center gap-2 transition active:scale-95 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Video'}
          </button>
        </div>

      </div>
    </div>
  );
}
