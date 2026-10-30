import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Newspaper,
  Eye,
  Clock,
  TrendingUp,
  PlusCircle,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Radio,
  BellRing,
  Megaphone,
  Layers,
  Images,
  Video,
  MapPin,
  Lightbulb,
  Users,
  Inbox,
  AlertTriangle,
  Sparkles,
  FileText,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { fetchDashboard } from '../api/dashboard';
import { updateArticleStatus } from '../api/articles';
import { hasPermission } from '../utils/permissions';

const numberFormat = new Intl.NumberFormat('en-IN');
const compactFormat = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const formatNumber = (value) => numberFormat.format(Number(value) || 0);
const formatCompact = (value) => compactFormat.format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatShortDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const statusClass = (status) => {
  if (['PUBLISHED', 'APPROVED', 'CLOSED', 'HIRED', 'ACCEPTED'].includes(status)) {
    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
  }
  if (['DRAFT', 'NEW', 'IN_REVIEW', 'SHORTLISTED'].includes(status)) {
    return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
  }
  if (['REJECTED', 'SPAM', 'HIDDEN'].includes(status)) {
    return 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20';
  }
  return 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
};

const RANGE_OPTIONS = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
];

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 rounded-3xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 h-80 rounded-3xl bg-slate-200 dark:bg-slate-800" />
        <div className="lg:col-span-4 h-80 rounded-3xl bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

export default function DashboardHome({
  user,
  onNavigate = () => {},
  onOpenAddModal = () => {},
  showToast,
}) {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [publishingId, setPublishingId] = useState(null);

  const canCreateArticle = hasPermission(user, 'article:create');
  const canReadArticles = hasPermission(user, 'article:read');
  const canModerateComments = hasPermission(user, 'comment:moderate');
  const canUpdateArticle = hasPermission(user, 'article:update');
  const canPublishArticle = hasPermission(user, 'article:publish');
  const canReadAds = hasPermission(user, 'ad:read');
  const canReadLiveNews = hasPermission(user, 'liveNews:read');
  const canReadNotices = hasPermission(user, 'notice:read');
  const canReadPolls = hasPermission(user, 'poll:read');
  const canReadQotd = hasPermission(user, 'qotd:read');
  const canReadSubmissions = hasPermission(user, 'submission:read');
  const canReadUsers = hasPermission(user, 'user:read');
  const canReadRoles = hasPermission(user, 'role:read');
  const canReadMedia = hasPermission(user, 'media:read');
  const canReadGalleries = hasPermission(user, 'gallery:read');
  const canReadEpaper = hasPermission(user, 'epaper:read');
  const canReadCategories = hasPermission(user, 'category:read');
  const canReadCities = hasPermission(user, 'city:read');
  const canReadStaticPages = hasPermission(user, 'staticPage:read');

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError('');
      try {
        const result = await fetchDashboard(range);
        setData(result);
      } catch (err) {
        setError(err?.message || 'Unable to load dashboard data.');
      } finally {
        if (silent) setRefreshing(false);
        else setLoading(false);
      }
    },
    [range],
  );

  useEffect(() => {
    load();
  }, [load]);

  const handlePublish = async (id) => {
    if (!canPublishArticle || publishingId) return;
    setPublishingId(id);
    try {
      await updateArticleStatus(id, 'PUBLISHED');
      showToast?.('Article published successfully.', 'success');
      await load({ silent: true });
    } catch (err) {
      showToast?.(err?.message || 'Failed to publish article.', 'warning');
    } finally {
      setPublishingId(null);
    }
  };

  const summary = data?.summary;
  const alerts = data?.alerts || [];
  const drafts = data?.editorialQueue?.drafts || [];
  const recentArticles = data?.recentArticles || [];
  const topArticles = data?.topArticles || [];
  const topCampaigns = data?.ads?.topCampaigns || [];
  const endingSoon = data?.ads?.endingSoon || [];
  const recentSubmissions = data?.submissions?.recent || [];

  const chartRows = useMemo(() => {
    const publishedRows = data?.series?.articlesPublishedByDay || [];
    const clickRows = data?.series?.adClicksByDay || [];
    const publishedByDate = new Map(publishedRows.map((row) => [row.date, row.count]));
    const clicksByDate = new Map(clickRows.map((row) => [row.date, row.clicks]));
    const dates = [...new Set([...publishedRows, ...clickRows].map((row) => row.date))];
    return dates.map((date) => ({
      date,
      clicks: clicksByDate.get(date) || 0,
      articles: publishedByDate.get(date) || 0,
    }));
  }, [data]);

  const chartMax = useMemo(
    () => Math.max(1, ...chartRows.flatMap((row) => [row.clicks, row.articles])),
    [chartRows],
  );
  const labelStep = Math.max(1, Math.ceil(chartRows.length / 8));

  const moduleCards = summary
    ? [
        ...(summary.notifications ? [{
          label: 'Push Subscriptions',
          icon: BellRing,
          value: `${formatNumber(summary.notifications.pushSubscriptions)} saved`,
          hint: 'Browser/device subscriptions, not unique people',
        }] : []),
        ...(canReadLiveNews ? [{
          label: 'Live News', icon: Radio,
          value: `${formatNumber(summary.liveNews.active)} active`,
          hint: `${formatNumber(summary.liveNews.total)} total`,
        }] : []),
        ...(canReadNotices ? [{
          label: 'Notices', icon: BellRing,
          value: `${formatNumber(summary.notices.active)} active`,
          hint: `${formatNumber(summary.notices.breaking)} breaking · ${formatNumber(summary.notices.total)} total`,
        }] : []),
        ...(canReadMedia ? [
        {
          label: 'Images', icon: Images,
          value: `${formatNumber(summary.library.images.published)} published`,
          hint: `${formatNumber(summary.library.images.total)} total`,
        },
        {
          label: 'Videos',
          icon: Video,
          value: `${formatNumber(summary.library.videos.published)} published`,
          hint: `${formatNumber(summary.library.videos.total)} total`,
        },
        ] : []),
        ...(canReadGalleries ? [{
          label: 'Galleries',
          icon: Layers,
          value: `${formatNumber(summary.library.galleries.published)} published`,
          hint: `${formatNumber(summary.library.galleries.total)} total`,
        }] : []),
        ...(canReadEpaper ? [{
          label: 'E-Paper',
          icon: FileText,
          value: `${formatNumber(summary.library.epaper.active)} active`,
          hint: summary.library.epaper.latest
            ? `${summary.library.epaper.latest.title} · ${formatDate(summary.library.epaper.latest.editionDate)}`
            : 'No edition yet',
        }] : []),
        ...(canReadPolls ? [{
          label: 'Polls',
          icon: TrendingUp,
          value: `${formatNumber(summary.polls.active)} active`,
          hint: `${formatNumber(summary.polls.votes)} votes · ${formatNumber(summary.polls.total)} total`,
        }] : []),
        ...(canReadQotd ? [{
          label: 'Question of the Day',
          icon: Lightbulb,
          value: `${formatNumber(summary.qotd.active)} active`,
          hint: `${formatNumber(summary.qotd.total)} total`,
        }] : []),
        ...(canReadCategories ? [{
          label: 'Categories',
          icon: Layers,
          value: `${formatNumber(summary.library.categories.active)} active`,
          hint: `${formatNumber(summary.library.categories.total)} total`,
        }] : []),
        ...(canReadCities ? [{
          label: 'Cities',
          icon: MapPin,
          value: `${formatNumber(summary.library.cities.active)} active`,
          hint: `${formatNumber(summary.library.cities.total)} total`,
        }] : []),
        ...(canReadStaticPages ? [{
          label: 'Static Pages',
          icon: FileText,
          value: `${formatNumber(summary.library.staticPages.active)} active`,
          hint: `${formatNumber(summary.library.staticPages.total)} total`,
        }] : []),
        ...(canReadUsers ? [{
          label: 'Users',
          icon: Users,
          value: `${formatNumber(summary.users.active)} active`,
          hint: `${formatNumber(summary.users.newInRange)} new in range${canReadRoles ? ` · ${formatNumber(summary.roles.active)} roles` : ''}`,
        }] : []),
        ...(canReadRoles && !canReadUsers ? [{
          label: 'Roles',
          icon: Users,
          value: `${formatNumber(summary.roles.active)} active`,
          hint: `${formatNumber(summary.roles.total)} total`,
        }] : []),
      ]
    : [];

  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  if (error && !data) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 shadow-sm flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Dashboard unavailable</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">{error}</p>
        <button
          onClick={() => load()}
          className="mt-1 inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Try again
        </button>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-red-900 via-slate-900 to-amber-900 text-white border border-red-500/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5" /> Kamgar Times Control Hub
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-serif tracking-tight">
            Welcome back, <span className="text-red-400">{user?.name || 'Admin'}</span>
            {user?.role ? <span className="text-sm font-semibold text-amber-200"> ({user.role})</span> : null}
          </h2>
          <p className="text-xs text-slate-200 max-w-xl">
            {canReadArticles ? <>
              {formatNumber(summary.articles.publishedToday)} article
              {summary.articles.publishedToday === 1 ? '' : 's'} published today.{' '}
              {formatNumber(summary.articles.draft)} draft
              {summary.articles.draft === 1 ? '' : 's'} awaiting editorial review.
            </> : 'Here is your permission-based workspace overview.'}
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">
          {canCreateArticle && (
            <button
              onClick={onOpenAddModal}
              className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Write Article</span>
            </button>
          )}
          {canReadArticles && (
            <button
              onClick={() => onNavigate('news')}
              className="bg-slate-950/80 hover:bg-slate-800 border border-red-500/40 text-red-400 hover:text-red-300 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition"
            >
              <Newspaper className="w-4 h-4" />
              <span>Manage Articles</span>
            </button>
          )}
        </div>

        <div className="absolute right-0 top-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Range + refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 w-fit">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.key}
              onClick={() => setRange(option.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                range === option.key
                  ? 'bg-red-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Updated {data?.meta?.generatedAt ? new Date(data.meta.generatedAt).toLocaleTimeString('en-IN') : '—'}
          </span>
          <button
            onClick={() => load({ silent: true })}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl hover:border-red-400/50 transition disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && data && (
        <div className="text-xs text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
          {error}
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {alerts.map((alert) => (
            <div
              key={alert.code}
              className={`inline-flex items-center gap-2 text-[11px] font-semibold px-3 py-1.5 rounded-full border ${
                alert.level === 'warning'
                  ? 'text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/25'
                  : 'text-blue-700 dark:text-blue-300 bg-blue-500/10 border-blue-500/25'
              }`}
            >
              {alert.level === 'warning' ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5" />
              )}
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* KPI cards */}
      {(canReadArticles || canReadAds) && <div className={`grid grid-cols-2 ${canReadArticles && canReadAds ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
        {canReadArticles && <StatCard
          title="Published Articles"
          value={formatNumber(summary.articles.published)}
          icon={Newspaper}
          color="red"
          subtitle={`${formatNumber(summary.articles.publishedToday)} today · ${formatNumber(summary.articles.publishedInRange)} in range`}
        />}
        {canReadArticles && <StatCard
          title="Pending Drafts"
          value={formatNumber(summary.articles.draft)}
          icon={Clock}
          color="amber"
          subtitle="Awaiting editorial review"
        />}
        {canReadArticles && <StatCard
          title="Total Views"
          value={formatCompact(summary.engagement.views)}
          icon={Eye}
          color="blue"
          subtitle={`${formatCompact(summary.engagement.likes)} likes${canModerateComments ? ` · ${formatCompact(summary.engagement.comments)} comments` : ''}`}
        />}
        {canReadAds && <StatCard
          title="Ad Clicks (range)"
          value={formatNumber(summary.ads.clicksInRange)}
          icon={Megaphone}
          color="emerald"
          subtitle={`${formatCompact(summary.ads.impressionsInRange)} impressions · ${summary.ads.ctr}% CTR`}
        />}
      </div>}

      {/* Chart + drafts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {(canReadArticles || canReadAds) && <div className={`${canReadArticles && canReadAds ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm dark:shadow-xl transition-colors`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-500" /> {canReadArticles && canReadAds ? 'Publishing & Ad Engagement' : canReadArticles ? 'Article Publishing' : 'Ad Engagement'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {canReadArticles && canReadAds ? 'Articles published and ad clicks' : canReadArticles ? 'Articles published' : 'Ad clicks'} per day ({range})
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              {canReadAds && <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-red-600 to-red-400" />
                Ad clicks
              </span>}
              {canReadArticles && <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-amber-600 to-amber-400" />
                Published
              </span>}
            </div>
          </div>

          {chartRows.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
              No activity in this range.
            </div>
          ) : (
            <div className="overflow-x-auto pb-1">
              <div
                className="h-60 flex items-end gap-1 border-b border-slate-200 dark:border-slate-800 pb-1"
                style={{ minWidth: `${Math.max(chartRows.length * 18, 320)}px` }}
              >
                {chartRows.map((row, index) => {
                  const clickHeight = Math.round((row.clicks / chartMax) * 100);
                  const articleHeight = Math.round((row.articles / chartMax) * 100);
                  const showLabel = index % labelStep === 0 || index === chartRows.length - 1;

                  return (
                    <div
                      key={row.date}
                      className="flex-1 min-w-[12px] h-full flex flex-col items-center justify-end gap-1 group relative"
                    >
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded border border-slate-700 shadow-md whitespace-nowrap z-20 pointer-events-none">
                        {formatShortDate(row.date)}{canReadAds ? ` · ${row.clicks} clicks` : ''}{canReadArticles ? ` · ${row.articles} published` : ''}
                      </div>
                      <div className="w-full flex items-end justify-center gap-[2px] h-48">
                        {canReadAds && <div
                          style={{ height: `${row.clicks ? Math.max(clickHeight, 3) : 0}%` }}
                          className="w-1/2 rounded-t bg-gradient-to-t from-red-600 to-red-400 group-hover:brightness-125 transition"
                        />}
                        {canReadArticles && <div
                          style={{ height: `${row.articles ? Math.max(articleHeight, 3) : 0}%` }}
                          className="w-1/2 rounded-t bg-gradient-to-t from-amber-600 to-amber-400 group-hover:brightness-125 transition"
                        />}
                      </div>
                      <span className="text-[9px] h-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {showLabel ? formatShortDate(row.date) : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              In range:{canReadAds && <> <strong className="text-slate-900 dark:text-white">{formatNumber(summary.ads.clicksInRange)}</strong> ad clicks</>}{canReadAds && canReadArticles ? ' · ' : ''}{canReadArticles && <><strong className="text-slate-900 dark:text-white">{formatNumber(summary.articles.publishedInRange)}</strong> published</>}
            </span>
            {canReadAds && <span>
              Ad campaigns: <strong className="text-slate-900 dark:text-white">{formatNumber(summary.ads.activeCampaigns)}</strong> active /{' '}
              {formatNumber(summary.ads.campaigns)}
            </span>}
          </div>
        </div>}

        {/* Draft queue */}
        {canReadArticles && <div className={`${canReadAds ? 'lg:col-span-4' : 'lg:col-span-12'} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm dark:shadow-xl flex flex-col transition-colors`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" /> Pending Approvals (
              {formatNumber(data.editorialQueue.draftCount)})
            </h3>
            {canReadArticles && (
              <button
                onClick={() => onNavigate('news')}
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold"
              >
                View All →
              </button>
            )}
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-80">
            {drafts.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
                No drafts waiting for review.
              </div>
            ) : (
              drafts.map((article) => (
                <div
                  key={article.id}
                  className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      {article.category}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
                      {formatDate(article.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-900 dark:text-white font-medium line-clamp-2 leading-snug">
                    {article.title}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Author: {article.author}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800/80">
                    {canReadArticles ? (
                      <button
                        onClick={() => onNavigate('news')}
                        className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" /> Review
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">Read-only</span>
                    )}

                    {canPublishArticle && (
                      <button
                        onClick={() => handlePublish(article.id)}
                        disabled={publishingId === article.id}
                        className="px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow transition flex items-center gap-1 disabled:opacity-60"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {publishingId === article.id ? 'Publishing...' : 'Publish'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>}
      </div>

      {/* Recent articles */}
      {canReadArticles && <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm dark:shadow-xl transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-red-600 dark:text-red-500" /> Recent Published News
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Latest articles live on the portal</p>
          </div>
          {canReadArticles && (
            <button
              onClick={() => onNavigate('news')}
              className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-bold self-start sm:self-auto"
            >
              Manage All Articles →
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-3 rounded-l-xl">Article Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Author</th>
                <th className="p-3">Views</th>
                <th className="p-3">Published</th>
                <th className="p-3 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentArticles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 dark:text-slate-500">
                    No published articles yet.
                  </td>
                </tr>
              ) : (
                recentArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white max-w-md">
                      <div className="flex items-center gap-3">
                        {article.image ? (
                          <img
                            src={article.image}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                            <Newspaper className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <span className="line-clamp-1">{article.title}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            {article.isBreaking && (
                              <span className="text-[9px] bg-red-600 text-white font-bold px-1.5 rounded">BREAKING</span>
                            )}
                            {article.isFeatured && (
                              <span className="text-[9px] bg-amber-500 text-slate-950 font-bold px-1.5 rounded">FEATURED</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-[11px]">
                        {article.category}
                      </span>
                    </td>
                    <td className="p-3">{article.author}</td>
                    <td className="p-3 font-bold text-amber-600 dark:text-amber-400">
                      {formatNumber(article.views)}
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400">{formatDate(article.publishedAt)}</td>
                    <td className="p-3 text-right">
                      {canReadArticles ? (
                        <button
                          onClick={() => onNavigate('news')}
                          className="text-xs text-red-600 dark:text-red-400 hover:underline font-semibold"
                        >
                          {canUpdateArticle ? 'Edit' : 'View'}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>}

      {/* Ads + top articles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {canReadAds && <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm dark:shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-red-500" /> Ads Performance
            </h3>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {summary.ads.ctr}% CTR
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Campaigns', value: summary.ads.campaigns, sub: `${summary.ads.activeCampaigns} active` },
              { label: 'Slots', value: summary.ads.slots, sub: `${summary.ads.activeSlots} active` },
              { label: 'Placements', value: summary.ads.placements, sub: `${summary.ads.activePlacements} active` },
              ...(canReadSubmissions ? [{ label: 'Inquiries', value: summary.submissions.adInquiries.total, sub: `${summary.submissions.adInquiries.newCount} new` }] : []),
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5">
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{formatNumber(item.value)}</p>
                <p className="text-[9px] text-slate-500 dark:text-slate-400">{item.sub}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Top campaigns in range
            </p>
            {topCampaigns.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-3">No ad activity in this range.</p>
            ) : (
              <div className="space-y-2">
                {topCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{campaign.title}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {formatNumber(campaign.impressions)} impressions · {formatNumber(campaign.clicks)} clicks
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 shrink-0">
                      {campaign.ctr}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {endingSoon.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Ending within 7 days
              </p>
              <div className="flex flex-wrap gap-2">
                {endingSoon.map((campaign) => (
                  <span
                    key={campaign.id}
                    className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/25 px-2 py-1 rounded-full"
                  >
                    {campaign.title} · {formatDate(campaign.endDate)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>}

        {canReadArticles && <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm dark:shadow-xl">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-500" /> Most Viewed Articles
          </h3>
          {topArticles.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-3">No published articles yet.</p>
          ) : (
            <div className="space-y-2">
              {topArticles.map((article, index) => (
                <div
                  key={article.id}
                  className="flex items-start gap-3 p-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  <span className="w-6 h-6 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-black flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                      {article.title}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {article.category} · {formatNumber(article.views)} views · {formatNumber(article.likes)} likes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>}
      </div>

      {/* Submissions */}
      {canReadSubmissions && <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm dark:shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Inbox className="w-5 h-5 text-red-600 dark:text-red-500" /> Reader Inbox
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatNumber(summary.submissions.newTotal)} new submissions need attention
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'News Tips', data: summary.submissions.newsTips },
            { label: 'Reporter Applications', data: summary.submissions.reporterApplications },
            { label: 'Ad Inquiries', data: summary.submissions.adInquiries },
            { label: 'Contact Messages', data: summary.submissions.contactMessages },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-3"
            >
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{item.label}</p>
              <div className="flex items-end justify-between mt-1">
                <p className="text-xl font-black text-slate-900 dark:text-white">{formatNumber(item.data.total)}</p>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.data.newCount > 0
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {formatNumber(item.data.newCount)} new
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {recentSubmissions.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-2">No submissions yet.</p>
          ) : (
            recentSubmissions.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                      {item.label}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${statusClass(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1 mt-1">{item.title}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {item.name} · {formatDate(item.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>}

      {/* Module status grid */}
      {moduleCards.length > 0 && <div className="space-y-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Module Overview</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Minimal status across all admin modules</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {moduleCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm dark:shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <Icon className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {card.label}
                  </p>
                </div>
                <p className="text-sm font-black text-slate-900 dark:text-white mt-2">{card.value}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{card.hint}</p>
              </div>
            );
          })}
        </div>
      </div>}
    </div>
  );
}
