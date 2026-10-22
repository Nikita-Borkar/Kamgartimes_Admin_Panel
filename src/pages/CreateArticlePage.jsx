import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  ArrowLeft, PlusCircle, Image as ImageIcon, Eye, Globe,
  CheckCircle2, Loader2, Upload, AlertCircle, SearchCheck, User
} from 'lucide-react';
import { createArticle, updateArticle, updateArticleStatus, uploadArticleImage } from '../api/articles';

/* --------------------------- rich text config ----------------------------- */

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, 4, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '1' }],
    ['blockquote', 'code-block'],
    ['link'],
    [{ color: [] }, { background: [] }],
    ['clean']
  ]
};

const QUILL_FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent', 'blockquote', 'code-block',
  'link', 'color', 'background'
];

/* --------------------------- helpers -------------------------------------- */

const errOf = (e) => e?.message || 'Something went wrong. Please try again.';
const stripHtml = (html) => (html || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();
const splitKeywords = (s) => (s || '').split(',').map(k => k.trim()).filter(Boolean);

export default function CreateArticlePage({
  editingArticle,
  categories,
  showToast,
  onSaved,
  onCancel
}) {
  const activeCategories = (categories || []).filter(c => c.isActive !== false);
  const mainCategories = activeCategories.filter(c => !c.parent);
  const sectionCategories = activeCategories.filter(c => c.parent);

  // Resolve the stored category ref (populated object or plain id) into the
  // category/section cascade. A stored ref pointing at a child category means
  // the article was filed under that section.
  const resolveInitial = () => {
    const catRef = editingArticle?.category;
    const catId = typeof catRef === 'object' && catRef?._id ? catRef._id : (catRef || '');
    const catObj = activeCategories.find(c => c._id === catId);
    const parentId = catObj && catObj.parent
      ? (typeof catObj.parent === 'object' ? catObj.parent._id : catObj.parent)
      : null;
    if (parentId) return { categoryId: parentId, subcategoryId: catId };
    return { categoryId: catId, subcategoryId: '' };
  };

  const initial = resolveInitial();

  const [formData, setFormData] = useState({
    title: editingArticle?.title || '',
    slug: editingArticle?.slug || '',
    summary: editingArticle?.summary || '',
    content: editingArticle?.content || '',
    categoryId: initial.categoryId,
    subcategoryId: initial.subcategoryId,
    featuredImage: editingArticle?.featuredImage || '',
    metaTitle: editingArticle?.seo?.metaTitle || '',
    metaDescription: editingArticle?.seo?.metaDescription || '',
    keywords: Array.isArray(editingArticle?.seo?.keywords) ? editingArticle.seo.keywords.join(', ') : ''
  });

  const currentStatus = editingArticle?.status || 'DRAFT';
  const isPublishedEdit = Boolean(editingArticle) && currentStatus === 'PUBLISHED';

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // Default category once real categories finish loading
  useEffect(() => {
    if (!formData.categoryId && mainCategories.length) {
      setFormData(prev => ({ ...prev, categoryId: mainCategories[0]._id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  const sectionsForCategory = activeCategories.filter(c => c.parent === formData.categoryId);
  const selectedCategory = activeCategories.find(c => c._id === formData.categoryId);
  const selectedSection = activeCategories.find(c => c._id === formData.subcategoryId);
  const previewLabel = [selectedCategory?.name, selectedSection?.name].filter(Boolean).join(' › ');
  const wordCount = stripHtml(formData.content) ? stripHtml(formData.content).split(/\s+/).length : 0;

  const handleCategoryChange = (categoryId) => {
    setFormData(prev => ({ ...prev, categoryId, subcategoryId: '' }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast?.('Please choose an image file.', 'error');
      return;
    }
    setUploadingImage(true);
    try {
      const url = await uploadArticleImage(file, {
        title: (formData.title || file.name).slice(0, 100),
        altText: (formData.title || '').slice(0, 300)
      });
      if (!url) throw new Error('Upload did not return an image URL.');
      setFormData(prev => ({ ...prev, featuredImage: url }));
      showToast?.('Featured image uploaded to media library.', 'success');
    } catch (err) {
      showToast?.(errOf(err), 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const validate = () => {
    const next = {};
    if (!formData.title.trim()) next.title = 'Headline is required.';
    else if (formData.title.trim().length > 250) next.title = 'Headline must be 250 characters or fewer.';
    if (!formData.summary.trim()) next.summary = 'Summary is required (shown on cards & search results).';
    else if (formData.summary.trim().length > 500) next.summary = 'Summary must be 500 characters or fewer.';
    if (!stripHtml(formData.content)) next.content = 'Article body cannot be empty.';
    if (!formData.subcategoryId && !formData.categoryId) next.category = 'Please choose a category.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async (targetStatus) => {
    if (saving) return;
    if (!validate()) {
      showToast?.('Please fix the highlighted fields before saving.', 'error');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim() || undefined,
      summary: formData.summary.trim(),
      content: formData.content,
      category: formData.subcategoryId || formData.categoryId,
      featuredImage: formData.featuredImage.trim(),
      seo: {
        metaTitle: formData.metaTitle.trim(),
        metaDescription: formData.metaDescription.trim(),
        keywords: splitKeywords(formData.keywords)
      }
    };

    setSaving(true);
    try {
      let savedId = editingArticle?._id || null;
      if (savedId) {
        await updateArticle(savedId, payload);
        if (targetStatus !== currentStatus) {
          await updateArticleStatus(savedId, targetStatus);
        }
        showToast?.(targetStatus === 'PUBLISHED' ? 'Article updated & published.' : 'Article saved as draft.', 'success');
      } else {
        const created = await createArticle(payload);
        savedId = created?._id;
        if (targetStatus === 'PUBLISHED' && savedId) {
          await updateArticleStatus(savedId, 'PUBLISHED');
        }
        showToast?.(targetStatus === 'PUBLISHED' ? 'New article published successfully!' : 'Article saved as draft.', 'success');
      }
      onSaved?.();
    } catch (err) {
      showToast?.(errOf(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">

      {/* Top Header Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm dark:shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md transition-colors duration-300">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition flex items-center gap-2 text-xs font-bold disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Articles</span>
          </button>

          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-red-600 dark:text-red-500" />
              {editingArticle ? 'Edit Article' : 'Create New News Article'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Write the story with the rich text editor, attach a featured image and publish to the website.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {isPublishedEdit ? (
            <button
              type="button"
              onClick={() => save('DRAFT')}
              disabled={saving}
              className="px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition disabled:opacity-50"
            >
              Save &amp; Unpublish
            </button>
          ) : (
            <button
              type="button"
              onClick={() => save('DRAFT')}
              disabled={saving}
              className="px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition disabled:opacity-50"
            >
              Save as Draft
            </button>
          )}

          <button
            type="button"
            onClick={() => save('PUBLISHED')}
            disabled={saving}
            className="bg-gradient-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-2xl shadow-lg shadow-red-900/30 flex items-center gap-2 transition active:scale-95 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>
              {saving ? 'Saving...'
                : editingArticle ? (isPublishedEdit ? 'Save Changes' : 'Save & Publish')
                : 'Publish Now'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Form Grid */}
      <form onSubmit={(e) => { e.preventDefault(); save('PUBLISHED'); }} className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Story Content & Media (8 cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Headline + Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Article Headline (समाचार का मुख्य शीर्षक)*
              </label>
              <textarea
                rows="2"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. न्यूनतम वेतन अधिनियम 2026: कामगारों के दैनिक भत्ते में 25% बढ़ोतरी की घोषणा..."
                className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.title ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-2xl p-3.5 text-base sm:text-lg font-serif font-bold text-slate-900 dark:text-white placeholder-slate-400 outline-none transition leading-snug`}
              />
              {errors.title && (
                <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.title}</p>
              )}
              <p className="text-[10px] text-slate-400 text-right">{formData.title.length}/250</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Article Brief Summary (संक्षिप्त सारांश)*
              </label>
              <textarea
                rows="3"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="A short 2-line summary displayed on article cards and search results..."
                className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.summary ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} focus:border-red-500 rounded-2xl p-3 text-xs text-slate-900 dark:text-white font-serif outline-none leading-relaxed`}
              />
              {errors.summary && (
                <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.summary}</p>
              )}
              <p className="text-[10px] text-slate-400 text-right">{formData.summary.length}/500</p>
            </div>
          </div>

          {/* Feature Image */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-red-500" /> Feature Image
              </h3>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="px-4 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-2 transition disabled:opacity-50"
              >
                {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {uploadingImage ? 'Uploading...' : 'Upload from Device'}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Feature Image URL</label>
              <input
                type="url"
                value={formData.featuredImage}
                onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                placeholder="https://res.cloudinary.com/... or paste any image URL"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>

            {/* Visual Image Preview Box */}
            <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
              {formData.featuredImage ? (
                <img
                  src={formData.featuredImage}
                  alt="Feature Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="text-xs text-slate-400 flex flex-col items-center gap-2">
                  <ImageIcon className="w-8 h-8" />
                  <span>No feature image yet — upload or paste a URL</span>
                </div>
              )}
              <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 backdrop-blur-md p-3 text-xs text-white flex items-center justify-between">
                <span className="font-serif italic text-slate-300 truncate">Feature Image Preview</span>
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow shrink-0">Live Preview</span>
              </div>
            </div>
          </div>

          {/* Full Story Content — Rich Text Editor */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm dark:shadow-xl space-y-3 transition-colors duration-300">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <label className="text-sm font-bold text-slate-900 dark:text-white block">
                Full Article Story (मुख्य समाचार का विस्तृत विवरण)*
              </label>
              <span className="text-[11px] text-slate-400">Word Count: {wordCount} words</span>
            </div>

            <div className={errors.content ? 'ring-1 ring-red-500 rounded-2xl' : ''}>
              <div className="bg-white rounded-xl overflow-hidden
                [&_.ql-toolbar]:rounded-t-xl [&_.ql-toolbar]:border-slate-700
                [&_.ql-container]:rounded-b-xl [&_.ql-container]:border-slate-700
                [&_.ql-editor]:min-h-[320px] [&_.ql-editor]:text-sm [&_.ql-editor]:text-slate-800">
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={(v) => setFormData(prev => ({ ...prev, content: v }))}
                  modules={QUILL_MODULES}
                  formats={QUILL_FORMATS}
                  placeholder="Write the full story here — headings, paragraphs, lists, links, bold/italic..."
                />
              </div>
            </div>
            {errors.content && (
              <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.content}</p>
            )}
          </div>

        </div>

        {/* Right Sidebar: Categories, Meta & Preview (4 cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Publishing Meta Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
              Publishing Meta
            </h3>

            {editingArticle && (
              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Current Status</span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
                  currentStatus === 'PUBLISHED'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${currentStatus === 'PUBLISHED' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                  {currentStatus === 'PUBLISHED' ? 'Published (Live)' : 'Draft'}
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">News Category (Navigation)*</label>
              <select
                value={formData.categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.category ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} focus:border-red-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none`}
              >
                {mainCategories.length === 0 && <option value="">No categories available</option>}
                {mainCategories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.category}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Section / Subcategory (optional)</label>
              <select
                value={formData.subcategoryId || ''}
                onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-red-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
              >
                <option value="">— No Section —</option>
                {sectionsForCategory.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              {sectionsForCategory.length === 0 && formData.categoryId && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400">No sections under this category yet — manage them in Categories &amp; Subcategories.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">URL Slug (optional)</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="auto-generated from headline if left empty"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-red-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-mono outline-none"
              />
            </div>

            <div className="flex items-start gap-2 p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
              <User className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                The article author is automatically set to your account ({editingArticle?.author?.name || 'you'}).
              </p>
            </div>
          </div>

          {/* SEO Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm dark:shadow-xl space-y-3 transition-colors duration-300">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-1.5">
              <SearchCheck className="w-4 h-4 text-amber-500" /> SEO &amp; Meta
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Meta Title</label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                placeholder="Search engine title (defaults to headline)"
                maxLength={250}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-red-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Meta Description</label>
              <textarea
                rows="2"
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                placeholder="Short description for search results..."
                maxLength={300}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-red-500 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Keywords (comma separated)</label>
              <textarea
                rows="2"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="कामगार, वेतन, EPFO"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white font-mono outline-none"
              />
            </div>
          </div>

          {/* Live Card Preview Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm dark:shadow-xl space-y-3 transition-colors duration-300">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-red-500" /> Live Website Card Preview
            </h3>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 space-y-2">
              <div className="relative h-32 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-900 flex items-center justify-center">
                {formData.featuredImage ? (
                  <img src={formData.featuredImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                )}
                <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow">
                  {previewLabel || 'Category'}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white font-serif line-clamp-2 leading-snug">
                {formData.title || 'Article Title Preview...'}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                {formData.summary || 'Summary preview...'}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <Globe className="w-3 h-3" />
                <span className="font-mono truncate">/{formData.slug || 'auto-slug'}</span>
              </div>
            </div>
          </div>

        </div>

      </form>

    </div>
  );
}
