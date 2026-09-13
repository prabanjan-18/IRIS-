import React from 'react';
import { Thermometer, Activity, Zap, HeartPulse, AlertCircle, Sparkles } from 'lucide-react';

export default function SymptomChips({ onSelectSymptom }) {
  const symptoms = [
    { label: "Fever", icon: Thermometer, color: "text-amber-600 dark:text-amber-400" },
    { label: "Headache", icon: Zap, color: "text-sapphire-600 dark:text-sky-400" },
    { label: "Cough", icon: Activity, color: "text-sapphire-700 dark:text-cyan-400" },
    { label: "Chest pain", icon: HeartPulse, color: "text-red-600 dark:text-rose-400" },
    { label: "Fatigue", icon: AlertCircle, color: "text-amber-700 dark:text-amber-400" },
    { label: "Rash & Itching", icon: Sparkles, color: "text-teal-600 dark:text-teal-300" },
    { label: "Sore Throat", icon: Activity, color: "text-sapphire-600 dark:text-blue-300" },
    { label: "Nausea", icon: AlertCircle, color: "text-emerald-700 dark:text-emerald-400" },
    { label: "Shortness of Breath", icon: HeartPulse, color: "text-red-600 dark:text-rose-400" }
  ];

  return (
    <div className="w-full flex flex-col gap-2 my-2">
      <div className="flex items-center gap-1.5 text-xs text-sapphire-700 dark:text-slate-300 px-1 font-sans font-semibold">
        <span>Quick symptom tags:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {symptoms.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectSymptom(item.label)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white dark:bg-[#102030] dark:hover:bg-[#162b42] border border-frosted-300/70 dark:border-[#223d5d] hover:border-sapphire-500 dark:hover:border-[#38bdf8] text-xs text-sapphire-900 dark:text-[#F1F7FB] font-semibold font-sans transition-all hover:scale-105 active:scale-95 shadow-soft group"
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
