import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Bell, Search, PlusCircle, ExternalLink, 
  User, LogOut, ShieldCheck, Clock, CheckCircle2, ChevronDown,
  Sun, Moon
} from 'lucide-react';
import Logo from './Logo';

export default function Header({ 
  user, 
  onLogout, 
  activeTab, 
  setActiveTab, 
  toggleMobileSidebar,
  onOpenAddModal,
  theme,
  toggleTheme
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const dateStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
      setCurrentTime(`${dateStr} | ${timeStr}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const notifications = [
    { id: 1, text: "Suresh Verma submitted a new article: Minimum Wage Hike 2026", time: "5 mins ago", unread: true },
    { id: 2, text: "Mumbai Edition e-Paper published successfully", time: "1 hour ago", unread: true },
    { id: 3, text: "3 new reader comments are pending approval", time: "2 hours ago", unread: false }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg transition-colors duration-300">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        
        {/* Left Side: Mobile Menu Button & Brand Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile Toggle */}
          <button 
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="block">
            <Logo size="md" showTagline={true} />
          </div>
        </div>

        {/* Center: Live Clock & Website Link */}
        <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950/60 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>{currentTime || '26 Sep 2026 | 10:00 AM'}</span>
          </div>
          <div className="w-px h-3 bg-slate-300 dark:bg-slate-800" />
          <a 
            href="d:\KamgarTimes_News_Project\Kamgartimes_Hindi_Website" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition font-semibold"
          >
            <span>Live Website</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Theme Switcher Toggle Button (Day / Night Mode) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-800 flex items-center gap-1.5"
            title={theme === 'dark' ? "Switch to Light Mode (Day)" : "Switch to Dark Mode (Night)"}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                <span className="hidden sm:inline text-xs font-bold text-amber-400">Day</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                <span className="hidden sm:inline text-xs font-bold text-slate-700">Night</span>
              </>
            )}
          </button>

          {/* Quick Add Article Button */}
          <button 
            onClick={onOpenAddModal}
            className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg shadow-md flex items-center gap-1.5 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">+ Write Article</span>
            <span className="sm:hidden">+ Write</span>
          </button>

          {/* Notifications Toggle */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 relative transition"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full" />
            </button>

            {/* Notifications Menu */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-red-500" /> Notifications
                  </span>
                  <span className="text-xs text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded font-medium">
                    2 New
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer ${n.unread ? 'bg-slate-50/80 dark:bg-slate-800/30' : ''}`}>
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-snug">{n.text}</p>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  ))}
                </div>
                <div className="p-2 text-center bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
                  <button onClick={() => setShowNotifications(false)} className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
            >
              <img 
                src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"} 
                alt="Admin Profile" 
                className="w-8 h-8 rounded-full border border-red-500 object-cover"
              />
              <div className="hidden lg:flex flex-col text-xs">
                <span className="font-semibold text-slate-900 dark:text-white leading-tight">{user?.name || 'Suresh Verma'}</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400">{user?.role || 'Super Admin'}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 hidden lg:block" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 p-2 space-y-1">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.name || 'Suresh Verma'}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{user?.email || 'admin@kamgartimes.com'}</p>
                  <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-medium">
                    <ShieldCheck className="w-3 h-3" /> Super Admin Access
                  </span>
                </div>
                
                <button 
                  onClick={() => { setActiveTab('settings'); setShowUserMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-slate-400" /> Profile Settings
                </button>
                
                <button 
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10 flex items-center gap-2 font-semibold"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
