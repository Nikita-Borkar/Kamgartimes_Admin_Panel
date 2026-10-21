import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardHome from './pages/DashboardHome';
import NewsManagementPage from './pages/NewsManagementPage';
import CreateArticlePage from './pages/CreateArticlePage';
import LiveBlogPage from './pages/LiveBlogPage';
import BreakingTickerPage from './pages/BreakingTickerPage';
import PhotoGalleryPage from './pages/PhotoGalleryPage';
import EPaperManagementPage from './pages/EPaperManagementPage';
import ReelsVideoPage from './pages/ReelsVideoPage';
import PollsRashifalPage from './pages/PollsRashifalPage';
import CategoryManagementPage from './pages/CategoryManagementPage';
import ReportersPage from './pages/ReportersPage';
import AdManagementPage from './pages/AdManagementPage';
import PollsCommentsPage from './pages/PollsCommentsPage';
import SettingsPage from './pages/SettingsPage';
import CitizenJournalismPage from './pages/CitizenJournalismPage';
import AdInquiriesPage from './pages/AdInquiriesPage';
import YouTubeVideosPage from './pages/YouTubeVideosPage';

// Mock Data
import { 
  INITIAL_STATS, 
  INITIAL_ARTICLES, 
  INITIAL_LIVE_UPDATES,
  INITIAL_BREAKING_NEWS, 
  INITIAL_PHOTO_GALLERIES,
  INITIAL_CATEGORIES, 
  INITIAL_REPORTERS, 
  INITIAL_EPAPERS, 
  INITIAL_POLL,
  INITIAL_HOROSCOPE,
  INITIAL_ADS, 
  INITIAL_COMMENTS, 
  INITIAL_SETTINGS 
} from './data/mockData';

import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { restoreSession, clearSession } from './api/auth';

export default function App() {
  // Theme State (Dark / Light Mode)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('kamgar_admin_theme') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('kamgar_admin_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Authentication State
  const [currentUser, setCurrentUser] = useState(null); // null = show LoginPage first
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const user = await restoreSession();
        if (active && user) setCurrentUser(user);
      } finally {
        if (active) setAuthChecked(true);
      }
    })();
    return () => { active = false; };
  }, []);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [editingArticleData, setEditingArticleData] = useState(null);

  // App Data State
  const [stats, setStats] = useState(INITIAL_STATS);
  const [articles, setArticles] = useState(INITIAL_ARTICLES);
  const [liveUpdates, setLiveUpdates] = useState(INITIAL_LIVE_UPDATES);
  const [breakingNews, setBreakingNews] = useState(INITIAL_BREAKING_NEWS);
  const [photoGalleries, setPhotoGalleries] = useState(INITIAL_PHOTO_GALLERIES);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [reporters, setReporters] = useState(INITIAL_REPORTERS);
  const [epapers, setEpapers] = useState(INITIAL_EPAPERS);
  const [poll, setPoll] = useState(INITIAL_POLL);
  const [horoscope, setHoroscope] = useState(INITIAL_HOROSCOPE);
  const [ads, setAds] = useState(INITIAL_ADS);
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);

  // Toast Alerts State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Login & Logout Handlers
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    showToast(`Welcome back ${userData.name}! Logged in successfully.`, 'success');
  };

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  // Open Create/Edit Article Page View
  const handleOpenCreatePage = (articleToEdit = null) => {
    setEditingArticleData(articleToEdit);
    setActiveTab('create-article');
  };

  // Save Article Handler (from CreateArticlePage)
  const handleSaveArticle = (articleObj) => {
    const exists = articles.some(a => a.id === articleObj.id);
    if (exists) {
      setArticles(articles.map(a => a.id === articleObj.id ? articleObj : a));
      showToast('Article changes saved successfully!', 'success');
    } else {
      setArticles([articleObj, ...articles]);
      setStats(prev => ({
        ...prev,
        totalArticles: prev.totalArticles + 1,
        todayArticles: prev.todayArticles + 1
      }));
      showToast('New article published successfully!', 'success');
    }
    setActiveTab('news');
    setEditingArticleData(null);
  };

  const handleDeleteArticle = (id) => {
    setArticles(articles.filter(a => a.id !== id));
    showToast('Article deleted.', 'warning');
  };

  const handleToggleArticleStatus = (id) => {
    setArticles(articles.map(a => {
      if (a.id === id) {
        const nextStatus = a.status === 'Published' ? 'Draft' : 'Published';
        showToast(`Article status changed to ${nextStatus}.`, 'info');
        return { ...a, status: nextStatus };
      }
      return a;
    }));
  };

  const handleApproveArticle = (id) => {
    setArticles(articles.map(a => a.id === id ? { ...a, status: 'Published' } : a));
    setStats(prev => ({ ...prev, pendingApprovals: Math.max(0, prev.pendingApprovals - 1) }));
    showToast('Pending article approved and published!', 'success');
  };

  const handleRejectArticle = (id) => {
    setArticles(articles.filter(a => a.id !== id));
    setStats(prev => ({ ...prev, pendingApprovals: Math.max(0, prev.pendingApprovals - 1) }));
    showToast('Pending article rejected.', 'warning');
  };

  // Live Blog Handlers
  const handleAddLiveUpdate = (newUpdate) => {
    setLiveUpdates([newUpdate, ...liveUpdates]);
    showToast('Live blog update broadcasted!', 'success');
  };

  const handleDeleteLiveUpdate = (id) => {
    setLiveUpdates(liveUpdates.filter(u => u.id !== id));
    showToast('Live update entry removed.', 'warning');
  };

  // Photo Gallery Handlers
  const handleAddGallery = (newGal) => {
    setPhotoGalleries([newGal, ...photoGalleries]);
    showToast('New photo album created!', 'success');
  };

  const handleDeleteGallery = (id) => {
    setPhotoGalleries(photoGalleries.filter(g => g.id !== id));
    showToast('Photo album removed.', 'warning');
  };

  // Poll & Rashifal Handlers
  const handleUpdatePoll = (newPoll) => {
    setPoll(newPoll);
    showToast('Opinion poll updated.', 'success');
  };

  const handleUpdateHoroscope = (newHoroscopes) => {
    setHoroscope(newHoroscopes);
    showToast('Daily Rashifal predictions updated.', 'success');
  };

  // Breaking Ticker Handlers
  const handleAddBreaking = (newItem) => {
    setBreakingNews([newItem, ...breakingNews]);
    showToast('New headline added to breaking ticker!', 'success');
  };

  const handleDeleteBreaking = (id) => {
    setBreakingNews(breakingNews.filter(b => b.id !== id));
    showToast('Breaking headline deleted.', 'warning');
  };

  const handleToggleBreaking = (id) => {
    setBreakingNews(breakingNews.map(b => b.id === id ? { ...b, status: b.status === 'Active' ? 'Paused' : 'Active' } : b));
  };

  // Category Handlers
  const handleAddCategory = (newCat) => {
    setCategories([...categories, newCat]);
    showToast('New news category created!', 'success');
  };

  const handleDeleteCategory = (id) => {
    setCategories(categories.filter(c => c.id !== id));
    showToast('Category removed.', 'warning');
  };

  // EPaper Handlers
  const handleAddEPaper = (newEp) => {
    setEpapers([newEp, ...epapers]);
    showToast('New e-Paper edition published!', 'success');
  };

  const handleDeleteEPaper = (id) => {
    setEpapers(epapers.filter(e => e.id !== id));
    showToast('e-Paper edition deleted.', 'warning');
  };

  // Reporters Handlers
  const handleAddReporter = (newRep) => {
    setReporters([...reporters, newRep]);
    showToast('Staff reporter account created!', 'success');
  };

  const handleDeleteReporter = (id) => {
    setReporters(reporters.filter(r => r.id !== id));
    showToast('Staff account deleted.', 'warning');
  };

  // Ads Handlers
  const handleAddAd = (newAd) => {
    setAds([newAd, ...ads]);
    showToast('New ad banner launched!', 'success');
  };

  const handleDeleteAd = (id) => {
    setAds(ads.filter(a => a.id !== id));
    showToast('Ad slot removed.', 'warning');
  };

  // Comments Handlers
  const handleApproveComment = (id) => {
    setComments(comments.map(c => c.id === id ? { ...c, status: 'Approved' } : c));
    showToast('Reader comment approved and live!', 'success');
  };

  const handleDeleteComment = (id) => {
    setComments(comments.filter(c => c.id !== id));
    showToast('Comment deleted.', 'warning');
  };

  // Settings Handler
  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    showToast('Site settings updated successfully!', 'success');
  };

  // Session hydration check (prevents flashing the login page on refresh)
  if (!authChecked) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
          <span className="text-xs text-slate-400">Restoring your session...</span>
        </div>
      </div>
    );
  }

  // Render Login Page if user is not authenticated
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Calculate badge counts for sidebar
  const counts = {
    pendingArticles: articles.filter(a => a.status === 'Pending').length,
    pendingComments: comments.filter(c => c.status === 'Pending').length
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Toast Floating Alert Banner */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-300">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 text-xs font-bold ${
            toast.type === 'success' ? 'bg-emerald-900 dark:bg-emerald-950 border-emerald-500/50 text-white' :
            toast.type === 'warning' ? 'bg-amber-900 dark:bg-amber-950 border-amber-500/50 text-white' :
            'bg-slate-900 border-slate-700 text-white'
          }`}>
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="p-1 hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header Navigation */}
      <Header 
        user={currentUser}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        toggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        onOpenAddModal={() => handleOpenCreatePage(null)}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Content Layout with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar */}
        <Sidebar 
          activeTab={activeTab === 'create-article' ? 'news' : activeTab}
          setActiveTab={setActiveTab}
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
          isDesktopOpen={isDesktopSidebarOpen}
          toggleDesktopSidebar={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
          counts={counts}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          
          {activeTab === 'dashboard' && (
            <DashboardHome 
              stats={stats}
              articles={articles}
              breakingNews={breakingNews}
              onNavigate={(tab) => setActiveTab(tab)}
              onApproveArticle={handleApproveArticle}
              onRejectArticle={handleRejectArticle}
              onOpenAddModal={() => handleOpenCreatePage(null)}
            />
          )}

          {activeTab === 'news' && (
            <NewsManagementPage 
              articles={articles}
              categories={categories}
              reporters={reporters}
              onOpenCreatePage={handleOpenCreatePage}
              onDeleteArticle={handleDeleteArticle}
              onToggleStatus={handleToggleArticleStatus}
            />
          )}

          {activeTab === 'create-article' && (
            <CreateArticlePage 
              editingArticle={editingArticleData}
              categories={categories}
              reporters={reporters}
              onSave={handleSaveArticle}
              onCancel={() => { setActiveTab('news'); setEditingArticleData(null); }}
            />
          )}

          {activeTab === 'liveblog' && (
            <LiveBlogPage 
              articles={articles}
              liveUpdates={liveUpdates}
              onAddLiveUpdate={handleAddLiveUpdate}
              onDeleteLiveUpdate={handleDeleteLiveUpdate}
            />
          )}

          {activeTab === 'breaking' && (
            <BreakingTickerPage 
              breakingList={breakingNews}
              onAddBreaking={handleAddBreaking}
              onDeleteBreaking={handleDeleteBreaking}
              onToggleBreaking={handleToggleBreaking}
            />
          )}

          {activeTab === 'photos' && (
            <PhotoGalleryPage 
              photoGalleries={photoGalleries}
              onAddGallery={handleAddGallery}
              onDeleteGallery={handleDeleteGallery}
            />
          )}

          {activeTab === 'epaper' && (
            <EPaperManagementPage 
              epapers={epapers}
              onAddEPaper={handleAddEPaper}
              onDeleteEPaper={handleDeleteEPaper}
            />
          )}

          {activeTab === 'reels' && (
            <ReelsVideoPage />
          )}

          {activeTab === 'youtube-videos' && (
            <YouTubeVideosPage />
          )}

          {activeTab === 'polls' && (
            <PollsRashifalPage 
              poll={poll}
              horoscope={horoscope}
              onUpdatePoll={handleUpdatePoll}
              onUpdateHoroscope={handleUpdateHoroscope}
            />
          )}

          {activeTab === 'categories' && (
            <CategoryManagementPage 
              categories={categories}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {activeTab === 'reporters' && (
            <ReportersPage 
              reporters={reporters}
              onAddReporter={handleAddReporter}
              onDeleteReporter={handleDeleteReporter}
            />
          )}

          {activeTab === 'ads' && (
            <AdManagementPage 
              ads={ads}
              onAddAd={handleAddAd}
              onDeleteAd={handleDeleteAd}
            />
          )}

          {activeTab === 'citizen-news' && (
            <CitizenJournalismPage />
          )}

          {activeTab === 'ad-inquiries' && (
            <AdInquiriesPage />
          )}

          {activeTab === 'comments' && (
            <PollsCommentsPage 
              comments={comments}
              onApproveComment={handleApproveComment}
              onDeleteComment={handleDeleteComment}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage 
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          )}

        </main>

      </div>

    </div>
  );
}
