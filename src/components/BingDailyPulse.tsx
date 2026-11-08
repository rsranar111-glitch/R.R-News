import React, { useState, useEffect } from 'react';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import { SupportedLanguage } from '../types/news.ts';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface DailyPoll {
  date: string;
  topic: string;
  question: string;
  options: PollOption[];
  generatedBy: string;
  timestamp: string;
}

interface BingDailyPulseProps {
  currentLang?: SupportedLanguage;
}

export const BingDailyPulse: React.FC<BingDailyPulseProps> = ({
  currentLang = 'en',
}) => {
  const [poll, setPoll] = useState<DailyPoll | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDailyPoll = async (force = false) => {
    if (force) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await fetch(`/api/gemini/daily-poll?lang=${currentLang}${force ? '&force=true' : ''}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.poll) {
          setPoll(data.poll);
          const storedVote = localStorage.getItem(`rrnews_poll_vote_${data.poll.date}`);
          if (storedVote) {
            setSelectedOption(storedVote);
            setHasVoted(true);
          } else {
            setSelectedOption(null);
            setHasVoted(false);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch daily poll:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDailyPoll();
  }, [currentLang]);

  const options = poll?.options || [];
  const totalVotes = options.reduce((acc, o) => acc + o.votes, 0);

  const handleVote = async (id: string) => {
    if (hasVoted || !poll) return;
    setSelectedOption(id);
    setHasVoted(true);

    try {
      localStorage.setItem(`rrnews_poll_vote_${poll.date}`, id);
    } catch {}

    setPoll(prev => {
      if (!prev) return null;
      return {
        ...prev,
        options: prev.options.map(o => (o.id === id ? { ...o, votes: o.votes + 1 } : o)),
      };
    });

    try {
      await fetch('/api/gemini/daily-poll/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionId: id,
          date: poll.date,
          lang: currentLang,
        }),
      });
    } catch (e) {
      console.warn('Vote submission error:', e);
    }
  };

  const formattedDate = poll?.date
    ? new Date(poll.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="rounded-xl p-4 sm:p-5 bg-[#121826] border border-white/10 text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/10">
        <div>
          <div className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-[0.14em]">
            Editorial Symposium · {formattedDate}
          </div>
          <h3 className="text-sm font-bold text-white mt-0.5">
            Question of the Day
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-300 tabular-nums">
            {totalVotes.toLocaleString()} responses
          </span>
          <button
            type="button"
            onClick={() => fetchDailyPoll(true)}
            disabled={isRefreshing || isLoading}
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/8 transition-colors cursor-pointer"
            title="Load Next Question"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-4 space-y-2.5 animate-pulse">
          <div className="h-4 bg-slate-800 rounded w-4/5" />
          <div className="h-3 bg-slate-800 rounded w-2/3" />
          <div className="h-9 bg-slate-800 rounded-lg mt-3" />
          <div className="h-9 bg-slate-800 rounded-lg" />
          <div className="h-9 bg-slate-800 rounded-lg" />
        </div>
      ) : poll ? (
        <>
          <div className="mb-3.5">
            {poll.topic && (
              <span className="font-mono text-[10px] uppercase font-bold text-cyan-400 tracking-wider block mb-1">
                {poll.topic}
              </span>
            )}
            <h4 className="headline-font text-sm sm:text-base font-bold text-white leading-snug">
              {poll.question}
            </h4>
          </div>

          <div className="space-y-2">
            {options.map(option => {
              const percentage =
                totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
              const isSelected = selectedOption === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleVote(option.id)}
                  disabled={hasVoted}
                  className={`w-full text-left p-2.5 rounded-lg border transition-colors relative overflow-hidden text-xs cursor-pointer ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/30 text-white font-semibold'
                      : 'border-white/10 hover:border-white/25 bg-[#0e1320] text-slate-200'
                  }`}
                >
                  {hasVoted && (
                    <div
                      className={`absolute top-0 bottom-0 left-0 transition-all duration-700 ease-out opacity-20 ${
                        isSelected ? 'bg-cyan-400' : 'bg-slate-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  )}

                  <div className="flex items-center justify-between relative z-10">
                    <span className="pr-2 font-medium">{option.text}</span>
                    {hasVoted && (
                      <span className="font-mono font-bold text-white shrink-0 tabular-nums">
                        {percentage}%
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-slate-300 font-medium">
              {hasVoted ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Response recorded</span>
                </>
              ) : (
                <span>Select a position to view consensus</span>
              )}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
              Reader Poll
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
};
