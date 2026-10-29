import React, { useState, useEffect } from 'react';
import {
  Megaphone, PlusCircle, Edit3, Trash2, X, AlertCircle, Loader2,
  CheckCircle2, RotateCcw, MousePointer, LayoutTemplate, Target,
  BarChart3, RefreshCw, Image as ImageIcon, CalendarDays, Search
} from 'lucide-react';
import Pagination from '../components/Pagination';
import { hasPermission } from '../utils/permissions';
import {
  fetchAdSlots, updateAdSlot, deleteAdSlot,
  fetchAdCampaigns, createAdCampaign, updateAdCampaign, deleteAdCampaign,
  fetchAdPlacements, createAdPlacement, updateAdPlacement, deleteAdPlacement,
  fetchAdClickStats
} from '../api/ads';

/* --------------------------------- helpers -------------------------------- */

const campaignStatus = (c) => {
  if (!c.isActive) return { label: 'Paused', cls: 'text-slate-400 bg-slate-800/80 border-slate-700' };
  const now = Date.now();
  if (c.startDate && now < new Date(c.startDate).getTime())
    return { label: 'Scheduled', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
  if (c.endDate && now > new Date(c.endDate).getTime())
    return { label: 'Expired', cls: 'text-red-400 bg-red-500/10 border-red-500/30' };
  return { label: 'Active', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
};

const StatusBadge = ({ status }) => (
  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${status.cls}`}>
    {status.label}
  </span>
);

const ActiveBadge = ({ isActive }) => (
  <StatusBadge
    status={isActive
      ? { label: 'Active', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' }
      : { label: 'Inactive', cls: 'text-slate-400 bg-slate-800/80 border-slate-700' }}
  />
);

const fmtDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
};

const fmtDateTime = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
};

const sizeLabel = (size) => `${size?.width || '?'}x${size?.height || '?'}`;

const errOf = (e) => e?.message || 'Something went wrong. Please try again.';

const TABS = [
  { key: 'slots', label: 'Slots', icon: LayoutTemplate },
  { key: 'campaigns', label: 'Campaigns', icon: ImageIcon },
  { key: 'placements', label: 'Placements', icon: Target },
  { key: 'stats', label: 'Click Stats', icon: BarChart3 },
];

const EMPTY_CAMP_FORM = {
  title: '', clickUrl: '', imageAlt: '', target: '_blank',
  priority: '0', startDate: '', endDate: '', isActive: true
};
const EMPTY_PLACEMENT_FORM = { adSlot: '', adCampaign: '', weight: '1', startDate: '', endDate: '', isActive: true };

export default function AdManagementPage({ user, showToast }) {
  const canCreate = hasPermission(user, 'ad:create');
  const canUpdate = hasPermission(user, 'ad:update');
  const canDelete = hasPermission(user, 'ad:delete');

  const [tab, setTab] = useState('slots');
  const [refreshing, setRefreshing] = useState(false);

  /* ---------------------------------- slots --------------------------------- */
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotEdit, setSlotEdit] = useState(null); // { id, name, form, error, saving }

  /* -------------------------------- campaigns -------------------------------- */
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [campPage, setCampPage] = useState(1);
  const [campLimit, setCampLimit] = useState(10);
  const [campTotal, setCampTotal] = useState(0);
  const [campSearchInput, setCampSearchInput] = useState('');
  const [campSearch, setCampSearch] = useState('');
  const [campForm, setCampForm] = useState(EMPTY_CAMP_FORM);
  const [campFile, setCampFile] = useState(null);
  const [campFormError, setCampFormError] = useState('');
  const [campCreating, setCampCreating] = useState(false);
  const [campEdit, setCampEdit] = useState(null); // { id, title, form, file, currentImage, error, saving }

  /* ------------------------------- placements -------------------------------- */
  const [placements, setPlacements] = useState([]);
  const [placementsLoading, setPlacementsLoading] = useState(true);
  const [plForm, setPlForm] = useState(EMPTY_PLACEMENT_FORM);
  const [plFormError, setPlFormError] = useState('');
  const [plCreating, setPlCreating] = useState(false);
  const [plEdit, setPlEdit] = useState(null); // { id, form, error, saving }

  /* ---------------------------------- stats ---------------------------------- */
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statFrom, setStatFrom] = useState('');
  const [statTo, setStatTo] = useState('');

  /* ----------------------------- delete confirm ------------------------------ */
  const [confirming, setConfirming] = useState(null); // { kind, item, error, deleting }

  /* -------------------------------- loaders ---------------------------------- */
  const loadSlots = async () => {
    setSlotsLoading(true);
    try {
      const data = await fetchAdSlots({ limit: 100 });
      setSlots(data?.slots || []);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const loadCampaigns = async (page = 1, limit = 10, search = campSearch) => {
    setCampaignsLoading(true);
    try {
      const data = await fetchAdCampaigns({ page, limit, search: search || undefined });
      setCampaigns(data?.campaigns || []);
      setCampTotal(data?.total || 0);
    } catch {
      setCampaigns([]);
      setCampTotal(0);
    } finally {
      setCampaignsLoading(false);
    }
  };

  const loadPlacements = async () => {
    setPlacementsLoading(true);
    try {
      const data = await fetchAdPlacements({ limit: 100 });
      setPlacements(data?.placements || []);
    } catch {
      setPlacements([]);
    } finally {
      setPlacementsLoading(false);
    }
  };

  const loadStats = async (from = statFrom, to = statTo) => {
    setStatsLoading(true);
    try {
      const data = await fetchAdClickStats({ from: from || undefined, to: to || undefined });
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
    loadCampaigns(1, campLimit, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tab === 'placements') loadPlacements();
    if (tab === 'stats') loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (tab === 'slots') await loadSlots();
      else if (tab === 'campaigns') await loadCampaigns(campPage, campLimit);
      else if (tab === 'placements') await loadPlacements();
      else await loadStats();
    } finally {
      setRefreshing(false);
    }
  };

  const slotOptions = slots.filter(s => s.isActive);
  const campaignOptions = campaigns.filter(c => c.isActive);

  /* --------------------------------- slots ----------------------------------- */
  const openSlotEdit = (slot) => {
    setSlotEdit({
      id: slot._id,
      name: slot.name,
      error: '',
      saving: false,
      form: {
        name: slot.name || '',
        key: slot.key || '',
        section: slot.section || '',
        width: slot.size?.width ?? '',
        height: slot.size?.height ?? '',
        position: String(slot.position ?? 0),
        maxAds: String(slot.maxAds ?? 1),
        isActive: slot.isActive !== false
      }
    });
  };

  const handleSaveSlotEdit = async () => {
    const { id, form } = slotEdit;
    setSlotEdit(s => ({ ...s, error: '', saving: true }));
    try {
      await updateAdSlot(id, {
        name: form.name.trim(),
        key: form.key.trim(),
        section: form.section.trim(),
        size: { width: Number(form.width), height: Number(form.height) },
        position: Number(form.position) || 0,
        maxAds: Number(form.maxAds) || 1,
        isActive: form.isActive
      });
      showToast(`Slot "${form.name.trim()}" updated successfully!`, 'success');
      setSlotEdit(null);
      await loadSlots();
    } catch (err) {
      setSlotEdit(s => ({ ...s, error: errOf(err), saving: false }));
    }
  };

  const handleSlotToggled = async (slot, nextActive) => {
    const err = await (async () => {
      try {
        await updateAdSlot(slot._id, { isActive: nextActive });
        return null;
      } catch (e) { return errOf(e); }
    })();
    if (err) showToast(err, 'error');
    else {
      showToast(nextActive ? `Slot "${slot.name}" reactivated.` : `Slot "${slot.name}" deactivated.`, nextActive ? 'success' : 'warning');
      await loadSlots();
    }
  };

  /* -------------------------------- campaigns -------------------------------- */
  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    setCampFormError('');
    if (!campForm.title.trim() || !campForm.clickUrl.trim() || !campFile) {
      setCampFormError('Title, click URL and the creative image are required.');
      return;
    }
    setCampCreating(true);
    try {
      const fd = new FormData();
      fd.append('title', campForm.title.trim());
      fd.append('clickUrl', campForm.clickUrl.trim());
      fd.append('image', campFile);
      fd.append('imageAlt', campForm.imageAlt.trim());
      fd.append('target', campForm.target);
      fd.append('priority', campForm.priority || '0');
      fd.append('isActive', String(campForm.isActive));
      fd.append('startDate', campForm.startDate || '');
      fd.append('endDate', campForm.endDate || '');
      await createAdCampaign(fd);
      showToast(`Campaign "${campForm.title.trim()}" uploaded!`, 'success');
      setCampForm(EMPTY_CAMP_FORM);
      setCampFile(null);
      setCampPage(1);
      await loadCampaigns(1, campLimit);
    } catch (err) {
      setCampFormError(errOf(err));
    } finally {
      setCampCreating(false);
    }
  };

  const openCampaignEdit = (c) => {
    setCampEdit({
      id: c._id,
      title: c.title,
      currentImage: c.imageUrl,
      file: null,
      error: '',
      saving: false,
      form: {
        title: c.title || '',
        clickUrl: c.clickUrl || '',
        imageAlt: c.imageAlt || '',
        target: c.target || '_blank',
        priority: String(c.priority ?? 0),
        startDate: c.startDate ? c.startDate.slice(0, 10) : '',
        endDate: c.endDate ? c.endDate.slice(0, 10) : '',
        isActive: c.isActive !== false
      }
    });
  };

  const handleSaveCampaignEdit = async () => {
    const { id, form, file } = campEdit;
    setCampEdit(s => ({ ...s, error: '', saving: true }));
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('clickUrl', form.clickUrl.trim());
      fd.append('imageAlt', form.imageAlt.trim());
      fd.append('target', form.target);
      fd.append('priority', form.priority || '0');
      fd.append('isActive', String(form.isActive));
      fd.append('startDate', form.startDate || '');
      fd.append('endDate', form.endDate || '');
      if (file) fd.append('image', file);
      await updateAdCampaign(id, fd);
      showToast(`Campaign "${form.title.trim()}" updated successfully!`, 'success');
      setCampEdit(null);
      await loadCampaigns(campPage, campLimit);
    } catch (err) {
      setCampEdit(s => ({ ...s, error: errOf(err), saving: false }));
    }
  };

  const handleCampaignToggled = async (c, nextActive) => {
    try {
      const fd = new FormData();
      fd.append('isActive', String(nextActive));
      await updateAdCampaign(c._id, fd);
      showToast(nextActive ? `Campaign "${c.title}" reactivated.` : `Campaign "${c.title}" paused.`, nextActive ? 'success' : 'warning');
      await loadCampaigns(campPage, campLimit);
    } catch (err) {
      showToast(errOf(err), 'error');
    }
  };

  const handleSearchCampaigns = (e) => {
    e.preventDefault();
    setCampSearch(campSearchInput.trim());
    setCampPage(1);
    loadCampaigns(1, campLimit, campSearchInput.trim());
  };

  /* ------------------------------- placements -------------------------------- */
  const handleCreatePlacement = async (e) => {
    e.preventDefault();
    setPlFormError('');
    if (!plForm.adSlot || !plForm.adCampaign) {
      setPlFormError('Select a slot and a campaign.');
      return;
    }
    setPlCreating(true);
    try {
      await createAdPlacement({
        adSlot: plForm.adSlot,
        adCampaign: plForm.adCampaign,
        weight: Number(plForm.weight) || 1,
        startDate: plForm.startDate || null,
        endDate: plForm.endDate || null,
        isActive: plForm.isActive
      });
      showToast('Placement created — the campaign is now live in that slot!', 'success');
      setPlForm(EMPTY_PLACEMENT_FORM);
      await loadPlacements();
    } catch (err) {
      setPlFormError(errOf(err));
    } finally {
      setPlCreating(false);
    }
  };

  const openPlacementEdit = (p) => {
    setPlEdit({
      id: p._id,
      error: '',
      saving: false,
      form: {
        adSlot: p.adSlot?._id || p.adSlot || '',
        adCampaign: p.adCampaign?._id || p.adCampaign || '',
        weight: String(p.weight ?? 1),
        startDate: p.startDate ? p.startDate.slice(0, 10) : '',
        endDate: p.endDate ? p.endDate.slice(0, 10) : '',
        isActive: p.isActive !== false
      }
    });
  };

  const handleSavePlacementEdit = async () => {
    const { id, form } = plEdit;
    setPlEdit(s => ({ ...s, error: '', saving: true }));
    try {
      await updateAdPlacement(id, {
        adSlot: form.adSlot,
        adCampaign: form.adCampaign,
        weight: Number(form.weight) || 1,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        isActive: form.isActive
      });
      showToast('Placement updated successfully!', 'success');
      setPlEdit(null);
      await loadPlacements();
    } catch (err) {
      setPlEdit(s => ({ ...s, error: errOf(err), saving: false }));
    }
  };

  const handlePlacementToggled = async (p, nextActive) => {
    try {
      await updateAdPlacement(p._id, { isActive: nextActive });
      showToast(nextActive ? 'Placement reactivated.' : 'Placement paused.', nextActive ? 'success' : 'warning');
      await loadPlacements();
    } catch (err) {
      showToast(errOf(err), 'error');
    }
  };

  /* ------------------------------ delete confirm ----------------------------- */
  const handleConfirmDelete = async () => {
    const { kind, item } = confirming;
    setConfirming(c => ({ ...c, deleting: true, error: '' }));
    try {
      if (kind === 'slot') {
        await deleteAdSlot(item._id);
        showToast(`Slot "${item.name}" deactivated.`, 'warning');
        await loadSlots();
      } else if (kind === 'campaign') {
        await deleteAdCampaign(item._id);
        showToast(`Campaign "${item.title}" paused.`, 'warning');
        await loadCampaigns(campPage, campLimit);
      } else {
        await deleteAdPlacement(item._id);
        showToast('Placement removed permanently.', 'warning');
        await loadPlacements();
      }
      setConfirming(null);
    } catch (err) {
      setConfirming(c => ({ ...c, deleting: false, error: errOf(err) }));
    }
  };

  /* --------------------------------- render ---------------------------------- */
  const activeCount = campaigns.filter(c => campaignStatus(c).label === 'Active').length;
  const tabBadge = {
    slots: slots.length,
    campaigns: campTotal,
    placements: placements.length,
    stats: stats ? stats.total : '—'
  };

  return (
    <div className="space-y-6">

      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-amber-500" />
            Ad Banners &amp; Monetization Manager
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Slots are the fixed ad positions on the reader site (hero, sidebar, footer — each with a pixel size).
            Campaigns are the creatives, placements assign a campaign to a slot on a schedule.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
            {activeCount} Live Campaign{activeCount === 1 ? '' : 's'}
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60 transition disabled:opacity-50"
            title="Refresh current view"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800/80 flex flex-wrap gap-1.5">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                tab === t.key
                  ? 'bg-red-600/20 border border-red-500/50 text-white'
                  : 'border border-transparent text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {t.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                tab === t.key ? 'bg-red-500/30 text-white' : 'bg-slate-800 text-slate-400'
              }`}>{tabBadge[t.key]}</span>
            </button>
          );
        })}
      </div>

      {/* ================================== SLOTS ================================== */}
      {tab === 'slots' && (
        <>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-400">
            Reader-site ad slots are predefined and maintained by the site configuration. This list shows the available placements and their required creative sizes.
          </div>

          {slotsLoading ? (
            <div className="flex items-center justify-center py-16 text-xs text-slate-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-red-500" /> Loading ad slots...
            </div>
          ) : slots.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl space-y-2">
              <p>No predefined ad slots found. Load the default reader-site slots from the backend:</p>
              <code className="text-[11px] text-amber-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                node src/scripts/seedAdSlots.js
              </code>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="p-3 rounded-l-xl">Slot</th>
                    <th className="p-3">Key</th>
                    <th className="p-3">Section</th>
                    <th className="p-3">Size</th>
                    <th className="p-3">Pos</th>
                    <th className="p-3">Max Ads</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {slots.map(slot => (
                    <tr key={slot._id} className={`hover:bg-slate-800/30 transition ${slot.isActive === false ? 'opacity-55' : ''}`}>
                      <td className="p-3 font-bold text-white">{slot.name}</td>
                      <td className="p-3 font-mono text-amber-400/90">{slot.key}</td>
                      <td className="p-3">
                        <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">{slot.section}</span>
                      </td>
                      <td className="p-3 font-semibold text-amber-500">{sizeLabel(slot.size)}</td>
                      <td className="p-3 text-slate-400">{slot.position}</td>
                      <td className="p-3 text-slate-400">{slot.maxAds}</td>
                      <td className="p-3"><ActiveBadge isActive={slot.isActive !== false} /></td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1">
                          {slot.isActive === false && (
                            <button
                              onClick={() => canUpdate && handleSlotToggled(slot, true)}
                              disabled={!canUpdate}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition disabled:opacity-40"
                              title={canUpdate ? 'Reactivate slot' : 'Requires ad:update permission'}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => canUpdate && openSlotEdit(slot)}
                            disabled={!canUpdate}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition disabled:opacity-40"
                            title={canUpdate ? 'Edit slot' : 'Requires ad:update permission'}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => canDelete && setConfirming({ kind: 'slot', item: slot, error: '', deleting: false })}
                            disabled={!canDelete || slot.isActive === false}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-40"
                            title={canDelete ? 'Deactivate slot' : 'Requires ad:delete permission'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ================================ CAMPAIGNS ================================ */}
      {tab === 'campaigns' && (
        <>
          {canCreate && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-amber-500" /> Upload New Ad Creative
              </h3>
              {campFormError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" /><span>{campFormError}</span>
                </div>
              )}
              <form onSubmit={handleCreateCampaign} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-4 space-y-1">
                  <label className="text-xs font-bold text-slate-300">Campaign Title*</label>
                  <input
                    type="text" value={campForm.title} maxLength={200}
                    onChange={(e) => setCampForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. ई-श्रम कार्ड मुफ्त पंजीकरण अभियान"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div className="sm:col-span-4 space-y-1">
                  <label className="text-xs font-bold text-slate-300">Click URL*</label>
                  <input
                    type="text" value={campForm.clickUrl}
                    onChange={(e) => setCampForm(f => ({ ...f, clickUrl: e.target.value }))}
                    placeholder="https://example.com or /scheme-detail"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-xs font-mono text-white outline-none"
                  />
                  <p className="text-[10px] text-slate-500">Absolute http(s) URL or a reader-site path starting with /</p>
                </div>
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-bold text-slate-300">Creative Image* (PNG/JPG/WebP)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file" accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => setCampFile(e.target.files?.[0] || null)}
                      className="w-full text-[10px] text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-red-600 file:text-white file:text-[10px] file:font-bold hover:file:bg-red-500 cursor-pointer bg-slate-950 border border-slate-700 rounded-xl p-1.5"
                    />
                    {campFile && (
                      <img src={URL.createObjectURL(campFile)} alt="preview" className="w-10 h-10 object-cover rounded-lg border border-slate-700 shrink-0" />
                    )}
                  </div>
                </div>
                <div className="sm:col-span-1">
                  <button
                    type="submit" disabled={campCreating}
                    className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white font-bold text-xs py-2 rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    {campCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                    Upload
                  </button>
                </div>
              </form>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-slate-800/70">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">Alt Text</label>
                  <input
                    type="text" value={campForm.imageAlt} maxLength={300}
                    onChange={(e) => setCampForm(f => ({ ...f, imageAlt: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">Opens In</label>
                  <select
                    value={campForm.target}
                    onChange={(e) => setCampForm(f => ({ ...f, target: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  >
                    <option value="_blank">New Tab (_blank)</option>
                    <option value="_self">Same Tab (_self)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">Priority</label>
                  <input
                    type="number" min={-1000} max={1000} value={campForm.priority}
                    onChange={(e) => setCampForm(f => ({ ...f, priority: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">Start Date</label>
                  <input
                    type="date" value={campForm.startDate}
                    onChange={(e) => setCampForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">End Date</label>
                  <input
                    type="date" value={campForm.endDate}
                    onChange={(e) => setCampForm(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Search + list */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-500" /> Ad Creatives
              </h3>
              <form onSubmit={handleSearchCampaigns} className="flex items-center gap-2">
                <input
                  type="text" value={campSearchInput}
                  onChange={(e) => setCampSearchInput(e.target.value)}
                  placeholder="Search by title..."
                  className="bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none w-48"
                />
                <button type="submit" className="p-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800/60 transition" title="Search">
                  <Search className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {campaignsLoading ? (
              <div className="flex items-center justify-center py-16 text-xs text-slate-400 gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-red-500" /> Loading campaigns...
              </div>
            ) : campaigns.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                {campSearch ? `No campaigns match "${campSearch}".` : 'No campaigns yet — upload your first ad creative from the form above.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="p-3 rounded-l-xl w-14">Img</th>
                      <th className="p-3">Title</th>
                      <th className="p-3">Click URL</th>
                      <th className="p-3">Priority</th>
                      <th className="p-3">Schedule</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right rounded-r-xl">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {campaigns.map(c => {
                      const status = campaignStatus(c);
                      return (
                        <tr key={c._id} className={`hover:bg-slate-800/30 transition ${status.label === 'Active' ? '' : 'opacity-70'}`}>
                          <td className="p-3">
                            <img src={c.imageUrl} alt={c.imageAlt || c.title} className="w-12 h-9 object-cover rounded-lg border border-slate-800 bg-slate-950" />
                          </td>
                          <td className="p-3 font-bold text-white max-w-[240px] truncate" title={c.title}>{c.title}</td>
                          <td className="p-3 font-mono text-amber-400/90 max-w-[180px] truncate" title={c.clickUrl}>{c.clickUrl}</td>
                          <td className="p-3 text-slate-400">{c.priority}</td>
                          <td className="p-3 text-slate-400 whitespace-nowrap">
                            {fmtDate(c.startDate)} → {fmtDate(c.endDate)}
                          </td>
                          <td className="p-3"><StatusBadge status={status} /></td>
                          <td className="p-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => canUpdate && handleCampaignToggled(c, !c.isActive)}
                                disabled={!canUpdate}
                                className={`p-1.5 rounded-lg transition disabled:opacity-40 ${
                                  c.isActive
                                    ? 'text-slate-500 hover:text-amber-400 hover:bg-amber-500/10'
                                    : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10'
                                }`}
                                title={canUpdate ? (c.isActive ? 'Pause campaign' : 'Reactivate campaign') : 'Requires ad:update permission'}
                              >
                                {c.isActive ? <Trash2 className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => canUpdate && openCampaignEdit(c)}
                                disabled={!canUpdate}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition disabled:opacity-40"
                                title={canUpdate ? 'Edit campaign' : 'Requires ad:update permission'}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <Pagination
              currentPage={campPage}
              totalPages={Math.max(Math.ceil(campTotal / campLimit), 1)}
              totalItems={campTotal}
              itemsPerPage={campLimit}
              onPageChange={(p) => { setCampPage(p); loadCampaigns(p, campLimit); }}
              onItemsPerPageChange={(n) => { setCampLimit(n); setCampPage(1); loadCampaigns(1, n); }}
            />
          </div>
        </>
      )}

      {/* ================================ PLACEMENTS =============================== */}
      {tab === 'placements' && (
        <>
          {canCreate && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-amber-500" /> Place Campaign in Slot
              </h3>
              <p className="text-[11px] text-slate-500">
                A placement binds one creative to one slot. Higher-weight placements rotate more often when a slot holds multiple ads.
              </p>
              {plFormError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" /><span>{plFormError}</span>
                </div>
              )}
              <form onSubmit={handleCreatePlacement} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-bold text-slate-300">Slot*</label>
                  <select
                    value={plForm.adSlot}
                    onChange={(e) => setPlForm(f => ({ ...f, adSlot: e.target.value }))}
                    required
                    className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="">Select slot...</option>
                    {slotOptions.map(s => (
                      <option key={s._id} value={s._id}>{s.name} ({sizeLabel(s.size)}) — {s.section}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-bold text-slate-300">Campaign*</label>
                  <select
                    value={plForm.adCampaign}
                    onChange={(e) => setPlForm(f => ({ ...f, adCampaign: e.target.value }))}
                    required
                    className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="">Select campaign...</option>
                    {campaignOptions.map(c => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-1 space-y-1">
                  <label className="text-xs font-bold text-slate-300">Weight</label>
                  <input
                    type="number" min={1} max={100} value={plForm.weight}
                    onChange={(e) => setPlForm(f => ({ ...f, weight: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-300">Start Date</label>
                  <input
                    type="date" value={plForm.startDate}
                    onChange={(e) => setPlForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-300">End Date</label>
                  <input
                    type="date" value={plForm.endDate}
                    onChange={(e) => setPlForm(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div className="sm:col-span-1">
                  <button
                    type="submit" disabled={plCreating || slotOptions.length === 0 || campaignOptions.length === 0}
                    className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white font-bold text-xs py-2 rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    {plCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                    Place
                  </button>
                </div>
              </form>
              {slotOptions.length === 0 && (
                <p className="text-[11px] text-amber-400">No active slots — create or reactivate a slot first.</p>
              )}
              {campaignOptions.length === 0 && (
                <p className="text-[11px] text-amber-400">No active campaigns — upload a creative first.</p>
              )}
            </div>
          )}

          {placementsLoading ? (
            <div className="flex items-center justify-center py-16 text-xs text-slate-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-red-500" /> Loading placements...
            </div>
          ) : placements.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              No placements yet — bind a campaign to a slot from the form above to start serving ads.
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="p-3 rounded-l-xl">Slot</th>
                    <th className="p-3">Campaign</th>
                    <th className="p-3">Weight</th>
                    <th className="p-3">Schedule</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {placements.map(p => {
                    const slot = typeof p.adSlot === 'object' ? p.adSlot : null;
                    const camp = typeof p.adCampaign === 'object' ? p.adCampaign : null;
                    const cStatus = camp ? campaignStatus(camp) : null;
                    const expired = p.endDate && Date.now() > new Date(p.endDate).getTime();
                    const scheduled = p.startDate && Date.now() < new Date(p.startDate).getTime();
                    const plStatus = p.isActive === false
                      ? { label: 'Paused', cls: 'text-slate-400 bg-slate-800/80 border-slate-700' }
                      : expired
                        ? { label: 'Expired', cls: 'text-red-400 bg-red-500/10 border-red-500/30' }
                        : scheduled
                          ? { label: 'Scheduled', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/30' }
                          : { label: 'Serving', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
                    return (
                      <tr key={p._id} className={`hover:bg-slate-800/30 transition ${p.isActive === false ? 'opacity-55' : ''}`}>
                        <td className="p-3">
                          <div className="font-bold text-white">{slot?.name || '—'}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{slot?.key} · {slot ? sizeLabel(slot.size) : ''} · {slot?.section}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2 min-w-0">
                            {camp?.imageUrl && (
                              <img src={camp.imageUrl} alt="" className="w-10 h-8 object-cover rounded-lg border border-slate-800 bg-slate-950 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <div className="font-semibold text-white max-w-[200px] truncate" title={camp?.title}>{camp?.title || '—'}</div>
                              {cStatus && <StatusBadge status={cStatus} />}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-slate-400">{p.weight}</td>
                        <td className="p-3 text-slate-400 whitespace-nowrap">{fmtDate(p.startDate)} → {fmtDate(p.endDate)}</td>
                        <td className="p-3"><StatusBadge status={plStatus} /></td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => canUpdate && handlePlacementToggled(p, p.isActive === false)}
                              disabled={!canUpdate}
                              className={`p-1.5 rounded-lg transition disabled:opacity-40 ${
                                p.isActive === false
                                  ? 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10'
                                  : 'text-slate-500 hover:text-amber-400 hover:bg-amber-500/10'
                              }`}
                              title={canUpdate ? (p.isActive === false ? 'Reactivate placement' : 'Pause placement') : 'Requires ad:update permission'}
                            >
                              {p.isActive === false ? <RotateCcw className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => canUpdate && openPlacementEdit(p)}
                              disabled={!canUpdate}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition disabled:opacity-40"
                              title={canUpdate ? 'Edit placement' : 'Requires ad:update permission'}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => canDelete && setConfirming({ kind: 'placement', item: p, error: '', deleting: false })}
                              disabled={!canDelete}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-40"
                              title={canDelete ? 'Delete placement permanently' : 'Requires ad:delete permission'}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ================================== STATS ================================== */}
      {tab === 'stats' && (
        <>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-amber-500" /> From</label>
              <input
                type="date" value={statFrom} onChange={(e) => setStatFrom(e.target.value)}
                className="bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">To</label>
              <input
                type="date" value={statTo} onChange={(e) => setStatTo(e.target.value)}
                className="bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <button
              onClick={() => loadStats()}
              disabled={statsLoading}
              className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-lg flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {statsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BarChart3 className="w-3.5 h-3.5" />}
              Apply
            </button>
            {(statFrom || statTo) && (
              <button
                onClick={() => { setStatFrom(''); setStatTo(''); loadStats('', ''); }}
                className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800 transition"
              >
                Clear dates
              </button>
            )}
          </div>

          {statsLoading && !stats ? (
            <div className="flex items-center justify-center py-16 text-xs text-slate-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-red-500" /> Loading click stats...
            </div>
          ) : !stats ? (
            <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              Could not load click statistics.
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Clicks{stats.range?.from || stats.range?.to ? ' (filtered)' : ''}</p>
                  <p className="text-3xl font-black text-white mt-1 flex items-center gap-2">
                    <MousePointer className="w-5 h-5 text-emerald-400" /> {stats.total?.toLocaleString?.() ?? stats.total}
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Campaigns With Clicks</p>
                  <p className="text-3xl font-black text-white mt-1">{stats.byCampaign?.length ?? 0}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Slots With Clicks</p>
                  <p className="text-3xl font-black text-white mt-1">{stats.bySlot?.length ?? 0}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* By campaign */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-500" /> Clicks by Campaign
                  </h3>
                  {(stats.byCampaign || []).length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No clicks recorded yet — stats appear after readers click placed ads.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                          <tr>
                            <th className="p-2.5 rounded-l-xl">Campaign</th>
                            <th className="p-2.5">Clicks</th>
                            <th className="p-2.5 rounded-r-xl">Last Clicked</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/70">
                          {stats.byCampaign.map(row => (
                            <tr key={row.campaignId} className="hover:bg-slate-800/30">
                              <td className="p-2.5 font-semibold text-white max-w-[220px] truncate" title={row.title}>{row.title}</td>
                              <td className="p-2.5 font-bold text-emerald-400">{row.clicks.toLocaleString()}</td>
                              <td className="p-2.5 text-slate-400 whitespace-nowrap">{fmtDateTime(row.lastClickedAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* By slot */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <LayoutTemplate className="w-4 h-4 text-amber-500" /> Clicks by Slot
                  </h3>
                  {(stats.bySlot || []).length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No slot activity yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                          <tr>
                            <th className="p-2.5 rounded-l-xl">Slot</th>
                            <th className="p-2.5">Section</th>
                            <th className="p-2.5">Clicks</th>
                            <th className="p-2.5 rounded-r-xl">Last Clicked</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/70">
                          {stats.bySlot.map(row => (
                            <tr key={row.slotId} className="hover:bg-slate-800/30">
                              <td className="p-2.5">
                                <div className="font-semibold text-white">{row.name}</div>
                                <div className="text-[10px] font-mono text-slate-500">{row.key}</div>
                              </td>
                              <td className="p-2.5">
                                <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full text-[10px]">{row.section || '—'}</span>
                              </td>
                              <td className="p-2.5 font-bold text-emerald-400">{row.clicks.toLocaleString()}</td>
                              <td className="p-2.5 text-slate-400 whitespace-nowrap">{fmtDateTime(row.lastClickedAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* By day */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-500" /> Clicks by Day
                </h3>
                {(stats.byDay || []).length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No daily activity yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {stats.byDay.map(row => (
                      <div key={row.date} className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-center">
                        <p className="text-[10px] text-slate-500 font-semibold">{row.date}</p>
                        <p className="text-sm font-black text-amber-400">{row.clicks}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* ================================ EDIT MODAL ================================ */}
      {slotEdit && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" /> Edit Ad Slot
              </h4>
              <button onClick={() => setSlotEdit(null)} className="text-slate-400 hover:text-white p-1"><X className="w-4 h-4" /></button>
            </div>
            {slotEdit.error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" /><span>{slotEdit.error}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-300">Name</label>
                <input
                  type="text" maxLength={100} value={slotEdit.form.name}
                  onChange={(e) => setSlotEdit(s => ({ ...s, form: { ...s.form, name: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Key</label>
                <input
                  type="text" value={slotEdit.form.key}
                  onChange={(e) => setSlotEdit(s => ({ ...s, form: { ...s.form, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') } }))}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-xs font-mono text-white outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Section</label>
                <input
                  type="text" maxLength={50} value={slotEdit.form.section}
                  onChange={(e) => setSlotEdit(s => ({ ...s, form: { ...s.form, section: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Width</label>
                <input
                  type="number" min={1} max={5000} value={slotEdit.form.width}
                  onChange={(e) => setSlotEdit(s => ({ ...s, form: { ...s.form, width: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Height</label>
                <input
                  type="number" min={1} max={5000} value={slotEdit.form.height}
                  onChange={(e) => setSlotEdit(s => ({ ...s, form: { ...s.form, height: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Position</label>
                <input
                  type="number" min={-100} max={100} value={slotEdit.form.position}
                  onChange={(e) => setSlotEdit(s => ({ ...s, form: { ...s.form, position: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Max Ads</label>
                <input
                  type="number" min={1} max={10} value={slotEdit.form.maxAds}
                  onChange={(e) => setSlotEdit(s => ({ ...s, form: { ...s.form, maxAds: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
                />
              </div>
              <label className="col-span-2 flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl cursor-pointer">
                <span className="text-xs font-bold text-slate-300">Active (receives placements)</span>
                <input
                  type="checkbox" checked={slotEdit.form.isActive}
                  onChange={(e) => setSlotEdit(s => ({ ...s, form: { ...s.form, isActive: e.target.checked } }))}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0"
                />
              </label>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setSlotEdit(null)} className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 transition">Cancel</button>
              <button
                onClick={handleSaveSlotEdit} disabled={slotEdit.saving}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white shadow-md transition flex items-center gap-2 disabled:opacity-50"
              >
                {slotEdit.saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {campEdit && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" /> Edit Campaign
              </h4>
              <button onClick={() => setCampEdit(null)} className="text-slate-400 hover:text-white p-1"><X className="w-4 h-4" /></button>
            </div>
            {campEdit.error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" /><span>{campEdit.error}</span>
              </div>
            )}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Title</label>
                <input
                  type="text" maxLength={200} value={campEdit.form.title}
                  onChange={(e) => setCampEdit(s => ({ ...s, form: { ...s.form, title: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Click URL</label>
                <input
                  type="text" value={campEdit.form.clickUrl}
                  onChange={(e) => setCampEdit(s => ({ ...s, form: { ...s.form, clickUrl: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-xs font-mono text-white outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Alt Text</label>
                <input
                  type="text" maxLength={300} value={campEdit.form.imageAlt}
                  onChange={(e) => setCampEdit(s => ({ ...s, form: { ...s.form, imageAlt: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Replace Image (optional)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file" accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => setCampEdit(s => ({ ...s, file: e.target.files?.[0] || null }))}
                    className="w-full text-[10px] text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-red-600 file:text-white file:text-[10px] file:font-bold hover:file:bg-red-500 cursor-pointer bg-slate-950 border border-slate-700 rounded-xl p-1.5"
                  />
                  <img
                    src={campEdit.file ? URL.createObjectURL(campEdit.file) : campEdit.currentImage}
                    alt=""
                    className="w-14 h-10 object-cover rounded-lg border border-slate-700 shrink-0"
                  />
                </div>
                <p className="text-[10px] text-slate-500">Leave empty to keep the current creative.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">Opens In</label>
                  <select
                    value={campEdit.form.target}
                    onChange={(e) => setCampEdit(s => ({ ...s, form: { ...s.form, target: e.target.value } }))}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  >
                    <option value="_blank">New Tab</option>
                    <option value="_self">Same Tab</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">Priority</label>
                  <input
                    type="number" min={-1000} max={1000} value={campEdit.form.priority}
                    onChange={(e) => setCampEdit(s => ({ ...s, form: { ...s.form, priority: e.target.value } }))}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">Start</label>
                  <input
                    type="date" value={campEdit.form.startDate}
                    onChange={(e) => setCampEdit(s => ({ ...s, form: { ...s.form, startDate: e.target.value } }))}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">End</label>
                  <input
                    type="date" value={campEdit.form.endDate}
                    onChange={(e) => setCampEdit(s => ({ ...s, form: { ...s.form, endDate: e.target.value } }))}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                </div>
              </div>
              <label className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl cursor-pointer">
                <span className="text-xs font-bold text-slate-300">Active (can be placed &amp; served)</span>
                <input
                  type="checkbox" checked={campEdit.form.isActive}
                  onChange={(e) => setCampEdit(s => ({ ...s, form: { ...s.form, isActive: e.target.checked } }))}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0"
                />
              </label>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setCampEdit(null)} className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 transition">Cancel</button>
              <button
                onClick={handleSaveCampaignEdit} disabled={campEdit.saving}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white shadow-md transition flex items-center gap-2 disabled:opacity-50"
              >
                {campEdit.saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {plEdit && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" /> Edit Placement
              </h4>
              <button onClick={() => setPlEdit(null)} className="text-slate-400 hover:text-white p-1"><X className="w-4 h-4" /></button>
            </div>
            {plEdit.error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" /><span>{plEdit.error}</span>
              </div>
            )}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Slot</label>
                <select
                  value={plEdit.form.adSlot}
                  onChange={(e) => setPlEdit(s => ({ ...s, form: { ...s.form, adSlot: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="">Select slot...</option>
                  {slots.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({sizeLabel(s.size)}) — {s.section}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Campaign</label>
                <select
                  value={plEdit.form.adCampaign}
                  onChange={(e) => setPlEdit(s => ({ ...s, form: { ...s.form, adCampaign: e.target.value } }))}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="">Select campaign...</option>
                  {campaigns.map(c => (
                    <option key={c._id} value={c._id}>{c.title}{c.isActive ? '' : ' (paused)'}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">Weight</label>
                  <input
                    type="number" min={1} max={100} value={plEdit.form.weight}
                    onChange={(e) => setPlEdit(s => ({ ...s, form: { ...s.form, weight: e.target.value } }))}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">Start</label>
                  <input
                    type="date" value={plEdit.form.startDate}
                    onChange={(e) => setPlEdit(s => ({ ...s, form: { ...s.form, startDate: e.target.value } }))}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">End</label>
                  <input
                    type="date" value={plEdit.form.endDate}
                    onChange={(e) => setPlEdit(s => ({ ...s, form: { ...s.form, endDate: e.target.value } }))}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                </div>
              </div>
              <label className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl cursor-pointer">
                <span className="text-xs font-bold text-slate-300">Active (serving in the slot)</span>
                <input
                  type="checkbox" checked={plEdit.form.isActive}
                  onChange={(e) => setPlEdit(s => ({ ...s, form: { ...s.form, isActive: e.target.checked } }))}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0"
                />
              </label>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setPlEdit(null)} className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 transition">Cancel</button>
              <button
                onClick={handleSavePlacementEdit} disabled={plEdit.saving}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white shadow-md transition flex items-center gap-2 disabled:opacity-50"
              >
                {plEdit.saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================== DELETE MODAL ============================== */}
      {confirming && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                {confirming.kind === 'placement' ? 'Delete Placement' : confirming.kind === 'slot' ? 'Deactivate Slot' : 'Pause Campaign'}
              </h4>
              <button onClick={() => setConfirming(null)} className="text-slate-400 hover:text-white p-1"><X className="w-4 h-4" /></button>
            </div>
            {confirming.error ? (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-400 flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0" /><span>{confirming.error}</span>
              </div>
            ) : (
              <p className="text-xs text-slate-300 leading-relaxed">
                {confirming.kind === 'placement' ? (
                  <>Permanently remove this placement? The campaign and its stats stay — only this slot assignment is deleted.</>
                ) : confirming.kind === 'slot' ? (
                  <>Deactivate slot <span className="font-bold text-white">{confirming.item.name}</span>? Active placements will stop serving. You can reactivate it anytime.</>
                ) : (
                  <>Pause campaign <span className="font-bold text-white">{confirming.item.title}</span>? It will stop serving in all placements. You can reactivate it anytime.</>
                )}
              </p>
            )}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setConfirming(null)} className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 transition">Cancel</button>
              <button
                onClick={handleConfirmDelete} disabled={confirming.deleting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md transition flex items-center gap-2 disabled:opacity-50"
              >
                {confirming.deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                {confirming.kind === 'placement' ? 'Delete' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
