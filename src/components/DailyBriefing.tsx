import React, { useState } from 'react';
import { 
  Calendar, 
  Sliders, 
} from 'lucide-react';
import { Article, NewsCategory, UserPreferences } from '../types/news.ts';
import { getArticleImage, handleImageError } from '../utils/imageFallback.ts';
import { AppLogo } from './AppLogo.tsx';

interface DailyBriefingProps {
  articles: Article[];
  preferences: UserPreferences;
  onUpdatePreferences: (p: Partial<UserPreferences>) => void;
  onSelectArticle: (article: Article) => void;
  onScheduleBriefingCalendar: () => void;
}

const AVAILABLE_TOPICS: NewsCategory[] = [
  'Technology',
  'Business',
  'World',
  'Science',
  'Climate',
  'Politics',
  'Culture',
  'Health',
  'Sports'
];

export const DailyBriefing: React.FC<DailyBriefingProps> = ({
  articles = [],
  preferences,
  onUpdatePreferences,
  onSelectArticle,
  onScheduleBriefingCalendar,
}) => {
  const [isEditingTopics, setIsEditingTopics] = useState(false);

  const validArticles = (articles || []).filter(a => a && a.title);
  const personalizedArticles = validArticles.filter(a => 
    preferences?.personalizedTopics?.includes(a.category)
  );

  const topBriefingStories = (personalizedArticles.length > 0 ? personalizedArticles : validArticles).slice(0, 5);

  const toggleTopic = (topic: NewsCategory) => {
    const current = preferences?.personalizedTopics || [];
    let updated: NewsCategory[];
    if (current.includes(topic)) {
      if (current.length <= 1) return;
      updated = current.filter(t => t !== topic);
    } else {
      updated = [...current, topic];
    }
    onUpdatePreferences({ personalizedTopics: updated });
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200 text-white">
      
      {/* Editorial Header */}
      <div className="border-b border-white/10 pb-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2">
              {todayStr} · R.R News Intelligence
            </div>
            <h1 className="headline-font text-3xl sm:text-4xl font-bold text-white mb-3">
              Your Daily Briefing
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Curated updates across your chosen beats: {(preferences?.personalizedTopics || []).join(', ')}.
            </p>
          </div>
          <div className="hidden sm:block shrink-0">
            <AppLogo size="lg" animate={true} />
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={() => setIsEditingTopics(!isEditingTopics)}
            className="font-semibold text-slate-200 hover:text-cyan-400 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customize beats ({preferences?.personalizedTopics?.length || 0})</span>
          </button>

          <span className="text-slate-600" aria-hidden="true">·</span>

          <button
            onClick={onScheduleBriefingCalendar}
            className="font-semibold text-slate-200 hover:text-cyan-400 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Add reading slot to calendar</span>
          </button>
        </div>
      </div>

      {/* Topic Customization Panel */}
      {isEditingTopics && (
        <div className="p-5 bg-[#151c2b] backdrop-blur-md rounded-2xl border border-slate-700 space-y-3 shadow-xl">
          <div className="text-xs font-semibold text-slate-200">
            Select preferred topics
          </div>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TOPICS.map((topic) => {
              const isSelected = (preferences?.personalizedTopics || []).includes(topic);
              return (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-cyan-600 text-white border-cyan-500 shadow-xs'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-cyan-400/50'
                  }`}
                >
                  {topic}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Briefing Stories List */}
      <div className="divide-y divide-white/10">
        {topBriefingStories.map((article, index) => {
          if (!article || !article.title) return null;
          return (
            <div
              key={`${article.id || 'brief'}-${index}`}
              onClick={() => onSelectArticle(article)}
              className="py-5 flex items-start gap-5 group cursor-pointer"
            >
              <span className="headline-font text-2xl font-bold text-slate-600 w-8 shrink-0">
                0{index + 1}
              </span>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  {article.category && (
                    <span className="uppercase tracking-wider text-[11px] font-bold text-cyan-400">
                      {article.category}
                    </span>
                  )}
                  {article.source && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-300">{article.source}</span>
                    </>
                  )}
                  {article.readTime && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{article.readTime}</span>
                    </>
                  )}
                </div>

                <h2 className="headline-font text-lg font-bold text-white group-hover:text-cyan-400 transition-colors leading-snug">
                  {article.title}
                </h2>

                {article.summary && (
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>
                )}
              </div>

              {(() => {
                const briefImg = getArticleImage(article.imageUrl, article.title, article.category);
                if (!briefImg) return null;
                return (
                  <img
                    src={briefImg}
                    alt={article.title || ''}
                    referrerPolicy="no-referrer"
                    onError={handleImageError}
                    className="w-24 h-20 rounded-xl object-cover shrink-0 bg-[#0d1526] border border-white/10"
                  />
                );
              })()}
            </div>
          );
        })}
      </div>

    </div>
  );
};
