import React, { useState } from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import EmergencyModal from './EmergencyModal';

export default function DisclaimerBar() {
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  return (
    <>
      <div className="w-full py-2 px-3 bg-white/70 border-t border-frosted-300/40 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-sapphire-800 font-medium">
        
        {/* Medical Disclaimer Banner */}
        <div className="flex items-center gap-2 text-center sm:text-left">
          <ShieldCheck className="w-4 h-4 text-sapphire-600 shrink-0 hidden xs:inline-block" />
          <span>
            Iris provides general health information, not a medical diagnosis. In an emergency, contact local emergency services immediately.
          </span>
        </div>

        {/* Emergency Escape Hatch Button */}
        <button
          onClick={() => setIsEmergencyModalOpen(true)}
          className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 font-bold text-[11px] transition-all hover:scale-105 active:scale-95 shadow-soft"
          aria-label="Open emergency contact guidance"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Emergency? Get help</span>
        </button>
      </div>

      {/* Emergency Modal */}
      <EmergencyModal 
        isOpen={isEmergencyModalOpen} 
        onClose={() => setIsEmergencyModalOpen(false)} 
      />
    </>
  );
}
