import React from 'react';
import { 
  LayoutDashboard, Newspaper, Flame, Layers, FileText, 
  Video, Users, Megaphone, MessageSquare, Settings, X, ChevronRight,
  Radio, Camera, HelpCircle, ShieldCheck, Briefcase, Youtube, ChevronLeft, UserCog, ScrollText
} from 'lucide-react';
import Logo from './Logo';
import { hasAnyPermission, hasPermission } from '../utils/permissions';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isMobileOpen, 
  setIsMobileOpen,
  isDesktopOpen = true,
  toggleDesktopSidebar,
  counts = {},
  user = null
}) {
  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      badge: null 
    },
    { 
      id: 'news', 
      label: 'News Articles & Blogs', 
      icon: Newspaper,
      badge: counts.pendingArticles ? `${counts.pendingArticles} New` : null,
      badgeColor: 'bg-amber-500'
    },
    { 
      id: 'liveblog', 
      label: 'Live Blog Coverage', 
      icon: Radio,
      badge: 'LIVE',
      badgeColor: 'bg-red-600'
    },
    { 
      id: 'breaking', 
      label: 'Breaking Ticker', 
      icon: Flame,
      badge: 'LIVE',
      badgeColor: 'bg-red-500'
    },
    { 
      id: 'photos', 
      label: 'Photo Gallery Albums', 
      icon: Camera,
      badge: null
    },
    { 
      id: 'epaper', 
      label: 'e-Paper Digital', 
      icon: FileText,
      badge: 'Today',
      badgeColor: 'bg-emerald-500'
    },
    { 
      id: 'reels', 
      label: 'Reels & Video News', 
      icon: Video,
      badge: null
    },
    { 
      id: 'youtube-videos', 
      label: 'YouTube Full Videos', 
      icon: Youtube,
      badge: null
    },
    { 
      id: 'polls', 
      label: 'Survey Polls & Rashifal', 
      icon: HelpCircle,
      badge: null
    },
    {
      id: 'ads',
      label: 'Ad Banners & Promo',
      icon: Megaphone,
      badge: null,
      visible: hasPermission(user, 'ad:read')
    },
    { 
      id: 'ad-inquiries', 
      label: 'Ad Inquiries (User)', 
      icon: Briefcase,
      badge: 'New',
      badgeColor: 'bg-emerald-500'
    },
    { 
      id: 'citizen-news', 
      label: 'Citizen Journalism', 
      icon: ShieldCheck,
      badge: 'New',
      badgeColor: 'bg-blue-500'
    },
    { 
      id: 'categories', 
      label: 'Categories & Sections', 
      icon: Layers,
      badge: null,
      visible: hasPermission(user, 'category:read')
    },
    { 
      id: 'reporters', 
      label: 'Reporters & Staff', 
      icon: Users,
      badge: null
    },
    { 
      id: 'comments', 
      label: 'Polls & Comments', 
      icon: MessageSquare,
      badge: counts.pendingComments ? `${counts.pendingComments}` : null,
      badgeColor: 'bg-blue-500'
    },
    { 
      id: 'roles', 
      label: 'Roles & Permissions', 
      icon: UserCog,
      badge: null,
      visible: hasAnyPermission(user, 'role:read', 'role:create')
    },
    {
      id: 'static-pages',
      label: 'Static Pages',
      icon: ScrollText,
      badge: null,
      visible: hasPermission(user, 'staticPage:read')
    },
    {
      id: 'settings',
      label: 'Site Settings',
      icon: Settings,
      badge: null,
      visible: hasPermission(user, 'setting:read')
    }
  ];

  const visibleMenuItems = menuItems.filter((item) => item.visible !== false);

  const handleTabClick = (id) => {
    setActiveTab(id);
    setIsMobileOpen(false);
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-colors duration-300">
      
      {/* Sidebar Header (Mobile Close Button) */}
      <div className="p-4 lg:hidden flex items-center justify-end border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 overflow-x-hidden">
        <div className={`px-3 pb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ${!isDesktopOpen ? 'text-center px-0 text-[8px]' : ''}`}>
          {isDesktopOpen ? 'MAIN CONTROLS' : 'MAIN'}
        </div>

        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              title={!isDesktopOpen ? item.label : undefined}
              className={`w-full flex items-center ${isDesktopOpen ? 'justify-between px-3' : 'justify-center px-0'} py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 group ${
                isActive 
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-900/30 font-semibold' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400'
                }`} />
                {isDesktopOpen && <span className="whitespace-nowrap">{item.label}</span>}
              </div>

              {isDesktopOpen && (
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-700'}`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-white/80" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer Info */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-center overflow-hidden">
          {isDesktopOpen ? (
            <>
              <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-300 whitespace-nowrap">Kamgar Times News</p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">v2.4 Enterprise Edition</p>
            </>
          ) : (
            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-300">KT</p>
          )}
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside className={`hidden lg:block shrink-0 h-full z-30 transition-all duration-300 ease-in-out relative ${isDesktopOpen ? 'w-64' : 'w-20'}`}>
        {navContent}
        
        {/* Desktop Toggle Button */}
        <button 
          onClick={toggleDesktopSidebar}
          className="absolute -right-3.5 top-8 w-7 h-7 bg-slate-900 dark:bg-black text-white rounded-full flex items-center justify-center shadow-md hover:bg-slate-800 dark:hover:bg-slate-800 transition-colors z-50 border-2 border-slate-100 dark:border-slate-800 ring-2 ring-slate-900/10 dark:ring-black"
          title={isDesktopOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isDesktopOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-full h-full z-10 shadow-2xl animate-in slide-in-from-left duration-300">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
