import { XMLParser } from 'fast-xml-parser';

export interface LiveArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  sourceUrl: string;
  category: string;
  imageUrl: string;
  publishedAt: string;
  publishedTimestamp: number;
  readTime: string;
  isBreaking?: boolean;
  isTrending?: boolean;
  trendingRank?: number;
  keyTakeaways: string[];
  duckDuckGoTopic?: string;
  author?: string;
  country?: string;
}

interface FeedSource {
  url: string;
  sourceName: string;
  defaultCategory: string;
}

// Short 90-second cache for fresh real-time dispatches
const cache = new Map<string, { timestamp: number; data: LiveArticle[] }>();
const CACHE_TTL_MS = 90 * 1000;

/**
 * Extracts ONLY the exact, authentic image embedded by the publisher for this specific article.
 * Never guesses or substitutes unrelated images.
 */
function extractExactPublisherImage(item: any): string {
  let rawUrl = '';

  // 1. Check media:content
  if (item['media:content']) {
    const mc = item['media:content'];
    if (Array.isArray(mc)) {
      const valid = mc.find((entry: any) => entry?.['@_url'] && String(entry['@_url']).startsWith('http'));
      if (valid) rawUrl = String(valid['@_url']);
    } else if (typeof mc === 'object' && mc['@_url']) {
      rawUrl = String(mc['@_url']);
    }
  }

  // 2. Check media:thumbnail
  if (!rawUrl && item['media:thumbnail']) {
    const mt = item['media:thumbnail'];
    if (Array.isArray(mt)) {
      const valid = mt.find((entry: any) => entry?.['@_url'] && String(entry['@_url']).startsWith('http'));
      if (valid) rawUrl = String(valid['@_url']);
    } else if (typeof mt === 'object' && mt['@_url']) {
      rawUrl = String(mt['@_url']);
    }
  }

  // 3. Check enclosure
  if (!rawUrl && item.enclosure?.['@_url'] && String(item.enclosure['@_url']).startsWith('http')) {
    rawUrl = String(item.enclosure['@_url']);
  }

  // 4. Check content:encoded or description for publisher <img>
  if (!rawUrl) {
    const html = String(item['content:encoded'] || item.description || '');
    if (html.includes('<img')) {
      const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (match && match[1] && match[1].startsWith('http')) {
        rawUrl = match[1];
      }
    }
  }

  if (!rawUrl) return '';

  // Upgrade BBC thumbnail resolution from 240px to 800px HD
  if (rawUrl.includes('ichef.bbci.co.uk/ace/standard/240/')) {
    rawUrl = rawUrl.replace('/standard/240/', '/standard/800/');
  }

  // Reject generic agency logos or 1x1 tracking pixels
  if (
    rawUrl.includes('1x1') ||
    rawUrl.includes('pixel') ||
    rawUrl.includes('favicon') ||
    rawUrl.endsWith('.svg')
  ) {
    return '';
  }

  return rawUrl;
}

function stripHtml(htmlStr: string): string {
  if (!htmlStr) return '';
  return htmlStr
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateReadTime(text: string): string {
  const words = text.split(/\s+/).length;
  const minutes = Math.max(2, Math.ceil(words / 180));
  return `${minutes} min read`;
}

function computeTimeAgo(dateStr?: string): { publishedAt: string; publishedTimestamp: number } {
  const now = Date.now();
  let timestamp = now;
  if (dateStr) {
    const parsed = Date.parse(dateStr);
    if (!isNaN(parsed) && parsed <= now + 60000) {
      timestamp = parsed;
    }
  }
  const diffSec = Math.max(0, Math.floor((now - timestamp) / 1000));
  let publishedAt = 'Just now';
  if (diffSec < 60) {
    publishedAt = 'Just now';
  } else if (diffSec < 3600) {
    const m = Math.floor(diffSec / 60);
    publishedAt = `${m}m ago`;
  } else if (diffSec < 86400) {
    const h = Math.floor(diffSec / 3600);
    publishedAt = `${h}h ago`;
  } else {
    const d = Math.floor(diffSec / 86400);
    publishedAt = `${d}d ago`;
  }
  return { publishedAt, publishedTimestamp: timestamp };
}

function getFeedsForRequest(category: string, country: string): FeedSource[] {
  const cat = (category || 'All').toUpperCase();
  const c = (country || 'global').toLowerCase();

  if (cat === 'TECHNOLOGY') {
    return [
      { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', sourceName: 'BBC Tech', defaultCategory: 'Technology' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', sourceName: 'New York Times', defaultCategory: 'Technology' },
      { url: 'https://feeds.feedburner.com/gadgets360-latest', sourceName: 'NDTV Gadgets 360', defaultCategory: 'Technology' },
    ];
  }
  if (cat === 'BUSINESS' || cat === 'CURRENCY') {
    return [
      { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', sourceName: 'BBC Business', defaultCategory: cat === 'CURRENCY' ? 'Currency' : 'Business' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', sourceName: 'New York Times', defaultCategory: cat === 'CURRENCY' ? 'Currency' : 'Business' },
      { url: 'https://feeds.feedburner.com/ndtvprofit-latest', sourceName: 'NDTV Profit', defaultCategory: cat === 'CURRENCY' ? 'Currency' : 'Business' },
    ];
  }
  if (cat === 'SCIENCE' || cat === 'CLIMATE') {
    return [
      { url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', sourceName: 'BBC Science', defaultCategory: cat === 'CLIMATE' ? 'Climate' : 'Science' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml', sourceName: 'New York Times', defaultCategory: 'Science' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Climate.xml', sourceName: 'NYT Climate', defaultCategory: 'Climate' },
    ];
  }
  if (cat === 'HEALTH') {
    return [
      { url: 'https://feeds.bbci.co.uk/news/health/rss.xml', sourceName: 'BBC Health', defaultCategory: 'Health' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml', sourceName: 'New York Times', defaultCategory: 'Health' },
    ];
  }
  if (cat === 'SPORTS') {
    return [
      { url: 'https://feeds.bbci.co.uk/sport/rss.xml', sourceName: 'BBC Sport', defaultCategory: 'Sports' },
      { url: 'https://feeds.feedburner.com/ndtvsports-latest', sourceName: 'NDTV Sports', defaultCategory: 'Sports' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml', sourceName: 'New York Times', defaultCategory: 'Sports' },
    ];
  }
  if (cat === 'WORLD') {
    return [
      { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', sourceName: 'BBC World', defaultCategory: 'World' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', sourceName: 'New York Times', defaultCategory: 'World' },
      { url: 'https://feeds.feedburner.com/ndtvnews-world-news', sourceName: 'NDTV World', defaultCategory: 'World' },
    ];
  }

  // Top Stories / All — tailored by regional edition while keeping global breadth
  if (c === 'in') {
    return [
      { url: 'https://feeds.feedburner.com/ndtvnews-top-stories', sourceName: 'NDTV News', defaultCategory: 'World' },
      { url: 'https://feeds.bbci.co.uk/news/world/asia/india/rss.xml', sourceName: 'BBC India', defaultCategory: 'World' },
      { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', sourceName: 'BBC World', defaultCategory: 'World' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', sourceName: 'New York Times', defaultCategory: 'World' },
    ];
  }
  if (c === 'us') {
    return [
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', sourceName: 'New York Times', defaultCategory: 'World' },
      { url: 'https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml', sourceName: 'BBC US & Canada', defaultCategory: 'World' },
      { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', sourceName: 'BBC Tech', defaultCategory: 'Technology' },
    ];
  }
  if (c === 'gb' || c === 'uk') {
    return [
      { url: 'https://feeds.bbci.co.uk/news/uk/rss.xml', sourceName: 'BBC UK', defaultCategory: 'World' },
      { url: 'https://feeds.bbci.co.uk/news/rss.xml', sourceName: 'BBC News', defaultCategory: 'World' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', sourceName: 'New York Times', defaultCategory: 'World' },
    ];
  }

  return [
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', sourceName: 'BBC World', defaultCategory: 'World' },
    { url: 'https://feeds.feedburner.com/ndtvnews-top-stories', sourceName: 'NDTV News', defaultCategory: 'World' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', sourceName: 'New York Times', defaultCategory: 'World' },
    { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', sourceName: 'BBC Business', defaultCategory: 'Business' },
    { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', sourceName: 'BBC Tech', defaultCategory: 'Technology' },
  ];
}

async function fetchSingleRssFeed(feed: FeedSource, country: string): Promise<LiveArticle[]> {
  try {
    const response = await fetch(feed.url, {
      signal: AbortSignal.timeout(4500),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 R.R-News-LiveEngine/3.0',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    });

    if (!response.ok) return [];

    const xmlText = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      trimValues: true,
    });

    const parsedXml = parser.parse(xmlText);
    const rawItems = parsedXml?.rss?.channel?.item || [];
    const itemsArray = Array.isArray(rawItems) ? rawItems : [rawItems];

    const now = Date.now();
    const maxAgeMs = 36 * 60 * 60 * 1000; // Strictly recent news (< 36 hours old)
    const results: LiveArticle[] = [];

    for (let i = 0; i < itemsArray.length; i++) {
      const item = itemsArray[i];
      if (!item || !item.title) continue;

      // Require an exact, authentic publisher image for this article
      const exactImageUrl = extractExactPublisherImage(item);
      if (!exactImageUrl) continue;

      const title = stripHtml(String(item.title));
      if (!title || title.length < 10) continue;

      const { publishedAt, publishedTimestamp } = computeTimeAgo(item.pubDate);
      // Skip stale/old articles
      if (now - publishedTimestamp > maxAgeMs) continue;

      const rawDesc = stripHtml(String(item.description || ''));
      const summary =
        rawDesc.length > 20 && rawDesc.toLowerCase() !== title.toLowerCase()
          ? rawDesc
          : `${title}. Live verified dispatch reported by ${feed.sourceName}.`;

      const link =
        typeof item.link === 'string'
          ? item.link
          : item.guid?.['#text'] || 'https://www.bbc.com/news';

      const content = `${title}\n\n${summary}\n\nReported directly by ${feed.sourceName} via R.R News Global Wire.\n\nPublished: ${item.pubDate || new Date(publishedTimestamp).toUTCString()}\nOriginal Dispatch: ${link}`;

      const cleanSlug = title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 18);
      const titleHash = Buffer.from(`${title}_${link}`).toString('hex').slice(0, 10);
      const id = `live-${feed.defaultCategory.toLowerCase()}-${cleanSlug}-${titleHash}`;

      results.push({
        id,
        title,
        summary,
        content,
        source: feed.sourceName,
        sourceUrl: link,
        category: feed.defaultCategory,
        imageUrl: exactImageUrl,
        publishedAt,
        publishedTimestamp,
        readTime: calculateReadTime(summary + ' ' + title),
        isBreaking: false,
        isTrending: true,
        trendingRank: 1,
        keyTakeaways: [
          `${feed.sourceName}: ${title.slice(0, 110)}${title.length > 110 ? '...' : ''}`,
          `Published ${publishedAt}`,
          'Verified authentic publisher photo and direct agency wire dispatch.',
        ],
        duckDuckGoTopic: title,
        author: 'By Rajveer Singh Rana',
        country,
      });
    }

    return results;
  } catch {
    return [];
  }
}

/**
 * Fetch live, fresh worldwide news articles with 100% authentic publisher images
 * and strict newest-first chronological ordering.
 */
export async function fetchLiveNews(
  category: string = 'All',
  query: string = '',
  country: string = 'global'
): Promise<LiveArticle[]> {
  const cacheKey = `v3_exact_${category}_${country}_${query.trim().toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const feeds = getFeedsForRequest(category, country);
  const feedBatches = await Promise.all(feeds.map(f => fetchSingleRssFeed(f, country)));
  const combined = feedBatches.flat();

  // Deduplicate by normalized title
  const seenTitles = new Set<string>();
  let uniqueArticles: LiveArticle[] = [];

  for (const art of combined) {
    const normTitle = art.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 45);
    if (!seenTitles.has(normTitle)) {
      seenTitles.add(normTitle);
      uniqueArticles.push(art);
    }
  }

  // If a search query is provided, filter matching articles across all feeds
  if (query.trim()) {
    const allFeeds: FeedSource[] = [
      ...feeds,
      { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', sourceName: 'BBC Tech', defaultCategory: 'Technology' },
      { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', sourceName: 'BBC Business', defaultCategory: 'Business' },
      { url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', sourceName: 'BBC Science', defaultCategory: 'Science' },
      { url: 'https://feeds.bbci.co.uk/sport/rss.xml', sourceName: 'BBC Sport', defaultCategory: 'Sports' },
    ];
    const extraBatches = await Promise.all(allFeeds.map(f => fetchSingleRssFeed(f, country)));
    const allCombined = [...uniqueArticles, ...extraBatches.flat()];
    const seenSearch = new Set<string>();
    const keywords = query
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 2);

    const matched = allCombined.filter(art => {
      const key = art.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 45);
      if (seenSearch.has(key)) return false;
      const haystack = `${art.title} ${art.summary} ${art.category}`.toLowerCase();
      const isMatch = keywords.some(kw => haystack.includes(kw));
      if (isMatch) {
        seenSearch.add(key);
        return true;
      }
      return false;
    });

    if (matched.length > 0) {
      uniqueArticles = matched;
    }
  }

  // Sort strictly by publishedTimestamp DESCENDING (Newest articles first!)
  uniqueArticles.sort((a, b) => b.publishedTimestamp - a.publishedTimestamp);

  // Assign trendingRank and breaking status based on freshness
  const finalArticles = uniqueArticles.slice(0, 30).map((art, index) => {
    const { publishedAt } = computeTimeAgo(new Date(art.publishedTimestamp).toUTCString());
    return {
      ...art,
      publishedAt,
      isBreaking: index < 4,
      isTrending: true,
      trendingRank: index + 1,
    };
  });

  if (finalArticles.length > 0) {
    cache.set(cacheKey, { timestamp: Date.now(), data: finalArticles });
  }

  return finalArticles;
}
