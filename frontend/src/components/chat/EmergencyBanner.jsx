import React from 'react';
import { PhoneCall, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function EmergencyBanner({ query = 'Emergency medical situation' }) {
  const primaryNumber = import.meta.env.VITE_EMERGENCY_NUMBER_PRIMARY || '112';
  const ambulanceNumber = import.meta.env.VITE_EMERGENCY_NUMBER_AMBULANCE || '108';

  return (
    <div className="my-3 rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/40 via-red-900/25 to-red-950/40 p-4 sm:p-5 shadow-lg shadow-red-950/20 backdrop-blur-md">
      <div className="flex items-start gap-3.5">
        <div className="relative mt-0.5 flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400 ring-1 ring-red-500/40 shadow-inner">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
              <AlertTriangle className="h-3 w-3" />
              URGENT MEDICAL ATTENTION
            </span>
          </div>

          <h3 className="mt-1.5 text-base font-semibold text-white tracking-tight">
            Immediate Care Recommended
          </h3>

          <p className="mt-1 text-xs sm:text-sm text-red-200/80 leading-relaxed">
            If you or someone nearby is experiencing a life-threatening medical emergency (severe chest pain, difficulty breathing, sudden weakness, heavy bleeding), do not wait — call emergency services immediately or visit the closest ER.
          </p>

          <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
            <a
              href={`tel:${primaryNumber}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-red-600/30 transition-all active:scale-95"
            >
              <PhoneCall className="h-4 w-4" />
              Call Emergency ({primaryNumber})
            </a>

            <a
              href={`tel:${ambulanceNumber}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-200 hover:text-white border border-red-500/30 text-xs sm:text-sm font-medium transition-all active:scale-95"
            >
              <PhoneCall className="h-4 w-4 text-red-400" />
              Call Ambulance ({ambulanceNumber})
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
