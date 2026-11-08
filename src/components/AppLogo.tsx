import React, { useState } from 'react';

export const APP_LOGO_SRC = '/src/assets/images/rr_news_logo_1791731040986.jpg';

interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: string;
  className?: string;
  animate?: boolean;
}

const SIZE_MAP = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-9 h-9',
  lg: 'w-11 h-11',
  xl: 'w-14 h-14',
};

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showText = false,
  subtitle,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div className={`flex items-center gap-2.5 shrink-0 ${className}`}>
      {/* Emblem Mark */}
      <div
        className={`relative ${sizeClass} shrink-0 rounded-xl overflow-hidden border border-cyan-500/25 bg-[#0d1526] shadow-xs flex items-center justify-center`}
      >
        {!imageError ? (
          <img
            src={APP_LOGO_SRC}
            alt="R.R News"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#0d1526] flex items-center justify-center text-white headline-font font-extrabold text-xs tracking-tight">
            R.R
          </div>
        )}
      </div>

      {/* Complete Editorial Publication Wordmark */}
      {showText && (
        <div className="text-left flex flex-col justify-center leading-none shrink-0">
          <div className="flex items-baseline gap-2 flex-nowrap">
            <span className="headline-font font-extrabold text-lg sm:text-xl tracking-wide text-white whitespace-nowrap">
              R.R NEWS
            </span>
          </div>
          <span className="text-[9.5px] sm:text-[10px] uppercase tracking-[0.14em] text-slate-400 font-semibold mt-1 whitespace-nowrap">
            {subtitle || 'GLOBAL WIRE & MARKETS'}
          </span>
        </div>
      )}
    </div>
  );
};
