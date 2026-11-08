import { PortfolioHolding } from '../types/finance.ts';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase.ts';

const LOCAL_STORAGE_KEY = 'rrnews_portfolio_holdings_v1';

export const DEFAULT_STARTER_HOLDINGS: PortfolioHolding[] = [
  {
    id: 'nvda',
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    type: 'stock',
    shares: 25,
    buyPrice: 118.50,
    currentPrice: 138.80,
    change24h: 2.85,
    sparkline: [131.2, 133.5, 134.8, 136.0, 137.4, 136.9, 138.80],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'aapl',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'stock',
    shares: 15,
    buyPrice: 215.00,
    currentPrice: 232.45,
    change24h: 1.24,
    sparkline: [228.1, 229.4, 230.2, 231.0, 230.8, 231.9, 232.45],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    type: 'crypto',
    shares: 0.35,
    buyPrice: 62500.00,
    currentPrice: 68450.00,
    change24h: 3.15,
    sparkline: [64200, 65100, 66400, 65900, 67200, 67800, 68450],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gold',
    symbol: 'GOLD',
    name: 'Gold Spot (XAU/USD)',
    type: 'commodity',
    shares: 2.5,
    buyPrice: 2580.00,
    currentPrice: 2654.50,
    change24h: 0.75,
    sparkline: [2620, 2628, 2635, 2642, 2639, 2648, 2654.5],
    updatedAt: new Date().toISOString()
  }
];

export function getLocalHoldings(): PortfolioHolding[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}
  return DEFAULT_STARTER_HOLDINGS;
}

export function saveLocalHoldings(holdings: PortfolioHolding[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(holdings));
  } catch (e) {}
}

export async function syncHoldingsToFirestore(userId: string, holdings: PortfolioHolding[]): Promise<void> {
  if (!userId) return;
  try {
    const userPortfolioRef = doc(db, 'portfolios', userId);
    await setDoc(userPortfolioRef, {
      holdings,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.warn('Firestore portfolio sync offline/cached:', e);
  }
}

export async function fetchHoldingsFromFirestore(userId: string): Promise<PortfolioHolding[] | null> {
  if (!userId) return null;
  try {
    const userPortfolioRef = doc(db, 'portfolios', userId);
    const snapshot = await getDoc(userPortfolioRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data && Array.isArray(data.holdings)) {
        return data.holdings;
      }
    }
  } catch (e) {
    console.warn('Firestore portfolio read error:', e);
  }
  return null;
}
