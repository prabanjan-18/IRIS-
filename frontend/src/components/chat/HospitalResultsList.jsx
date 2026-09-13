import React, { useState } from 'react';
import { ExternalLink, MapPin, Compass } from 'lucide-react';

/**
 * HospitalResultsList — Connected mini-map + compact hospital rows component.
 * 
 * Features:
 * - Numbered pins (1, 2, 3...) matching row badges.
 * - Frosted Blue (#9FE2EE) badge/pin styling with dark Ink 900 (#0B1416) text.
 * - Max 5 pins on map; "+N more below" indicator if > 5.
 * - If 1 hospital, skip mini-map completely.
 * - If lat/lng unavailable for enough hospitals, gracefully omit mini-map.
 * - "View full map ↗" affordance.
 * - Compact rows with specialty · distance · rating (missing fields cleanly omitted).
 * - Thin hairline borders (border-frosted-200 dark:border-[#2A3B3F]).
 * - Real Google Maps deep links.
 */
export default function HospitalResultsList({ hospitals = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!Array.isArray(hospitals) || hospitals.length === 0) {
    return null;
  }

  // Filter hospitals that have valid numeric coordinates
  const validCoordinates = hospitals.filter(
    (h) => typeof h.lat === 'number' && !isNaN(h.lat) && typeof h.lng === 'number' && !isNaN(h.lng)
  );

  // Mini-map is shown ONLY if there are at least 2 hospitals with valid coordinates
  const showMiniMap = hospitals.length > 1 && validCoordinates.length >= 2;

  // Max 5 pins plotted on the map
  const mapHospitals = validCoordinates.slice(0, 5);
  const overflowCount = hospitals.length > 5 ? hospitals.length - 5 : 0;

  // Compute bounding box with padding for SVG map projection
  let pinPositions = [];
  if (showMiniMap) {
    const lats = mapHospitals.map((h) => h.lat);
    const lngs = mapHospitals.map((h) => h.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latSpan = maxLat - minLat || 0.01;
    const lngSpan = maxLng - minLng || 0.01;

    const padLat = latSpan * 0.25;
    const padLng = lngSpan * 0.25;

    const bMinLat = minLat - padLat;
    const bMaxLat = maxLat + padLat;
    const bMinLng = minLng - padLng;
    const bMaxLng = maxLng + padLng;

    const svgWidth = 600;
    const svgHeight = 160;
    const marginX = 45;
    const marginY = 32;

    pinPositions = mapHospitals.map((h, i) => {
      const x = marginX + ((h.lng - bMinLng) / (bMaxLng - bMinLng)) * (svgWidth - marginX * 2);
      // Invert Y because latitude increases northward, SVG Y increases downward
      const y = svgHeight - marginY - ((h.lat - bMinLat) / (bMaxLat - bMinLat)) * (svgHeight - marginY * 2);
      
      // Find original index in hospitals array (1-indexed)
      const originalIdx = hospitals.findIndex((orig) => orig.name === h.name && orig.lat === h.lat);
      const displayIndex = originalIdx >= 0 ? originalIdx + 1 : i + 1;

      return {
        hospital: h,
        displayIndex,
        x: Math.max(25, Math.min(svgWidth - 25, x)),
        y: Math.max(28, Math.min(svgHeight - 16, y)),
      };
    });
  }

  // Google Maps broad view URL
  const broadSearchQuery = hospitals[0]?.name 
    ? encodeURIComponent(hospitals.map(h => h.name).slice(0, 2).join(' or ')) 
    : 'hospitals';
  const fullMapUrl = validCoordinates[0]
    ? `https://www.google.com/maps/search/hospitals/@${validCoordinates[0].lat},${validCoordinates[0].lng},13z`
    : `https://www.google.com/maps/search/?api=1&query=${broadSearchQuery}`;

  return (
    <div className="w-full max-w-[600px] mt-3.5 rounded-2xl border border-frosted-300/80 dark:border-[#1e3854] bg-white/95 dark:bg-[#0d1b2a]/95 shadow-soft overflow-hidden transition-all font-sans">
      
      {/* ─── 1. MINI-MAP (Rendered only when >1 hospital with valid coordinates) ─── */}
      {showMiniMap && (
        <div className="relative w-full h-[160px] bg-slate-900 border-b border-frosted-200 dark:border-[#1e3854] overflow-hidden select-none">
          
          {/* Stylized Vector Map Background */}
          <svg
            viewBox="0 0 600 160"
            className="w-full h-full object-cover"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              {/* Background gradient */}
              <linearGradient id="mapBgGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0B1416" />
                <stop offset="60%" stopColor="#0E1E24" />
                <stop offset="100%" stopColor="#132830" />
              </linearGradient>

              {/* Grid pattern */}
              <pattern id="mapGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#9FE2EE" strokeWidth="0.5" strokeOpacity="0.08" />
              </pattern>

              {/* Pin glow filter */}
              <filter id="pinGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.6" />
              </filter>
            </defs>

            {/* Base Background */}
            <rect width="600" height="160" fill="url(#mapBgGrad)" />
            <rect width="600" height="160" fill="url(#mapGrid)" />

            {/* Stylized Roads / Arteries */}
            <path
              d="M -20,60 C 120,40 240,110 380,85 C 480,68 540,90 620,70"
              fill="none"
              stroke="#2A4B56"
              strokeWidth="4"
              strokeOpacity="0.4"
            />
            <path
              d="M -20,60 C 120,40 240,110 380,85 C 480,68 540,90 620,70"
              fill="none"
              stroke="#9FE2EE"
              strokeWidth="1.5"
              strokeOpacity="0.25"
            />
            <path
              d="M 180,-10 C 200,60 160,110 220,170"
              fill="none"
              stroke="#2A4B56"
              strokeWidth="3"
              strokeOpacity="0.3"
            />
            <path
              d="M 440,-10 C 420,50 470,100 450,170"
              fill="none"
              stroke="#2A4B56"
              strokeWidth="2.5"
              strokeOpacity="0.3"
            />

            {/* Connecting lines between nearest pins */}
            {pinPositions.length > 1 && (
              <polyline
                points={pinPositions.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#9FE2EE"
                strokeWidth="1"
                strokeDasharray="4 4"
                strokeOpacity="0.35"
              />
            )}

            {/* Numbered Pins */}
            {pinPositions.map((p) => {
              const isHovered = hoveredIdx === p.displayIndex - 1;
              return (
                <g
                  key={`pin-${p.displayIndex}`}
                  transform={`translate(${p.x}, ${p.y})`}
                  className="cursor-pointer transition-transform duration-200"
                  style={{ transformOrigin: 'center bottom' }}
                  onMouseEnter={() => setHoveredIdx(p.displayIndex - 1)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => window.open(p.hospital.mapsUrl, '_blank', 'noopener,noreferrer')}
                >
                  {/* Subtle Pulse ring on hover */}
                  {isHovered && (
                    <circle r="16" fill="#9FE2EE" fillOpacity="0.2" className="animate-ping" />
                  )}

                  {/* Pin teardrop body */}
                  <path
                    d="M 0,0 C -9,-9 -9,-20 0,-20 C 9,-20 9,-9 0,0 Z"
                    fill="#9FE2EE"
                    filter="url(#pinGlow)"
                    stroke={isHovered ? '#FFFFFF' : '#0B1416'}
                    strokeWidth={isHovered ? '1.5' : '0.8'}
                  />

                  {/* Number inside pin */}
                  <text
                    x="0"
                    y="-11"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#0B1416"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="Inter, system-ui, sans-serif"
                  >
                    {p.displayIndex}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Top-Right "View full map ↗" button */}
          <a
            href={fullMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#0B1416]/80 hover:bg-[#0B1416] text-[#9FE2EE] hover:text-white border border-[#9FE2EE]/30 text-[11px] font-semibold backdrop-blur-md transition-colors shadow-sm"
          >
            <span>View full map</span>
            <ExternalLink className="w-3 h-3 stroke-[2]" />
          </a>

          {/* Bottom-Left Badge if > 5 hospitals */}
          {overflowCount > 0 && (
            <div className="absolute bottom-2 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0B1416]/80 text-[#9FE2EE] border border-[#9FE2EE]/20 text-[10px] font-medium backdrop-blur-md">
              <span>+{overflowCount} more below</span>
            </div>
          )}

          {/* Live Map Watermark */}
          <div className="absolute bottom-2 right-2.5 flex items-center gap-1 text-[9px] text-[#9FE2EE]/60 font-mono pointer-events-none">
            <Compass className="w-2.5 h-2.5 text-[#9FE2EE]/80" />
            <span>Google Maps</span>
          </div>
        </div>
      )}

      {/* ─── 2. COMPACT HOSPITAL ROWS ─── */}
      <div className="divide-y divide-frosted-200 dark:divide-[#2A3B3F]">
        {hospitals.map((hospital, idx) => {
          const isHovered = hoveredIdx === idx;
          const displayNum = idx + 1;

          // Assemble secondary pieces: specialty · distance · rating (omit missing)
          const secondaryParts = [];
          if (hospital.specialty && hospital.specialty.trim()) {
            secondaryParts.push({ key: 'spec', val: hospital.specialty.trim() });
          }
          if (hospital.distanceText && hospital.distanceText.trim()) {
            secondaryParts.push({ key: 'dist', val: hospital.distanceText.trim() });
          }
          if (typeof hospital.rating === 'number' && hospital.rating > 0) {
            secondaryParts.push({ key: 'rate', val: `${hospital.rating.toFixed(1)} ★` });
          }

          return (
            <div
              key={`hosp-row-${idx}`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center justify-between gap-3 px-3.5 py-3 transition-colors ${
                isHovered
                  ? 'bg-frosted-100/70 dark:bg-[#14263b]/60'
                  : 'hover:bg-frosted-50/50 dark:hover:bg-[#112032]/40'
              }`}
            >
              {/* Left Side: Number Badge + Details */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                
                {/* Frosted Blue Badge (#9FE2EE bg, #0B1416 text) */}
                <span className="w-5 h-5 rounded-full bg-[#9FE2EE] text-[#0B1416] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  {displayNum}
                </span>

                {/* Info Text */}
                <div className="min-w-0 flex-1">
                  
                  {/* Hospital Name (Inter 500) */}
                  <h4 className="text-sm font-medium text-sapphire-950 dark:text-[#F1F7FB] truncate leading-tight">
                    {hospital.name}
                  </h4>

                  {/* Secondary line: specialty · distance · rating */}
                  {secondaryParts.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-sapphire-600 dark:text-[#94A3B8] flex-wrap leading-tight">
                      {secondaryParts.map((item, pIdx) => (
                        <React.Fragment key={item.key}>
                          <span className={item.key === 'rate' ? 'text-amber-600 dark:text-amber-400 font-semibold' : ''}>
                            {item.val}
                          </span>
                          {pIdx < secondaryParts.length - 1 && (
                            <span className="text-frosted-400 dark:text-[#3C535A] font-bold">·</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  {/* Address fallback if distinct and no secondary parts */}
                  {secondaryParts.length === 0 && hospital.address && (
                    <p className="text-xs text-sapphire-500 dark:text-[#82A8D2] truncate mt-0.5">
                      {hospital.address}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Side: Maps ↗ Link */}
              <div className="shrink-0 pl-2">
                <a
                  href={hospital.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-sapphire-700 dark:text-[#9FE2EE] hover:text-sapphire-950 dark:hover:text-white bg-frosted-100 dark:bg-[#132337] hover:bg-frosted-200 dark:hover:bg-[#192f49] border border-frosted-300/80 dark:border-[#1e3854] transition-all shadow-xs group"
                >
                  <span>Maps</span>
                  <ExternalLink className="w-3 h-3 stroke-[2] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
