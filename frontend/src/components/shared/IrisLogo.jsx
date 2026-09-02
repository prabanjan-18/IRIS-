import React from 'react';

/**
 * Iris Logo Component — Sapphire Theme
 * Abstract concentric-ring "iris/lens" mark with Sapphire Blue tones
 */
export default function IrisLogo({ size = 24, className = "" }) {
  return (
    <div 
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-label="Iris Healthcare Assistant Logo"
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 hover:rotate-12"
      >
        {/* Outer Ring */}
        <circle 
          cx="12" 
          cy="12" 
          r="9.5" 
          stroke="#1E3A5A" 
          strokeWidth="1.5" 
          strokeDasharray="60"
          className="opacity-90"
        />
        {/* Middle Lens Aperture Ring */}
        <circle 
          cx="12" 
          cy="12" 
          r="6" 
          stroke="#3A6B9F" 
          strokeWidth="1.5" 
          className="opacity-100"
        />
        {/* Inner Pupil Core */}
        <circle 
          cx="12" 
          cy="12" 
          r="2.5" 
          fill="#0B192C" 
        />
        {/* Subtle Radial Light Glint */}
        <path 
          d="M 12 3.5 A 8.5 8.5 0 0 1 19.5 11" 
          stroke="#5B8ABF" 
          strokeWidth="1.5" 
          strokeLinecap="round"
          className="opacity-70"
        />
      </svg>
    </div>
  );
}
