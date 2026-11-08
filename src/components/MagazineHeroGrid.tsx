import React from 'react';
import {
  Bookmark,
  Share2,
  Clock,
  Globe,
} from 'lucide-react';
import { Article } from '../types/news.ts';
import { getArticleImage, handleImageError } from '../utils/imageFallback.ts';
import { formatTimeAgo } from '../utils/timeAgo.ts';

interface MagazineHeroGridProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onAuditCredibility: (article: Article) => void;
  onToggleSave?: (article: Article) => void;
  onOpenShare?: (article: Article) => void;
  isArticleSaved?: (id: string) => boolean;
}

export const MagazineHeroGrid: React.FC<MagazineHeroGridProps> = ({
  articles,
  onSelectArticle,
  onToggleSave,
  onOpenShare,
  isArticleSaved,
}) => {
  if (!articles || articles.length === 0) return null;

  const leadArticle = articles[0];
  const secondaryArticles = articles.slice(1, 7);

  const leadImage = getArticleImage(
    leadArticle.imageUrl,
    leadArticle.title,
    leadArticle.category
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Tier 1: Lead Front-Page Dispatch Card */}
      <article
        onClick={() => onSelectArticle(leadArticle)}
        className="rounded-2xl overflow-hidden group cursor-pointer bg-[#0d1526] border border-cyan-500/25 shadow-xl transition-all hover:border-cyan-400/45"
      >
        {/* Top Image Frame with Category Pill (Top-Left) & Time Pill (Top-Right) */}
        {leadImage && (
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-[#090f1d]">
            <img
              src={leadImage}
              alt={leadArticle.title}
              referrerPolicy="no-referrer"
              onError={handleImageError}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />

            {/* Top-Left Category Badge (Bright Blue Pill like "WORLD" in Screenshot) */}
            <div className="absolute top-3.5 left-3.5 z-10">
              <span className="inline-block px-3.5 py-1 rounded-lg bg-[#1d6bf3] text-white font-extrabold text-xs uppercase tracking-wider shadow-md">
                {leadArticle.category || 'WORLD'}
              </span>
            </div>

            {/* Top-Right Time Ago Badge */}
            <div className="absolute top-3.5 right-3.5 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-slate-100 text-xs font-semibold shadow-md">
                <Clock className="w-3.5 h-3.5 text-slate-200" />
                <span>{formatTimeAgo(leadArticle.publishedTimestamp || leadArticle.publishedAt)}</span>
              </span>
            </div>
          </div>
        )}

        {/* Card Content Body */}
        <div className="p-4 sm:p-6 space-y-3">
          {!leadImage && (
            <div className="flex items-center justify-between gap-2">
              <span className="inline-block px-3 py-1 rounded-lg bg-[#1d6bf3] text-white font-extrabold text-xs uppercase tracking-wider">
                {leadArticle.category || 'WORLD'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 border border-white/10 text-slate-200 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-slate-300" />
                <span>{formatTimeAgo(leadArticle.publishedTimestamp || leadArticle.publishedAt)}</span>
              </span>
            </div>
          )}

          <h2 className="headline-font text-2xl sm:text-3xl font-bold text-white leading-[1.2] group-hover:text-cyan-300 transition-colors">
            {leadArticle.title}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {leadArticle.summary}
          </p>

          {/* Bottom Attribution & Action Bar (🌐 R.R NEWS | BY RAJVEER SINGH RANA   🔖 🔗) */}
          <div className="pt-3.5 border-t border-white/10 flex items-center justify-between gap-2">
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

            <div className="flex items-center gap-3 shrink-0">
              {onToggleSave && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave(leadArticle);
                  }}
                  className="p-1.5 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  title="Save to Vault"
                  aria-label="Save story"
                >
                  <Bookmark
                    className={`w-4 h-4 ${
                      isArticleSaved && isArticleSaved(leadArticle.id)
                        ? 'fill-current text-cyan-400'
                        : ''
                    }`}
                  />
                </button>
              )}

              {onOpenShare && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenShare(leadArticle);
                  }}
                  className="p-1.5 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  title="Share Story"
                  aria-label="Share story"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* Tier 2: Secondary & Featured Stories Grid */}
      {secondaryArticles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {secondaryArticles.map((article) => {
            const secImg = getArticleImage(article.imageUrl, article.title, article.category);
            return (
              <article
                key={article.id}
                onClick={() => onSelectArticle(article)}
                className="rounded-2xl overflow-hidden group cursor-pointer flex flex-col justify-between bg-[#0d1526] border border-cyan-500/20 hover:border-cyan-400/45 shadow-lg transition-all"
              >
                <div>
                  {/* Article Photo with Category & Time Overlays */}
                  {secImg && (
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#090f1d]">
                      <img
                        src={secImg}
                        alt={article.title}
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

                      {/* Top-Right Time Badge */}
                      <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-slate-100 text-[11px] font-semibold shadow-md">
                          <Clock className="w-3 h-3 text-slate-200" />
                          <span>{formatTimeAgo(article.publishedTimestamp || article.publishedAt)}</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Headline & Summary */}
                  <div className="p-4 sm:p-5 pb-3">
                    {!secImg && (
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

                    <h3 className="headline-font text-lg sm:text-xl font-bold text-white leading-snug group-hover:text-cyan-300 transition-colors mb-2 line-clamp-3">
                      {article.title}
                    </h3>

                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-3">
                      {article.summary}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <span className="inline-flex items-center gap-1 font-extrabold text-[11px] uppercase tracking-wider text-cyan-400 whitespace-nowrap shrink-0">
                      <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>R.R NEWS</span>
                    </span>
                    <span className="text-slate-600 shrink-0" aria-hidden="true">|</span>
                    <span className="font-semibold text-[10.5px] sm:text-[11px] uppercase tracking-wide sm:tracking-wider text-slate-300 whitespace-nowrap">
                      BY RAJVEER SINGH RANA
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {onToggleSave && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSave(article);
                        }}
                        className="p-1 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                        title="Save to Vault"
                        aria-label="Save story"
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            isArticleSaved && isArticleSaved(article.id)
                              ? 'fill-current text-cyan-400'
                              : ''
                          }`}
                        />
                      </button>
                    )}

                    {onOpenShare && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenShare(article);
                        }}
                        className="p-1 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                        title="Share Story"
                        aria-label="Share story"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
