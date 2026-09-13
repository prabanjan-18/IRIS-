import React from 'react';
import IrisLogo from '../shared/IrisLogo';

export default function ThinkingIndicator() {
  return (
    <div className="flex items-start gap-3 py-4 animate-fadeIn">
      {/* Iris Logo Avatar */}
      <div className="w-8 h-8 rounded-full bg-white dark:bg-[#0f1d2e] border border-frosted-300 dark:border-[#1e3854] flex items-center justify-center shrink-0 shadow-soft">
        <IrisLogo size={18} isProcessing={true} />
      </div>

      {/* Pulsing Dots Container */}
      <div className="p-4 bg-white/90 dark:bg-[#0d1b2a]/95 border border-frosted-300/80 dark:border-[#1e3854] rounded-2xl rounded-tl-sm flex items-center gap-3 shadow-soft">
        <span className="text-xs text-sapphire-900 dark:text-[#F8FAFC] font-sans font-bold">Iris is analyzing evidence...</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sapphire-600 dark:bg-[#38bdf8] animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-sapphire-600 dark:bg-[#38bdf8] animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-sapphire-600 dark:bg-[#38bdf8] animate-bounce" />
        </div>
      </div>
    </div>
  );
}
