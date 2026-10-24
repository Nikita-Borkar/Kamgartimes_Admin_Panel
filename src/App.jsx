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
import MediaImagesPage from './pages/MediaImagesPage';
import NoticesPage from './pages/NoticesPage';
import QotdPage from './pages/QotdPage';
import RolesPermissionsPage from './pages/RolesPermissionsPage';
import StaticPagesPage from './pages/StaticPagesPage';

// Mock Data
import { 
  INITIAL_STATS, 
  INITIAL_ARTICLES, 
  INITIAL_LIVE_UPDATES,
  INITIAL_BREAKING_NEWS, 
  INITIAL_PHOTO_GALLERIES,
  INITIAL_REPORTERS, 
  INITIAL_EPAPERS, 
  INITIAL_POLL,
  INITIAL_HOROSCOPE,
  INITIAL_COMMENTS
} from './data/mockData';

import { CheckCircle2, AlertCircle, X, Lock } from 'lucide-react';

function AccessRestricted() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-xl flex flex-col items-center text-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <Lock className="w-5 h-5 text-red-400" />
      </div>
      <h3 className="text-sm font-bold text-white">Access Restricted</h3>
      <p className="text-xs text-slate-400 max-w-sm">
        Your account does not have the required permissions to access this module. Contact an administrator if you need access.
      </p>
    </div>
  );
}
import { restoreSession, clearSession } from './api/auth';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from './api/categories';
import { hasAnyPermission, hasPermission } from './utils/permissions';

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

  // Categories (backend-backed): navigation categories + their sections
  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const data = await fetchCategories({ limit: 500 });
      const list = Array.isArray(data) ? data : (data?.categories || []);
      setCategories(list);
    } catch {
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    if (hasPermission(currentUser, 'category:read')) {
      loadCategories();
    } else {
      setCategoriesLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

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
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [reporters, setReporters] = useState(INITIAL_REPORTERS);
  const [epapers, setEpapers] = useState(INITIAL_EPAPERS);
  const [poll, setPoll] = useState(INITIAL_POLL);
  const [horoscope, setHoroscope] = useState(INITIAL_HOROSCOPE);
  const [comments, setComments] = useState(INITIAL_COMMENTS);

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

  // (Articles are saved/published by CreateArticlePage directly against the backend API)

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

  // Category Handlers (API-backed; return error message string or null)
  const handleCreateCategory = async (values) => {
    try {
      await createCategory(values);
      await loadCategories();
      return null;
    } catch (err) {
      return err?.message || 'Failed to create category.';
    }
  };

  const handleUpdateCategory = async (id, values) => {
    try {
      await updateCategory(id, values);
      await loadCategories();
      return null;
    } catch (err) {
      return err?.message || 'Failed to update category.';
    }
  };

  const handleDeactivateCategory = async (id) => {
    try {
      await deleteCategory(id);
      await loadCategories();
      return null;
    } catch (err) {
      return err?.message || 'Failed to deactivate category.';
    }
  };

  const handleRestoreCategory = async (id) => {
    try {
      await updateCategory(id, { isActive: true });
      await loadCategories();
      return null;
    } catch (err) {
      return err?.message || 'Failed to reactivate category.';
    }
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
  // (settings are saved by SettingsPage directly against the backend API)

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
          user={currentUser}
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
              categories={categories}
              user={currentUser}
              showToast={showToast}
              onOpenCreatePage={handleOpenCreatePage}
            />
          )}

          {activeTab === 'create-article' && (
            <CreateArticlePage 
              editingArticle={editingArticleData}
              categories={categories}
              showToast={showToast}
              onSaved={() => { setActiveTab('news'); setEditingArticleData(null); }}
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

          {activeTab === 'notices' && (
            hasPermission(currentUser, 'notice:read') ? (
              <NoticesPage user={currentUser} showToast={showToast} />
            ) : (
              <AccessRestricted />
            )
          )}

          {activeTab === 'photos' && (
            <PhotoGalleryPage 
              photoGalleries={photoGalleries}
              onAddGallery={handleAddGallery}
              onDeleteGallery={handleDeleteGallery}
            />
          )}

          {activeTab === 'media-images' && (
            hasPermission(currentUser, 'media:read') ? (
              <MediaImagesPage user={currentUser} showToast={showToast} />
            ) : (
              <AccessRestricted />
            )
          )}

          {activeTab === 'epaper' && (
            <EPaperManagementPage 
              epapers={epapers}
              onAddEPaper={handleAddEPaper}
              onDeleteEPaper={handleDeleteEPaper}
            />
          )}

          {activeTab === 'reels' && (
            hasPermission(currentUser, 'media:read') ? (
              <ReelsVideoPage categories={categories} user={currentUser} showToast={showToast} />
            ) : (
              <AccessRestricted />
            )
          )}

          {activeTab === 'youtube-videos' && (
            hasPermission(currentUser, 'media:read') ? (
              <YouTubeVideosPage categories={categories} user={currentUser} showToast={showToast} />
            ) : (
              <AccessRestricted />
            )
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
            hasPermission(currentUser, 'category:read') ? (
              <CategoryManagementPage 
                categories={categories}
                loading={categoriesLoading}
                user={currentUser}
                showToast={showToast}
                onCreate={handleCreateCategory}
                onUpdate={handleUpdateCategory}
                onDeactivate={handleDeactivateCategory}
                onRestore={handleRestoreCategory}
              />
            ) : (
              <AccessRestricted />
            )
          )}

          {activeTab === 'reporters' && (
            <ReportersPage 
              reporters={reporters}
              onAddReporter={handleAddReporter}
              onDeleteReporter={handleDeleteReporter}
            />
          )}

          {activeTab === 'ads' && (
            hasPermission(currentUser, 'ad:read') ? (
              <AdManagementPage user={currentUser} showToast={showToast} />
            ) : (
              <AccessRestricted />
            )
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

          {activeTab === 'roles' && (
            hasAnyPermission(currentUser, 'role:read', 'role:create') ? (
              <RolesPermissionsPage user={currentUser} showToast={showToast} />
            ) : (
              <AccessRestricted />
            )
          )}

          {activeTab === 'static-pages' && (
            hasPermission(currentUser, 'staticPage:read') ? (
              <StaticPagesPage user={currentUser} showToast={showToast} />
            ) : (
              <AccessRestricted />
            )
          )}

          {activeTab === 'qotd' && (
            hasPermission(currentUser, 'qotd:read') ? (
              <QotdPage user={currentUser} showToast={showToast} />
            ) : (
              <AccessRestricted />
            )
          )}

          {activeTab === 'settings' && (
            hasAnyPermission(currentUser, 'setting:read', 'setting:update') ? (
              <SettingsPage user={currentUser} showToast={showToast} />
            ) : (
              <AccessRestricted />
            )
          )}

        </main>

      </div>

    </div>
  );
}
