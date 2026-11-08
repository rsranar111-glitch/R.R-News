export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  sourceUrl: string;
  category: NewsCategory;
  imageUrl: string;
  publishedAt: string;
  publishedTimestamp?: number;
  readTime: string;
  isBreaking?: boolean;
  isTrending?: boolean;
  trendingRank?: number;
  keyTakeaways: string[];
  duckDuckGoTopic?: string;
  author?: string;
  country?: string; // 'global' | 'us' | 'in' | 'gb' | 'jp' | 'de' | 'fr' | etc.
}

export interface CountryOption {
  code: string;
  name: string;
  native: string;
  flag: string;
}

export type NewsCategory = 
  | 'All'
  | 'Top Stories'
  | 'Technology'
  | 'Business'
  | 'Currency'
  | 'Sports'
  | 'World'
  | 'Science'
  | 'Climate'
  | 'Politics'
  | 'Culture'
  | 'Health';

export interface SavedArticle extends Article {
  savedAt: string;
  notes?: string;
  readProgress?: number; // 0 to 100
  isRead?: boolean;
}

export interface EngagementMetrics {
  totalSecondsRead: number;
  articlesReadCount: number;
  articlesSavedCount: number;
  completionRate: number; // percentage
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  categoryCounts: Record<string, number>;
  dailyMinutes: Record<string, number>; // date -> minutes
  sharesCount: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  summary: string;
  articleId?: string;
  category: NewsCategory;
  timestamp: string;
  isRead: boolean;
  isBreaking: boolean;
}

export interface CalendarEventPayload {
  summary: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
}

export interface CalendarSyncedEvent {
  id: string;
  title: string;
  startDateTime: string;
  endDateTime: string;
  htmlLink?: string;
}

export type SupportedLanguage = 
  | 'en' // English
  | 'es' // Español
  | 'hi' // हिन्दी
  | 'fr' // Français
  | 'de' // Deutsch
  | 'ja' // 日本語
  | 'zh' // 中文
  | 'ar'; // العربية

export interface UserPreferences {
  darkMode: boolean;
  personalizedTopics: NewsCategory[];
  dailyBriefingTime: string;
  pushNotificationsEnabled: boolean;
  alertThreshold: 'all' | 'breaking_only' | 'high_priority';
  audioAlertsEnabled: boolean;
  fontScale: 'normal' | 'large';
  language: SupportedLanguage;
  country: string;
}
