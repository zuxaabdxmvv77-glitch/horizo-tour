import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark';
  showText?: boolean;
  className?: string;
}

export function Logo({variant = 'dark', showText = true, className = ''}: LogoProps) {
  const textColor = variant === 'light' ? 'text-white' : 'text-[#111111]';
  const globeStroke = variant === 'light' ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.34)';

  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        width="36"
        height="36"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* Navy globe */}
        <circle cx="32" cy="34" r="23" fill="#0B1F5C" />
        <ellipse cx="32" cy="34" rx="10.5" ry="23" stroke={globeStroke} strokeWidth="2" />
        <path
          d="M10 34H54M14 23H50M14 45H50"
          stroke={globeStroke}
          strokeWidth="2"
        />
        {/* Orange swoosh */}
        <path
          d="M8 42C18 49 38 45 55 24"
          stroke="#FF8A00"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        {/* Airplane */}
        <path
          d="M55 17L47 20.5L50 23.5L44.5 27.5L46.5 29.5L52 25.5L55 28.5V17Z"
          fill="#FF8A00"
        />
        {/* Location pin */}
        <path
          d="M32 7C27.5 7 24 10.5 24 14.8C24 20.4 32 28 32 28C32 28 40 20.4 40 14.8C40 10.5 36.5 7 32 7Z"
          fill="#FF8A00"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        <circle cx="32" cy="14.6" r="2.8" fill="#0B1F5C" />
      </svg>

      {showText && (
        <span className={`text-[17px] font-semibold tracking-tight whitespace-nowrap ${textColor}`}>
          Horizo Tour
        </span>
      )}
    </span>
  );
}
