import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Edit3, 
  DollarSign, 
  RefreshCw, 
  Search, 
  PieChart, 
  Check, 
  ArrowUpRight, 
  ArrowDownRight,
  Shield,
  Briefcase
} from 'lucide-react';
import { PortfolioHolding, WatchlistAsset, AssetType } from '../types/finance.ts';
import { 
  getLocalHoldings, 
  saveLocalHoldings, 
  syncHoldingsToFirestore, 
  fetchHoldingsFromFirestore 
} from '../services/portfolioStorage.ts';

interface PortfolioDashboardProps {
  userId?: string;
  isOnline?: boolean;
}

export const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({
  userId,
  isOnline = true
}) => {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | AssetType>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for adding holding
  const [selectedSymbol, setSelectedSymbol] = useState('NVDA');
  const [sharesInput, setSharesInput] = useState('10');
  const [buyPriceInput, setBuyPriceInput] = useState('130.00');

  // Load holdings on mount or when userId changes
  useEffect(() => {
    const loadHoldings = async () => {
      setIsLoading(true);
      if (userId) {
        const remote = await fetchHoldingsFromFirestore(userId);
        if (remote && remote.length > 0) {
          setHoldings(remote);
          saveLocalHoldings(remote);
          setIsLoading(false);
          return;
        }
      }
      setHoldings(getLocalHoldings());
      setIsLoading(false);
    };

    loadHoldings();
  }, [userId]);

  // Fetch live market watchlist
  const fetchWatchlist = async () => {
    try {
      const res = await fetch('/api/finance/watchlist');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.assets)) {
          setWatchlist(data.assets);
          // Update live prices for current holdings
          setHoldings(prev => {
            const updated = prev.map(h => {
              const live = data.assets.find((a: WatchlistAsset) => a.symbol === h.symbol);
              if (live) {
                return {
                  ...h,
                  currentPrice: live.price,
                  change24h: live.change24h,
                  sparkline: live.sparkline || h.sparkline
                };
              }
              return h;
            });
            saveLocalHoldings(updated);
            if (userId) syncHoldingsToFirestore(userId, updated);
            return updated;
          });
        }
      }
    } catch (e) {
      console.warn('Watchlist fetch error:', e);
    }
  };

  useEffect(() => {
    fetchWatchlist();
    const interval = setInterval(fetchWatchlist, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleAddHolding = (e: React.FormEvent) => {
    e.preventDefault();
    const assetMeta = watchlist.find(w => w.symbol === selectedSymbol) || {
      symbol: selectedSymbol,
      name: selectedSymbol,
      type: 'stock' as AssetType,
      price: parseFloat(buyPriceInput) || 100,
      change24h: 0,
      sparkline: [100, 102, 101, 103, 105, 104, 106]
    };

    const shares = parseFloat(sharesInput) || 1;
    const buyPrice = parseFloat(buyPriceInput) || assetMeta.price;

    const newHolding: PortfolioHolding = {
      id: `${assetMeta.symbol.toLowerCase()}-${Date.now()}`,
      symbol: assetMeta.symbol,
      name: assetMeta.name,
      type: assetMeta.type,
      shares,
      buyPrice,
      currentPrice: assetMeta.price,
      change24h: assetMeta.change24h,
      sparkline: assetMeta.sparkline,
      updatedAt: new Date().toISOString()
    };

    const updated = [newHolding, ...holdings.filter(h => h.symbol !== newHolding.symbol)];
    setHoldings(updated);
    saveLocalHoldings(updated);
    if (userId) syncHoldingsToFirestore(userId, updated);
    setIsAddModalOpen(false);
  };

  const handleRemoveHolding = (id: string) => {
    const updated = holdings.filter(h => h.id !== id);
    setHoldings(updated);
    saveLocalHoldings(updated);
    if (userId) syncHoldingsToFirestore(userId, updated);
  };

  // Calculations
  const totalValue = holdings.reduce((sum, h) => sum + (h.shares * h.currentPrice), 0);
  const totalCost = holdings.reduce((sum, h) => sum + (h.shares * h.buyPrice), 0);
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
  const dayGainLoss = holdings.reduce((sum, h) => {
    const previousClose = h.currentPrice / (1 + (h.change24h / 100));
    return sum + (h.shares * (h.currentPrice - previousClose));
  }, 0);
  const dayGainLossPercent = totalValue > 0 ? (dayGainLoss / totalValue) * 100 : 0;

  const filteredHoldings = selectedFilter === 'all' 
    ? holdings 
    : holdings.filter(h => h.type === selectedFilter);

  // Sparkline renderer
  const renderSparkline = (points: number[], isPositive: boolean) => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 80;
    const height = 28;

    const pathD = points.map((val, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible">
        <path
          d={pathD}
          fill="none"
          stroke={isPositive ? '#10B981' : '#EF4444'}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-white">
      {/* Section Header */}
      <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-400 mb-1">
            Capital Markets & Asset Allocation
          </div>
          <h1 className="headline-font text-2xl sm:text-3xl font-bold text-white">
            Portfolio & Global Watchlist
          </h1>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Position</span>
        </button>
      </div>

      {/* Portfolio Executive KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Value */}
        <div className="rounded-xl p-5 bg-[#111827] border border-white/10">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
            <span>Total Portfolio Balance</span>
            <span className="text-cyan-400 font-bold">USD</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono tabular-nums">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <span className="text-slate-400">Invested Capital:</span>
            <span className="font-mono tabular-nums text-slate-200 font-semibold">
              ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* 24h Performance */}
        <div className="rounded-xl p-5 bg-[#111827] border border-white/10">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
            <span>24h Net Performance</span>
            <RefreshCw onClick={fetchWatchlist} className="w-3.5 h-3.5 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer" />
          </div>
          <div className={`text-2xl sm:text-3xl font-bold tracking-tight font-mono tabular-nums flex items-center gap-1.5 ${
            dayGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {dayGainLoss >= 0 ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
            <span>
              {dayGainLoss >= 0 ? '+' : ''}${dayGainLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-xs font-mono tabular-nums text-slate-300">
            {dayGainLossPercent >= 0 ? '+' : ''}{dayGainLossPercent.toFixed(2)}% past 24 hours
          </div>
        </div>

        {/* Total Return */}
        <div className="rounded-xl p-5 bg-[#111827] border border-white/10">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
            <span>All-Time Return</span>
            <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className={`text-2xl sm:text-3xl font-bold tracking-tight font-mono tabular-nums ${
            totalGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs font-mono tabular-nums">
            <span className={totalGainLossPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {totalGainLossPercent >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}% overall ROI
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar & Filter Tabs */}
      <div className="flex items-center gap-4 border-b border-white/10 overflow-x-auto scrollbar-none">
        {[
          { id: 'all', label: 'All Holdings' },
          { id: 'stock', label: 'Equities' },
          { id: 'crypto', label: 'Digital Assets' },
          { id: 'forex', label: 'Currencies' },
          { id: 'commodity', label: 'Commodities' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setSelectedFilter(f.id as any)}
            className={`py-2.5 text-xs uppercase tracking-wider font-mono border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              selectedFilter === f.id
                ? 'border-cyan-400 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-white font-semibold'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Holdings Table */}
      <div className="rounded-xl overflow-hidden bg-[#111827] border border-white/10">
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">
            Active Positions ({filteredHoldings.length})
          </h3>
          <span className="font-mono text-[11px] text-slate-400">
            Live Market Telemetry
          </span>
        </div>

        {filteredHoldings.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">No positions found in this category.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs font-bold text-cyan-400 hover:underline cursor-pointer min-h-[44px] inline-flex items-center"
            >
              + Add your first asset
            </button>
          </div>
        ) : (
          <>
            {/* Mobile View: Horizontally Swipeable Snap Cards with Sticky Header Indicator */}
            <div className="md:hidden">
              <div className="sticky top-0 z-10 px-4 py-2.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{filteredHoldings.length} {filteredHoldings.length === 1 ? 'Position' : 'Positions'} Active</span>
                </span>
                <span className="text-slate-400 font-medium">← Swipe Cards →</span>
              </div>

              <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory p-4 scrollbar-none">
                {filteredHoldings.map((h) => {
                  const currentValue = h.shares * h.currentPrice;
                  const totalCost = h.shares * h.buyPrice;
                  const plDollar = currentValue - totalCost;
                  const plPercent = totalCost > 0 ? (plDollar / totalCost) * 100 : 0;
                  const isPositive = plDollar >= 0;

                  return (
                    <div
                      key={h.id}
                      className="snap-center shrink-0 w-[82vw] max-w-[320px] bg-[#121826] border border-slate-700/80 rounded-2xl p-4 shadow-lg space-y-3 text-white"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-white font-mono text-base tracking-tight">
                            {h.symbol}
                          </div>
                          <div className="text-xs text-slate-300 truncate max-w-[180px]">
                            {h.name}
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveHolding(h.id)}
                          className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-400 hover:text-rose-400 transition-colors cursor-pointer rounded-xl hover:bg-rose-950/40 active:scale-95"
                          title="Remove holding"
                          aria-label="Remove holding"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-700/60 font-mono tabular-nums">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans">Market Value</span>
                          <span className="font-extrabold text-sm text-white">
                            ${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans">Price & 24h</span>
                          <div className="flex items-center gap-1.5 font-bold">
                            <span>${h.currentPrice.toFixed(2)}</span>
                            <span className={h.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                              {h.change24h >= 0 ? '+' : ''}{h.change24h.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono tabular-nums pt-1">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans">Holdings ({h.shares} units)</span>
                          <span className="text-slate-300 text-[11px]">Cost: ${h.buyPrice.toFixed(2)}</span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-sans">Total ROI</span>
                          <div className={`font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isPositive ? '+' : ''}${plDollar.toFixed(2)} ({isPositive ? '+' : ''}{plPercent.toFixed(1)}%)
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-center">
                        {renderSparkline(h.sparkline, h.change24h >= 0)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Desktop View: Multi-column Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-white">
                <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="py-3 px-5">Asset</th>
                    <th className="py-3 px-4">Holdings</th>
                    <th className="py-3 px-4">Current Price</th>
                    <th className="py-3 px-4">24h Trend</th>
                    <th className="py-3 px-4">Market Value</th>
                    <th className="py-3 px-4">Total P&L</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredHoldings.map((h) => {
                    const currentValue = h.shares * h.currentPrice;
                    const totalCost = h.shares * h.buyPrice;
                    const plDollar = currentValue - totalCost;
                    const plPercent = totalCost > 0 ? (plDollar / totalCost) * 100 : 0;
                    const isPositive = plDollar >= 0;

                    return (
                      <tr key={h.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-white font-mono text-sm">
                            {h.symbol}
                          </div>
                          <div className="text-[11px] text-slate-300 truncate max-w-[120px]">
                            {h.name}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono tabular-nums text-slate-200">
                          <div>{h.shares} units</div>
                          <div className="text-[10px] text-slate-400 font-sans">
                            Cost: ${h.buyPrice.toFixed(2)}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono tabular-nums font-bold text-white">
                          ${h.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {renderSparkline(h.sparkline, h.change24h >= 0)}
                            <span className={`font-mono tabular-nums text-[11px] font-bold ${
                              h.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                              {h.change24h >= 0 ? '+' : ''}{h.change24h.toFixed(2)}%
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono tabular-nums font-black text-white">
                          ${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        <td className="py-3.5 px-4 font-mono tabular-nums">
                          <div className={`font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isPositive ? '+' : ''}${plDollar.toFixed(2)}
                          </div>
                          <div className={`text-[10px] ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isPositive ? '+' : ''}{plPercent.toFixed(2)}%
                          </div>
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => handleRemoveHolding(h.id)}
                            className="p-1.5 text-stone-400 hover:text-red-600 transition-colors cursor-pointer rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                            title="Remove holding"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Market Watchlist Grid */}
      <div className="bg-[#111827] border border-white/10 rounded-xl p-5 space-y-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">
              Global Market Watchlist
            </h3>
            <p className="text-xs text-slate-400">
              Live quotes across major international benchmarks and crypto
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400 tabular-nums">
            Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {watchlist.slice(0, 8).map((asset) => {
            const isHeld = holdings.some(h => h.symbol === asset.symbol);
            const isPos = asset.change24h >= 0;

            return (
              <div 
                key={asset.symbol}
                className="p-3.5 rounded-xl border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800/80 transition-colors flex flex-col justify-between space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-mono font-black text-sm text-white">
                      {asset.symbol}
                    </div>
                    <div className="text-[11px] text-slate-300 truncate max-w-[130px]">
                      {asset.name}
                    </div>
                  </div>
                  <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isPos ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                  }`}>
                    {isPos ? '+' : ''}{asset.change24h.toFixed(2)}%
                  </span>
                </div>

                <div className="flex items-end justify-between pt-1">
                  <div className="font-mono text-base font-bold text-white tabular-nums">
                    ${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>

                  {isHeld ? (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Tracked
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedSymbol(asset.symbol);
                        setBuyPriceInput(asset.price.toString());
                        setIsAddModalOpen(true);
                      }}
                      className="text-[11px] font-bold text-cyan-400 hover:underline cursor-pointer"
                    >
                      + Track
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Holding Modal */}
      {isAddModalOpen && (
        <div 
          onClick={() => setIsAddModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xl animate-in fade-in"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-[#111726] backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-6 space-y-4 text-white"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                Add Asset Position
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddHolding} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Select Asset
                </label>
                <select
                  value={selectedSymbol}
                  onChange={e => {
                    setSelectedSymbol(e.target.value);
                    const found = watchlist.find(w => w.symbol === e.target.value);
                    if (found) setBuyPriceInput(found.price.toString());
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                >
                  {watchlist.map(w => (
                    <option key={w.symbol} value={w.symbol} className="bg-slate-900 text-white">
                      {w.symbol} - {w.name} (${w.price.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Units / Shares
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.0001"
                    value={sharesInput}
                    onChange={e => setSharesInput(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Buy Price ($ USD)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    value={buyPriceInput}
                    onChange={e => setBuyPriceInput(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Save Position
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
