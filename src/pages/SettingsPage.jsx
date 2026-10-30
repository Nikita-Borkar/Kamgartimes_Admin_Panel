import React, { useState, useEffect } from 'react';
import {
  Settings, Image as ImageIcon, Globe, Share2, Loader2, Save, AlertCircle,
  CheckCircle2, PlusCircle, Trash2, Wrench, Youtube, Facebook, Instagram,
  MessageCircle, Twitter, Send
} from 'lucide-react';
import { hasPermission } from '../utils/permissions';
import {
  fetchSiteSetting, updateSiteSetting, uploadSiteLogo, SOCIAL_PLATFORMS
} from '../api/siteSettings';

const PLATFORM_META = {
  youtube: { label: 'YouTube', icon: Youtube, color: 'text-red-400' },
  facebook: { label: 'Facebook', icon: Facebook, color: 'text-blue-400' },
  instagram: { label: 'Instagram', icon: Instagram, color: 'text-pink-400' },
  whatsapp: { label: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-400' },
  twitter: { label: 'X / Twitter', icon: Twitter, color: 'text-slate-300' },
  telegram: { label: 'Telegram', icon: Send, color: 'text-sky-400' }
};

const EMPTY_FORM = {
  siteName: '',
  tagline: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
  isMaintenanceMode: false
};

export default function SettingsPage({ user, showToast }) {
  const canRead = hasPermission(user, 'setting:read');
  const canUpdate = hasPermission(user, 'setting:update');

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [socialLinks, setSocialLinks] = useState([]);
  const [logoLightUrl, setLogoLightUrl] = useState('');
  const [logoDarkUrl, setLogoDarkUrl] = useState('');
  const [logoLightFile, setLogoLightFile] = useState(null);
  const [logoDarkFile, setLogoDarkFile] = useState(null);
  const [logoLightPreview, setLogoLightPreview] = useState('');
  const [logoDarkPreview, setLogoDarkPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [savedTick, setSavedTick] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const s = await fetchSiteSetting();
      setForm({
        siteName: s?.siteName || '',
        tagline: s?.tagline || '',
        contactEmail: s?.contactEmail || '',
        contactPhone: s?.contactPhone || '',
        address: s?.address || '',
        isMaintenanceMode: !!s?.isMaintenanceMode
      });
      setSocialLinks((s?.socialLinks || []).map(l => ({ platform: l.platform, url: l.url })));
      setLogoLightUrl(s?.logoLightUrl || s?.logoUrl || '');
      setLogoDarkUrl(s?.logoDarkUrl || '');
    } catch (err) {
      setFormError(err?.message || 'Could not load site settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canRead) load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRead]);

  useEffect(() => {
    if (!logoLightFile) {
      setLogoLightPreview('');
      return undefined;
    }
    const previewUrl = URL.createObjectURL(logoLightFile);
    setLogoLightPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [logoLightFile]);

  useEffect(() => {
    if (!logoDarkFile) {
      setLogoDarkPreview('');
      return undefined;
    }
    const previewUrl = URL.createObjectURL(logoDarkFile);
    setLogoDarkPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [logoDarkFile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.siteName.trim()) {
      setFormError('Site name is required.');
      return;
    }
    const badLink = socialLinks.find(l => !l.platform.trim() || !l.url.trim() || !/^https?:\/\/\S+$/i.test(l.url.trim()));
    if (badLink) {
      setFormError(`Enter a platform name and a valid http(s):// URL for each social link.`);
      return;
    }

    setSaving(true);
    try {
      // Step 1: all scalar + social fields as JSON.
      // Send the current scalar values with each settings update; blank email is allowed.
      await updateSiteSetting({
        siteName: form.siteName.trim(),
        tagline: form.tagline,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        address: form.address,
        isMaintenanceMode: form.isMaintenanceMode,
        socialLinks: socialLinks.map(l => ({ platform: l.platform.trim().toLowerCase(), url: l.url.trim(), icon: '' }))
      });

      // Upload each selected theme logo separately so either variant can be
      // replaced without changing the other one.
      if (logoLightFile) {
        const updated = await uploadSiteLogo(logoLightFile, 'light');
        setLogoLightUrl(updated?.logoLightUrl || updated?.logoUrl || logoLightUrl);
        setLogoLightFile(null);
      }
      if (logoDarkFile) {
        const updated = await uploadSiteLogo(logoDarkFile, 'dark');
        setLogoDarkUrl(updated?.logoDarkUrl || logoDarkUrl);
        setLogoDarkFile(null);
      }

      showToast('Site settings saved!', 'success');
      window.dispatchEvent(new Event('site-settings-updated'));
      setSavedTick(true);
      setTimeout(() => setSavedTick(false), 3000);
    } catch (err) {
      setFormError(err?.message || 'Failed to save site settings.');
    } finally {
      setSaving(false);
    }
  };

  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const updateLink = (idx, patch) =>
    setSocialLinks(links => links.map((l, i) => (i === idx ? { ...l, ...patch } : l)));

  const addLink = () =>
    setSocialLinks(links => [...links, {
      platform: SOCIAL_PLATFORMS.find(p => !links.some(l => l.platform === p)) || '',
      url: ''
    }]);

  const removeLink = (idx) => setSocialLinks(links => links.filter((_, i) => i !== idx));

  if (!canRead) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-xs text-slate-400 gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-red-500" /> Loading site settings...
      </div>
    );
  }

  const inputCls = 'w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-xs text-white outline-none disabled:opacity-50';

  return (
    <form onSubmit={handleSave} className="space-y-6">

      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-500" />
            Site Settings &amp; Branding
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Logo, tagline, contact details and social links — served to the reader site via the public site-setting API.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {savedTick && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
            </span>
          )}
          {form.isMaintenanceMode && (
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5" /> Maintenance On
            </span>
          )}
        </div>
      </div>

      {formError && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" /><span>{formError}</span>
        </div>
      )}

      {/* ============================ Branding ============================ */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-amber-500" /> Logo &amp; Branding
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Light Theme Logo</label>
            <div className="bg-slate-950/70 border border-dashed border-slate-700 rounded-2xl p-4 flex flex-col items-center gap-3">
              <div className="h-20 w-full rounded-xl bg-white flex items-center justify-center overflow-hidden p-2">
                {(logoLightPreview || logoLightUrl) ? (
                  <img src={logoLightPreview || logoLightUrl} alt="Light theme site logo preview" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">No logo</span>
                )}
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                disabled={!canUpdate}
                onChange={(e) => setLogoLightFile(e.target.files?.[0] || null)}
                className="w-full text-[10px] text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-red-600 file:text-white file:text-[10px] file:font-bold hover:file:bg-red-500 cursor-pointer bg-slate-950 border border-slate-700 rounded-xl p-1.5 disabled:opacity-50"
              />
              <p className="text-[10px] text-slate-500 text-center">
                {logoLightFile ? 'Save settings to upload this logo.' : 'Shown on light backgrounds.'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Dark Theme Logo</label>
            <div className="bg-slate-950/70 border border-dashed border-slate-700 rounded-2xl p-4 flex flex-col items-center gap-3">
              <div className="h-20 w-full rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden p-2">
                {(logoDarkPreview || logoDarkUrl || logoLightUrl) ? (
                  <img src={logoDarkPreview || logoDarkUrl || logoLightUrl} alt="Dark theme site logo preview" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">No logo</span>
                )}
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                disabled={!canUpdate}
                onChange={(e) => setLogoDarkFile(e.target.files?.[0] || null)}
                className="w-full text-[10px] text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-red-600 file:text-white file:text-[10px] file:font-bold hover:file:bg-red-500 cursor-pointer bg-slate-950 border border-slate-700 rounded-xl p-1.5 disabled:opacity-50"
              />
              <p className="text-[10px] text-slate-500 text-center">
                {logoDarkFile ? 'Save settings to upload this logo.' : logoDarkUrl ? 'Shown on dark backgrounds.' : 'Uses the light logo until you upload one.'}
              </p>
            </div>
          </div>

          <div className="sm:col-span-2 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Site Name*</label>
              <input
                type="text" maxLength={100} value={form.siteName} disabled={!canUpdate}
                onChange={(e) => setField('siteName', e.target.value)}
                placeholder="e.g. कामगार टाइम्स (Kamgar Times)"
                className={inputCls}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Tagline</span>
                <span className="text-[10px] text-slate-500 font-normal">{form.tagline.length}/200</span>
              </label>
              <input
                type="text" maxLength={200} value={form.tagline} disabled={!canUpdate}
                onChange={(e) => setField('tagline', e.target.value)}
                placeholder="e.g. जनसामान्यांचा बुलंद आवाज..."
                className={inputCls}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============================ Contact ============================ */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-amber-500" /> Contact Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Contact Email</label>
            <input
              type="email" value={form.contactEmail} disabled={!canUpdate}
              onChange={(e) => setField('contactEmail', e.target.value)}
              placeholder="admin@example.com"
              className={inputCls}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Contact Phone</label>
            <input
              type="text" value={form.contactPhone} disabled={!canUpdate}
              onChange={(e) => setField('contactPhone', e.target.value)}
              placeholder="+91 98765 43210"
              className={inputCls}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Address</label>
            <input
              type="text" value={form.address} disabled={!canUpdate}
              onChange={(e) => setField('address', e.target.value)}
              placeholder="Office address..."
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* ========================== Social Links ========================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-500" /> Social Media Links
          </h3>
          <button
            type="button" onClick={addLink} disabled={!canUpdate}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-950 border border-slate-700 text-slate-300 hover:text-white hover:border-red-500/50 transition flex items-center gap-1.5 disabled:opacity-40"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Add Link
          </button>
        </div>
        <datalist id="social-platform-suggestions">
          {SOCIAL_PLATFORMS.map(platform => (
            <option key={platform} value={platform} />
          ))}
        </datalist>

        {socialLinks.length === 0 ? (
          <p className="text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl py-6 text-center">
            No social links yet. Add a suggested platform or enter a custom platform name and URL.
          </p>
        ) : (
          <div className="space-y-2">
            {socialLinks.map((link, idx) => {
              const meta = PLATFORM_META[link.platform] || {
                label: link.platform || 'Custom platform',
                icon: Share2,
                color: 'text-slate-400'
              };
              const Icon = meta.icon;
              return (
                <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center gap-3">
                  <span className={`shrink-0 ${meta.color}`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    list="social-platform-suggestions"
                    maxLength={50}
                    value={link.platform}
                    disabled={!canUpdate}
                    onChange={(e) => updateLink(idx, { platform: e.target.value })}
                    placeholder="Platform name"
                    aria-label={`Platform name for social link ${idx + 1}`}
                    className="bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white outline-none disabled:opacity-50 w-40"
                  />
                  <input
                    type="url" value={link.url} disabled={!canUpdate}
                    onChange={(e) => updateLink(idx, { url: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 min-w-[200px] bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none disabled:opacity-50"
                  />
                  <button
                    type="button" onClick={() => removeLink(idx)} disabled={!canUpdate}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-40"
                    title="Remove link"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================= Maintenance ========================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <label className="flex items-start justify-between gap-4 cursor-pointer">
          <div className="flex items-start gap-3 min-w-0">
            <Wrench className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">Maintenance Mode</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                When enabled, the reader site shows a maintenance notice while keeping pages available. Public APIs keep working.
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={form.isMaintenanceMode}
            disabled={!canUpdate}
            onChange={(e) => setField('isMaintenanceMode', e.target.checked)}
            className="sr-only peer"
          />
          <span className="shrink-0 inline-flex h-6 w-11 items-center rounded-full bg-slate-800 border border-slate-700 transition-colors peer-checked:bg-red-600 peer-checked:border-red-500 after:content-[''] after:h-4 after:w-4 after:rounded-full after:bg-slate-400 after:transition-transform after:translate-x-1 peer-checked:after:translate-x-5 peer-checked:after:bg-white peer-disabled:opacity-50" />
        </label>
      </div>

      {/* ============================ Save ============================ */}
      {canUpdate && (
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => { load(); setFormError(''); showToast('Reverted to last saved values.', 'warning'); }}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl text-xs text-slate-300 hover:bg-slate-800 transition disabled:opacity-50"
          >
            Discard changes
          </button>
          <button
            type="submit" disabled={saving}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white shadow-lg transition flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </button>
        </div>
      )}
    </form>
  );
}
