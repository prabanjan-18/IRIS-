import React from 'react';
import { Stethoscope, Pill, MapPin } from 'lucide-react';
import SymptomChips from './SymptomChips';

export default function EmptyState({ onSelectSuggestion, onSelectSymptom }) {
  const quickSuggestions = [
    {
      title: "Check my symptoms",
      subtitle: "Analyze fever, pain, or fatigue and get triage guidance",
      icon: Stethoscope,
      prompt: "I want to check my symptoms. I have a low-grade fever and body aches."
    },
    {
      title: "Understand a medication",
      subtitle: "Dosage rules, potential side effects & drug interactions",
      icon: Pill,
      prompt: "Can you explain common side effects and timing for Amoxicillin?"
    },
    {
      title: "Find urgent care guidance",
      subtitle: "Identify red flags and emergency evaluation criteria",
      icon: MapPin,
      prompt: "What red flag symptoms mean I should go to the Emergency Room?"
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-4 py-8 animate-fadeIn text-center">
      
      {/* Editorial Serif Hero Title */}
      <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-sapphire-900 tracking-tight leading-tight mb-3">
        What's going on with your health today?
      </h1>
      <p className="text-sm md:text-base text-sapphire-700 font-sans max-w-lg mb-8 leading-relaxed font-medium">
        Iris provides instant structured symptom analysis, medication explanations, and clinical triage recommendations.
      </p>

      {/* Symptom Chips Row */}
      <div className="w-full max-w-3xl mb-6">
        <SymptomChips onSelectSymptom={onSelectSymptom} />
      </div>

      {/* Quick Suggestion Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl text-left">
        {quickSuggestions.map((card, idx) => {
          const Icon = card.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectSuggestion(card.prompt)}
              className="p-4 rounded-2xl bg-white/90 hover:bg-white border border-frosted-300/60 hover:border-sapphire-400 transition-all group shadow-soft flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-xl bg-frosted-100 border border-frosted-300/60 flex items-center justify-center text-sapphire-800 mb-3 group-hover:scale-110 transition-transform">
                <Icon className="w-5 h-5 stroke-[1.5]" />
              </div>

              <div>
                <h3 className="font-display text-sm font-bold text-sapphire-900 group-hover:text-sapphire-600 transition-colors mb-1">
                  {card.title}
                </h3>
                <p className="text-xs text-sapphire-700 font-sans leading-normal">
                  {card.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
}
