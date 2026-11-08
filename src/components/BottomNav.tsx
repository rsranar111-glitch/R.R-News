import React from 'react';
import { Home, Newspaper, TrendingUp, Sparkles, Bookmark, Bot } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  savedCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
}) => {
  const tabs = [
    { id: 'today', label: 'Front Page', icon: Home },
    { id: 'feed', label: 'Wire', icon: Newspaper },
    { id: 'portfolio', label: 'Markets', icon: TrendingUp },
    { id: 'briefing', label: 'Brief', icon: Sparkles },
    { id: 'vault', label: 'Saved', icon: Bookmark, badge: savedCount },
    { id: 'chat', label: 'AI Desk', icon: Bot },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#070b14]/98 backdrop-blur-xl border-t border-white/10 pb-[env(safe-area-inset-bottom,0px)] md:hidden text-slate-100">
      <div className="grid grid-cols-6 items-center h-16 max-w-lg mx-auto px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center h-full transition-colors relative cursor-pointer touch-manipulation ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
              title={tab.label}
              aria-label={tab.label}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400 fill-cyan-400/20' : ''}`} />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2.5 px-1 rounded bg-cyan-500 text-slate-950 font-mono text-[9px] font-bold leading-tight">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] tracking-tight mt-1 truncate max-w-[60px] text-center">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-2.5 right-2.5 h-[3px] bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
