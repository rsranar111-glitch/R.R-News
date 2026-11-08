import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  AlertCircle,
  Globe2,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { Article, SupportedLanguage } from '../types/news.ts';
import { CredibilityAuditResult } from '../types/finance.ts';
import { AppLogo } from './AppLogo.tsx';

interface CredibilityAuditModalProps {
  article: Article | null;
  onClose: () => void;
  activeLang?: SupportedLanguage;
}

export const CredibilityAuditModal: React.FC<CredibilityAuditModalProps> = ({
  article,
  onClose,
  activeLang = 'en',
}) => {
  const [audit, setAudit] = useState<CredibilityAuditResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!article) return;
    setIsLoading(true);

    fetch('/api/gemini/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ article, targetLang: activeLang }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.audit) {
          setAudit(data.audit);
        }
      })
      .catch(err => {
        console.warn('Audit fetch error:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [article, activeLang]);

  if (!article) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl h-[92vh] sm:h-auto sm:max-h-[90vh] bg-[#0e1422] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-white/12 overflow-hidden flex flex-col text-white"
      >
        {/* Header Toolbar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-[#111827] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#182236] hover:bg-[#1f2c46] text-white font-semibold text-xs border border-white/10 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <AppLogo size="xs" animate={false} />
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="truncate max-w-[160px] sm:max-w-none">Source & Bias Verification</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/8 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
          {/* Article Context Kicker */}
          <div className="space-y-1.5 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
              <span className="text-cyan-400 font-bold uppercase">{article.category}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300">{article.source}</span>
            </div>
            <h2 className="headline-font text-lg sm:text-xl font-bold text-white leading-snug">
              {article.title}
            </h2>
          </div>

          {isLoading ? (
            <div className="py-8 space-y-4">
              <div className="flex items-center gap-2.5 text-cyan-400 font-mono text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Auditing primary sources & editorial framing via Gemini 3.8 Flash...</span>
              </div>
              <div className="h-4 bg-slate-800 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-slate-800 rounded animate-pulse w-5/6" />
              <div className="h-4 bg-slate-800 rounded animate-pulse w-2/3" />
            </div>
          ) : audit ? (
            <div className="space-y-5">
              {/* Scorecard Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#111827] border border-white/10">
                  <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Editorial Classification
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        audit.overallRating === 'High Verification'
                          ? 'bg-emerald-400'
                          : 'bg-amber-400'
                      }`}
                    />
                    <span className="text-sm font-bold text-white">{audit.overallRating}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#111827] border border-white/10">
                  <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Source Transparency Index
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-cyan-400 tabular-nums">
                      {audit.sourceTransparencyScore}%
                    </span>
                    <span className="text-xs text-slate-300 truncate">
                      {audit.primarySourceDensity}
                    </span>
                  </div>
                </div>
              </div>

              {/* Factual Core */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Verified Factual Checkpoints</span>
                </div>
                <ul className="space-y-2">
                  {audit.factualBasis.map((fact, idx) => (
                    <li
                      key={idx}
                      className="text-xs leading-relaxed text-slate-200 p-3 rounded-lg bg-[#111827] border border-white/10"
                    >
                      {fact}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Framing & Bias */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Editorial Framing & Nuance</span>
                </div>
                <ul className="space-y-2">
                  {audit.potentialBiases.map((bias, idx) => (
                    <li
                      key={idx}
                      className="text-xs leading-relaxed text-slate-200 p-3 rounded-lg bg-[#111827] border border-white/10"
                    >
                      {bias}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Alternative Global Perspectives */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                  <Globe2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Cross-Source Global Perspectives</span>
                </div>
                <ul className="space-y-2">
                  {audit.alternativePerspectives.map((persp, idx) => (
                    <li
                      key={idx}
                      className="text-xs leading-relaxed text-slate-200 p-3 rounded-lg bg-[#111827] border border-white/10"
                    >
                      {persp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 bg-[#111827]">
          <span className="font-mono text-[10px] uppercase tracking-wider">
            R.R News Ombudsman Verification
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
