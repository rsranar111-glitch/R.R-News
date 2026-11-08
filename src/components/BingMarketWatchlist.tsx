import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MarketAsset {
  symbol: string;
  name: string;
  price: string;
  change: string;
  isPositive: boolean;
  type: 'index' | 'stock' | 'crypto' | 'commodity';
}

const MARKET_DATA: MarketAsset[] = [
  { symbol: 'S&P 500', name: 'US Large Cap', price: '5,745.20', change: '+0.42%', isPositive: true, type: 'index' },
  { symbol: 'NASDAQ', name: 'US Composite', price: '18,120.45', change: '+0.78%', isPositive: true, type: 'index' },
  { symbol: 'DOW', name: 'Industrial Avg', price: '42,110.15', change: '+0.25%', isPositive: true, type: 'index' },
  { symbol: 'NIFTY 50', name: 'NSE India', price: '25,182.00', change: '+0.55%', isPositive: true, type: 'index' },
  { symbol: 'FTSE 100', name: 'London Exchange', price: '8,280.60', change: '-0.12%', isPositive: false, type: 'index' },
  { symbol: 'BTC/USD', name: 'Spot Bitcoin', price: '$68,450.00', change: '+2.45%', isPositive: true, type: 'crypto' },
  { symbol: 'ETH/USD', name: 'Spot Ether', price: '$2,640.80', change: '+1.90%', isPositive: true, type: 'crypto' },
  { symbol: 'SOL/USD', name: 'Solana Network', price: '$158.20', change: '+4.12%', isPositive: true, type: 'crypto' },
  { symbol: 'GOLD', name: 'Spot Troy Oz', price: '$2,654.50', change: '+0.75%', isPositive: true, type: 'commodity' },
  { symbol: 'BRENT', name: 'North Sea Crude', price: '$74.15', change: '-0.42%', isPositive: false, type: 'commodity' },
  { symbol: 'SILVER', name: 'Spot Troy Oz', price: '$31.85', change: '+1.15%', isPositive: true, type: 'commodity' },
];

export const BingMarketWatchlist: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'index' | 'crypto' | 'commodity'>('all');

  const filteredAssets =
    activeTab === 'all' ? MARKET_DATA : MARKET_DATA.filter(a => a.type === activeTab);

  return (
    <div className="rounded-xl p-4 sm:p-5 bg-[#121826] border border-white/10 text-white">
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10">
        <div>
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Financial Desk
          </div>
          <h3 className="text-sm font-bold text-white mt-0.5">
            Global Markets & Indices
          </h3>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">
          Real-Time
        </span>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-3 mb-2 border-b border-white/10 text-xs">
        {[
          { id: 'all', label: 'All' },
          { id: 'index', label: 'Indices' },
          { id: 'crypto', label: 'Digital' },
          { id: 'commodity', label: 'Commodities' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-2 text-[11px] font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-cyan-400 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Structured Financial Table */}
      <div className="divide-y divide-white/8">
        {filteredAssets.slice(0, 6).map((asset) => (
          <div
            key={asset.symbol}
            className="flex items-center justify-between py-2 text-xs"
          >
            <div className="min-w-0 pr-2">
              <div className="font-mono font-bold text-white text-xs">
                {asset.symbol}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {asset.name}
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="font-mono tabular-nums font-bold text-white text-xs">
                {asset.price}
              </div>
              <div
                className={`font-mono tabular-nums text-[11px] font-semibold flex items-center justify-end gap-0.5 ${
                  asset.isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {asset.isPositive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {asset.change}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
