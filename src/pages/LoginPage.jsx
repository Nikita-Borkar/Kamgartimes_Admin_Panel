import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, Mail, Eye, EyeOff, KeyRound, 
  ArrowRight, Sparkles, HelpCircle, CheckCircle2, AlertCircle,
  Zap, Newspaper, FileText, Check
} from 'lucide-react';
import Logo from '../components/Logo';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@kamgartimes.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [activeDemoRole, setActiveDemoRole] = useState('admin');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (email === 'admin@kamgartimes.com' && password === 'admin123') {
        onLoginSuccess({
          name: 'Suresh Verma',
          email: 'admin@kamgartimes.com',
          role: 'Super Admin / Chief Editor',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        });
      } else if (email === 'editor@kamgartimes.com' && password === 'editor123') {
        onLoginSuccess({
          name: 'Anjali Sharma',
          email: 'editor@kamgartimes.com',
          role: 'Senior Digital Editor',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80'
        });
      } else {
        onLoginSuccess({
          name: email.split('@')[0],
          email: email,
          role: 'Admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        });
      }
    }, 700);
  };

  const handleDemoFill = (type) => {
    setActiveDemoRole(type);
    if (type === 'admin') {
      setEmail('admin@kamgartimes.com');
      setPassword('admin123');
    } else {
      setEmail('editor@kamgartimes.com');
      setPassword('editor123');
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotSuccess(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSuccess(false);
    }, 2200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-3 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      
      {/* Dynamic Background Ambient Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      
      {/* Subtle Grid Overlay pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Main Glass Card Container */}
      <div className="w-full max-w-md lg:max-w-4xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* Left Section: Sleek Brand Hero Showcase (Hidden on small screens or streamlined cleanly) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900/90 to-red-950/40 p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80">
          
          <div className="space-y-6">
            {/* Header Brand */}
            <Logo size="lg" showTagline={true} />
            
            <div className="space-y-3 pt-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                <Sparkles className="w-3.5 h-3.5" /> Portal Management
              </span>
              
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white font-serif leading-tight">
                Digital Media <span className="bg-gradient-to-r from-red-500 to-amber-400 bg-clip-text text-transparent">Control Hub</span>
              </h2>
              
              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed hidden sm:block">
                Streamlined portal for Maharashtra's leading news network. Manage breaking updates, e-Paper editions, live blogs & reporters effortlessly.
              </p>
            </div>
          </div>

          {/* Quick Highlight Feature Chips (Visible on md/lg) */}
          <div className="mt-6 space-y-2 hidden sm:block">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-300">
              <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-red-400" />
              </div>
              <span className="font-medium">Instant Breaking News Ticker</span>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-300">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-amber-400" />
              </div>
              <span className="font-medium">e-Paper Edition Management</span>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-300">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="font-medium">Multi-tier Role Permissions</span>
            </div>
          </div>

          {/* Left Footer */}
          <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>© 2026 Kamgar Times</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-[10px] font-mono text-slate-300">v2.4 Enterprise</span>
          </div>

        </div>

        {/* Right Section: Focused Clean Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-slate-900/40">
          
          <div className="w-full max-w-sm mx-auto space-y-6">
            
            {/* Form Title & Subtitle */}
            <div className="text-center lg:text-left space-y-1">
              <h3 className="text-2xl font-bold text-white tracking-tight">Admin Sign In</h3>
              <p className="text-xs text-slate-400">
                Enter your authorized credentials to access your dashboard.
              </p>
            </div>

            {/* Quick Demo Pill Selectors */}
            <div className="bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between px-2 pt-1 pb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                  Quick Demo Accounts
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">1-Click Auto Fill</span>
              </div>
              
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleDemoFill('admin')}
                  className={`px-3 py-2 rounded-xl text-left transition-all duration-200 flex items-center justify-between ${
                    activeDemoRole === 'admin'
                      ? 'bg-red-600/20 border border-red-500/50 text-white shadow-sm'
                      : 'bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="truncate">
                    <p className={`text-xs font-bold truncate ${activeDemoRole === 'admin' ? 'text-red-400' : 'text-slate-200'}`}>
                      Super Admin
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">admin@kamgartimes.com</p>
                  </div>
                  {activeDemoRole === 'admin' && <Check className="w-4 h-4 text-red-400 shrink-0 ml-1" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoFill('editor')}
                  className={`px-3 py-2 rounded-xl text-left transition-all duration-200 flex items-center justify-between ${
                    activeDemoRole === 'editor'
                      ? 'bg-amber-500/20 border border-amber-500/50 text-white shadow-sm'
                      : 'bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="truncate">
                    <p className={`text-xs font-bold truncate ${activeDemoRole === 'editor' ? 'text-amber-400' : 'text-slate-200'}`}>
                      Senior Editor
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">editor@kamgartimes.com</p>
                  </div>
                  {activeDemoRole === 'editor' && <Check className="w-4 h-4 text-amber-400 shrink-0 ml-1" />}
                </button>
              </div>
            </div>

            {/* Error Alert Banner */}
            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-red-400 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Email / Username
                </label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-slate-500 group-focus-within:text-red-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setActiveDemoRole(''); }}
                    placeholder="admin@kamgartimes.com"
                    required
                    className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs text-red-400 hover:text-red-300 transition font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-slate-500 group-focus-within:text-red-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setActiveDemoRole(''); }}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300 hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-red-600 focus:ring-red-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-red-600 via-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-900/30 hover:shadow-red-900/50 flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>

            {/* Technical Support Link */}
            <div className="text-center pt-2 border-t border-slate-800/60">
              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                Need help? Contact <a href="mailto:support@kamgartimes.com" className="text-slate-300 hover:text-white underline transition">support@kamgartimes.com</a>
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Reset Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl relative">
            
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-500" /> Reset Password
              </h4>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Enter your registered administrator email address. We will send a secure password reset link to your inbox.
            </p>

            {forgotSuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                <span>Password reset link sent! Check your email inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4 pt-1">
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@kamgartimes.com"
                    required
                    className="w-full bg-slate-950 border border-slate-700/80 focus:border-red-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none"
                  />
                </div>
                
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-md"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

