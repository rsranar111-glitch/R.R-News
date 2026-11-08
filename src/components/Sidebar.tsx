import React, { useState } from 'react';
import {
  X,
  Globe,
  Calendar,
  Sun,
  ShieldCheck,
  LogOut,
  Newspaper,
  Sparkles,
  BarChart3,
  Bookmark,
  Check,
  Bell,
  ChevronRight,
  MapPin,
  TrendingUp,
  Volume2,
  VolumeX,
  Award,
  Type,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  NotificationItem,
  SupportedLanguage,
  UserPreferences,
} from '../types/news.ts';
import {
  SUPPORTED_LANGUAGES,
  getUIText,
} from '../services/translations.ts';
import { COUNTRIES } from '../services/countries.ts';
import { AppLogo } from './AppLogo.tsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (p: Partial<UserPreferences>) => void;
  savedCount: number;
  notifications: NotificationItem[];
  onOpenPrivacy: () => void;
  onSelectNotificationArticle: (articleId?: string, notificationItem?: NotificationItem) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  user,
  onGoogleSignIn,
  onSignOut,
  preferences,
  onUpdatePreferences,
  savedCount,
  notifications,
  onOpenPrivacy,
  onSelectNotificationArticle,
}) => {
  const [isSigningInLocal, setIsSigningInLocal] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [editionPanelTab, setEditionPanelTab] = useState<'country' | 'language'>('country');

  const currentLang = preferences.language || 'en';
  const currentCountry = COUNTRIES.find(c => c.code === (preferences.country || 'global')) || COUNTRIES[0];
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  const handleSignIn = async () => {
    try {
      setIsSigningInLocal(true);
      setSignInError(null);
      await onGoogleSignIn();
    } catch (err: any) {
      setSignInError(err.message || 'Unable to sign in');
    } finally {
      setIsSigningInLocal(false);
    }
  };

  if (!isOpen) return null;

  const handleSelectNav = (tabId: string) => {
    setActiveTab(tabId);
    onClose();
  };

  const handleLanguageChange = (lang: SupportedLanguage) => {
    onUpdatePreferences({ language: lang });
  };

  const navItems = [
    {
      id: 'today',
      label: 'Front Page Edition',
      subtitle: 'Lead stories & top dispatches',
      icon: Sun,
      badge: 'LIVE',
    },
    {
      id: 'feed',
      label: getUIText('headlines', currentLang),
      subtitle: 'Global & regional wire stream',
      icon: Newspaper,
    },
    {
      id: 'portfolio',
      label: 'Markets & Portfolio',
      subtitle: 'Equities, FX & commodities',
      icon: TrendingUp,
    },
    {
      id: 'briefing',
      label: getUIText('dailyBrief', currentLang),
      subtitle: 'Executive synthesis & audio',
      icon: Sparkles,
    },
    {
      id: 'chat',
      label: getUIText('aiDesk', currentLang),
      subtitle: 'Gemini 3.8 intelligence desk',
      icon: Sparkles,
      badge: 'AI',
    },
    {
      id: 'vault',
      label: getUIText('saved', currentLang),
      subtitle: 'Offline reading archive',
      icon: Bookmark,
      badge: savedCount > 0 ? String(savedCount) : undefined,
    },
    {
      id: 'analytics',
      label: getUIText('analytics', currentLang),
      subtitle: 'Reading telemetry & stats',
      icon: BarChart3,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <aside className="relative w-80 sm:w-96 max-w-[88vw] bg-[#0b101b] h-full shadow-2xl flex flex-col z-10 border-r border-white/12 animate-in slide-in-from-left duration-250 ease-out text-slate-100">
        {/* Sidebar Masthead Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#090d16]">
          <div className="flex items-center gap-3 min-w-0">
            <AppLogo size="sm" animate={false} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="headline-font text-base font-bold text-white tracking-tight">
                  R.R NEWS
                </h2>
                <span className="font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-bold">
                  INDEX
                </span>
              </div>
              <p className="text-[11px] font-mono text-cyan-400/90 truncate mt-0.5">
                By Rajveer Singh Rana
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/8 border border-transparent hover:border-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-5 scrollbar-thin">
          {/* 1. PRIMARY EDITORIAL SECTIONS (Top Priority) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-[0.16em]">
                {getUIText('quickNavigation', currentLang)}
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                7 Desks
              </span>
            </div>

            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectNav(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-[#151f34] border-cyan-500/40 text-white shadow-sm'
                        : 'bg-transparent border-transparent text-slate-300 hover:bg-[#111827] hover:border-white/8 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                          isActive
                            ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300'
                            : 'bg-[#111827] border-white/8 text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold truncate">{item.label}</span>
                          {item.badge && (
                            <span className="font-mono text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{item.subtitle}</p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive ? 'text-cyan-400 translate-x-0.5' : 'text-slate-500'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. REGIONAL BUREAU & TRANSLATION SWITCHER (Segmented Card) */}
          <div className="bg-[#111827] border border-white/10 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Bureau & Localization
              </span>
              <span className="font-mono text-[10px] text-cyan-400 font-semibold">
                {currentCountry.flag} {currentCountry.code.toUpperCase()} · {currentLangObj.code.toUpperCase()}
              </span>
            </div>

            {/* Segmented Tab Controls */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[#090d16] border border-white/8">
              <button
                type="button"
                onClick={() => setEditionPanelTab('country')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  editionPanelTab === 'country'
                    ? 'bg-[#162035] text-white border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Edition ({ currentCountry.code.toUpperCase() })</span>
              </button>
              <button
                type="button"
                onClick={() => setEditionPanelTab('language')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  editionPanelTab === 'language'
                    ? 'bg-[#162035] text-white border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Language ({ currentLangObj.native })</span>
              </button>
            </div>

            {/* Tab Content: Regional Country Bureau OR Language */}
            {editionPanelTab === 'country' ? (
              <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-0.5 scrollbar-thin">
                {COUNTRIES.map((c) => {
                  const isSelected = (preferences.country || 'global') === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => onUpdatePreferences({ country: c.code })}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/60 text-white border-cyan-400/50'
                          : 'bg-[#090d16]/80 text-slate-300 border-white/8 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span>{c.flag}</span>
                        <span className="truncate">{c.name}</span>
                      </span>
                      {isSelected && <Check className="w-3 h-3 shrink-0 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-0.5 scrollbar-thin">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = currentLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/60 text-white border-cyan-400/50'
                          : 'bg-[#090d16]/80 text-slate-300 border-white/8 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span>{lang.flag}</span>
                        <span className="truncate">{lang.native}</span>
                      </span>
                      {isSelected && <Check className="w-3 h-3 shrink-0 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. SUBSCRIBER & ANALYST ACCOUNT */}
          <div className="p-3.5 rounded-xl bg-[#111827] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Subscriber Credentials
              </span>
              {user && (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Synced</span>
                </span>
              )}
            </div>

            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-cyan-500/40 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-cyan-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                        {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">
                      {user.displayName || 'Verified Subscriber'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('calendar');
                      onClose();
                    }}
                    className="text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer font-medium"
                  >
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{getUIText('calendarSchedule', currentLang)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={onSignOut}
                    className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{getUIText('signOut', currentLang)}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Sign in to sync your portfolio watchlist, offline vault, and personalized executive briefings.
                </p>

                {signInError && (
                  <div className="text-xs text-rose-300 bg-rose-950/40 p-2.5 rounded-lg border border-rose-500/30 space-y-1">
                    <p className="font-semibold">{signInError}</p>
                    <p className="text-[11px] text-rose-400">
                      Use "Instant Analyst Profile" below to activate immediately.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isSigningInLocal}
                  className="w-full py-2 px-3 rounded-lg bg-[#090d16] border border-white/15 hover:border-cyan-400/50 flex items-center justify-center gap-2 text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isSigningInLocal ? (
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                  )}
                  <span>{isSigningInLocal ? 'Signing in...' : getUIText('signInWithGoogle', currentLang)}</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const { signInAsDemoUser } = await import('../services/firebase.ts');
                    signInAsDemoUser('Rajveer Singh Rana (Chief Analyst)');
                    setSignInError(null);
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Instant Analyst Profile (1-Click)</span>
                </button>
              </div>
            )}
          </div>

          {/* 4. LIVE WIRE ALERTS IN SIDEBAR */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                <Bell className="w-3 h-3 text-cyan-400" />
                <span>{getUIText('recentUpdates', currentLang)}</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">{notifications.length} Dispatches</span>
            </div>

            <div className="max-h-40 overflow-y-auto divide-y divide-white/8 rounded-xl bg-[#111827] border border-white/10 text-xs">
              {notifications.length === 0 ? (
                <p className="p-3 text-center text-slate-400 text-xs">
                  {getUIText('noAlerts', currentLang)}
                </p>
              ) : (
                notifications.slice(0, 4).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      onSelectNotificationArticle(n.articleId, n);
                      onClose();
                    }}
                    className="p-3 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-0.5">
                      <span className="font-bold text-cyan-400 uppercase">
                        {n.category}
                      </span>
                      <span>{n.timestamp}</span>
                    </div>
                    <p className="font-medium text-slate-200 line-clamp-2 leading-snug">
                      {n.title}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 5. READING & TELEMETRY CONTROLS */}
          <div className="bg-[#111827] border border-white/10 rounded-xl p-3.5 space-y-2.5 text-xs">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-1">
              Reader Preferences
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="flex items-center gap-2 text-slate-300 font-medium">
                <Type className="w-3.5 h-3.5 text-cyan-400" />
                <span>Typography Scale</span>
              </span>
              <button
                type="button"
                onClick={() =>
                  onUpdatePreferences({
                    fontScale: preferences.fontScale === 'normal' ? 'large' : 'normal',
                  })
                }
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#090d16] border border-white/12 hover:border-cyan-400/50 text-slate-200 cursor-pointer transition-colors"
              >
                {preferences.fontScale === 'large' ? 'Large (115%)' : 'Standard (100%)'}
              </button>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-white/8 pt-2">
              <span className="flex items-center gap-2 text-slate-300 font-medium">
                {preferences.audioAlertsEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>Breaking Audio Alerts</span>
              </span>
              <button
                type="button"
                onClick={() =>
                  onUpdatePreferences({ audioAlertsEnabled: !preferences.audioAlertsEnabled })
                }
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border cursor-pointer transition-colors ${
                  preferences.audioAlertsEnabled
                    ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                    : 'bg-[#090d16] border-white/12 text-slate-400 hover:text-slate-200'
                }`}
              >
                {preferences.audioAlertsEnabled ? 'Active' : 'Muted'}
              </button>
            </div>

            <div className="pt-2 border-t border-white/8">
              <button
                type="button"
                onClick={() => {
                  onOpenPrivacy();
                  onClose();
                }}
                className="w-full py-2 px-2.5 rounded-lg bg-[#090d16] border border-white/10 hover:border-white/25 text-slate-300 hover:text-white text-xs flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{getUIText('privacySettings', currentLang)}</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Sidebar Publisher Watermark Footer */}
        <div className="px-5 py-3.5 border-t border-white/12 bg-[#080b13] flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.16em] text-slate-400">
              <Award className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="font-bold text-white">R.R NEWS</span>
              <span>·</span>
              <span>OFFICIAL EDITION</span>
            </div>
            <p className="text-xs font-semibold text-cyan-300 tracking-wide mt-0.5 truncate">
              By Rajveer Singh Rana
            </p>
          </div>
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest shrink-0">
            VERIFIED
          </span>
        </div>
      </aside>
    </div>
  );
};
