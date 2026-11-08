import React from 'react';

interface BingTrendingBarProps {
  onSelectQuery: (query: string) => void;
  activeQuery: string | null;
}

const TRENDING_TOPICS = [
  { tag: 'Artificial Intelligence', query: 'Artificial Intelligence Gemini OpenAI technology' },
  { tag: 'Central Banks & Rates', query: 'Stock market inflation economy Federal Reserve' },
  { tag: 'Orbital & Deep Space', query: 'Space exploration NASA ISRO astronomy' },
  { tag: 'Energy Transition', query: 'Renewable clean energy climate change solar' },
  { tag: 'European Football', query: 'Champions League Football Premier League' },
  { tag: 'Global Diplomacy', query: 'United Nations global summit treaties' },
  { tag: 'Digital Assets & FX', query: 'Bitcoin cryptocurrency forex currency' },
];

export const BingTrendingBar: React.FC<BingTrendingBarProps> = ({
  onSelectQuery,
  activeQuery,
}) => {
  return (
    <div className="bg-[#0c101b] border-b border-white/10 py-2 px-3 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto flex items-center gap-3 text-xs">
        <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] shrink-0">
          In Focus:
        </span>

        <div className="flex items-center gap-2 sm:gap-3">
          {TRENDING_TOPICS.map((topic, i) => {
            const isActive = activeQuery === topic.query;
            return (
              <React.Fragment key={topic.tag}>
                {i > 0 && (
                  <span className="text-slate-600 select-none" aria-hidden="true">
                    ·
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onSelectQuery(topic.query)}
                  className={`whitespace-nowrap text-[11px] transition-colors cursor-pointer ${
                    isActive
                      ? 'text-cyan-400 font-bold underline underline-offset-4'
                      : 'text-slate-300 hover:text-white font-medium'
                  }`}
                >
                  {topic.tag}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
