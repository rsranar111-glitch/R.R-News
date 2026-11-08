export type AssetType = 'stock' | 'crypto' | 'forex' | 'commodity';

export interface WatchlistAsset {
  symbol: string;
  name: string;
  type: AssetType;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume: string;
  sparkline: number[];
}

export interface PortfolioHolding {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  shares: number;
  buyPrice: number;
  currentPrice: number;
  change24h: number;
  sparkline: number[];
  updatedAt: string;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  dayGainLoss: number;
  dayGainLossPercent: number;
}

export interface CredibilityAuditResult {
  articleId: string;
  targetLang: string;
  overallRating: 'High Verification' | 'Developing Story' | 'Opinion / Editorial';
  sourceTransparencyScore: number; // 0-100
  primarySourceDensity: string;
  factualBasis: string[];
  potentialBiases: string[];
  alternativePerspectives: string[];
  analyzedAt: string;
}
