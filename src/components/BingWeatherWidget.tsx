import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Droplets,
  Wind,
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  MapPin,
  RefreshCw,
  Search,
  Navigation,
} from 'lucide-react';
import {
  fetchLiveOpenMeteoWeather,
  searchOpenMeteoLocations,
  OpenMeteoWeatherData,
  GeocodingResult,
} from '../services/openMeteoService.ts';

interface BingWeatherWidgetProps {
  countryCode?: string;
  isCompact?: boolean;
}

export const BingWeatherWidget: React.FC<BingWeatherWidgetProps> = ({
  countryCode = 'global',
  isCompact = false,
}) => {
  const [weather, setWeather] = useState<OpenMeteoWeatherData | null>(null);
  const [isCelsius, setIsCelsius] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);

  const loadWeather = async (cityOrCode?: string, lat?: number, lon?: number, force = false) => {
    setIsLoading(true);
    try {
      const data = await fetchLiveOpenMeteoWeather({
        cityOrCountry: cityOrCode || countryCode,
        lat,
        lon,
        forceRefresh: force,
      });
      setWeather(data);
    } catch (err) {
      console.error('Failed to load Open-Meteo weather:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(countryCode);
  }, [countryCode]);

  const handleGeolocate = () => {
    if ('geolocation' in navigator) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          loadWeather(undefined, pos.coords.latitude, pos.coords.longitude, true);
        },
        () => {
          loadWeather(countryCode, undefined, undefined, true);
        },
        { timeout: 8000 }
      );
    }
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length >= 2) {
      const results = await searchOpenMeteoLocations(val);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectLocation = (loc: GeocodingResult) => {
    loadWeather(loc.name, loc.latitude, loc.longitude, true);
    setShowSearchInput(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleCitySearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      loadWeather(searchQuery.trim(), undefined, undefined, true);
      setShowSearchInput(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const displayTemp = (c: number) => {
    if (isCelsius) return `${c}°C`;
    return `${Math.round((c * 9) / 5 + 32)}°F`;
  };

  const renderWeatherIcon = (iconType: string, className = 'w-5 h-5') => {
    switch (iconType) {
      case 'sun':
        return <Sun className={`${className} text-amber-400`} />;
      case 'rain':
        return <CloudRain className={`${className} text-cyan-400`} />;
      case 'snow':
        return <CloudSnow className={`${className} text-sky-300`} />;
      case 'storm':
        return <CloudLightning className={`${className} text-amber-400`} />;
      case 'fog':
        return <CloudFog className={`${className} text-slate-400`} />;
      case 'cloud':
      default:
        return <CloudSun className={`${className} text-amber-300`} />;
    }
  };

  // Compact inline readout for the top utility masthead
  if (isCompact) {
    const currentTemp = weather ? weather.temp : 22;
    const currentCity = weather ? weather.city : 'Global';
    return (
      <button
        type="button"
        onClick={() => loadWeather(weather?.city || countryCode, undefined, undefined, true)}
        className="flex items-center gap-1.5 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
        title={`Open-Meteo: ${weather?.condition || 'Weather'} · Click to refresh`}
      >
        <CloudSun className={`w-3.5 h-3.5 text-amber-400 shrink-0 ${isLoading ? 'animate-spin' : ''}`} />
        <span className="font-medium text-slate-300 truncate max-w-[90px]">{currentCity}</span>
        <span className="font-mono tabular-nums font-bold text-white">{displayTemp(currentTemp)}</span>
      </button>
    );
  }

  return (
    <div className="rounded-xl p-4 sm:p-5 border border-white/10 bg-[#121826] text-white">
      {/* Desk Kicker & Controls */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 gap-2">
        {showSearchInput ? (
          <div className="w-full relative">
            <form onSubmit={handleCitySearchSubmit} className="flex items-center gap-1.5 w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Enter city (e.g., London, Tokyo)..."
                autoFocus
                className="w-full px-2.5 py-1 rounded-md text-xs bg-[#0c101b] border border-white/15 text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-cyan-600 text-white hover:bg-cyan-500 cursor-pointer shrink-0"
              >
                Find
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSearchInput(false);
                  setSearchResults([]);
                }}
                className="text-xs text-slate-400 hover:text-white shrink-0 px-1 cursor-pointer"
              >
                ✕
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 z-30 bg-[#0c101b] rounded-lg shadow-2xl border border-white/15 max-h-48 overflow-y-auto divide-y divide-white/10 text-xs">
                {searchResults.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => handleSelectLocation(loc)}
                    className="w-full text-left px-3 py-2 hover:bg-white/8 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="font-medium text-white">
                      {loc.name}
                      {loc.admin1 ? `, ${loc.admin1}` : ''}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{loc.country}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="min-w-0">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Meteorological Desk
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate font-bold text-white text-sm">
                  {weather?.city || 'Global Weather'}
                </span>
                {weather?.country && (
                  <span className="text-slate-400 text-xs truncate hidden sm:inline">
                    · {weather.country}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setShowSearchInput(true)}
                className="p-1.5 text-slate-300 hover:text-white rounded-md hover:bg-white/8 transition-colors cursor-pointer"
                title="Search City"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleGeolocate}
                className="p-1.5 text-slate-300 hover:text-cyan-400 rounded-md hover:bg-white/8 transition-colors cursor-pointer"
                title="Use Local Coordinates"
              >
                <Navigation className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => loadWeather(weather?.city || countryCode, undefined, undefined, true)}
                className="p-1.5 text-slate-300 hover:text-white rounded-md hover:bg-white/8 transition-colors cursor-pointer"
                title="Refresh Telemetry"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => setIsCelsius(!isCelsius)}
                className="font-mono text-[11px] font-bold text-slate-200 hover:text-white px-2 py-0.5 rounded bg-[#182033] border border-white/10 transition-colors cursor-pointer"
                title="Toggle Celsius / Fahrenheit"
              >
                {isCelsius ? '°C' : '°F'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Primary Temperature Readout */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="p-2.5 rounded-lg bg-[#172033] border border-white/8 text-amber-400 shrink-0">
            {renderWeatherIcon(weather?.forecast?.[0]?.icon || 'sun', 'w-7 h-7')}
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2.5">
              <span className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none">
                {displayTemp(weather?.temp ?? 22)}
              </span>
              <span className="text-xs text-slate-400">
                Feels {displayTemp(weather?.apparentTemp ?? weather?.temp ?? 22)}
              </span>
            </div>
            <div className="text-xs font-medium text-slate-200 mt-1 truncate">
              {weather?.condition || 'Clear Sky'} ·{' '}
              <span className="font-mono tabular-nums text-slate-300">
                H:{displayTemp(weather?.high ?? 25)} L:{displayTemp(weather?.low ?? 18)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Atmospheric Telemetry Row */}
      <div className="grid grid-cols-3 gap-2 py-2.5 border-b border-white/10 text-[11px] text-slate-300">
        <div className="flex items-center gap-1.5" title="Relative Humidity">
          <Droplets className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate font-mono tabular-nums">{weather?.humidity ?? 55}% RH</span>
        </div>
        <div className="flex items-center gap-1.5" title="Wind Speed">
          <Wind className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate font-mono tabular-nums">{weather?.windSpeed ?? 12} km/h</span>
        </div>
        <div className="flex items-center gap-1.5" title={`Air Quality: ${weather?.aqiLevel || 'Good'}`}>
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              (weather?.aqi ?? 32) <= 50
                ? 'bg-emerald-400'
                : (weather?.aqi ?? 32) <= 100
                ? 'bg-amber-400'
                : 'bg-rose-500'
            }`}
          />
          <span className="truncate font-mono tabular-nums">AQI {weather?.aqi ?? 32}</span>
        </div>
      </div>

      {/* 5-Day Forecast Strip */}
      <div className="pt-3">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase text-slate-400 tracking-wider mb-2">
          <span>5-Day Forecast</span>
          <span>Open-Meteo</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 text-center">
          {(weather?.forecast || []).map((f, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg bg-[#0e1320] border border-white/6"
            >
              <span className="font-mono text-[10px] font-semibold text-slate-300 uppercase">
                {f.day}
              </span>
              <div className="my-0.5">{renderWeatherIcon(f.icon, 'w-4 h-4')}</div>
              <span className="font-mono tabular-nums text-xs font-bold text-white">
                {displayTemp(f.tempMax)}
              </span>
              <span className="font-mono tabular-nums text-[10px] text-slate-400">
                {displayTemp(f.tempMin)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Bureaus (Unboxed Text Links) */}
      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 text-[11px]">
        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 shrink-0">
          Bureaus:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {['New Delhi', 'London', 'New York', 'Tokyo', 'Paris'].map((c, idx) => (
            <React.Fragment key={c}>
              {idx > 0 && <span className="text-slate-600">·</span>}
              <button
                type="button"
                onClick={() => loadWeather(c, undefined, undefined, true)}
                className="text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer whitespace-nowrap text-[11px] font-medium"
              >
                {c}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
