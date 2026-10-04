import React, { useState } from 'react';
import { Settings, Save, Globe, Share2, Shield, Radio, CheckCircle2, Server } from 'lucide-react';

export default function SettingsPage({ settings, onSaveSettings }) {
  const [formData, setFormData] = useState(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-red-500" />
            Site Settings & API Configuration
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure website brand profile, social media channels, SEO meta and Node.js REST API endpoints.
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Settings Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* General Site Config */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-red-500" /> Website Profile & Branding
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Portal Name</label>
              <input
                type="text"
                value={formData.siteName}
                onChange={(e) => setFormData({...formData, siteName: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white font-serif outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tagline / Slogan</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white font-serif outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Official Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Breaking News Scroll Speed (Seconds)</label>
              <input
                type="number"
                value={formData.breakingNewsScrollSpeed}
                onChange={(e) => setFormData({...formData, breakingNewsScrollSpeed: parseInt(e.target.value) || 15})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Backend API Configuration */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-amber-500" /> Node.js / Express Backend API Endpoints
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Node.js REST API Base URL</label>
            <input
              type="text"
              value={formData.apiBackendUrl}
              onChange={(e) => setFormData({...formData, apiBackendUrl: e.target.value})}
              placeholder="http://localhost:5000/api/v1"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-amber-400 font-mono outline-none"
            />
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Set base URL to connect Node.js / Express APIs.</p>
          </div>
        </div>

        {/* Social Media Handles */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-500" /> Social Media & WhatsApp Channels
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">WhatsApp News Channel Link</label>
              <input
                type="url"
                value={formData.whatsappGroup}
                onChange={(e) => setFormData({...formData, whatsappGroup: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">YouTube Channel Link</label>
              <input
                type="url"
                value={formData.youtubeChannel || ''}
                onChange={(e) => setFormData({...formData, youtubeChannel: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Telegram Channel Link</label>
              <input
                type="url"
                value={formData.telegramChannel || ''}
                onChange={(e) => setFormData({...formData, telegramChannel: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Widgets Configuration (Weather & Stocks) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-500" /> Widgets Settings (Weather & Stocks)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Default Weather City</label>
              <input
                type="text"
                value={formData.weatherCity || 'Nagpur'}
                onChange={(e) => setFormData({...formData, weatherCity: e.target.value})}
                placeholder="e.g. Nagpur"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Weather API Key (OpenWeatherMap)</label>
              <input
                type="password"
                value={formData.weatherApiKey || ''}
                onChange={(e) => setFormData({...formData, weatherApiKey: e.target.value})}
                placeholder="Enter API Key"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Live Stock Symbols (Comma Separated)</label>
              <input
                type="text"
                value={formData.stockSymbols || 'RELIANCE.NS, TCS.NS, INFY.NS'}
                onChange={(e) => setFormData({...formData, stockSymbols: e.target.value})}
                placeholder="e.g. RELIANCE.NS, TCS.NS"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white font-mono outline-none"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Symbols used for the Stock Market twin widget.</p>
            </div>
          </div>
        </div>

        {/* Maintenance Toggle */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Maintenance Mode</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Enabling this will temporarily display an 'Under Maintenance' page to public visitors.</p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={formData.maintenanceMode} 
              onChange={(e) => setFormData({...formData, maintenanceMode: e.target.checked})}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-slate-300 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>

      </form>

    </div>
  );
}
