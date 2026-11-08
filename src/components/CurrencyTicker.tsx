import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { SupportedLanguage } from '../types/news.ts';
import { getUIText } from '../services/translations.ts';

interface CurrencyPair {
  pair: string;
  rate: string;
  change: string;
  isPositive: boolean;
}

const DEFAULT_RATES: CurrencyPair[] = [
  { pair: 'EUR/USD', rate: '1.0842', change: '+0.12%', isPositive: true },
  { pair: 'USD/JPY', rate: '154.32', change: '-0.24%', isPositive: false },
  { pair: 'GBP/USD', rate: '1.2980', change: '+0.18%', isPositive: true },
  { pair: 'USD/CHF', rate: '0.8654', change: '-0.08%', isPositive: false },
  { pair: 'USD/INR', rate: '84.06', change: '+0.03%', isPositive: true },
  { pair: 'BTC/USD', rate: '$68,420', change: '+2.60%', isPositive: true },
  { pair: 'GOLD', rate: '$2,654.50', change: '+0.75%', isPositive: true },
  { pair: 'BRENT', rate: '$74.15', change: '-0.42%', isPositive: false },
];

export const CurrencyTicker: React.FC<{ onSelectCurrency?: () => void; language?: SupportedLanguage }> = ({
  onSelectCurrency,
  language = 'en',
}) => {
  const [rates, setRates] = useState<CurrencyPair[]>(DEFAULT_RATES);

  const fetchRates = async () => {
    try {
      const res = await fetch('/api/currency/rates');
      const data = await res.json();
      if (data.success && Array.isArray(data.rates)) {
        setRates(data.rates);
      }
    } catch {
      // fallback to DEFAULT_RATES
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-full bg-[#070b14] border-b border-white/10 text-xs py-2 px-3.5 sm:px-6 lg:px-8 overflow-hidden select-none text-slate-200">
      <div className="max-w-7xl mx-auto flex items-center gap-3 min-w-0">
        {/* Market Tape Label (Matches Screenshot: ↗ MARKETS & FX |) */}
        <button
          type="button"
          onClick={onSelectCurrency}
          className="inline-flex items-center gap-1.5 font-extrabold uppercase tracking-wider text-[11px] text-cyan-400 hover:text-cyan-300 shrink-0 cursor-pointer transition-colors"
        >
          <TrendingUp className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>{getUIText('marketsFx', language)}</span>
        </button>

        <span className="text-slate-600 shrink-0" aria-hidden="true">|</span>

        {/* Horizontal Financial Tape */}
        <div className="flex items-center divide-x divide-white/10 overflow-x-auto scrollbar-none flex-1 min-w-0">
          {rates.map((item) => (
            <div
              key={item.pair}
              onClick={onSelectCurrency}
              className="flex items-center gap-1.5 px-3 first:pl-0 whitespace-nowrap shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
            >
              <span className="text-slate-300 font-semibold text-xs">{item.pair}</span>
              <span className="tabular-nums text-white font-bold text-xs">{item.rate}</span>
              <span
                className={`inline-flex items-center gap-0.5 tabular-nums text-[11px] font-bold ${
                  item.isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                <span>{item.isPositive ? '▲' : '▼'}</span>
                <span>{item.change}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
