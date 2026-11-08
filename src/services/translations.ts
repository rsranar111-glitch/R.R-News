import { Article, NewsCategory, SupportedLanguage } from '../types/news.ts';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  native: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
];

export const CATEGORY_TRANSLATIONS: Record<SupportedLanguage, Record<NewsCategory, string>> = {
  en: {
    'All': 'All',
    'Top Stories': 'Top Stories',
    'Technology': 'Technology',
    'Business': 'Business',
    'Currency': 'Currency',
    'Sports': 'Sports',
    'World': 'World',
    'Science': 'Science',
    'Climate': 'Climate',
    'Politics': 'Politics',
    'Culture': 'Culture',
    'Health': 'Health',
  },
  es: {
    'All': 'Todos',
    'Top Stories': 'Destacados',
    'Technology': 'Tecnología',
    'Business': 'Negocios',
    'Currency': 'Divisas',
    'Sports': 'Deportes',
    'World': 'Mundo',
    'Science': 'Ciencia',
    'Climate': 'Clima',
    'Politics': 'Política',
    'Culture': 'Cultura',
    'Health': 'Salud',
  },
  hi: {
    'All': 'सभी',
    'Top Stories': 'मुख्य समाचार',
    'Technology': 'प्रौद्योगिकी',
    'Business': 'व्यापार',
    'Currency': 'मुद्रा',
    'Sports': 'खेल',
    'World': 'विश्व',
    'Science': 'विज्ञान',
    'Climate': 'पर्यावरण',
    'Politics': 'राजनीति',
    'Culture': 'संस्कृति',
    'Health': 'स्वास्थ्य',
  },
  fr: {
    'All': 'Tous',
    'Top Stories': 'À la Une',
    'Technology': 'Technologie',
    'Business': 'Économie',
    'Currency': 'Devises',
    'Sports': 'Sports',
    'World': 'Monde',
    'Science': 'Sciences',
    'Climate': 'Climat',
    'Politics': 'Politique',
    'Culture': 'Culture',
    'Health': 'Santé',
  },
  de: {
    'All': 'Alle',
    'Top Stories': 'Top-Themen',
    'Technology': 'Technologie',
    'Business': 'Wirtschaft',
    'Currency': 'Währungen',
    'Sports': 'Sport',
    'World': 'Welt',
    'Science': 'Wissenschaft',
    'Climate': 'Klima',
    'Politics': 'Politik',
    'Culture': 'Kultur',
    'Health': 'Gesundheit',
  },
  ja: {
    'All': 'すべて',
    'Top Stories': '主要ニュース',
    'Technology': 'テクノロジー',
    'Business': 'ビジネス',
    'Currency': '為替',
    'Sports': 'スポーツ',
    'World': '国際',
    'Science': 'サイエンス',
    'Climate': '環境',
    'Politics': '政治',
    'Culture': 'カルチャー',
    'Health': '健康',
  },
  zh: {
    'All': '全部',
    'Top Stories': '头条',
    'Technology': '科技',
    'Business': '财经',
    'Currency': '外汇',
    'Sports': '体育',
    'World': '国际',
    'Science': '科学',
    'Climate': '环境',
    'Politics': '时政',
    'Culture': '文化',
    'Health': '健康',
  },
  ar: {
    'All': 'الكل',
    'Top Stories': 'أهم الأخبار',
    'Technology': 'تكنولوجيا',
    'Business': 'أعمال',
    'Currency': 'عملات',
    'Sports': 'رياضة',
    'World': 'عالمي',
    'Science': 'علوم',
    'Climate': 'مناخ',
    'Politics': 'سياسة',
    'Culture': 'ثقافة',
    'Health': 'صحة',
  }
};

export const UI_TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    headlines: 'Headlines',
    dailyBrief: 'Daily Brief',
    saved: 'Saved',
    analytics: 'Analytics',
    aiDesk: 'AI Desk',
    trending: 'Trending',
    developing: 'Developing',
    readStory: 'Read story',
    marketsFx: 'Markets & FX',
    searchPlaceholder: 'Search stories...',
    recentUpdates: 'Recent Updates',
    noAlerts: 'No alerts',
    signInWithGoogle: 'Sign in with Google',
    signOut: 'Sign Out',
    calendarSchedule: 'Calendar Schedule',
    privacySettings: 'Privacy & Data',
    newsLanguage: 'News Language',
    settings: 'Settings & Preferences',
    darkMode: 'Dark Mode',
    readingMenu: 'Reading Menu',
    quickNavigation: 'Sections',
    syncedAccount: 'Signed in via Google',
    guestUser: 'Guest Reader',
    guestDesc: 'Sign in to sync your saved stories and schedule reading slots.',
  },
  es: {
    headlines: 'Titulares',
    dailyBrief: 'Resumen Diario',
    saved: 'Guardados',
    analytics: 'Estadísticas',
    aiDesk: 'Mesa IA',
    trending: 'Tendencias',
    developing: 'En Desarrollo',
    readStory: 'Leer historia',
    marketsFx: 'Mercados y Divisas',
    searchPlaceholder: 'Buscar historias...',
    recentUpdates: 'Actualizaciones',
    noAlerts: 'Sin alertas',
    signInWithGoogle: 'Iniciar sesión con Google',
    signOut: 'Cerrar sesión',
    calendarSchedule: 'Horario en Calendario',
    privacySettings: 'Privacidad y Datos',
    newsLanguage: 'Idioma de Noticias',
    settings: 'Ajustes y Preferencias',
    darkMode: 'Modo Oscuro',
    readingMenu: 'Menú de Lectura',
    quickNavigation: 'Secciones',
    syncedAccount: 'Conectado con Google',
    guestUser: 'Lector Invitado',
    guestDesc: 'Inicia sesión para sincronizar lecturas y programar en calendario.',
  },
  hi: {
    headlines: 'मुख्य समाचार',
    dailyBrief: 'दैनिक सारांश',
    saved: 'सहेजे गए',
    analytics: 'एनालिटिक्स',
    aiDesk: 'एआई डेस्क',
    trending: 'ट्रेंडिंग',
    developing: 'ताज़ा घटनाक्रम',
    readStory: 'पूरी खबर पढ़ें',
    marketsFx: 'बाजार और मुद्रा',
    searchPlaceholder: 'समाचार खोजें...',
    recentUpdates: 'हालिया अपडेट',
    noAlerts: 'कोई सूचना नहीं',
    signInWithGoogle: 'Google से साइन इन करें',
    signOut: 'साइन आउट',
    calendarSchedule: 'कैलेंडर शेड्यूल',
    privacySettings: 'गोपनीयता और डेटा',
    newsLanguage: 'समाचार की भाषा',
    settings: 'सेटिंग्स और प्राथमिकताएं',
    darkMode: 'डार्क मोड',
    readingMenu: 'रीडिंग मेनू',
    quickNavigation: 'अनुभाग',
    syncedAccount: 'Google से जुड़ा हुआ',
    guestUser: 'अतिथि पाठक',
    guestDesc: 'अपनी सहेजी गई खबरों को सिंक करने के लिए साइन इन करें।',
  },
  fr: {
    headlines: 'La Une',
    dailyBrief: 'Briefing Quotidien',
    saved: 'Enregistrés',
    analytics: 'Statistiques',
    aiDesk: 'Bureau IA',
    trending: 'Tendances',
    developing: 'En Cours',
    readStory: 'Lire l’article',
    marketsFx: 'Marchés & Devises',
    searchPlaceholder: 'Rechercher des articles...',
    recentUpdates: 'Mises à jour',
    noAlerts: 'Aucune alerte',
    signInWithGoogle: 'Se connecter avec Google',
    signOut: 'Déconnexion',
    calendarSchedule: 'Planning Calendrier',
    privacySettings: 'Données & Confidentialité',
    newsLanguage: 'Langue des Actualités',
    settings: 'Paramètres',
    darkMode: 'Mode Sombre',
    readingMenu: 'Menu de Lecture',
    quickNavigation: 'Rubriques',
    syncedAccount: 'Connecté avec Google',
    guestUser: 'Lecteur Invité',
    guestDesc: 'Connectez-vous pour synchroniser vos articles et votre calendrier.',
  },
  de: {
    headlines: 'Schlagzeilen',
    dailyBrief: 'Tagesüberblick',
    saved: 'Gespeichert',
    analytics: 'Analysen',
    aiDesk: 'KI-Redaktion',
    trending: 'Im Trend',
    developing: 'Eilmeldung',
    readStory: 'Artikel lesen',
    marketsFx: 'Märkte & Devisen',
    searchPlaceholder: 'Nachrichten durchsuchen...',
    recentUpdates: 'Neueste Meldungen',
    noAlerts: 'Keine Benachrichtigungen',
    signInWithGoogle: 'Mit Google anmelden',
    signOut: 'Abmelden',
    calendarSchedule: 'Kalender-Termine',
    privacySettings: 'Datenschutz',
    newsLanguage: 'Nachrichtensprache',
    settings: 'Einstellungen',
    darkMode: 'Dunkelmodus',
    readingMenu: 'Lesemenü',
    quickNavigation: 'Bereiche',
    syncedAccount: 'Mit Google synchronisiert',
    guestUser: 'Gast-Leser',
    guestDesc: 'Melden Sie sich an, um Artikel zu speichern und Termine zu planen.',
  },
  ja: {
    headlines: '主要ヘッドライン',
    dailyBrief: 'デイリーブリーフィング',
    saved: '保存済み',
    analytics: '分析・統計',
    aiDesk: 'AIデスク',
    trending: '急上昇',
    developing: '速報',
    readStory: '記事を読む',
    marketsFx: '市況・為替レート',
    searchPlaceholder: '記事を検索...',
    recentUpdates: '新着通知',
    noAlerts: '通知はありません',
    signInWithGoogle: 'Googleでログイン',
    signOut: 'ログアウト',
    calendarSchedule: 'カレンダースケジュール',
    privacySettings: 'プライバシーとデータ',
    newsLanguage: 'ニュース言語',
    settings: '設定・環境設定',
    darkMode: 'ダークモード',
    readingMenu: 'メニュー',
    quickNavigation: 'カテゴリー',
    syncedAccount: 'Googleアカウント連携中',
    guestUser: 'ゲスト閲覧中',
    guestDesc: 'ログインすると保存記事の同期やカレンダー予約が可能です。',
  },
  zh: {
    headlines: '要闻头条',
    dailyBrief: '每日简报',
    saved: '已收藏',
    analytics: '阅读分析',
    aiDesk: 'AI 智库',
    trending: '热度榜',
    developing: '即时快讯',
    readStory: '阅读全文',
    marketsFx: '行情与外汇',
    searchPlaceholder: '搜索新闻报道...',
    recentUpdates: '最新提醒',
    noAlerts: '暂无新通知',
    signInWithGoogle: '通过 Google 登录',
    signOut: '退出登录',
    calendarSchedule: '日历阅读计划',
    privacySettings: '隐私与数据',
    newsLanguage: '新闻语言',
    settings: '设置与偏好',
    darkMode: '深色模式',
    readingMenu: '阅读侧边栏',
    quickNavigation: '新闻版块',
    syncedAccount: '已关联 Google 账户',
    guestUser: '访客读者',
    guestDesc: '登录即可跨端同步收藏夹并添加日历日程。',
  },
  ar: {
    headlines: 'العناوين الرئيسية',
    dailyBrief: 'الموجز اليومي',
    saved: 'المحفوظات',
    analytics: 'الإحصائيات',
    aiDesk: 'مكتب الذكاء الاصطناعي',
    trending: 'الأكثر تداولاً',
    developing: 'عاجل وتطورات',
    readStory: 'اقرأ القصة',
    marketsFx: 'الأسواق والعملات',
    searchPlaceholder: 'ابحث في الأخبار...',
    recentUpdates: 'آخر التحديثات',
    noAlerts: 'لا توجد تنبيهات',
    signInWithGoogle: 'تسجيل الدخول عبر Google',
    signOut: 'تسجيل الخروج',
    calendarSchedule: 'جدول التقويم',
    privacySettings: 'الخصوصية والبيانات',
    newsLanguage: 'لغة الأخبار',
    settings: 'الإعدادات والتفضيلات',
    darkMode: 'الوضع الليلي',
    readingMenu: 'قائمة القراءة',
    quickNavigation: 'الأقسام',
    syncedAccount: 'مسجل عبر Google',
    guestUser: 'قارئ زائر',
    guestDesc: 'سجل الدخول لمزامنة المقالات المحفوظة وجدولة فترات القراءة.',
  }
};

// In-Memory Translation Cache
const TRANSLATION_CACHE = new Map<string, string>();

/**
 * Server-backed Translation API with client fallback and in-memory caching
 */
export async function translateText(text: string, targetLang: SupportedLanguage): Promise<string> {
  if (!text || targetLang === 'en') return text;
  const cacheKey = `${targetLang}::${text.trim()}`;
  if (TRANSLATION_CACHE.has(cacheKey)) {
    return TRANSLATION_CACHE.get(cacheKey)!;
  }

  // 1. Try Server Endpoint
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.translation) {
        TRANSLATION_CACHE.set(cacheKey, data.translation);
        return data.translation;
      }
    }
  } catch (err) {
    // Silent fallback
  }

  // 2. Direct Client GTX Fallback
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const gRes = await fetch(url);
    if (gRes.ok) {
      const data = await gRes.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const joined = data[0].map((part: any) => part[0]).filter(Boolean).join('');
        if (joined) {
          TRANSLATION_CACHE.set(cacheKey, joined);
          return joined;
        }
      }
    }
  } catch (err) {
    // Silent fallback
  }

  return text;
}

/**
 * Translates a single news article asynchronously
 */
export async function translateArticleAsync(article: Article, targetLang: SupportedLanguage): Promise<Article> {
  if (targetLang === 'en' || !article) return article;

  const [title, summary] = await Promise.all([
    translateText(article.title, targetLang),
    translateText(article.summary, targetLang),
  ]);

  return {
    ...article,
    title,
    summary,
  };
}

/**
 * Translates an array of articles in parallel via single batch request
 */
export async function translateArticlesBatch(articles: Article[], targetLang: SupportedLanguage): Promise<Article[]> {
  if (targetLang === 'en' || !articles || articles.length === 0) return articles;

  const textsToTranslate: string[] = [];
  const indexMap: { articleIdx: number; field: 'title' | 'summary' }[] = [];

  articles.forEach((art, idx) => {
    const titleKey = `${targetLang}::${art.title?.trim()}`;
    const summaryKey = `${targetLang}::${art.summary?.trim()}`;

    if (!TRANSLATION_CACHE.has(titleKey) && art.title) {
      textsToTranslate.push(art.title);
      indexMap.push({ articleIdx: idx, field: 'title' });
    }
    if (!TRANSLATION_CACHE.has(summaryKey) && art.summary) {
      textsToTranslate.push(art.summary);
      indexMap.push({ articleIdx: idx, field: 'summary' });
    }
  });

  if (textsToTranslate.length > 0) {
    let successCount = 0;
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: textsToTranslate, targetLang }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.translations)) {
          data.translations.forEach((translatedStr: string, i: number) => {
            const mapInfo = indexMap[i];
            if (mapInfo) {
              const article = articles[mapInfo.articleIdx];
              const originalText = mapInfo.field === 'title' ? article.title : article.summary;
              if (originalText && translatedStr) {
                TRANSLATION_CACHE.set(`${targetLang}::${originalText.trim()}`, translatedStr);
                successCount++;
              }
            }
          });
        }
      }
    } catch (err) {
      // Silent fallback
    }

    // Fallback item by item if server batch failed
    if (successCount === 0) {
      await Promise.all(
        textsToTranslate.map(t => translateText(t, targetLang))
      );
    }
  }

  return articles.map(article => {
    const cachedTitle = TRANSLATION_CACHE.get(`${targetLang}::${article.title?.trim()}`);
    const cachedSummary = TRANSLATION_CACHE.get(`${targetLang}::${article.summary?.trim()}`);

    return {
      ...article,
      title: cachedTitle || article.title,
      summary: cachedSummary || article.summary,
    };
  });
}

/**
 * Returns localized article (cached or sync fallback)
 */
export function getLocalizedArticle(article: Article, lang: SupportedLanguage): Article {
  if (lang === 'en' || !article) return article;

  const cachedTitle = TRANSLATION_CACHE.get(`${lang}::${article.title?.trim()}`);
  const cachedSummary = TRANSLATION_CACHE.get(`${lang}::${article.summary?.trim()}`);

  if (cachedTitle || cachedSummary) {
    return {
      ...article,
      title: cachedTitle || article.title,
      summary: cachedSummary || article.summary,
    };
  }

  // Trigger background translation so UI updates dynamically
  translateArticleAsync(article, lang).catch(() => {});

  return article;
}

export function getUIText(key: string, lang: SupportedLanguage): string {
  return UI_TRANSLATIONS[lang]?.[key] || UI_TRANSLATIONS.en[key] || key;
}

export function getCategoryText(cat: NewsCategory, lang: SupportedLanguage): string {
  return CATEGORY_TRANSLATIONS[lang]?.[cat] || CATEGORY_TRANSLATIONS.en[cat] || cat;
}
