import React, { useState } from 'react';
import { RefreshCw, Languages } from 'lucide-react';
import { NewsCategory, SupportedLanguage } from '../types/news.ts';
import { getCategoryText, getUIText, SUPPORTED_LANGUAGES } from '../services/translations.ts';
import { getCountryByCode } from '../services/countries.ts';

interface CategoryBarProps {
  categories: NewsCategory[];
  selectedCategory: NewsCategory;
  onSelectCategory: (cat: NewsCategory) => void;
  showOnlyTrending: boolean;
  onToggleOnlyTrending: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  language?: SupportedLanguage;
  onSelectLanguage?: (lang: SupportedLanguage) => void;
  country?: string;
  onOpenCountrySelect?: () => void;
  lastRefreshedAt?: Date;
  isTranslating?: boolean;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  showOnlyTrending,
  onToggleOnlyTrending,
  onRefresh,
  isRefreshing,
  language = 'en',
  onSelectLanguage,
  country = 'global',
  onOpenCountrySelect,
  isTranslating = false,
}) => {
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const currentCountry = getCountryByCode(country);
  const currentLangInfo = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="border-b border-white/10 mb-6 w-full max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
        {/* Editorial Desk / Beat Tabs */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-none flex-1 min-w-0 text-xs">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat && !showOnlyTrending;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  if (showOnlyTrending) onToggleOnlyTrending();
                  onSelectCategory(cat);
                }}
                className={`py-2.5 whitespace-nowrap border-b-2 transition-colors cursor-pointer text-xs uppercase tracking-wider ${
                  isSelected
                    ? 'border-cyan-400 text-white font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-100 font-semibold'
                }`}
              >
                {getCategoryText(cat, language)}
              </button>
            );
          })}
        </div>

        {/* Desk Controls: Wire Filter, Language Translation, Edition, Refresh */}
        <div className="flex items-center justify-end gap-2 pb-2 sm:pb-0 shrink-0">
          {/* Trending / Top Wire Filter Toggle */}
          <button
            type="button"
            onClick={onToggleOnlyTrending}
            className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
              showOnlyTrending
                ? 'bg-amber-500/15 border-amber-400/50 text-amber-300 font-bold'
                : 'bg-[#141b2d] border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            {getUIText('trending', language)}
          </button>

          {/* Language Translator */}
          {onSelectLanguage && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border transition-colors cursor-pointer ${
                  language !== 'en'
                    ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300'
                    : 'bg-[#141b2d] border-white/10 text-slate-200 hover:text-white'
                }`}
                title="Translate Dispatches"
              >
                <Languages className={`w-3.5 h-3.5 ${isTranslating ? 'animate-spin text-cyan-400' : ''}`} />
                <span>{currentLangInfo.flag}</span>
                <span className="hidden sm:inline text-[11px]">{currentLangInfo.native}</span>
              </button>

              {showLangDropdown && (
                <div className="absolute right-0 mt-2 w-44 bg-[#121826] rounded-xl shadow-2xl border border-white/15 py-1.5 z-50">
                  <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 border-b border-white/10">
                    Translate Edition
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {SUPPORTED_LANGUAGES.map(l => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          onSelectLanguage(l.code);
                          setShowLangDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-white/8 transition-colors cursor-pointer ${
                          language === l.code
                            ? 'font-bold text-cyan-400 bg-cyan-950/30'
                            : 'text-slate-200'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{l.flag}</span>
                          <span>{l.native}</span>
                        </span>
                        {language === l.code && <span className="text-cyan-400">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {onOpenCountrySelect && (
            <button
              type="button"
              onClick={onOpenCountrySelect}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium bg-[#141b2d] text-slate-200 hover:text-white border border-white/10 transition-colors cursor-pointer"
              title="Change Regional Edition"
            >
              <span>{currentCountry.flag}</span>
              <span className="truncate max-w-[90px]">{currentCountry.name}</span>
            </button>
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="w-7 h-7 flex items-center justify-center rounded bg-[#141b2d] border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Wire"
              aria-label="Refresh stories"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
