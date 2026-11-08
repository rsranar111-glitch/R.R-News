import React from 'react';
import { Bookmark, Trash2 } from 'lucide-react';
import { Article, SavedArticle } from '../types/news.ts';
import { AppLogo } from './AppLogo.tsx';

interface OfflineVaultProps {
  savedArticles: SavedArticle[];
  onSelectArticle: (article: Article) => void;
  onRemoveFromVault: (articleId: string) => void;
  onClearVault: () => void;
  isOnline: boolean;
}

export const OfflineVault: React.FC<OfflineVaultProps> = ({
  savedArticles,
  onSelectArticle,
  onRemoveFromVault,
  onClearVault,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200 text-white">
      
      {/* Header */}
      <div className="flex items-end justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <AppLogo size="sm" animate={false} />
          <div>
            <h1 className="headline-font text-2xl sm:text-3xl font-bold text-white">
              Saved Vault
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {savedArticles.length} {savedArticles.length === 1 ? 'story' : 'stories'} preserved offline · R.R News
            </p>
          </div>
        </div>

        {savedArticles.length > 0 && (
          <button
            onClick={onClearVault}
            className="text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      {/* List */}
      {savedArticles.length === 0 ? (
        <div className="py-16 text-center text-slate-400 space-y-2">
          <Bookmark className="w-8 h-8 mx-auto text-slate-600" />
          <p className="text-sm font-medium text-white">No saved articles</p>
          <p className="text-xs text-slate-400">Save articles to read them offline at your convenience.</p>
        </div>
      ) : (
        <div className="divide-y divide-white/10">
          {savedArticles.map((article) => (
            <div
              key={article.id}
              className="py-5 flex items-start justify-between gap-4 group"
            >
              <div 
                onClick={() => onSelectArticle(article)}
                className="flex-1 cursor-pointer space-y-1"
              >
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <span className="uppercase tracking-wider text-[11px] font-bold text-cyan-400">
                    {article.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-300">{article.source}</span>
                  <span aria-hidden="true">·</span>
                  <span>{article.readTime}</span>
                </div>

                <h3 className="headline-font text-base font-bold text-white group-hover:text-cyan-400 transition-colors leading-snug">
                  {article.title}
                </h3>

                {article.summary && (
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0 pt-1">
                <button
                  onClick={() => onSelectArticle(article)}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Read
                </button>

                <button
                  onClick={() => onRemoveFromVault(article.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
