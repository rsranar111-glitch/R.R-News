import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  X,
  Volume2,
  VolumeX,
  FileText,
  TrendingUp,
  Scale,
  Compass,
  ArrowUpRight,
  Layers,
} from 'lucide-react';
import { Article, SupportedLanguage } from '../types/news.ts';

type AnalysisMode = 'brief' | 'deep' | 'market' | 'counter';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  analysisMode?: AnalysisMode;
  modelUsed?: string;
  keyTakeaways?: string[];
  followUpQuestions?: string[];
  sources?: string[];
  attachedArticleTitle?: string;
}

interface GeminiChatDeskProps {
  initialArticle?: Article | null;
  onClearInitialArticle?: () => void;
  currentLang?: SupportedLanguage;
  articles?: Article[];
}

const ANALYSIS_MODES: {
  id: AnalysisMode;
  label: string;
  shortDesc: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  {
    id: 'brief',
    label: 'Executive Brief',
    shortDesc: 'Core synthesis & operational takeaways',
    icon: FileText,
  },
  {
    id: 'deep',
    label: 'Deep Context',
    shortDesc: 'Historical drivers & technical mechanisms',
    icon: Compass,
  },
  {
    id: 'market',
    label: 'Market Impact',
    shortDesc: 'Macro, sector, capex & FX implications',
    icon: TrendingUp,
  },
  {
    id: 'counter',
    label: 'Counter-Angles',
    shortDesc: 'Competing viewpoints & risk audit',
    icon: Scale,
  },
];

const QUICK_PROMPTS = [
  {
    kicker: 'MACRO & CENTRAL BANKS',
    title: 'Assess cross-border settlement protocols & DXY currency positioning',
    prompt:
      'Analyze how central bank instant wholesale settlement protocols and interest rate differentials are impacting global FX markets and corporate liquidity.',
    mode: 'market' as AnalysisMode,
  },
  {
    kicker: 'SILICON & AI COMPUTE',
    title: 'Sub-2nm open chiplet standards & sovereign AI hardware outlook',
    prompt:
      'Provide a deep technical and industry analysis of open sub-2nm chiplet interconnect standards and their impact on AI accelerator supply chains.',
    mode: 'deep' as AnalysisMode,
  },
  {
    kicker: 'CLEAN ENERGY & EV',
    title: 'Solid-state ceramic battery breakthroughs vs. grid storage demand',
    prompt:
      'Synthesize the commercial timeline, manufacturing hurdles, and automotive impact of 550 Wh/kg solid-state EV battery cells.',
    mode: 'brief' as AnalysisMode,
  },
  {
    kicker: 'GEOPOLITICS & SPACE',
    title: 'Artemis Harmony Protocol & orbital satellite security guardrails',
    prompt:
      'Examine the geopolitical significance and competing perspectives surrounding international lunar corridors and LEO anti-satellite treaties.',
    mode: 'counter' as AnalysisMode,
  },
];

/**
 * Formats inline **bold** and *italic* segments into clean React nodes without raw markdown syntax.
 */
function formatInlineMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={idx} className="italic text-slate-200">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

/**
 * Renders structured editorial markdown (headings, bullets, numbered items, paragraphs) cleanly.
 */
function renderEditorialMarkdown(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let bulletBuffer: string[] = [];

  const flushBullets = (keyPrefix: string) => {
    if (bulletBuffer.length === 0) return;
    elements.push(
      <ul key={`ul-${keyPrefix}`} className="space-y-2 my-2.5 pl-1">
        {bulletBuffer.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-slate-200 leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-2" />
            <span className="flex-1">{formatInlineMarkdown(item)}</span>
          </li>
        ))}
      </ul>
    );
    bulletBuffer = [];
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    if (!line) {
      flushBullets(`empty-${idx}`);
      return;
    }

    if (line.startsWith('### ') || line.startsWith('## ') || line.startsWith('# ')) {
      flushBullets(`h-${idx}`);
      const cleanHeading = line.replace(/^#{1,3}\s+/, '');
      elements.push(
        <h3
          key={`heading-${idx}`}
          className="headline-font text-base sm:text-lg font-bold text-white mt-4 first:mt-0 mb-1.5 pb-1 border-b border-white/10"
        >
          {formatInlineMarkdown(cleanHeading)}
        </h3>
      );
      return;
    }

    if (/^[-•*]\s+/.test(line)) {
      bulletBuffer.push(line.replace(/^[-•*]\s+/, ''));
      return;
    }

    if (/^\d+\.\s+/.test(line)) {
      flushBullets(`num-${idx}`);
      const match = line.match(/^(\d+)\.\s+(.*)$/);
      if (match) {
        elements.push(
          <div key={`num-item-${idx}`} className="flex items-start gap-2.5 my-1.5 text-slate-200 leading-relaxed">
            <span className="font-mono text-xs font-bold text-cyan-400 shrink-0 mt-0.5">
              0{match[1]}
            </span>
            <span className="flex-1">{formatInlineMarkdown(match[2])}</span>
          </div>
        );
        return;
      }
    }

    flushBullets(`p-${idx}`);
    elements.push(
      <p key={`para-${idx}`} className="text-slate-200 leading-relaxed my-2 first:mt-0">
        {formatInlineMarkdown(line)}
      </p>
    );
  });

  flushBullets('final');
  return elements;
}

export const GeminiChatDesk: React.FC<GeminiChatDeskProps> = ({
  initialArticle,
  onClearInitialArticle,
  currentLang = 'en',
  articles = [],
}) => {
  const [activeContextArticle, setActiveContextArticle] = useState<Article | null>(
    initialArticle || null
  );
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('brief');
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite'>(
    'gemini-3.8-flash'
  );

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'model',
      content:
        '### R.R News Chief Intelligence Desk\nSelect an **Analysis Lens** above (`Executive Brief`, `Deep Context`, `Market Impact`, or `Counter-Angles`) or attach any live wire dispatch from the right rail to generate a structured, cross-referenced intelligence briefing.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      analysisMode: 'brief',
      modelUsed: 'Gemini 3.8 Flash',
      keyTakeaways: [
        'Real-time synthesis grounded in active R.R News wire dispatches.',
        'Four analytical lenses: Executive Brief, Deep Context, Market Impact, and Counter-Angles.',
        'Multi-language intelligence output with zero user tracking.',
      ],
      followUpQuestions: [
        "Synthesize today's top 3 breaking global dispatches and their common thread.",
        'What are the key macroeconomic and currency risks across global markets today?',
        'Compare the commercial readiness of solid-state EV batteries vs. ocean thermal energy.',
      ],
      sources: ['R.R News Global Wire', 'Multi-Source Verification Desk'],
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialArticle) {
      setActiveContextArticle(initialArticle);
      setInputPrompt(
        `Provide a comprehensive ${analysisMode === 'market' ? 'market impact assessment' : 'editorial briefing and structural context'} for "${initialArticle.title}".`
      );
    }
  }, [initialArticle]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const submitQuery = async (
    promptText: string,
    modeOverride?: AnalysisMode,
    articleOverride?: Article | null
  ) => {
    const cleanPrompt = promptText.trim();
    if (!cleanPrompt || isLoading) return;

    const effectiveMode = modeOverride || analysisMode;
    const effectiveArticle =
      articleOverride !== undefined ? articleOverride : activeContextArticle;

    if (modeOverride) {
      setAnalysisMode(modeOverride);
    }

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: cleanPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      analysisMode: effectiveMode,
      attachedArticleTitle: effectiveArticle?.title,
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role, content: m.content })),
          model: selectedModel,
          analysisMode: effectiveMode,
          targetLang: currentLang,
          contextArticle: effectiveArticle
            ? {
                title: effectiveArticle.title,
                summary: effectiveArticle.summary,
                content: effectiveArticle.content,
                source: effectiveArticle.source,
                category: effectiveArticle.category,
              }
            : undefined,
        }),
      });

      const data = await response.json();

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'model',
        content: data.reply || data.fallbackReply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        analysisMode: effectiveMode,
        modelUsed:
          selectedModel === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Gemini 3.1 Flash Lite',
        keyTakeaways: Array.isArray(data.keyTakeaways) ? data.keyTakeaways : undefined,
        followUpQuestions: Array.isArray(data.followUpQuestions)
          ? data.followUpQuestions
          : undefined,
        sources: Array.isArray(data.sources) ? data.sources : undefined,
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'model',
        content:
          '### Connection Interrupted\nUnable to reach the R.R News intelligence server. Please try submitting your inquiry again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        analysisMode: effectiveMode,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    submitQuery(inputPrompt);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSpeech = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanSpeechText = text.replace(/[#*•-]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    utterance.rate = 0.98;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleResetChat = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeakingId(null);
    setMessages([
      {
        id: `welcome-reset-${Date.now()}`,
        role: 'model',
        content:
          '### Intelligence Session Cleared\nSelect a research lens or wire dispatch to begin a fresh briefing.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        analysisMode,
        modelUsed:
          selectedModel === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Gemini 3.1 Flash Lite',
        followUpQuestions: [
          "Synthesize today's top 3 breaking global dispatches.",
          'What are the key macroeconomic and currency risks today?',
          'Analyze recent breakthroughs in semiconductors and clean energy.',
        ],
      },
    ]);
  };

  const handleClearContext = () => {
    setActiveContextArticle(null);
    if (onClearInitialArticle) onClearInitialArticle();
  };

  const wireSuggestions = articles.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Top Editorial Desk Header */}
      <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>R.R News Research & Synthesis</span>
          </div>
          <h1 className="headline-font text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Editorial Intelligence Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Cross-referenced news synthesis, macroeconomic impact modeling, and multi-perspective source verification powered by Google Gemini.
          </p>
        </div>

        {/* Engine Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <div className="flex items-center bg-[#111827] border border-white/10 p-0.5 rounded-lg text-xs">
            {[
              { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash' },
              { id: 'gemini-3.1-flash-lite', label: 'Flash 3.1 Lite' },
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedModel(m.id as any)}
                className={`px-3 py-1.5 rounded-md font-mono text-[11px] transition-colors cursor-pointer ${
                  selectedModel === m.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleResetChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#182236] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Reset Intelligence Session"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Session</span>
          </button>
        </div>
      </div>

      {/* Analysis Lens Selector Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {ANALYSIS_MODES.map(mode => {
          const Icon = mode.icon;
          const isSelected = analysisMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => setAnalysisMode(mode.id)}
              className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                isSelected
                  ? 'bg-[#141e33] border-cyan-400/60 text-white shadow-sm'
                  : 'bg-[#111827] border-white/8 hover:border-white/20 text-slate-300'
              }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'bg-white/5 text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{mode.label}</span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug mt-0.5 line-clamp-1">
                  {mode.shortDesc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 12-Column Intelligence Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Briefing Thread & Composer (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col border border-white/10 rounded-xl bg-[#0e1422] overflow-hidden shadow-xl">
          {/* Active Article Context Bar */}
          {activeContextArticle && (
            <div className="px-4 py-2.5 bg-[#141e33] border-b border-cyan-500/30 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-400 shrink-0">
                  Attached Dispatch:
                </span>
                <span className="font-semibold text-white truncate">
                  {activeContextArticle.title}
                </span>
                <span className="text-slate-400 hidden sm:inline shrink-0">
                  ({activeContextArticle.source})
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    submitQuery(
                      `Analyze "${activeContextArticle.title}" using the ${analysisMode.toUpperCase()} lens.`,
                      analysisMode,
                      activeContextArticle
                    )
                  }
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Run Brief
                </button>
                <button
                  type="button"
                  onClick={handleClearContext}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                  title="Detach article"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Scrollable Briefing Thread */}
          <div className="h-[58vh] sm:h-[540px] overflow-y-auto p-4 sm:p-6 space-y-6">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';

              if (isUser) {
                return (
                  <div key={msg.id} className="flex flex-col items-end">
                    <div className="max-w-[85%] rounded-xl px-4 py-3 bg-[#182338] border border-cyan-500/30 text-white text-xs sm:text-sm leading-relaxed">
                      {msg.attachedArticleTitle && (
                        <div className="font-mono text-[10px] text-cyan-400 uppercase tracking-wider mb-1">
                          Ref: {msg.attachedArticleTitle}
                        </div>
                      )}
                      <div>{msg.content}</div>
                    </div>
                    <div className="mt-1 px-1 font-mono text-[10px] text-slate-500">
                      Inquiry · {msg.timestamp}
                    </div>
                  </div>
                );
              }

              const modeLabel =
                ANALYSIS_MODES.find(m => m.id === msg.analysisMode)?.label || 'Editorial Brief';

              return (
                <div key={msg.id} className="flex flex-col items-start">
                  <div className="w-full rounded-xl bg-[#121929] border border-white/10 p-4 sm:p-5 space-y-4">
                    {/* AI Dispatch Header Strip */}
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/8 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-400">
                          {modeLabel}
                        </span>
                        <span className="text-slate-600" aria-hidden="true">·</span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {msg.modelUsed || 'Gemini 3.8 Flash'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleSpeech(msg.id, msg.content)}
                          className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 transition-colors cursor-pointer ${
                            speakingId === msg.id
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                          title={speakingId === msg.id ? 'Stop audio' : 'Read briefing aloud'}
                        >
                          {speakingId === msg.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span className="hidden xs:inline">Listen</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="px-2 py-1 rounded text-[11px] text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Copy intelligence briefing"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="hidden xs:inline">Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Formatted Editorial Prose */}
                    <div className="text-xs sm:text-sm space-y-2">
                      {renderEditorialMarkdown(msg.content)}
                    </div>

                    {/* Key Takeaways Structured Callout */}
                    {msg.keyTakeaways && msg.keyTakeaways.length > 0 && (
                      <div className="p-3.5 rounded-lg bg-[#0b101b] border border-white/10 space-y-2">
                        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-400 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          <span>Key Intelligence Takeaways</span>
                        </div>
                        <div className="space-y-1.5">
                          {msg.keyTakeaways.map((pt, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed"
                            >
                              <span className="font-mono text-[10px] font-bold text-emerald-400 shrink-0 mt-0.5">
                                0{idx + 1}
                              </span>
                              <span>{formatInlineMarkdown(pt)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sources & Timestamp Footer */}
                    <div className="pt-2 border-t border-white/8 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                          Sources:
                        </span>
                        <span>
                          {(msg.sources && msg.sources.length > 0
                            ? msg.sources
                            : ['R.R News Global Wire']
                          ).join(' · ')}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">{msg.timestamp}</span>
                    </div>

                    {/* Interactive Follow-Up Questions */}
                    {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                      <div className="pt-2 space-y-1.5">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 block">
                          Continue Investigation:
                        </span>
                        <div className="flex flex-col sm:flex-row flex-wrap gap-1.5">
                          {msg.followUpQuestions.map((q, idx) => (
                            <button
                              key={idx}
                              type="button"
                              disabled={isLoading}
                              onClick={() => submitQuery(q)}
                              className="text-left px-3 py-1.5 rounded-lg bg-[#162033] hover:bg-[#1c2942] border border-white/10 hover:border-cyan-400/40 text-xs text-slate-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <span className="line-clamp-1">{q}</span>
                              <ArrowUpRight className="w-3 h-3 text-cyan-400 shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="rounded-xl bg-[#121929] border border-white/10 p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>
                    Synthesizing {ANALYSIS_MODES.find(m => m.id === analysisMode)?.label} via{' '}
                    {selectedModel === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Flash 3.1 Lite'}...
                  </span>
                </div>
                <div className="space-y-2 animate-pulse">
                  <div className="h-3.5 bg-slate-800 rounded w-3/4" />
                  <div className="h-3.5 bg-slate-800 rounded w-11/12" />
                  <div className="h-3.5 bg-slate-800 rounded w-2/3" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Input Composer */}
          <form
            onSubmit={handleSendMessage}
            className="p-3.5 sm:p-4 bg-[#111827] border-t border-white/10 flex items-center gap-2.5"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={`Ask the ${ANALYSIS_MODES.find(m => m.id === analysisMode)?.label} desk about any global story, market trend, or policy...`}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-lg bg-[#090d16] border border-white/12 text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 disabled:opacity-40 transition-colors cursor-pointer shrink-0"
              title="Dispatch Inquiry"
            >
              <span>Analyze</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right Intelligence Sidebar: Quick Briefings & Live Wire Context Picker (4 Columns) */}
        <aside className="lg:col-span-4 space-y-5">
          {/* Curated Research Starters */}
          <div className="rounded-xl bg-[#111827] border border-white/10 p-4 sm:p-5 space-y-3">
            <div className="pb-2.5 border-b border-white/10">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-400 block">
                1-Click Briefings
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">
                Priority Intelligence Prompts
              </h3>
            </div>

            <div className="divide-y divide-white/8">
              {QUICK_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => submitQuery(item.prompt, item.mode)}
                  className="w-full text-left py-2.5 first:pt-0 last:pb-0 group cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-0.5">
                    <span className="text-cyan-400 font-bold">{item.kicker}</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors leading-snug">
                    {item.title}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Live Wire Dispatches Context Selector */}
          {wireSuggestions.length > 0 && (
            <div className="rounded-xl bg-[#111827] border border-white/10 p-4 sm:p-5 space-y-3">
              <div className="pb-2.5 border-b border-white/10">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-400 block">
                  Live Wire Dispatches
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  Analyze Active Headlines
                </h3>
              </div>

              <div className="divide-y divide-white/8">
                {wireSuggestions.map((art, idx) => {
                  const isAttached = activeContextArticle?.id === art.id;
                  return (
                    <div key={art.id || idx} className="py-2.5 first:pt-0 last:pb-0 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
                        <span className="text-cyan-400 font-bold uppercase">{art.category}</span>
                        <span>·</span>
                        <span className="truncate">{art.source}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200 leading-snug line-clamp-2">
                        {art.title}
                      </p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => {
                            setActiveContextArticle(art);
                            submitQuery(
                              `Provide an executive briefing and structural analysis for "${art.title}".`,
                              analysisMode,
                              art
                            );
                          }}
                          className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Analyze Story</span>
                        </button>
                        {isAttached && (
                          <span className="font-mono text-[10px] text-emerald-400 uppercase">
                            · Attached
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
