import { Article, SavedArticle, EngagementMetrics, UserPreferences } from '../types/news.ts';

const SAVED_ARTICLES_KEY = 'rr_news_saved_articles_v1';
const METRICS_KEY = 'rr_news_metrics_v1';
const PREFERENCES_KEY = 'rr_news_preferences_v1';

export const DEFAULT_PREFERENCES: UserPreferences = {
  darkMode: true,
  personalizedTopics: ['Technology', 'Business', 'World', 'Science', 'Climate'],
  dailyBriefingTime: '08:00 AM',
  pushNotificationsEnabled: true,
  alertThreshold: 'all',
  audioAlertsEnabled: false,
  fontScale: 'normal',
  language: 'en',
  country: 'global',
};

export const DEFAULT_METRICS: EngagementMetrics = {
  totalSecondsRead: 480, // initial benchmark 8 mins
  articlesReadCount: 3,
  articlesSavedCount: 0,
  completionRate: 85,
  streakDays: 4,
  lastActiveDate: new Date().toISOString().split('T')[0],
  categoryCounts: {
    Technology: 4,
    Business: 3,
    Science: 2,
    World: 2,
    Climate: 1,
  },
  dailyMinutes: {
    [new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0]]: 12,
    [new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0]]: 18,
    [new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0]]: 15,
    [new Date().toISOString().split('T')[0]]: 8,
  },
  sharesCount: 2,
};

// Offline Articles
export function getSavedArticles(): SavedArticle[] {
  try {
    const raw = localStorage.getItem(SAVED_ARTICLES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load saved articles', e);
    return [];
  }
}

export function saveArticleOffline(article: Article): SavedArticle[] {
  const existing = getSavedArticles();
  const index = existing.findIndex(a => a.id === article.id);
  const now = new Date().toISOString();

  let updated: SavedArticle[];
  if (index >= 0) {
    // Already saved, toggle/remove
    updated = existing.filter(a => a.id !== article.id);
  } else {
    const newSaved: SavedArticle = {
      ...article,
      savedAt: now,
      readProgress: 0,
      isRead: false,
    };
    updated = [newSaved, ...existing];
    incrementMetric('articlesSavedCount', 1);
  }

  try {
    localStorage.setItem(SAVED_ARTICLES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('LocalStorage error saving article', e);
  }
  return updated;
}

export function isArticleSaved(articleId: string): boolean {
  const existing = getSavedArticles();
  return existing.some(a => a.id === articleId);
}

export function removeArticleOffline(articleId: string): SavedArticle[] {
  const existing = getSavedArticles();
  const updated = existing.filter(a => a.id !== articleId);
  try {
    localStorage.setItem(SAVED_ARTICLES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('LocalStorage error removing article', e);
  }
  return updated;
}

// User Preferences
export function getUserPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFERENCES, ...parsed, darkMode: true };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(prefs: Partial<UserPreferences>): UserPreferences {
  const current = getUserPreferences();
  const updated = { ...current, ...prefs };
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save preferences', e);
  }
  return updated;
}

// Engagement Analytics
export function getEngagementMetrics(): EngagementMetrics {
  try {
    const raw = localStorage.getItem(METRICS_KEY);
    if (!raw) return DEFAULT_METRICS;
    return { ...DEFAULT_METRICS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_METRICS;
  }
}

export function saveEngagementMetrics(metrics: EngagementMetrics): void {
  try {
    localStorage.setItem(METRICS_KEY, JSON.stringify(metrics));
  } catch (e) {
    console.error('Failed to save metrics', e);
  }
}

export function recordReadingTime(seconds: number, category?: string): EngagementMetrics {
  const metrics = getEngagementMetrics();
  metrics.totalSecondsRead += seconds;

  const today = new Date().toISOString().split('T')[0];
  const minutesToday = Math.round((metrics.dailyMinutes[today] || 0) + seconds / 60);
  metrics.dailyMinutes[today] = minutesToday;

  if (category) {
    metrics.categoryCounts[category] = (metrics.categoryCounts[category] || 0) + 1;
  }

  // Update streak if needed
  if (metrics.lastActiveDate !== today) {
    const lastDate = new Date(metrics.lastActiveDate);
    const currDate = new Date(today);
    const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays === 1) {
      metrics.streakDays += 1;
    } else if (diffDays > 1) {
      metrics.streakDays = 1;
    }
    metrics.lastActiveDate = today;
  }

  saveEngagementMetrics(metrics);
  return metrics;
}

export function recordArticleRead(category: string, completed = true): EngagementMetrics {
  const metrics = getEngagementMetrics();
  metrics.articlesReadCount += 1;
  metrics.categoryCounts[category] = (metrics.categoryCounts[category] || 0) + 1;

  if (completed) {
    metrics.completionRate = Math.min(100, Math.round(((metrics.articlesReadCount * 0.85) / metrics.articlesReadCount) * 100));
  }

  saveEngagementMetrics(metrics);
  return metrics;
}

export function recordSocialShare(_articleId?: string): EngagementMetrics {
  const metrics = getEngagementMetrics();
  metrics.sharesCount = (metrics.sharesCount || 0) + 1;
  saveEngagementMetrics(metrics);
  return metrics;
}

export function incrementMetric(key: keyof EngagementMetrics, amount = 1): void {
  const metrics = getEngagementMetrics();
  if (typeof metrics[key] === 'number') {
    (metrics[key] as number) += amount;
    saveEngagementMetrics(metrics);
  }
}

export function clearAllLocalUserData(): void {
  localStorage.removeItem(SAVED_ARTICLES_KEY);
  localStorage.removeItem(METRICS_KEY);
  localStorage.removeItem(PREFERENCES_KEY);
}

export function exportAllUserData(): string {
  const data = {
    exportDate: new Date().toISOString(),
    source: 'R.R NEWS Privacy Vault',
    preferences: getUserPreferences(),
    savedArticles: getSavedArticles(),
    engagementMetrics: getEngagementMetrics(),
  };
  return JSON.stringify(data, null, 2);
}

// Aliases for component compatibility
export const recordShare = recordSocialShare;
export const clearLocalData = clearAllLocalUserData;
export const exportLocalDataAsJSON = exportAllUserData;
