import React, { useState } from 'react';
import { Layers, PlusCircle, Edit3, Trash2, Tag, CheckCircle2 } from 'lucide-react';

export default function CategoryManagementPage({ 
  categories, 
  onAddCategory, 
  onDeleteCategory 
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [color, setColor] = useState('bg-red-500');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddCategory({
      id: Date.now(),
      name: name.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/\s+/g, '-'),
      count: 0,
      color: color
    });

    setName('');
    setSlug('');
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Layers className="w-6 h-6 text-red-500" />
          News Categories Manager
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage website navigation categories, menu order and category colors.
        </p>
      </div>

      {/* Add Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-amber-500" /> Add New Category
        </h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          
          <div className="sm:col-span-5 space-y-1">
            <label className="text-xs font-bold text-slate-300">Category Name*</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Labor Safety"
              required
              className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
            />
          </div>

          <div className="sm:col-span-4 space-y-1">
            <label className="text-xs font-bold text-slate-300">Slug / URL Identifier</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="labor-safety"
              className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

        </form>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg flex items-center justify-between hover:border-slate-700 transition">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-10 rounded-full ${cat.color || 'bg-red-500'}`} />
              <div>
                <h4 className="text-sm font-bold text-white">{cat.name}</h4>
                <p className="text-[10px] text-slate-400">/{cat.slug} • {cat.count} Articles</p>
              </div>
            </div>

            <button
              onClick={() => onDeleteCategory(cat.id)}
              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
              title="Delete Category"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
