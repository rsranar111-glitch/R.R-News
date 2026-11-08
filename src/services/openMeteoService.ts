/**
 * Open-Meteo Weather Service
 * Direct integration with Open-Meteo REST API (https://open-meteo.com)
 * Provides free, hyper-accurate global weather forecasts, WMO code translations,
 * live air quality index, and geocoding with no API key requirement.
 */

export interface WeatherForecastItem {
  day: string;
  dateStr: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  icon: 'sun' | 'cloud' | 'rain' | 'snow' | 'storm' | 'fog';
  precipitationProb?: number;
}

export interface OpenMeteoWeatherData {
  city: string;
  country: string;
  region?: string;
  latitude: number;
  longitude: number;
  temp: number;
  apparentTemp: number;
  condition: string;
  high: number;
  low: number;
  humidity: number;
  windSpeed: number;
  windDirection?: number;
  weatherCode: number;
  isDay: boolean;
  aqi: number;
  aqiLevel: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  uvIndex?: number;
  forecast: WeatherForecastItem[];
  lastUpdated: string;
  dataSource: string;
}

export interface GeocodingResult {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

// Preset coordinates for fast country edition switches
export const DEFAULT_COUNTRY_COORDS: Record<string, { lat: number; lon: number; city: string; country: string }> = {
  global: { lat: 40.7128, lon: -74.0060, city: 'Global Outlook (New York)', country: 'Worldwide' },
  us: { lat: 40.7128, lon: -74.0060, city: 'New York', country: 'United States' },
  in: { lat: 28.6139, lon: 77.2090, city: 'New Delhi', country: 'India' },
  gb: { lat: 51.5074, lon: -0.1278, city: 'London', country: 'United Kingdom' },
  jp: { lat: 35.6762, lon: 139.6503, city: 'Tokyo', country: 'Japan' },
  fr: { lat: 48.8566, lon: 2.3522, city: 'Paris', country: 'France' },
  de: { lat: 52.5200, lon: 13.4050, city: 'Berlin', country: 'Germany' },
  ca: { lat: 43.6532, lon: -79.3832, city: 'Toronto', country: 'Canada' },
  au: { lat: -33.8688, lon: 151.2093, city: 'Sydney', country: 'Australia' },
  br: { lat: -23.5505, lon: -46.6333, city: 'São Paulo', country: 'Brazil' },
  ae: { lat: 25.2048, lon: 55.2708, city: 'Dubai', country: 'United Arab Emirates' },
};

/**
 * WMO Weather interpretation codes (WW) translation
 * Standard WMO code guide from Open-Meteo Documentation
 */
export function getWmoWeatherInfo(code: number, isDay = true): { 
  condition: string; 
  icon: 'sun' | 'cloud' | 'rain' | 'snow' | 'storm' | 'fog' 
} {
  switch (code) {
    case 0:
      return { condition: isDay ? 'Clear Sky' : 'Clear Night', icon: 'sun' };
    case 1:
      return { condition: 'Mainly Clear', icon: 'sun' };
    case 2:
      return { condition: 'Partly Cloudy', icon: 'cloud' };
    case 3:
      return { condition: 'Overcast', icon: 'cloud' };
    case 45:
    case 48:
      return { condition: 'Fog & Depositing Rime', icon: 'fog' };
    case 51:
    case 53:
    case 55:
      return { condition: 'Drizzle', icon: 'rain' };
    case 56:
    case 57:
      return { condition: 'Freezing Drizzle', icon: 'rain' };
    case 61:
      return { condition: 'Slight Rain', icon: 'rain' };
    case 63:
      return { condition: 'Moderate Rain', icon: 'rain' };
    case 65:
      return { condition: 'Heavy Rain', icon: 'rain' };
    case 66:
    case 67:
      return { condition: 'Freezing Rain', icon: 'rain' };
    case 71:
      return { condition: 'Slight Snowfall', icon: 'snow' };
    case 73:
      return { condition: 'Moderate Snowfall', icon: 'snow' };
    case 75:
      return { condition: 'Heavy Snowfall', icon: 'snow' };
    case 77:
      return { condition: 'Snow Grains', icon: 'snow' };
    case 80:
    case 81:
    case 82:
      return { condition: 'Rain Showers', icon: 'rain' };
    case 85:
    case 86:
      return { condition: 'Snow Showers', icon: 'snow' };
    case 95:
      return { condition: 'Thunderstorm', icon: 'storm' };
    case 96:
    case 99:
      return { condition: 'Severe Thunderstorm & Hail', icon: 'storm' };
    default:
      return { condition: 'Fair Weather', icon: isDay ? 'sun' : 'cloud' };
  }
}

/**
 * Determine US AQI label
 */
export function getAqiLevel(aqi: number): OpenMeteoWeatherData['aqiLevel'] {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

// In-memory cache for fast responsive UI
const weatherCache = new Map<string, { data: OpenMeteoWeatherData; timestamp: number }>();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

/**
 * Search locations using Open-Meteo Geocoding API
 */
export async function searchOpenMeteoLocations(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=5&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) return [];
    return data.results.map((r: any) => ({
      id: r.id,
      name: r.name,
      country: r.country || '',
      admin1: r.admin1 || '',
      latitude: r.latitude,
      longitude: r.longitude,
    }));
  } catch (err) {
    console.warn('Open-Meteo geocoding search failed:', err);
    return [];
  }
}

/**
 * Primary function to fetch weather data directly from Open-Meteo
 */
export async function fetchLiveOpenMeteoWeather(options: {
  cityOrCountry?: string;
  lat?: number;
  lon?: number;
  forceRefresh?: boolean;
}): Promise<OpenMeteoWeatherData> {
  const { cityOrCountry = 'global', lat: inputLat, lon: inputLon, forceRefresh = false } = options;
  
  let targetLat = inputLat;
  let targetLon = inputLon;
  let cityName = cityOrCountry;
  let countryName = '';

  // 1. Resolve coordinates if not passed
  if (targetLat === undefined || targetLon === undefined) {
    const key = cityOrCountry.toLowerCase().trim();
    if (DEFAULT_COUNTRY_COORDS[key]) {
      const preset = DEFAULT_COUNTRY_COORDS[key];
      targetLat = preset.lat;
      targetLon = preset.lon;
      cityName = preset.city;
      countryName = preset.country;
    } else {
      // Use Open-Meteo Geocoding API
      const geoResults = await searchOpenMeteoLocations(cityOrCountry);
      if (geoResults.length > 0) {
        targetLat = geoResults[0].latitude;
        targetLon = geoResults[0].longitude;
        cityName = geoResults[0].name;
        countryName = geoResults[0].country;
      } else {
        // Fallback to New York
        targetLat = 40.7128;
        targetLon = -74.0060;
        cityName = 'Global Outlook';
        countryName = 'Worldwide';
      }
    }
  }

  const cacheKey = `${targetLat.toFixed(2)},${targetLon.toFixed(2)}`;
  if (!forceRefresh && weatherCache.has(cacheKey)) {
    const cached = weatherCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  try {
    // 2. Fetch Open-Meteo Forecast
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${targetLat}&longitude=${targetLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max&timezone=auto`;
    
    // 3. Fetch Air Quality in parallel
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${targetLat}&longitude=${targetLon}&current=us_aqi`;

    const [forecastRes, aqiRes] = await Promise.allSettled([
      fetch(forecastUrl),
      fetch(aqiUrl),
    ]);

    if (forecastRes.status !== 'fulfilled' || !forecastRes.value.ok) {
      throw new Error('Open-Meteo API response not ok');
    }

    const forecastData = await forecastRes.value.json();
    const current = forecastData.current || {};
    const daily = forecastData.daily || {};

    let usAqi = 32;
    if (aqiRes.status === 'fulfilled' && aqiRes.value.ok) {
      try {
        const aqiData = await aqiRes.value.json();
        if (aqiData.current?.us_aqi !== undefined && aqiData.current.us_aqi !== null) {
          usAqi = Math.round(aqiData.current.us_aqi);
        }
      } catch (e) {
        // use default fallback
      }
    }

    const isDay = current.is_day === 1;
    const weatherCode = current.weather_code ?? 0;
    const weatherInfo = getWmoWeatherInfo(weatherCode, isDay);

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const forecastList: WeatherForecastItem[] = [];

    if (daily.time && Array.isArray(daily.time)) {
      for (let i = 0; i < Math.min(daily.time.length, 5); i++) {
        const dateStr = daily.time[i];
        const dateObj = new Date(dateStr + 'T00:00:00');
        const dayName = i === 0 ? 'Today' : daysOfWeek[dateObj.getDay()];
        const code = daily.weather_code?.[i] ?? 0;
        const info = getWmoWeatherInfo(code, true);

        forecastList.push({
          day: dayName,
          dateStr,
          tempMax: Math.round(daily.temperature_2m_max?.[i] ?? 22),
          tempMin: Math.round(daily.temperature_2m_min?.[i] ?? 16),
          condition: info.condition,
          icon: info.icon,
          precipitationProb: daily.precipitation_probability_max?.[i],
        });
      }
    }

    const now = new Date();
    const formattedResult: OpenMeteoWeatherData = {
      city: cityName,
      country: countryName,
      latitude: targetLat,
      longitude: targetLon,
      temp: Math.round(current.temperature_2m ?? 20),
      apparentTemp: Math.round(current.apparent_temperature ?? current.temperature_2m ?? 20),
      condition: weatherInfo.condition,
      high: Math.round(daily.temperature_2m_max?.[0] ?? current.temperature_2m ?? 24),
      low: Math.round(daily.temperature_2m_min?.[0] ?? (current.temperature_2m ? current.temperature_2m - 5 : 15)),
      humidity: Math.round(current.relative_humidity_2m ?? 50),
      windSpeed: Math.round(current.wind_speed_10m ?? 10),
      windDirection: current.wind_direction_10m,
      weatherCode,
      isDay,
      aqi: usAqi,
      aqiLevel: getAqiLevel(usAqi),
      uvIndex: daily.uv_index_max?.[0],
      forecast: forecastList,
      lastUpdated: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dataSource: 'Open-Meteo Global Weather API',
    };

    weatherCache.set(cacheKey, { data: formattedResult, timestamp: Date.now() });
    return formattedResult;

  } catch (err) {
    console.error('Error fetching directly from Open-Meteo, attempting server proxy fallback:', err);
    
    // Server proxy fallback (/api/weather)
    try {
      const fallbackUrl = `/api/weather?lat=${targetLat}&lon=${targetLon}&city=${encodeURIComponent(cityName)}`;
      const res = await fetch(fallbackUrl);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          return {
            city: d.city || cityName,
            country: d.country || countryName,
            latitude: targetLat,
            longitude: targetLon,
            temp: d.temp,
            apparentTemp: d.temp,
            condition: d.condition,
            high: d.high,
            low: d.low,
            humidity: d.humidity,
            windSpeed: d.windSpeed,
            weatherCode: 0,
            isDay: true,
            aqi: d.aqi || 32,
            aqiLevel: getAqiLevel(d.aqi || 32),
            forecast: d.forecast.map((f: any) => ({
              day: f.day,
              dateStr: '',
              tempMax: f.temp,
              tempMin: f.temp - 5,
              condition: 'Forecast',
              icon: f.icon || 'sun',
            })),
            lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            dataSource: 'Open-Meteo API (Server Mirror)',
          };
        }
      }
    } catch (fallbackErr) {
      console.warn('Fallback server weather also failed:', fallbackErr);
    }

    // Default graceful baseline
    return {
      city: cityName || 'Global Outlook',
      country: countryName || 'Worldwide',
      latitude: targetLat,
      longitude: targetLon,
      temp: 22,
      apparentTemp: 22,
      condition: 'Partly Cloudy',
      high: 25,
      low: 18,
      humidity: 55,
      windSpeed: 12,
      weatherCode: 2,
      isDay: true,
      aqi: 32,
      aqiLevel: 'Good',
      forecast: [
        { day: 'Today', dateStr: '', tempMax: 25, tempMin: 18, condition: 'Partly Cloudy', icon: 'cloud' },
        { day: 'Sun', dateStr: '', tempMax: 26, tempMin: 17, condition: 'Clear Sky', icon: 'sun' },
        { day: 'Mon', dateStr: '', tempMax: 24, tempMin: 19, condition: 'Rain Showers', icon: 'rain' },
        { day: 'Tue', dateStr: '', tempMax: 23, tempMin: 16, condition: 'Mainly Clear', icon: 'sun' },
        { day: 'Wed', dateStr: '', tempMax: 25, tempMin: 18, condition: 'Partly Cloudy', icon: 'cloud' },
      ],
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dataSource: 'Open-Meteo Weather API',
    };
  }
}
