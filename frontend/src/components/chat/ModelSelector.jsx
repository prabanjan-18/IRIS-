import React, { useState, useEffect, useRef } from 'react';
import { Cpu, ChevronDown, Check, Sparkles, Zap } from 'lucide-react';
import { fetchAvailableModels, DEFAULT_FREE_MODELS } from '../../services/sendMessageToBackend';

export default function ModelSelector({ selectedModel, setSelectedModel, dropUp = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [models, setModels] = useState(DEFAULT_FREE_MODELS);
  const dropdownRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    fetchAvailableModels().then((data) => {
      if (isMounted && data && data.length > 0) {
        setModels(data);
        if (!selectedModel) {
          setSelectedModel(data[0].id);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentModelObj = models.find((m) => m.id === selectedModel) || models[0] || { name: 'Auto Router', id: 'openrouter/free' };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-frosted-300/80 hover:border-sapphire-400 transition-all text-xs font-semibold text-sapphire-900 shadow-soft group"
        title="Select AI Model"
      >
        <div className="w-4 h-4 rounded-md bg-sapphire-100 flex items-center justify-center text-sapphire-700 group-hover:scale-105 transition-transform">
          <Cpu className="w-2.5 h-2.5 stroke-[2]" />
        </div>
        
        <div className="flex items-center gap-1 max-w-[110px] sm:max-w-[150px] truncate">
          <span className="truncate text-sapphire-900 text-[11px] font-bold">{currentModelObj.name}</span>
        </div>

        <ChevronDown className={`w-3 h-3 text-sapphire-600 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-sapphire-900' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute ${dropUp ? 'bottom-full mb-2 left-0' : 'top-full mt-2 right-0'} w-72 md:w-80 rounded-2xl bg-white border border-frosted-300/90 shadow-[0_20px_45px_-5px_rgba(15,37,55,0.25),0_10px_20px_-5px_rgba(15,37,55,0.18)] z-50 overflow-hidden animate-fadeIn`}>
          <div className="p-3 border-b border-frosted-300/60 bg-white flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sapphire-900">
              <Sparkles className="w-3.5 h-3.5 text-sapphire-600" />
              <span>Select LLM Model</span>
            </div>
            <span className="text-[10px] text-sapphire-700 font-mono font-medium">OpenRouter Models</span>
          </div>

          <div className="max-h-64 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
            {models.map((model) => {
              const isSelected = model.id === selectedModel;
              const provider = model.id.split('/')[0] || 'OpenRouter';
              const cleanName = model.name;

              return (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all ${
                    isSelected
                      ? 'bg-sapphire-100 border border-sapphire-300 text-sapphire-900 font-bold'
                      : 'hover:bg-frosted-100 text-sapphire-700 hover:text-sapphire-900 border border-transparent'
                  }`}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className={`truncate ${isSelected ? 'text-sapphire-900 font-bold' : 'text-sapphire-800 font-medium'}`}>
                        {cleanName}
                      </span>
                    </div>
                    <span className="text-[10px] text-sapphire-500 font-mono capitalize">
                      {provider}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isSelected && <Check className="w-3.5 h-3.5 text-sapphire-800 stroke-[2.5]" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-2.5 bg-white border-t border-frosted-300/60 text-[10px] text-sapphire-700 font-medium text-center flex items-center justify-center gap-1">
            <Zap className="w-3 h-3 text-amber-600 shrink-0" />
            <span>Automatic fallback active if selected model is busy</span>
          </div>
        </div>
      )}
    </div>
  );
}
