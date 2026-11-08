import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  Article,
  NewsCategory,
  SavedArticle,
  EngagementMetrics,
  UserPreferences,
  NotificationItem,
} from './types/news.ts';
import {
  getSavedArticles,
  saveArticleOffline,
  removeArticleOffline,
  isArticleSaved,
  getUserPreferences,
  saveUserPreferences,
  getEngagementMetrics,
  recordReadingTime,
} from './services/storage.ts';
import { initAuth, googleSignIn, logout } from './services/firebase.ts';
import { Navbar } from './components/Navbar.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { BreakingTicker } from './components/BreakingTicker.tsx';
import { CurrencyTicker } from './components/CurrencyTicker.tsx';
import { CategoryBar } from './components/CategoryBar.tsx';
import { ArticleCard } from './components/ArticleCard.tsx';
import { ArticleDetailModal } from './components/ArticleDetailModal.tsx';
import { DailyBriefing } from './components/DailyBriefing.tsx';
import { OfflineVault } from './components/OfflineVault.tsx';
import { AnalyticsDashboard } from './components/AnalyticsDashboard.tsx';
import { GeminiChatDesk } from './components/GeminiChatDesk.tsx';
import { CalendarModal } from './components/CalendarModal.tsx';
import { ShareModal } from './components/ShareModal.tsx';
import { PrivacyModal } from './components/PrivacyModal.tsx';
import { PushNotificationToast } from './components/PushNotificationToast.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { TodaySection } from './components/TodaySection.tsx';
import { BingWeatherWidget } from './components/BingWeatherWidget.tsx';
import { BingMarketWatchlist } from './components/BingMarketWatchlist.tsx';
import { AppLogo } from './components/AppLogo.tsx';
import { BingDailyPulse } from './components/BingDailyPulse.tsx';
import { BingTrendingBar } from './components/BingTrendingBar.tsx';
import { PortfolioDashboard } from './components/PortfolioDashboard.tsx';
import { CredibilityAuditModal } from './components/CredibilityAuditModal.tsx';
import { getLocalizedArticle, translateArticlesBatch } from './services/translations.ts';
import { getArticleImage, handleImageError } from './utils/imageFallback.ts';
import { formatTimeAgo } from './utils/timeAgo.ts';
import { RotateCcw, Bookmark, Share2, Sparkles, ShieldCheck, Award, Clock, Globe } from 'lucide-react';

const CATEGORIES: NewsCategory[] = [
  'All',
  'Technology',
  'Business',
  'Currency',
  'Sports',
  'World',
  'Science',
  'Climate',
  'Health',
];

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'today' | 'feed' | 'briefing' | 'vault' | 'analytics' | 'chat' | 'calendar' | 'portfolio'
  >('today');
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('All');
  const [showOnlyTrending, setShowOnlyTrending] = useState(true);

  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [, setNewsError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchedQuery, setActiveSearchedQuery] = useState<string | null>(null);

  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [metrics, setMetrics] = useState<EngagementMetrics>(getEngagementMetrics());
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const p = getUserPreferences();
    return { ...p, darkMode: true };
  });

  const [activeArticleDetail, setActiveArticleDetail] = useState<Article | null>(null);
  const [shareArticle, setShareArticle] = useState<Article | null>(null);
  const [calendarArticle, setCalendarArticle] = useState<Article | null>(null);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [chatInitialArticle, setChatInitialArticle] = useState<Article | null>(null);
  const [activeAuditArticle, setActiveAuditArticle] = useState<Article | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleOpenAudit = (article: Article) => {
    setActiveAuditArticle(article);
    setIsAuditModalOpen(true);
  };

  const [user, setUser] = useState<User | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Breakthrough in solid-state battery cells promises 800-mile EV range',
      summary: 'Materials scientists demonstrate ultra-thin ceramic electrolyte.',
      category: 'Technology',
      timestamp: '18m ago',
      isRead: false,
      isBreaking: true,
      articleId: 'rr-news-101',
    },
  ]);
  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, [preferences.darkMode]);

  const [, setTick] = useState(0);
  useEffect(() => {
    const liveTick = setInterval(() => {
      setTick(prev => prev + 1);
    }, 30000);
    return () => clearInterval(liveTick);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser) => setUser(currentUser),
      () => setUser(null)
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setSavedArticles(getSavedArticles());
  }, []);

  const fetchNews = async (
    cat: NewsCategory = selectedCategory,
    query: string = '',
    country: string = preferences.country || 'global',
    isSilent = false
  ) => {
    if (!isSilent) setIsLoadingNews(true);
    setNewsError(null);
    try {
      let url = '/api/news';
      const params = new URLSearchParams();
      if (query.trim()) {
        params.append('q', query.trim());
      } else if (cat !== 'All') {
        params.append('category', cat);
      }
      if (country && country !== 'global') {
        params.append('country', country);
      }

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.articles)) {
        setIsOnline(true);
        setArticles(data.articles);
        setNewsError(null);
        setActiveSearchedQuery(query.trim() || null);
        setLastRefreshedAt(new Date());

        const breaking = data.articles.filter((a: Article) => a.isBreaking);
        if (breaking.length > 0) {
          const freshNotifs: NotificationItem[] = breaking.slice(0, 5).map((a: Article) => ({
            id: `notif-${a.id}`,
            title: a.title,
            summary: a.summary,
            category: a.category,
            timestamp: a.publishedAt || 'Just now',
            isRead: false,
            isBreaking: true,
            articleId: a.id,
          }));
          setNotifications(freshNotifs);
        }
      } else {
        throw new Error(data.error || 'Failed to fetch news');
      }
    } catch (err: any) {
      if (!isSilent) setNewsError(err.message || 'Unable to load stories');
      if (savedArticles.length > 0 && articles.length === 0) {
        setArticles(savedArticles);
      }
    } finally {
      setIsLoadingNews(false);
    }
  };

  useEffect(() => {
    fetchNews(selectedCategory, '', preferences.country || 'global');
  }, [selectedCategory, preferences.country]);

  useEffect(() => {
    const autoRefreshTimer = setInterval(() => {
      fetchNews(selectedCategory, searchQuery, preferences.country || 'global', true);
    }, 2 * 60 * 1000);

    return () => clearInterval(autoRefreshTimer);
  }, [selectedCategory, searchQuery, preferences.country]);

  useEffect(() => {
    const handleReturnToApp = () => {
      if (document.visibilityState === 'visible') {
        fetchNews(selectedCategory, searchQuery, preferences.country || 'global', true);
      }
    };

    document.addEventListener('visibilitychange', handleReturnToApp);
    window.addEventListener('focus', handleReturnToApp);
    window.addEventListener('pageshow', handleReturnToApp);

    return () => {
      document.removeEventListener('visibilitychange', handleReturnToApp);
      window.removeEventListener('focus', handleReturnToApp);
      window.removeEventListener('pageshow', handleReturnToApp);
    };
  }, [selectedCategory, searchQuery, preferences.country]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && !document.hidden) {
        const updated = recordReadingTime(5);
        setMetrics(updated);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    fetchNews('All', searchQuery);
    setActiveTab('feed');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveSearchedQuery(null);
    fetchNews(selectedCategory, '');
  };

  const handleToggleSaveArticle = (article: Article) => {
    const updated = saveArticleOffline(article);
    setSavedArticles(updated);
    setMetrics(getEngagementMetrics());
  };

  const handleRemoveFromVault = (articleId: string) => {
    const updated = removeArticleOffline(articleId);
    setSavedArticles(updated);
    setMetrics(getEngagementMetrics());
  };

  const handleClearVault = () => {
    if (window.confirm('Clear all saved articles?')) {
      savedArticles.forEach(a => removeArticleOffline(a.id));
      setSavedArticles([]);
      setMetrics(getEngagementMetrics());
    }
  };

  const handleUpdatePreferences = (newPrefs: Partial<UserPreferences>) => {
    const updated = saveUserPreferences(newPrefs);
    setPreferences(updated);
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (result) setUser(result.user);
    } catch (err: any) {
      console.error('Sign in error:', err);
      throw err;
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
  };

  const handleOpenArticle = (article: Article) => setActiveArticleDetail(article);

  const handleSelectNotification = (articleId?: string, item?: NotificationItem) => {
    let target = articleId ? articles.find(a => a.id === articleId) : undefined;

    if (!target && item?.title) {
      target = articles.find(
        a =>
          a.title.toLowerCase().includes(item.title.toLowerCase()) ||
          item.title.toLowerCase().includes(a.title.toLowerCase())
      );
    }

    if (!target && articleId) {
      target = savedArticles.find(a => a.id === articleId);
    }

    if (!target && item) {
      target = {
        id: item.articleId || item.id,
        title: item.title,
        summary: item.summary || item.title,
        content: `${item.title}\n\n${item.summary || ''}\n\nVerified live alert from R.R News global network.`,
        source: 'R.R News Live Intelligence',
        sourceUrl: '#',
        category: (item.category as any) || 'All',
        imageUrl: '',
        publishedAt: new Date().toISOString(),
        readTime: '2 min read',
        isBreaking: item.isBreaking ?? true,
        keyTakeaways: [item.title, item.summary || 'Developing story'],
      };
    } else if (!target && articles.length > 0) {
      target = articles[0];
    }

    if (target) {
      if (item?.id || articleId) {
        setNotifications(prev =>
          prev.map(n => (n.id === item?.id || n.articleId === articleId ? { ...n, isRead: true } : n))
        );
      }
      handleOpenArticle(target);
    }
  };

  const handleOpenShare = (article: Article) => setShareArticle(article);
  const handleScheduleCalendar = (article?: Article | null) => {
    setCalendarArticle(article || null);
    setIsCalendarModalOpen(true);
  };
  const handleAskGemini = (article: Article) => {
    setChatInitialArticle(article);
    setActiveTab('chat');
  };

  const [translatedArticles, setTranslatedArticles] = useState<Article[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const lang = preferences.language || 'en';
    if (lang === 'en' || !articles || articles.length === 0) {
      setTranslatedArticles(articles);
      setIsTranslating(false);
      return;
    }

    setIsTranslating(true);
    translateArticlesBatch(articles, lang)
      .then((translated) => {
        if (isMounted) {
          setTranslatedArticles(translated);
          setIsTranslating(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTranslatedArticles(articles);
          setIsTranslating(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [articles, preferences.language]);

  const localizedArticles = (translatedArticles.length > 0 ? translatedArticles : articles).map(a =>
    getLocalizedArticle(a, preferences.language || 'en')
  );

  const rawArticles = (
    showOnlyTrending
      ? localizedArticles.filter(a => a && (a.isBreaking || a.isTrending))
      : localizedArticles
  ).filter(a => Boolean(a && a.title));

  const displayArticles = [...rawArticles].sort((a, b) => {
    const timeDiff = (b.publishedTimestamp || 0) - (a.publishedTimestamp || 0);
    if (timeDiff !== 0) return timeDiff;
    return (a.trendingRank || 99) - (b.trendingRank || 99);
  });

  const leadArticle = displayArticles.length > 0 ? displayArticles[0] : null;
  const wireArticles =
    displayArticles.length > 1 ? displayArticles.slice(1).filter(a => Boolean(a && a.title)) : [];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-[#090d16] text-slate-100 selection:bg-cyan-500/25">
      <div className="relative z-10 flex flex-col min-h-screen w-full max-w-full overflow-x-hidden">
        {/* Two-Tier Publication Masthead */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab as any);
            if (tab === 'calendar') handleScheduleCalendar(null);
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          isOnline={isOnline}
          savedCount={savedArticles.length}
          notifications={notifications}
          markNotificationsAsRead={() => {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          }}
          onSelectNotificationArticle={(item) => handleSelectNotification(item.articleId, item)}
          user={user}
          onGoogleSignIn={handleGoogleSignIn}
          onSignOut={handleSignOut}
          onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
          preferences={preferences}
          onUpdatePreferences={handleUpdatePreferences}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />

        {/* Financial Market & FX Tape */}
        <CurrencyTicker
          onSelectCurrency={() => {
            setSelectedCategory('Currency');
            setActiveTab('feed');
          }}
          language={preferences.language}
        />

        {/* Developing Story Wire Strip */}
        <BreakingTicker
          articles={localizedArticles}
          onSelectArticle={handleOpenArticle}
          audioAlertsEnabled={preferences.audioAlertsEnabled}
          onToggleAudio={() =>
            handleUpdatePreferences({ audioAlertsEnabled: !preferences.audioAlertsEnabled })
          }
          language={preferences.language}
        />

        {/* Editorial Topics In Focus (Shown on World & Wire Feed) */}
        {activeTab === 'feed' && (
          <BingTrendingBar
            activeQuery={activeSearchedQuery}
            onSelectQuery={(q) => {
              setSearchQuery(q);
              fetchNews('All', q, preferences.country || 'global');
              setActiveTab('feed');
            }}
          />
        )}

        {/* Main Broadsheet Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-7">
          {/* TAB 1: WORLD & WIRE FEED */}
          {activeTab === 'feed' && (
            <div className="space-y-6">
              {/* Desk Category Bar */}
              <CategoryBar
                categories={CATEGORIES}
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  if (activeSearchedQuery) handleClearSearch();
                }}
                showOnlyTrending={showOnlyTrending}
                onToggleOnlyTrending={() => setShowOnlyTrending(!showOnlyTrending)}
                onRefresh={() =>
                  fetchNews(selectedCategory, searchQuery, preferences.country || 'global')
                }
                isRefreshing={isLoadingNews}
                language={preferences.language}
                onSelectLanguage={(lang) => handleUpdatePreferences({ language: lang })}
                isTranslating={isTranslating}
                country={preferences.country || 'global'}
                onOpenCountrySelect={() => setIsSidebarOpen(true)}
                lastRefreshedAt={lastRefreshedAt}
              />

              {/* Active Search Query Header */}
              {activeSearchedQuery && (
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs text-slate-300">
                  <span>
                    Search Dispatches for: <strong className="text-white">"{activeSearchedQuery}"</strong> (
                    {displayArticles.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="flex items-center gap-1 text-cyan-400 font-semibold hover:underline cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Filter</span>
                  </button>
                </div>
              )}

              {/* 12-Column Editorial Wire Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                {/* Primary News Stream (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                  {isLoadingNews ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 py-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-56 bg-slate-800/40 animate-pulse rounded-xl" />
                      ))}
                    </div>
                  ) : displayArticles.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 space-y-3 bg-[#121826] border border-white/10 rounded-xl p-8">
                      <p className="headline-font text-lg font-bold text-white">
                        No dispatches matched your current filter
                      </p>
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
                      >
                        Return to All Global Dispatches
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Lead Section Dispatch Card (Matches Screenshot Card UI) */}
                      {!activeSearchedQuery && leadArticle && (
                        <article
                          onClick={() => handleOpenArticle(leadArticle)}
                          className="rounded-2xl overflow-hidden bg-[#0d1526] border border-cyan-500/25 shadow-xl group cursor-pointer transition-all hover:border-cyan-400/45"
                        >
                          {(() => {
                            const leadImg = getArticleImage(
                              leadArticle?.imageUrl,
                              leadArticle?.title,
                              leadArticle?.category
                            );
                            if (!leadImg) return null;
                            return (
                              <div className="relative aspect-[16/10] sm:aspect-[16/9] overflow-hidden bg-[#090f1d]">
                                <img
                                  src={leadImg}
                                  alt={leadArticle?.title || ''}
                                  referrerPolicy="no-referrer"
                                  onError={handleImageError}
                                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                                />

                                {/* Top-Left Category Badge */}
                                <div className="absolute top-3.5 left-3.5 z-10">
                                  <span className="inline-block px-3.5 py-1 rounded-lg bg-[#1d6bf3] text-white font-extrabold text-xs uppercase tracking-wider shadow-md">
                                    {leadArticle?.category || 'WORLD'}
                                  </span>
                                </div>

                                {/* Top-Right Time Badge */}
                                <div className="absolute top-3.5 right-3.5 z-10">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-slate-100 text-xs font-semibold shadow-md">
                                    <Clock className="w-3.5 h-3.5 text-slate-200" />
                                    <span>
                                      {formatTimeAgo(
                                        leadArticle.publishedTimestamp || leadArticle.publishedAt
                                      )}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            );
                          })()}

                          <div className="p-4 sm:p-6 space-y-3">
                            <h2 className="headline-font text-2xl sm:text-3xl font-bold text-white group-hover:text-cyan-300 transition-colors leading-[1.2]">
                              {leadArticle?.title || ''}
                            </h2>

                            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                              {leadArticle?.summary || ''}
                            </p>

                            <div className="flex items-center justify-between pt-3.5 border-t border-white/10 text-xs">
                              <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                                <span className="inline-flex items-center gap-1 font-extrabold text-[11px] sm:text-xs uppercase tracking-wider text-cyan-400 whitespace-nowrap shrink-0">
                                  <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
                                  <span>R.R NEWS</span>
                                </span>
                                <span className="text-slate-600 shrink-0" aria-hidden="true">|</span>
                                <span className="font-semibold text-[10.5px] sm:text-xs uppercase tracking-wide sm:tracking-wider text-slate-300 whitespace-nowrap">
                                  BY RAJVEER SINGH RANA
                                </span>
                              </div>

                              <div className="flex items-center gap-2.5 text-cyan-400 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenAudit(leadArticle);
                                  }}
                                  className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                                  title="Verify Source & Bias Audit"
                                  aria-label="Audit Credibility"
                                >
                                  <ShieldCheck className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAskGemini(leadArticle);
                                  }}
                                  className="p-1 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                                  title="AI Desk Brief"
                                  aria-label="AI Desk Brief"
                                >
                                  <Sparkles className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleSaveArticle(leadArticle);
                                  }}
                                  className="p-1 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                                  title="Save"
                                  aria-label="Save"
                                >
                                  <Bookmark
                                    className={`w-4 h-4 ${
                                      isArticleSaved(leadArticle.id) ? 'fill-current' : ''
                                    }`}
                                  />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenShare(leadArticle);
                                  }}
                                  className="p-1 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                                  title="Share"
                                  aria-label="Share"
                                >
                                  <Share2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                      )}

                      {/* Wire Dispatches Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {(activeSearchedQuery ? displayArticles : wireArticles).map((article, idx) => (
                          <ArticleCard
                            key={`${article.id || 'article'}-${idx}`}
                            article={article}
                            isSaved={isArticleSaved(article.id)}
                            onToggleSave={handleToggleSaveArticle}
                            onOpenArticle={handleOpenArticle}
                            onOpenShare={handleOpenShare}
                            onScheduleCalendar={handleScheduleCalendar}
                            onAskGemini={handleAskGemini}
                            onAuditCredibility={handleOpenAudit}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Intelligence Rail (4 cols) */}
                <aside className="lg:col-span-4 space-y-5 lg:border-l lg:border-white/10 lg:pl-6">
                  {/* Editorial Command & Publisher Card */}
                  <div className="bg-[#111827] border border-white/10 rounded-xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                      <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-400">
                        <Award className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Wire Command</span>
                      </span>
                      <span className="font-mono text-[10px] text-emerald-400 font-semibold">
                        ● Live Stream
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Global & regional dispatches curated with real-time factual verification and market context.
                    </p>
                    <div className="pt-2 border-t border-white/8 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Publisher</span>
                      <strong className="text-white font-semibold">By Rajveer Singh Rana</strong>
                    </div>
                  </div>

                  <BingMarketWatchlist />
                  <BingWeatherWidget countryCode={preferences.country} />
                  <BingDailyPulse currentLang={preferences.language} />

                  {/* Editorial Wire Index */}
                  <div className="bg-[#111827] border border-white/10 rounded-xl p-4 sm:p-5">
                    <div className="pb-2.5 mb-3 border-b border-white/10">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 block">
                        Wire Index
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">
                        Most Tracked Beats
                      </h4>
                    </div>
                    <div className="divide-y divide-white/8">
                      {[
                        { rank: '01', title: 'Global AI Governance & Sovereign Compute', query: 'Artificial Intelligence global summit' },
                        { rank: '02', title: 'Central Bank Monetary Policy & Yields', query: 'Interest rates central banks inflation' },
                        { rank: '03', title: 'Deep Space & Lunar Infrastructure', query: 'NASA ISRO lunar exploration Mars' },
                        { rank: '04', title: 'Grid Modernization & Clean Baseload', query: 'Renewable clean energy solar grid' },
                        { rank: '05', title: 'European Club Football & Champions League', query: 'Champions League Football match' },
                      ].map((item) => (
                        <button
                          key={item.rank}
                          type="button"
                          onClick={() => {
                            setSearchQuery(item.query);
                            fetchNews('All', item.query, preferences.country || 'global');
                          }}
                          className="w-full text-left flex items-baseline gap-3 py-2.5 hover:opacity-85 transition-opacity cursor-pointer group"
                        >
                          <span className="font-mono text-xs font-bold text-cyan-400 shrink-0">
                            {item.rank}
                          </span>
                          <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                            {item.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          )}

          {/* TAB 0: FRONT PAGE (TODAY SECTION) */}
          {activeTab === 'today' && (
            <TodaySection
              articles={displayArticles}
              preferences={preferences}
              onSelectArticle={handleOpenArticle}
              onToggleSave={handleToggleSaveArticle}
              onOpenShare={handleOpenShare}
              onScheduleCalendar={handleScheduleCalendar}
              onAskGemini={handleAskGemini}
              onAuditCredibility={handleOpenAudit}
              isArticleSaved={isArticleSaved}
              onRefresh={() =>
                fetchNews(selectedCategory, searchQuery, preferences.country || 'global')
              }
              isRefreshing={isLoadingNews}
              lastRefreshedAt={lastRefreshedAt}
            />
          )}

          {/* TAB: MARKETS & PORTFOLIO */}
          {activeTab === 'portfolio' && (
            <PortfolioDashboard userId={user?.uid} isOnline={isOnline} />
          )}

          {/* TAB 2: EXECUTIVE BRIEF */}
          {activeTab === 'briefing' && (
            <DailyBriefing
              articles={articles}
              preferences={preferences}
              onUpdatePreferences={handleUpdatePreferences}
              onSelectArticle={handleOpenArticle}
              onScheduleBriefingCalendar={() => handleScheduleCalendar(null)}
            />
          )}

          {/* TAB 3: SAVED VAULT */}
          {activeTab === 'vault' && (
            <OfflineVault
              savedArticles={savedArticles}
              onSelectArticle={handleOpenArticle}
              onRemoveFromVault={handleRemoveFromVault}
              onClearVault={handleClearVault}
              isOnline={isOnline}
            />
          )}

          {/* TAB 4: ANALYTICS */}
          {activeTab === 'analytics' && <AnalyticsDashboard metrics={metrics} />}

          {/* TAB 5: AI DESK */}
          {activeTab === 'chat' && (
            <GeminiChatDesk
              initialArticle={chatInitialArticle}
              onClearInitialArticle={() => setChatInitialArticle(null)}
              currentLang={preferences.language}
              articles={displayArticles}
            />
          )}
        </main>

        {/* Institutional Publication Footer with Watermark */}
        <footer className="relative overflow-hidden mt-12 border-t border-white/12 bg-[#090d16] text-slate-400 pb-24 md:pb-12 pt-10 text-xs">
          {/* Subtle Architectural Background Watermark */}
          <div
            aria-hidden="true"
            className="pointer-events-none select-none absolute inset-x-0 bottom-2 flex justify-center overflow-hidden opacity-[0.035]"
          >
            <span className="headline-font text-5xl sm:text-7xl lg:text-8xl font-extrabold uppercase tracking-[0.2em] text-white whitespace-nowrap">
              BY RAJVEER SINGH RANA
            </span>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 pb-8 border-b border-white/10">
              {/* Col 1: Masthead & Editorial Charter (4 cols) */}
              <div className="lg:col-span-4 space-y-3">
                <AppLogo size="sm" showText={true} subtitle="GLOBAL WIRE" />
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                  R.R News delivers real-time global wire dispatches, cross-referenced source verification, live market telemetry, and multi-language editorial intelligence.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111827] border border-cyan-500/25 font-mono text-[11px] text-slate-200">
                  <Award className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>
                    Watermarked & Engineered <strong className="text-white">By Rajveer Singh Rana</strong>
                  </span>
                </div>
              </div>

              {/* Col 2: Editorial Desks (3 cols) */}
              <div className="lg:col-span-3 space-y-2.5">
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                  Editorial Desks
                </div>
                <ul className="grid grid-cols-2 gap-1.5 text-xs">
                  {(['World', 'Technology', 'Business', 'Currency', 'Science', 'Climate', 'Health', 'Sports'] as NewsCategory[]).map(
                    (cat) => (
                      <li key={cat}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat);
                            setShowOnlyTrending(false);
                            setActiveTab('feed');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {cat}
                        </button>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Col 3: Intelligence Suite (3 cols) */}
              <div className="lg:col-span-3 space-y-2.5">
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                  Intelligence Suite
                </div>
                <ul className="space-y-1.5 text-xs">
                  {[
                    { id: 'today', label: 'Front Page Edition' },
                    { id: 'portfolio', label: 'Markets & Portfolio Watchlist' },
                    { id: 'briefing', label: 'Executive Daily Briefing' },
                    { id: 'chat', label: 'AI Research & Fact Desk' },
                    { id: 'vault', label: 'Offline Reading Vault' },
                    { id: 'analytics', label: 'Reading Telemetry & Analytics' },
                  ].map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab(item.id as any);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 4: Governance & Verification (2 cols) */}
              <div className="lg:col-span-2 space-y-2.5">
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                  Standards & Data
                </div>
                <ul className="space-y-1.5 text-xs">
                  <li>
                    <button
                      type="button"
                      onClick={() => setIsPrivacyModalOpen(true)}
                      className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Privacy & Local Storage
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleScheduleCalendar(null)}
                      className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Schedule Reading Sync
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setIsSidebarOpen(true)}
                      className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Edition & Language Settings
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
              <div className="flex flex-wrap items-center gap-2">
                <span>© {new Date().getFullYear()} R.R News Global Intelligence.</span>
                <span className="text-slate-600">·</span>
                <span className="font-mono text-cyan-400 font-semibold">
                  By Rajveer Singh Rana
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider">
                <span>Open-Meteo Telemetry</span>
                <span>·</span>
                <span>Multi-Source Bias Audit</span>
                <span>·</span>
                <span>Real-Time FX</span>
              </div>
            </div>
          </div>
        </footer>

        {/* Push Notification Toast */}
        <div className="mb-14 md:mb-0">
          <PushNotificationToast
            notification={activeToast}
            onClose={() => setActiveToast(null)}
            onClick={(id, item) => {
              handleSelectNotification(id, item || activeToast || undefined);
              setActiveToast(null);
            }}
            audioAlertsEnabled={preferences.audioAlertsEnabled}
          />
        </div>

        {/* Mobile Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab as any);
            if (tab === 'calendar') handleScheduleCalendar(null);
          }}
          savedCount={savedArticles.length}
        />

        {/* Reader Modal */}
        <ArticleDetailModal
          article={activeArticleDetail}
          onClose={() => setActiveArticleDetail(null)}
          isSaved={activeArticleDetail ? isArticleSaved(activeArticleDetail.id) : false}
          onToggleSave={handleToggleSaveArticle}
          onOpenShare={handleOpenShare}
          onScheduleCalendar={handleScheduleCalendar}
          onAskGemini={handleAskGemini}
          onAuditCredibility={handleOpenAudit}
        />

        {/* Credibility & Bias Audit Modal */}
        {isAuditModalOpen && (
          <CredibilityAuditModal
            article={activeAuditArticle}
            onClose={() => {
              setIsAuditModalOpen(false);
              setActiveAuditArticle(null);
            }}
            activeLang={preferences.language}
          />
        )}

        {/* Calendar Modal */}
        <CalendarModal
          isOpen={isCalendarModalOpen}
          onClose={() => {
            setIsCalendarModalOpen(false);
            setCalendarArticle(null);
          }}
          article={calendarArticle}
          user={user}
          onGoogleSignIn={handleGoogleSignIn}
        />

        {/* Share Modal */}
        <ShareModal
          isOpen={!!shareArticle}
          onClose={() => setShareArticle(null)}
          article={shareArticle}
        />

        {/* Privacy Modal */}
        <PrivacyModal
          isOpen={isPrivacyModalOpen}
          onClose={() => setIsPrivacyModalOpen(false)}
          onDataCleared={() => {
            setSavedArticles([]);
            setMetrics(getEngagementMetrics());
          }}
        />

        {/* Navigation Drawer */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab as any);
            if (tab === 'calendar') handleScheduleCalendar(null);
          }}
          user={user}
          onGoogleSignIn={handleGoogleSignIn}
          onSignOut={handleSignOut}
          preferences={preferences}
          onUpdatePreferences={handleUpdatePreferences}
          savedCount={savedArticles.length}
          notifications={notifications}
          onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
          onSelectNotificationArticle={(articleId, notificationItem) => {
            handleSelectNotification(articleId, notificationItem);
          }}
        />
      </div>
    </div>
  );
}
