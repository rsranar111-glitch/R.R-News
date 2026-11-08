import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bookmark, 
  Share2, 
  Calendar, 
  Sparkles, 
  ExternalLink, 
  Volume2, 
  VolumeX,
  Languages,
  ArrowLeft,
  Zap,
  Check,
  ShieldCheck
} from 'lucide-react';
import { Article, SupportedLanguage } from '../types/news.ts';
import { getArticleImage, handleImageError } from '../utils/imageFallback.ts';
import { recordReadingTime, recordArticleRead } from '../services/storage.ts';
import { translateText, SUPPORTED_LANGUAGES } from '../services/translations.ts';
import { AppLogo } from './AppLogo.tsx';

interface ArticleDetailModalProps {
  article: Article | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (article: Article) => void;
  onOpenShare: (article: Article) => void;
  onScheduleCalendar: (article: Article) => void;
  onAskGemini: (article: Article) => void;
  onAuditCredibility?: (article: Article) => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({
  article,
  onClose,
  isSaved,
  onToggleSave,
  onOpenShare,
  onScheduleCalendar,
  onAskGemini,
  onAuditCredibility,
}) => {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('normal');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeLang, setActiveLang] = useState<SupportedLanguage>('en');
  const [showLangMenu, setShowLangDropdown] = useState(false);
  const [translatedTitle, setTranslatedTitle] = useState('');
  const [translatedContent, setTranslatedContent] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  // Gemini Quick Summary State
  const [showQuickSummary, setShowQuickSummary] = useState(false);
  const [quickSummaryBullets, setQuickSummaryBullets] = useState<string[]>([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!article) return;
    recordArticleRead(article.category || 'World');
    const readTimer = setInterval(() => {
      recordReadingTime(10);
    }, 10000);
    return () => clearInterval(readTimer);
  }, [article]);

  useEffect(() => {
    if (!article) return;
    setShowQuickSummary(false);
    setQuickSummaryBullets([]);
    if (activeLang === 'en') {
      setTranslatedTitle(article.title);
      setTranslatedContent(article.content || article.summary);
      return;
    }

    setIsTranslating(true);
    Promise.all([
      translateText(article.title, activeLang),
      translateText(article.content || article.summary, activeLang)
    ]).then(([tTitle, tContent]) => {
      setTranslatedTitle(tTitle);
      setTranslatedContent(tContent);
      setIsTranslating(false);
    }).catch(() => {
      setIsTranslating(false);
    });
  }, [article, activeLang]);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!article) return null;

  const currentTitle = translatedTitle || article.title;
  const currentContent = translatedContent || article.content || article.summary;

  const handleToggleQuickSummary = async () => {
    if (!showQuickSummary) {
      setShowQuickSummary(true);
      if (quickSummaryBullets.length === 0) {
        setIsLoadingSummary(true);
        try {
          const res = await fetch('/api/gemini/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ article, targetLang: activeLang }),
          });
          const data = await res.json();
          if (data.success && Array.isArray(data.bullets) && data.bullets.length > 0) {
            if (activeLang !== 'en') {
              const translatedBullets = await Promise.all(
                data.bullets.map((b: string) => translateText(b, activeLang))
              );
              setQuickSummaryBullets(translatedBullets);
            } else {
              setQuickSummaryBullets(data.bullets);
            }
          } else {
            const rawFallback = [
              `Core Fact: ${article.summary || article.title}`,
              `Context: Dispatches reported by ${article.source || 'global sources'} under ${article.category || 'World'}.`,
              `Outlook: Editorial desk tracking subsequent developments.`
            ];
            if (activeLang !== 'en') {
              const translatedBullets = await Promise.all(
                rawFallback.map(b => translateText(b, activeLang))
              );
              setQuickSummaryBullets(translatedBullets);
            } else {
              setQuickSummaryBullets(rawFallback);
            }
          }
        } catch (err) {
          const rawFallback = [
            `Core Fact: ${article.summary || article.title}`,
            `Context: Significant report from ${article.source || 'wire'}.`,
            `Outlook: Updates will be posted as verified.`
          ];
          if (activeLang !== 'en') {
            const translatedBullets = await Promise.all(
              rawFallback.map(b => translateText(b, activeLang))
            );
            setQuickSummaryBullets(translatedBullets);
          } else {
            setQuickSummaryBullets(rawFallback);
          }
        } finally {
          setIsLoadingSummary(false);
        }
      }
    } else {
      setShowQuickSummary(false);
    }
  };

  const handleToggleAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const textToRead = showQuickSummary && quickSummaryBullets.length > 0
        ? currentTitle + '. Quick summary: ' + quickSummaryBullets.join('. ')
        : currentTitle + '. ' + currentContent;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  const paragraphs = currentContent
    ? currentContent.split('\n\n').filter(p => p.trim().length > 0)
    : [currentTitle];

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl h-[95vh] sm:h-auto sm:max-h-[92vh] bg-[#111726] backdrop-blur-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col text-slate-100"
      >
        {/* Mobile Pull Handle Indicator */}
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mt-2 sm:hidden shrink-0" />
        
        {/* Modal Header Toolbar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-[#151c2b] backdrop-blur-md shrink-0">
          
          {/* Prominent Back / Close Pill + App Logo */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer border border-slate-600"
              title="Close article (Esc)"
              aria-label="Close article"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-white/10">
              <AppLogo size="xs" animate={false} />
              <span className="text-[11px] font-bold text-slate-300">
                R.R News Wire
              </span>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">

            {/* Quick Summary Toggle Button */}
            <button
              onClick={handleToggleQuickSummary}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                showQuickSummary
                  ? 'bg-amber-500 text-slate-900 border-amber-400 shadow-xs'
                  : 'bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-900/50'
              }`}
              title="Toggle 3-Bullet Quick Summary using Gemini AI"
            >
              <Zap className={`w-3.5 h-3.5 ${showQuickSummary ? 'fill-current text-slate-900' : 'text-amber-400'}`} />
              <span className="hidden sm:inline">Quick Summary</span>
              <span className="sm:hidden text-[10px] uppercase font-black">3 Bullets</span>
            </button>

            {/* Inline Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangDropdown(!showLangMenu)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  activeLang !== 'en'
                    ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                    : 'text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                }`}
                title="Translate Article"
              >
                <Languages className={`w-3.5 h-3.5 ${isTranslating ? 'animate-spin text-cyan-400' : ''}`} />
                <span className="uppercase text-[11px] font-bold">{activeLang}</span>
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-[#151c2b] rounded-xl shadow-2xl border border-slate-700 py-1.5 z-50">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    Translate Article
                  </div>
                  {SUPPORTED_LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setActiveLang(l.code);
                        setShowLangDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-800 ${
                        activeLang === l.code ? 'font-bold text-cyan-400' : 'text-slate-300'
                      }`}
                    >
                      <span>{l.flag} {l.native}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Font Size Adjuster */}
            <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-0.5 text-xs font-semibold text-slate-300 border border-slate-700">
              <button 
                onClick={() => setFontSize('normal')} 
                className={`px-2 py-0.5 rounded ${fontSize === 'normal' ? 'bg-slate-700 shadow-xs text-white' : ''}`}
              >
                A
              </button>
              <button 
                onClick={() => setFontSize('large')} 
                className={`px-2 py-0.5 rounded text-sm ${fontSize === 'large' ? 'bg-slate-700 shadow-xs text-white' : ''}`}
              >
                A+
              </button>
            </div>

            <button
              onClick={() => onAskGemini(article)}
              className="px-2 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-bold hover:bg-cyan-900/60 transition-colors flex items-center gap-1 cursor-pointer"
              title="Copilot Analysis"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Copilot AI</span>
            </button>

            {onAuditCredibility && (
              <button
                onClick={() => onAuditCredibility(article)}
                className="px-2 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-900/60 transition-colors flex items-center gap-1 cursor-pointer"
                title="Audit factual credibility & media bias"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Audit Bias</span>
              </button>
            )}

            <button
              onClick={handleToggleAudio}
              className={`w-9 h-9 sm:w-8 sm:h-8 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl transition-all active:scale-95 cursor-pointer ${
                isPlayingAudio 
                  ? 'text-rose-400 bg-rose-950/40' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title={isPlayingAudio ? 'Stop Reading' : 'Listen to article'}
              aria-label="Listen"
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => onToggleSave(article)}
              className={`w-9 h-9 sm:w-8 sm:h-8 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl transition-all active:scale-95 cursor-pointer ${
                isSaved 
                  ? 'text-cyan-400 bg-cyan-950/40' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title={isSaved ? 'Saved' : 'Save article'}
              aria-label="Save"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => onOpenShare(article)}
              className="w-9 h-9 sm:w-8 sm:h-8 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all active:scale-95 cursor-pointer"
              title="Share"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 sm:w-8 sm:h-8 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-all active:scale-95 cursor-pointer"
              title="Close window (Esc)"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Reading Column */}
        <div className="overflow-y-auto px-5 sm:px-12 py-5 sm:py-8 flex-1 space-y-6">
          
          {/* Article Header */}
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="uppercase font-mono text-[11px] font-bold tracking-[0.14em] text-cyan-400">
                  {article.category}
                </span>
                <span className="text-slate-600" aria-hidden="true">·</span>
                <span className="text-xs text-slate-200 font-semibold">
                  {article.source}
                </span>
              </div>

              {/* Quick Summary Button */}
              <button
                onClick={handleToggleQuickSummary}
                className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1 rounded-lg cursor-pointer transition-all ${
                  showQuickSummary 
                    ? 'bg-amber-500 text-slate-900 shadow-xs' 
                    : 'bg-amber-950/60 text-amber-300 hover:bg-amber-900/60 border border-amber-800/60'
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
                <span>{showQuickSummary ? 'Hide 3-Bullet Brief' : '3-Bullet Brief'}</span>
              </button>
            </div>

            <h1 className="headline-font text-xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              {currentTitle}
            </h1>

            {article.author && (
              <p className="text-xs text-slate-300 font-medium">
                By {article.author}
              </p>
            )}
          </div>

          {/* Quick 3-Bullet Point Summary Panel */}
          {showQuickSummary && (
            <div className="max-w-2xl mx-auto rounded-2xl p-5 bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-900 border border-amber-700/80 shadow-md space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-amber-900/60">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-300">
                  <Zap className="w-4 h-4 text-amber-400 fill-current" />
                  <span>Gemini AI Quick Briefing (3 Bullets)</span>
                </div>
                <button
                  onClick={() => setShowQuickSummary(false)}
                  className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
                >
                  Close
                </button>
              </div>

              {isLoadingSummary ? (
                <div className="space-y-2 py-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                    <span className="text-xs font-bold text-amber-300">Generating 3-bullet briefing with Gemini AI...</span>
                  </div>
                  <div className="h-3.5 bg-amber-800/40 rounded-md animate-pulse w-4/5" />
                  <div className="h-3.5 bg-amber-800/40 rounded-md animate-pulse w-11/12" />
                  <div className="h-3.5 bg-amber-800/40 rounded-md animate-pulse w-3/4" />
                </div>
              ) : (
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-100">
                  {quickSummaryBullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 bg-slate-900/90 p-3 rounded-xl border border-amber-500/30 shadow-xs">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-900 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed font-semibold text-slate-100">{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Hero Media */}
          {(() => {
            const modalImg = getArticleImage(article.imageUrl, article.title, article.category);
            if (!modalImg) return null;
            return (
              <div className="max-w-2xl mx-auto overflow-hidden rounded-xl aspect-[16/10] bg-slate-800 shadow-md">
                <img
                  src={modalImg}
                  alt={article?.title || ''}
                  referrerPolicy="no-referrer"
                  onError={handleImageError}
                  className="w-full h-full object-cover"
                />
              </div>
            );
          })()}

          {/* Body Prose */}
          <div className={`max-w-2xl mx-auto text-slate-200 leading-relaxed space-y-4 ${
            fontSize === 'huge' ? 'text-lg sm:text-xl' : fontSize === 'large' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
          }`}>
            {paragraphs.map((p, idx) => (
              <p 
                key={idx} 
                className={idx === 0 ? "first-letter:text-4xl sm:first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-2.5 first-letter:mt-0.5 leading-relaxed text-white font-normal" : "leading-relaxed text-slate-200"}
              >
                {p}
              </p>
            ))}
          </div>

          {/* Key Takeaways */}
          {article.keyTakeaways && article.keyTakeaways.length > 0 && (
            <div className="max-w-2xl mx-auto p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/40 space-y-2">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Key Intelligence Points
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-200 list-disc list-inside">
                {article.keyTakeaways.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer Actions & Large Close Button */}
          <div className="max-w-2xl mx-auto pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <span>Source: {article.source}</span>
            
            <div className="flex items-center gap-3">
              {article.sourceUrl && (
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 hover:underline font-semibold"
                >
                  Read Original Dispatches <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {/* Bottom Close Button */}
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700"
              >
                Close Article
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
