import React from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, X, HeartPulse, Building2 } from 'lucide-react';

export default function EmergencyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-modal-title"
    >
      <div className="relative w-full max-w-lg bg-white border border-red-200 rounded-2xl p-6 shadow-2xl overflow-hidden text-sapphire-900">
        
        {/* Header Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-600"></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-sapphire-600 hover:text-sapphire-900 p-1.5 rounded-lg hover:bg-frosted-100 transition-colors"
          aria-label="Close emergency modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 border border-red-300 flex items-center justify-center text-red-700 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 id="emergency-modal-title" className="font-display text-xl font-bold text-sapphire-900">
              Emergency Guidance
            </h3>
            <p className="text-xs text-sapphire-700 font-sans font-medium">
              Immediate actions for life-threatening or urgent conditions
            </p>
          </div>
        </div>

        {/* Emergency Alert Box */}
        <div className="p-4 mb-5 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-800 font-semibold leading-relaxed">
            If you or someone nearby is experiencing a medical emergency, do not wait for online responses. Seek immediate professional medical help.
          </p>
        </div>

        {/* Immediate Call Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <a 
            href="tel:911" 
            className="flex items-center gap-3 p-3.5 bg-red-50 hover:bg-red-100 border border-red-300 rounded-xl transition-all group shadow-soft"
          >
            <div className="w-9 h-9 rounded-lg bg-red-600 text-white font-bold flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-sapphire-700 font-semibold">Call Emergency</div>
              <div className="text-base font-bold text-red-700 group-hover:underline">911 / 112</div>
            </div>
          </a>

          <a 
            href="tel:18002221222" 
            className="flex items-center gap-3 p-3.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-all group shadow-soft"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-600 text-white font-bold flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-sapphire-700 font-semibold">Poison Control</div>
              <div className="text-xs font-bold text-amber-900 group-hover:underline">1-800-222-1222</div>
            </div>
          </a>
        </div>

        {/* Warning Signs List */}
        <div className="mb-6 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-sapphire-700">
            Go to the nearest Emergency Room if experiencing:
          </h4>
          <ul className="text-xs text-sapphire-900 font-medium space-y-1.5 pl-4 list-disc marker:text-red-600">
            <li>Chest pain, pressure, or tightness radiating to left arm/jaw</li>
            <li>Sudden weakness, numbness, or facial drooping on one side</li>
            <li>Severe difficulty breathing or blue-tinged lips/fingertips</li>
            <li>Sudden severe headache ("thunderclap") or loss of consciousness</li>
            <li>Uncontrolled bleeding or severe traumatic injuries</li>
          </ul>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-frosted-300">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-sapphire-700 hover:text-sapphire-900 transition-colors"
          >
            I understand
          </button>
          <a
            href="https://www.google.com/maps/search/nearest+emergency+room"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-sans font-bold shadow-soft"
          >
            <Building2 className="w-4 h-4" />
            Find Nearest ER
          </a>
        </div>

      </div>
    </div>
  );
}
