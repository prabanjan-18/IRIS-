import React from 'react';

/**
 * Iris Logo Component — Sapphire Clinical Theme
 * Abstract concentric-ring "iris/lens" mark with sophisticated animation states
 * 
 * @param {number} size - Pixel dimensions for width and height
 * @param {string} className - Optional container styling classes
 * @param {boolean} isProcessing - When true, activates subtle clinical blink and breathing animations
 */
export default function IrisLogo({ size = 24, className = "", isProcessing = false }) {
  return (
    <div 
      className={`relative flex items-center justify-center shrink-0 ${isProcessing ? 'iris-animating' : ''} ${className}`}
      style={{ width: size, height: size }}
      aria-label="Iris Healthcare Assistant Logo"
      role="img"
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* Blink Group: hardware-accelerated natural vertical blink closure */}
        <g className="iris-blink-group">
          
          {/* Outer Housing Ring */}
          <circle 
            cx="12" 
            cy="12" 
            r="9.5" 
            stroke="#1E3A5A" 
            strokeWidth="1.5" 
            strokeDasharray="60"
            className="iris-outer-ring opacity-90"
          />

          {/* Middle Lens Aperture Ring */}
          <circle 
            cx="12" 
            cy="12" 
            r="6" 
            stroke="#3A6B9F" 
            strokeWidth="1.5" 
            className="iris-aperture opacity-100"
          />

          {/* Inner Pupil Core: subtle hippus breathing oscillation */}
          <circle 
            cx="12" 
            cy="12" 
            r="2.5" 
            fill="#0B192C" 
            className="iris-pupil"
          />

          {/* Subtle Corneal Light Glint Reflection */}
          <path 
            d="M 12 3.5 A 8.5 8.5 0 0 1 19.5 11" 
            stroke="#5B8ABF" 
            strokeWidth="1.5" 
            strokeLinecap="round"
            className="iris-glint opacity-70"
          />
          
        </g>
      </svg>
    </div>
  );
}

