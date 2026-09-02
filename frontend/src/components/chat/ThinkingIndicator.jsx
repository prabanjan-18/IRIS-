import React from 'react';
import IrisLogo from '../shared/IrisLogo';

export default function ThinkingIndicator() {
  return (
    <div className="flex items-start gap-3 py-4 animate-fadeIn">
      {/* Iris Logo Avatar */}
      <div className="w-8 h-8 rounded-full bg-white border border-frosted-300 flex items-center justify-center shrink-0 shadow-soft">
        <IrisLogo size={18} />
      </div>

      {/* Pulsing Dots Container */}
      <div className="p-4 bg-white/90 border border-frosted-300/80 rounded-2xl rounded-tl-sm flex items-center gap-3 shadow-soft">
        <span className="text-xs text-sapphire-900 font-sans font-bold">Iris is analyzing evidence...</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sapphire-600 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-sapphire-600 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-sapphire-600 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
