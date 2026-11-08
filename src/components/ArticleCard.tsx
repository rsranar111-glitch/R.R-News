import React from 'react';
import {
  Bookmark,
  Share2,
  Clock,
  Globe,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Article } from '../types/news.ts';
import { getArticleImage, handleImageError } from '../utils/imageFallback.ts';
import { formatTimeAgo } from '../utils/timeAgo.ts';

interface ArticleCardProps {
  article: Article;
  isSaved: boolean;
  onToggleSave: (article: Article) => void;
  onOpenArticle: (article: Article) => void;
  onOpenShare: (article: Article) => void;
  onScheduleCalendar: (article: Article) => void;
  onAskGemini: (article: Article) => void;
  onAuditCredibility?: (article: Article) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  isSaved,
  onToggleSave,
  onOpenArticle,
  onOpenShare,
  onAskGemini,
  onAuditCredibility,
}) => {
  if (!article || !article.title) return null;

  const resolvedImage = getArticleImage(
    article.imageUrl,
    article.title,
    article.category
  );

  return (
    <article
      onClick={() => onOpenArticle(article)}
      className="rounded-2xl overflow-hidden group flex flex-col justify-between bg-[#0d1526] border border-cyan-500/20 hover:border-cyan-400/45 shadow-lg transition-all cursor-pointer"
    >
      <div>
        {/* Full-Bleed Top News Image with Category & Time Overlays */}
        {resolvedImage && (
          <div className="relative overflow-hidden aspect-[16/10] bg-[#090f1d]">
            <img
              src={resolvedImage}
              alt={article.title || ''}
              referrerPolicy="no-referrer"
              onError={handleImageError}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
              loading="lazy"
            />

            {/* Top-Left Category Badge */}
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-block px-3 py-1 rounded-lg bg-[#1d6bf3] text-white font-extrabold text-[11px] uppercase tracking-wider shadow-md">
                {article.category || 'WORLD'}
              </span>
            </div>

            {/* Top-Right Time Ago Badge */}
            <div className="absolute top-3 right-3 z-10">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-slate-100 text-[11px] font-semibold shadow-md">
                <Clock className="w-3 h-3 text-slate-200" />
                <span>{formatTimeAgo(article.publishedTimestamp || article.publishedAt)}</span>
              </span>
            </div>
          </div>
        )}

        {/* Card Content Body */}
        <div className="p-4 sm:p-5 pb-3">
          {!resolvedImage && (
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="inline-block px-3 py-1 rounded-lg bg-[#1d6bf3] text-white font-extrabold text-[11px] uppercase tracking-wider">
                {article.category || 'WORLD'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 border border-white/10 text-slate-200 text-[11px] font-semibold">
                <Clock className="w-3 h-3 text-slate-300" />
                <span>{formatTimeAgo(article.publishedTimestamp || article.publishedAt)}</span>
              </span>
            </div>
          )}

          <h3 className="headline-font text-lg sm:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-3 leading-snug mb-2">
            {article.title}
          </h3>

          {article.summary && (
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed font-normal">
              {article.summary}
            </p>
          )}
        </div>
      </div>

      {/* Card Footer (🌐 R.R NEWS | BY RAJVEER SINGH RANA   🔖 🔗) */}
      <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-white/10 flex items-center justify-between gap-1.5 text-xs">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="inline-flex items-center gap-1 font-extrabold text-[10.5px] sm:text-[11px] uppercase tracking-wider text-cyan-400 whitespace-nowrap shrink-0">
            <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>R.R NEWS</span>
          </span>
          <span className="text-slate-600 shrink-0" aria-hidden="true">|</span>
          <span className="font-semibold text-[10px] sm:text-[11px] uppercase tracking-wide sm:tracking-wider text-slate-300 whitespace-nowrap">
            BY RAJVEER SINGH RANA
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onAuditCredibility && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAuditCredibility(article);
              }}
              className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
              title="Verify Source & Bias Audit"
              aria-label="Audit Credibility"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAskGemini(article);
            }}
            className="p-1 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            title="AI Desk Analysis"
            aria-label="AI Desk Analysis"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(article);
            }}
            className="p-1 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            title={isSaved ? 'Saved in Vault' : 'Save to Vault'}
            aria-label="Save"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenShare(article);
            }}
            className="p-1 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            title="Share Dispatch"
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
};
