import React, { useState } from 'react';
import {
  Menu,
  Search,
  X,
  ChevronDown,
  ChevronRight,
  Calendar,
  TrendingUp,
  Globe,
  Radio,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { NotificationItem, UserPreferences } from '../types/news.ts';
import { COUNTRIES, getCountryByCode } from '../services/countries.ts';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  darkMode?: boolean;
  setDarkMode?: (val: boolean) => void;
  isOnline: boolean;
  savedCount: number;
  notifications: NotificationItem[];
  markNotificationsAsRead: () => void;
  onSelectNotificationArticle?: (notification: NotificationItem) => void;
  user: User | null;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
  onOpenPrivacy: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (p: Partial<UserPreferences>) => void;
  onOpenSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  isOnline,
  savedCount,
  preferences,
  onUpdatePreferences,
  onOpenSidebar,
}) => {
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const currentCountryInfo = getCountryByCode(preferences.country || 'global');

  // Format date like "SUN, 08 NOV 2026" as shown in screenshot
  const now = new Date();
  const weekday = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const dayNum = String(now.getDate()).padStart(2, '0');
  const monthShort = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const yearNum = now.getFullYear();
  const statusBarDate = `${weekday}, ${dayNum} ${monthShort} ${yearNum}`;

  const handleSearchFormSubmit = (e: React.FormEvent) => {
    onSearchSubmit(e);
    setIsSearchOpen(false);
  };

  const navSections = [
    { id: 'today', label: 'Front Page' },
    { id: 'feed', label: 'World & Wire' },
    { id: 'portfolio', label: 'Markets & Portfolio' },
    { id: 'briefing', label: 'Executive Brief' },
    { id: 'vault', label: savedCount > 0 ? `Saved (${savedCount})` : 'Saved Vault' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'chat', label: 'AI Desk' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#070b14]/95 backdrop-blur-xl border-b border-cyan-500/15 text-slate-100">
      {/* Row 1: Top Status Bar (LIVE | SUN, 08 NOV 2026 | R.R NEWS ↗) */}
      <div className="border-b border-white/10 bg-[#050811] text-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-emerald-400 text-[11px] whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#22c55e] animate-pulse shrink-0" />
              <span>{isOnline ? 'LIVE' : 'OFFLINE'}</span>
            </span>

            <span className="text-slate-600" aria-hidden="true">|</span>

            <span className="inline-flex items-center gap-1.5 text-slate-300 font-medium text-[11px] tracking-wide whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{statusBarDate}</span>
            </span>

            <span className="text-slate-600" aria-hidden="true">|</span>
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('today')}
              className="font-extrabold tracking-wider uppercase text-cyan-400 hover:text-cyan-300 text-xs whitespace-nowrap cursor-pointer transition-colors"
            >
              R.R NEWS
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('portfolio')}
              className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer shrink-0"
              title="Markets & Portfolio"
              aria-label="Markets & Portfolio"
            >
              <TrendingUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Main Masthead Bar (Menu | R.R Badge | R.R NEWS GLOBAL WIRE & MARKETS | Search | Globe) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2.5 sm:py-3 gap-1.5 sm:gap-3">
          {/* Left: Hamburger Button + R.R Emblem Box + Vertical Divider + Complete App Name */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenSidebar}
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#0d1526] hover:bg-[#131f38] border border-cyan-500/25 flex items-center justify-center text-cyan-400 transition-colors cursor-pointer shrink-0 shadow-inner"
              title="Open Navigation & Edition Menu"
              aria-label="Open Menu"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.25]" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('today')}
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#0d1526] hover:bg-[#131f38] border border-cyan-500/25 flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-inner"
              title="R.R News Front Page"
            >
              <span className="headline-font font-extrabold text-xs sm:text-base text-white tracking-tight whitespace-nowrap">
                R.R
              </span>
            </button>

            {/* Vertical Cyan Divider Line */}
            <div className="h-8 sm:h-9 w-[1.5px] bg-cyan-500/40 shrink-0 mx-0.5" aria-hidden="true" />

            {/* Full App Name & Subtitle — Never Truncated */}
            <button
              type="button"
              onClick={() => setActiveTab('today')}
              className="text-left flex flex-col justify-center cursor-pointer shrink-0"
            >
              <span className="headline-font text-[18px] xs:text-xl sm:text-2xl font-extrabold text-white tracking-wide leading-none whitespace-nowrap">
                R.R NEWS
              </span>
              <span className="text-[8.5px] xs:text-[9.5px] sm:text-[10.5px] font-semibold uppercase tracking-[0.11em] sm:tracking-[0.16em] text-slate-400 mt-1 whitespace-nowrap">
                GLOBAL WIRE &amp; MARKETS
              </span>
            </button>
          </div>

          {/* Right: Circular Search Button + Pill Globe Edition Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Desktop Inline Search */}
            <div className="hidden lg:block w-60 mr-1">
              <form onSubmit={handleSearchFormSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dispatches, topics..."
                  className="w-full pl-8 pr-7 py-2 text-xs rounded-full bg-[#0d1526] border border-slate-700/80 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
                />
                <Search className="w-3.5 h-3.5 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>
            </div>

            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#0d1526] hover:bg-[#131f38] border border-slate-700/80 flex items-center justify-center text-slate-200 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Search Dispatches"
              aria-label="Search"
            >
              <Search className="w-4 h-4 stroke-[2.2]" />
            </button>

            {/* Globe Edition Selector Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCountryMenu(!showCountryMenu)}
                className="h-9 px-2.5 sm:h-10 sm:px-3.5 rounded-full bg-[#0d1526] hover:bg-[#131f38] border border-slate-700/80 flex items-center gap-1 text-slate-200 hover:text-white transition-colors cursor-pointer shrink-0"
                title={`Edition: ${currentCountryInfo.name}`}
                aria-label="Select Regional Edition"
              >
                <Globe className="w-4 h-4 text-slate-200 shrink-0" />
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {showCountryMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0d1526] rounded-xl shadow-2xl border border-cyan-500/25 py-1.5 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 border-b border-white/10 flex items-center justify-between">
                    <span>Regional Edition</span>
                    <Radio className="w-3 h-3 text-cyan-400" />
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {COUNTRIES.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          onUpdatePreferences({ country: c.code });
                          setShowCountryMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-white/8 transition-colors cursor-pointer ${
                          preferences.country === c.code
                            ? 'font-bold text-cyan-400 bg-cyan-950/40'
                            : 'text-slate-200'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{c.flag}</span>
                          <span>{c.name}</span>
                        </span>
                        {preferences.country === c.code && <span className="text-cyan-400">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expandable Search Bar when Search Icon Clicked */}
        {isSearchOpen && (
          <div className="lg:hidden py-2.5 border-t border-white/10">
            <form onSubmit={handleSearchFormSubmit} className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search R.R News dispatches..."
                  autoFocus
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-[#0d1526] border border-cyan-500/30 text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
                />
                <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Row 3: Horizontal Navigation Strip (Front Page | World & Wire | Markets & Portfolio | Executive Brief >) */}
      <div className="border-t border-white/10 bg-[#070b14]">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 relative flex items-center">
          <nav
            className="w-full flex items-center gap-5 sm:gap-7 overflow-x-auto scrollbar-none pr-6"
            aria-label="Primary Navigation"
          >
            {navSections.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2.5 text-[13px] whitespace-nowrap border-b-[3px] transition-all cursor-pointer ${
                    isActive
                      ? 'border-cyan-400 text-white font-bold shadow-[0_4px_12px_-2px_rgba(34,211,238,0.5)]'
                      : 'border-transparent text-slate-300 hover:text-white font-medium'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 pl-3 bg-gradient-to-l from-[#070b14] via-[#070b14]/90 to-transparent flex items-center">
            <ChevronRight className="w-4 h-4 text-cyan-400" />
          </div>
        </div>
      </div>
    </header>
  );
};
