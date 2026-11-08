import React from 'react';
import { RefreshCw, Calendar, Clock, Award, Sparkles, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { Article, UserPreferences } from '../types/news.ts';
import { BingWeatherWidget } from './BingWeatherWidget.tsx';
import { BingMarketWatchlist } from './BingMarketWatchlist.tsx';
import { BingDailyPulse } from './BingDailyPulse.tsx';
import { ArticleCard } from './ArticleCard.tsx';
import { MagazineHeroGrid } from './MagazineHeroGrid.tsx';
import { formatTimeAgo } from '../utils/timeAgo.ts';

interface TodaySectionProps {
  articles: Article[];
  preferences: UserPreferences;
  onSelectArticle: (article: Article) => void;
  onToggleSave: (article: Article) => void;
  onOpenShare: (article: Article) => void;
  onScheduleCalendar: (article: Article) => void;
  onAskGemini: (article: Article) => void;
  onAuditCredibility?: (article: Article) => void;
  isArticleSaved: (id: string) => boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  lastRefreshedAt?: Date;
}

export const TodaySection: React.FC<TodaySectionProps> = ({
  articles,
  preferences,
  onSelectArticle,
  onToggleSave,
  onOpenShare,
  onScheduleCalendar,
  onAskGemini,
  onAuditCredibility,
  isArticleSaved,
  onRefresh,
  isRefreshing = false,
  lastRefreshedAt = new Date(),
}) => {
  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-5 sm:space-y-7">
      {/* Row 6: FRONT PAGE EDITION Banner Card (Matches Screenshot with Vertical Cyan Accent Bar) */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0d1526] border border-cyan-500/25 p-4 sm:p-5 shadow-lg">
        {/* Left Glowing Vertical Cyan Bar */}
        <div
          className="absolute left-3 top-3.5 bottom-3.5 w-1 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
          aria-hidden="true"
        />

        <div className="pl-3.5 flex items-center justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <h1 className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.22em] text-cyan-400">
              FRONT PAGE EDITION
            </h1>

            <div className="flex items-center gap-2 text-xs sm:text-[13px] text-slate-300 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{todayDateStr}</span>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-[13px] text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                Wire Updated:{' '}
                <strong className="text-cyan-400 font-bold">
                  {formatTimeAgo(lastRefreshedAt)}
                </strong>
              </span>
            </div>
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#09101f] hover:bg-[#111c35] border border-cyan-500/40 text-white font-semibold text-xs sm:text-sm shadow-[0_0_14px_rgba(34,211,238,0.12)] transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh Wire'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary 12-Column Broadsheet Fold: 8-Col Editorial Stream + 4-Col Intelligence Desk Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left/Center 8 Columns: Lead Story & Featured News Cards */}
        <div className="lg:col-span-8">
          <MagazineHeroGrid
            articles={articles}
            onSelectArticle={onSelectArticle}
            onAuditCredibility={onAuditCredibility || onSelectArticle}
            onToggleSave={onToggleSave}
            onOpenShare={onOpenShare}
            isArticleSaved={isArticleSaved}
          />
        </div>

        {/* Right 4 Columns: Live Intelligence Sidebar Rail */}
        <aside className="lg:col-span-4 space-y-5 lg:border-l lg:border-white/10 lg:pl-6">
          {/* Publisher & Intelligence Desk Sidebar Header Card */}
          <div className="bg-[#0d1526] border border-cyan-500/20 rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-400">
                  Editorial Command
                </span>
              </div>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Verified Wire</span>
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="headline-font text-base font-bold text-white">
                R.R News Intelligence Desk
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Real-time multi-agency synthesis, live FX telemetry, and factual source verification.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (articles.length > 0) onAskGemini(articles[0]);
                }}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#131f38] hover:bg-[#192847] border border-cyan-500/30 text-xs font-semibold text-cyan-300 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AI Brief</span>
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (articles.length > 0 && onAuditCredibility) {
                    onAuditCredibility(articles[0]);
                  }
                }}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#09101f] hover:bg-[#131f38] border border-white/10 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Bias Audit</span>
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Publisher &amp; Architect</span>
              <strong className="text-white font-semibold">By Rajveer Singh Rana</strong>
            </div>
          </div>

          <BingMarketWatchlist />
          <BingWeatherWidget countryCode={preferences.country} />
          <BingDailyPulse currentLang={preferences.language} />
        </aside>
      </div>

      {/* Below the Fold: Further Global & Regional Dispatches */}
      {articles.length > 7 && (
        <section className="pt-6 border-t border-white/15 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-400 block">
                Global Wire Continuation
              </span>
              <h2 className="headline-font text-xl sm:text-2xl font-bold text-white mt-0.5">
                Further Regional &amp; Sector Dispatches
              </h2>
            </div>
            <span className="font-mono text-xs text-slate-400 hidden sm:inline">
              {articles.length - 7} Dispatches
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.slice(7).map((article, idx) => (
              <ArticleCard
                key={`${article.id}-${idx}`}
                article={article}
                isSaved={isArticleSaved(article.id)}
                onToggleSave={onToggleSave}
                onOpenArticle={onSelectArticle}
                onOpenShare={onOpenShare}
                onScheduleCalendar={onScheduleCalendar}
                onAskGemini={onAskGemini}
                onAuditCredibility={onAuditCredibility}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
