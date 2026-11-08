import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { Article, SupportedLanguage } from '../types/news.ts';
import { getUIText } from '../services/translations.ts';

interface BreakingTickerProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  audioAlertsEnabled: boolean;
  onToggleAudio: () => void;
  language?: SupportedLanguage;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({
  articles = [],
  onSelectArticle,
  language = 'en',
}) => {
  const trendingArticles = (articles || []).filter(a => a && (a.isBreaking || a.isTrending));
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (trendingArticles.length <= 1) {
      setCurrentIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % trendingArticles.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [trendingArticles.length]);

  if (!trendingArticles || trendingArticles.length === 0) return null;

  const safeIndex = currentIndex % trendingArticles.length;
  const current = trendingArticles[safeIndex] || trendingArticles[0];

  if (!current || !current.title) return null;

  return (
    <div className="w-full max-w-full overflow-hidden bg-[#070b14] border-b border-cyan-500/15 py-2 px-3.5 sm:px-6 lg:px-8">
      <div
        onClick={() => onSelectArticle(current)}
        className="max-w-7xl mx-auto flex items-center justify-between gap-2.5 min-w-0 cursor-pointer group"
      >
        <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] shrink-0 animate-pulse" />

          <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 font-bold text-amber-400 uppercase tracking-wider text-[10px] shrink-0">
            {getUIText('developing', language)}
          </span>

          <span className="text-amber-500/60 font-bold shrink-0" aria-hidden="true">|</span>

          <span className="font-medium text-slate-100 truncate group-hover:text-cyan-300 transition-colors text-[13px]">
            {current.title}
          </span>
        </div>

        <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
};
