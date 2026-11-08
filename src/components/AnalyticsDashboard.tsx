import React from 'react';
import { EngagementMetrics } from '../types/news.ts';

interface AnalyticsDashboardProps {
  metrics: EngagementMetrics;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ metrics }) => {
  const totalMinutes = Math.floor(metrics.totalSecondsRead / 60);

  const categoryEntries = Object.entries(metrics.categoryCounts || {});
  const totalCategoryInteractions =
    categoryEntries.reduce((sum, [, count]) => sum + count, 0) || 1;

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-white">
      {/* Editorial Section Header */}
      <div className="border-b border-white/10 pb-4">
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-400 mb-1">
          Local Device Telemetry
        </div>
        <h1 className="headline-font text-2xl sm:text-3xl font-bold text-white">
          Reading Analytics & Focus
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Private engagement metrics computed strictly in local storage with zero external tracking.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl p-5 space-y-1.5 bg-[#111827] border border-white/10">
          <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
            Reading Time
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
            {totalMinutes} <span className="text-xs font-normal text-slate-400">min</span>
          </div>
        </div>

        <div className="rounded-xl p-5 space-y-1.5 bg-[#111827] border border-white/10">
          <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
            Daily Streak
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 tabular-nums flex items-baseline gap-1.5">
            <span>{metrics.streakDays}</span>
            <span className="text-xs font-normal text-slate-400">days</span>
          </div>
        </div>

        <div className="rounded-xl p-5 space-y-1.5 bg-[#111827] border border-white/10">
          <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
            Dispatches Read
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-cyan-400 tabular-nums">
            {metrics.articlesReadCount}
          </div>
        </div>

        <div className="rounded-xl p-5 space-y-1.5 bg-[#111827] border border-white/10">
          <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
            Vault Saved
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
            {metrics.articlesSavedCount}
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="rounded-xl p-5 sm:p-6 bg-[#111827] border border-white/10 space-y-4">
        <div className="pb-2.5 border-b border-white/10">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 block">
            Beat Distribution
          </span>
          <h2 className="headline-font text-lg font-bold text-white mt-0.5">
            Editorial Topics Explored
          </h2>
        </div>

        <div className="space-y-3.5 max-w-2xl">
          {categoryEntries.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">
              Open and read dispatches across the wire to populate your beat distribution.
            </p>
          ) : (
            categoryEntries.map(([category, count]) => {
              const percentage = Math.round((count / totalCategoryInteractions) * 100);
              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-200 font-medium">
                    <span>{category}</span>
                    <span className="font-mono text-slate-400 tabular-nums">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#090d16] rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
