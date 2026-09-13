import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function DisclaimerBar() {
  return (
    <div className="w-full py-1.5 px-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-sapphire-600/70 dark:text-slate-300 font-sans select-none">
      <ShieldCheck className="w-3.5 h-3.5 text-sapphire-500/80 dark:text-[#38bdf8] shrink-0" />
      <span>
        IRIS provides informational health synthesis, not medical advice. For emergencies, contact local emergency services immediately.
      </span>
    </div>
  );
}
