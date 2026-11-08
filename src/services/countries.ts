import { CountryOption } from '../types/news.ts';

export const COUNTRIES: CountryOption[] = [
  { code: 'global', name: 'Global / World', native: 'Global Edition', flag: '🌐' },
  { code: 'in', name: 'India', native: 'भारत', flag: '🇮🇳' },
  { code: 'us', name: 'United States', native: 'United States', flag: '🇺🇸' },
  { code: 'gb', name: 'United Kingdom', native: 'United Kingdom', flag: '🇬🇧' },
  { code: 'jp', name: 'Japan', native: '日本', flag: '🇯🇵' },
  { code: 'de', name: 'Germany', native: 'Deutschland', flag: '🇩🇪' },
  { code: 'fr', name: 'France', native: 'France', flag: '🇫🇷' },
  { code: 'ca', name: 'Canada', native: 'Canada', flag: '🇨🇦' },
  { code: 'au', name: 'Australia', native: 'Australia', flag: '🇦🇺' },
  { code: 'br', name: 'Brazil', native: 'Brasil', flag: '🇧🇷' },
  { code: 'ae', name: 'United Arab Emirates', native: 'الإمارات', flag: '🇦🇪' },
];

export function getCountryByCode(code: string): CountryOption {
  return COUNTRIES.find(c => c.code.toLowerCase() === (code || 'global').toLowerCase()) || COUNTRIES[0];
}
