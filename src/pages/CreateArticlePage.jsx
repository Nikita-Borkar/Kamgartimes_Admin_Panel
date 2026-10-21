import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Save, PlusCircle, Image as ImageIcon, Volume2, 
  MapPin, Flame, Star, Sparkles, Radio, CheckCircle2, Eye, Tag, Globe
} from 'lucide-react';

export default function CreateArticlePage({ 
  editingArticle, 
  categories, 
  reporters, 
  onSave, 
  onCancel 
}) {
  const activeCategories = (categories || []).filter(c => c.isActive !== false);
  const mainCategories = activeCategories.filter(c => !c.parent);
  const sectionCategories = activeCategories.filter(c => c.parent);

  const initialCategoryId = (() => {
    if (editingArticle?.categoryId) return editingArticle.categoryId;
    const byName = activeCategories.find(c => c.name === editingArticle?.category);
    return byName?._id || mainCategories[0]?._id || '';
  })();

  const initialSubcategoryId = (() => {
    if (editingArticle?.subcategoryId) return editingArticle.subcategoryId;
    const byName = sectionCategories.find(c => c.name === editingArticle?.subcategory);
    return byName?._id || '';
  })();

  const [formData, setFormData] = useState({
    title: editingArticle?.title || '',
    subheadline: editingArticle?.subheadline || '',
    summary: editingArticle?.summary || '',
    content: editingArticle?.content || '',
    category: editingArticle?.category || mainCategories[0]?.name || '',
    categoryId: initialCategoryId,
    subcategoryId: initialSubcategoryId,
    city: editingArticle?.city || 'नागपुर',
    reporter: editingArticle?.reporter || reporters[0]?.name || 'महेंद्र शेंडे',
    status: editingArticle?.status || 'Published',
    isHero: editingArticle?.isHero || false,
    isBreaking: editingArticle?.isBreaking || false,
    isFeatured: editingArticle?.isFeatured || true,
    isTrending: editingArticle?.isTrending || false,
    isLiveBlog: editingArticle?.isLiveBlog || false,
    hasAudio: editingArticle?.hasAudio || false,
    audioUrl: editingArticle?.audioUrl || '',
    image: editingArticle?.image || editingArticle?.imageUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=1200&q=80',
    imageCaption: editingArticle?.imageCaption || 'कामगार कल्याण योजना कार्यक्रम (सांकेतिक चित्र)',
    tags: Array.isArray(editingArticle?.tags) ? editingArticle.tags.join(', ') : (editingArticle?.tags || 'LaborWage, EPFO, GovtScheme')
  });

  // Default category once real categories finish loading
  useEffect(() => {
    if (!formData.categoryId && mainCategories.length) {
      setFormData(prev => ({
        ...prev,
        categoryId: mainCategories[0]._id,
        category: mainCategories[0].name
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  const sectionsForCategory = activeCategories.filter(c => c.parent === formData.categoryId);
  const selectedCategory = (categories || []).find(c => c._id === formData.categoryId);
  const selectedSection = (categories || []).find(c => c._id === formData.subcategoryId);
  const previewLabel = [selectedCategory?.name, selectedSection?.name].filter(Boolean).join(' › ');

  const handleCategoryChange = (categoryId) => {
    const cat = (categories || []).find(c => c._id === categoryId);
    setFormData(prev => ({
      ...prev,
      categoryId,
      category: cat?.name || '',
      subcategoryId: ''
    }));
  };

  const handleSubmit = (e, targetStatus = null) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const formattedTags = typeof formData.tags === 'string' 
      ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      : formData.tags;

    onSave({
      ...editingArticle,
      ...formData,
      category: selectedCategory?.name || formData.category || '',
      categorySlug: selectedCategory?.slug || '',
      subcategory: selectedSection?.name || '',
      subcategorySlug: selectedSection?.slug || '',
      status: targetStatus || formData.status,
      tags: formattedTags
    });
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm dark:shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md transition-colors duration-300">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onCancel}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition flex items-center gap-2 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Articles</span>
          </button>

          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-red-600 dark:text-red-500" />
              {editingArticle ? 'Edit Article Editor' : 'Create New News Article'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Publish news stories, upload featured images, audio podcasts & set website placements.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'Draft')}
            className="px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition"
          >
            Save as Draft
          </button>

          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'Published')}
            className="bg-gradient-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-2xl shadow-lg shadow-red-900/30 flex items-center gap-2 transition active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{editingArticle ? 'Save Changes' : 'Publish Now'}</span>
          </button>
        </div>
      </div>

      {/* Main Form Grid */}
      <form onSubmit={(e) => handleSubmit(e)} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Story Content & Media (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Article Title & Subheadline (TEXTAREAS FOR EASY TYPING) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">
            
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Article Headline (समाचार का मुख्य शीर्षक)*
              </label>
              <textarea
                rows="2"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. न्यूनतम वेतन अधिनियम 2026: कामगारों के दैनिक भत्ते में 25% बढ़ोतरी की घोषणा..."
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-2xl p-3.5 text-base sm:text-lg font-serif font-bold text-slate-900 dark:text-white placeholder-slate-400 outline-none transition leading-snug"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Subheadline (उप-शीर्षक / Secondary Headline)
              </label>
              <textarea
                rows="2"
                value={formData.subheadline}
                onChange={(e) => setFormData({...formData, subheadline: e.target.value})}
                placeholder="e.g. केंद्रीय श्रम एवं रोजगार मंत्रालय ने असंगठित क्षेत्र के श्रमिकों को दी राहत..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-red-500 rounded-2xl p-3 text-xs text-slate-900 dark:text-white font-serif outline-none leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Article Brief Summary (संक्षिप्त सारांश)
              </label>
              <textarea
                rows="3"
                value={formData.summary}
                onChange={(e) => setFormData({...formData, summary: e.target.value})}
                placeholder="A short 2-line summary displayed on article cards and search results..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-red-500 rounded-2xl p-3 text-xs text-slate-900 dark:text-white font-serif outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Feature Image & Gallery */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-red-500" /> Feature Image & Media Attachment
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Feature Image URL</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Image Caption (चित्र विवरण)</label>
              <textarea
                rows="2"
                value={formData.imageCaption}
                onChange={(e) => setFormData({...formData, imageCaption: e.target.value})}
                placeholder="e.g. निर्माण स्थल पर कार्यरत भारतीय कामगार। (सांकेतिक चित्र)"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none font-serif leading-snug"
              />
            </div>

            {/* Visual Image Preview Box */}
            <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
              <img 
                src={formData.image} 
                alt="Feature Preview" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=1200&q=80';
                }}
              />
              <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 backdrop-blur-md p-3 text-xs text-white flex items-center justify-between">
                <span className="font-serif italic text-slate-300 truncate">{formData.imageCaption || 'Feature Image Preview'}</span>
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow shrink-0">Live Preview</span>
              </div>
            </div>
          </div>

          {/* Full Story Content Textarea */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm dark:shadow-xl space-y-3 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 dark:text-white block">
                Full Article Story (मुख्य समाचार का विस्तृत विवरण)
              </label>
              <span className="text-[11px] text-slate-400">Word Count: {formData.content ? formData.content.trim().split(/\s+/).length : 0} words</span>
            </div>

            <textarea
              rows="12"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="Write full article story details here..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-red-500 rounded-2xl p-4 text-xs sm:text-sm text-slate-900 dark:text-white font-serif outline-none leading-relaxed"
            />
          </div>

          {/* Audio Podcast Option */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Audio Podcast Attachment</h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.hasAudio} 
                  onChange={(e) => setFormData({...formData, hasAudio: e.target.checked})}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {formData.hasAudio && (
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Audio File MP3 URL</label>
                <input
                  type="url"
                  value={formData.audioUrl}
                  onChange={(e) => setFormData({...formData, audioUrl: e.target.value})}
                  placeholder="https://example.com/audio/podcast.mp3"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none font-mono"
                />
              </div>
            )}
          </div>

        </div>

        {/* Right Sidebar: Categories, Placements & Meta (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Article Settings & Author Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
              Publishing Meta
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Publication Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-red-500 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none"
              >
                <option value="Published">Published (Live on Website)</option>
                <option value="Pending">Pending Editorial Review</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">News Category (Navigation)</label>
              <select
                value={formData.categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-red-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
              >
                {mainCategories.length === 0 && <option value="">No categories available</option>}
                {mainCategories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Section / Subcategory (optional)</label>
              <select
                value={formData.subcategoryId || ''}
                onChange={(e) => setFormData({...formData, subcategoryId: e.target.value})}
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
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Reporter / Author</label>
              <select
                value={formData.reporter}
                onChange={(e) => setFormData({...formData, reporter: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-red-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
              >
                {reporters.map(r => (
                  <option key={r.id} value={r.name}>{r.name} ({r.location})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">City Location</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-red-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
              >
                {["नागपुर", "मुंबई", "दिल्ली", "लखनऊ", "पटना", "भोपाल", "इंदौर", "जयपुर", "रांची", "रायपुर"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Website Display Flags Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm dark:shadow-xl space-y-3 transition-colors duration-300">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
              Website Display Placements
            </h3>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-red-500/40 transition">
                <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> 🌟 Hero Banner (मुख्य हीरो)
                </span>
                <input
                  type="checkbox"
                  checked={formData.isHero}
                  onChange={(e) => setFormData({...formData, isHero: e.target.checked})}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-red-500/40 transition">
                <span className="text-xs font-bold text-red-500 flex items-center gap-1.5">
                  <Flame className="w-4 h-4" /> 🔥 Breaking News
                </span>
                <input
                  type="checkbox"
                  checked={formData.isBreaking}
                  onChange={(e) => setFormData({...formData, isBreaking: e.target.checked})}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-amber-500/40 transition">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Star className="w-4 h-4" /> ⭐ Featured Story
                </span>
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-purple-500/40 transition">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <Radio className="w-4 h-4" /> 🔴 Live Blog Event
                </span>
                <input
                  type="checkbox"
                  checked={formData.isLiveBlog}
                  onChange={(e) => setFormData({...formData, isLiveBlog: e.target.checked})}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
              </label>
            </div>
          </div>

          {/* Tags & Keywords Card (TEXTAREA) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm dark:shadow-xl space-y-3 transition-colors duration-300">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-amber-500" /> Tags & Keywords
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Comma Separated Tags</label>
              <textarea
                rows="2"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                placeholder="LaborWage, EPFO, MaharashtraNews"
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
              <div className="relative h-32 rounded-xl overflow-hidden bg-slate-900">
                <img src={formData.image} alt="" className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow">
                  {previewLabel || 'Category'}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white font-serif line-clamp-2 leading-snug">
                {formData.title || 'Article Title Preview...'}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{formData.reporter} • {formData.city}</p>
            </div>
          </div>

        </div>

      </form>

    </div>
  );
}
