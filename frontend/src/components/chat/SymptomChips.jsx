import React from 'react';
import { Thermometer, Activity, Zap, HeartPulse, AlertCircle, Sparkles } from 'lucide-react';

export default function SymptomChips({ onSelectSymptom }) {
  const symptoms = [
    { label: "Fever", icon: Thermometer, color: "text-amber-600" },
    { label: "Headache", icon: Zap, color: "text-sapphire-600" },
    { label: "Cough", icon: Activity, color: "text-sapphire-700" },
    { label: "Chest pain", icon: HeartPulse, color: "text-red-600" },
    { label: "Fatigue", icon: AlertCircle, color: "text-amber-700" },
    { label: "Rash & Itching", icon: Sparkles, color: "text-teal-600" },
    { label: "Sore Throat", icon: Activity, color: "text-sapphire-600" },
    { label: "Nausea", icon: AlertCircle, color: "text-emerald-700" },
    { label: "Shortness of Breath", icon: HeartPulse, color: "text-red-600" }
  ];

  return (
    <div className="w-full flex flex-col gap-2 my-2">
      <div className="flex items-center gap-1.5 text-xs text-sapphire-700 px-1 font-sans font-semibold">
        <span>Quick symptom tags:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {symptoms.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectSymptom(item.label)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white border border-frosted-300/70 hover:border-sapphire-500 text-xs text-sapphire-900 font-semibold font-sans transition-all hover:scale-105 active:scale-95 shadow-soft group"
            >
              <Icon className={`w-3.5 h-3.5 ${item.color} group-hover:rotate-12 transition-transform stroke-[1.5]`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
