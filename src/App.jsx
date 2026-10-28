import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardHome from './pages/DashboardHome';
import NewsManagementPage from './pages/NewsManagementPage';
import NewsTickerPage from './pages/NewsTickerPage';
import LiveNewsPage from './pages/LiveNewsPage';
import CreateArticlePage from './pages/CreateArticlePage';
import ReelsVideoPage from './pages/ReelsVideoPage';
import CategoryManagementPage from './pages/CategoryManagementPage';
import AdManagementPage from './pages/AdManagementPage';
import SettingsPage from './pages/SettingsPage';
import YouTubeVideosPage from './pages/YouTubeVideosPage';
import MediaImagesPage from './pages/MediaImagesPage';
import PhotoGalleryPage from './pages/PhotoGalleryPage';
import NoticesPage from './pages/NoticesPage';
import QotdPage from './pages/QotdPage';
import RolesPermissionsPage from './pages/RolesPermissionsPage';
import StaticPagesPage from './pages/StaticPagesPage';
import { createQuestion, fetchTodayQuestion } from './api/qotd';

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
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

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


  // Poll & Rashifal Handlers
  const handleUpdatePoll = async (newPoll) => {
    setPoll(newPoll);
    try {
      const opts = (newPoll.options || []).map(o => typeof o === 'string' ? o : o.text).filter(Boolean);
      await createQuestion({
        question: newPoll.question,
        options: opts.length > 0 ? opts : ['हाँ', 'नहीं', 'कह नहीं सकते'],
        correctAnswer: opts[0] || 'हाँ',
        explanation: 'जनमत सर्वेक्षण में आपका मत दर्ज किया गया।',
        category: 'जनमत सर्वेक्षण',
        isActive: true,
      });
      showToast('Opinion poll saved to database & live website!', 'success');
    } catch (e) {
      console.error('Failed to sync poll to backend:', e);
      showToast('Poll updated locally.', 'success');
    }
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
  const counts = {};

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
            hasPermission(currentUser, 'dashboard:read') ? (
              <DashboardHome
                user={currentUser}
                onNavigate={(tab) => setActiveTab(tab)}
                onOpenAddModal={() => handleOpenCreatePage(null)}
                showToast={showToast}
              />
            ) : (
              <AccessRestricted />
            )
          )}

          {activeTab === 'news' && (
            <NewsManagementPage 
              categories={categories}
              user={currentUser}
              showToast={showToast}
              onOpenCreatePage={handleOpenCreatePage}
            />
          )}

          {activeTab === 'news-ticker' && (
            hasPermission(currentUser, 'article:read') ? (
              <NewsTickerPage
                categories={categories}
                onManageArticles={() => setActiveTab('news')}
              />
            ) : (
              <AccessRestricted />
            )
          )}

          {activeTab === 'live-news' && (
            hasPermission(currentUser, 'liveNews:read') ? (
              <LiveNewsPage
                categories={categories}
                user={currentUser}
                showToast={showToast}
              />
            ) : (
              <AccessRestricted />
            )
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



          {activeTab === 'notices' && (
            hasPermission(currentUser, 'notice:read') ? (
              <NoticesPage user={currentUser} showToast={showToast} />
            ) : (
              <AccessRestricted />
            )
          )}

          {activeTab === 'photos' && (
            hasPermission(currentUser, 'media:read') ? (
              <PhotoGalleryPage showToast={showToast} />
            ) : (
              <AccessRestricted />
            )
          )}

          {activeTab === 'media-images' && (
            hasPermission(currentUser, 'media:read') ? (
              <MediaImagesPage user={currentUser} showToast={showToast} />
            ) : (
              <AccessRestricted />
            )
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

          {activeTab === 'ads' && (
            hasPermission(currentUser, 'ad:read') ? (
              <AdManagementPage user={currentUser} showToast={showToast} />
            ) : (
              <AccessRestricted />
            )
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
