import React, { useState } from 'react';
import { Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import IrisLogo from '../shared/IrisLogo';
import HospitalResultsList from './HospitalResultsList';

/**
 * ConversationalBubble — Premium chat bubble for non-medical assistant responses.
 * Used when responseType === "conversation" (general chat, greetings, small talk).
 */
export default function ConversationalBubble({ message }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const text = message.text || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Render text with basic formatting:
   * - Line breaks preserved
   * - **bold** text
   * - Simple bullet lists (lines starting with - or •)
   */
  const renderFormattedText = (rawText) => {
    if (!rawText) return null;

    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      // Bold: **text**
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const formatted = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-bold text-sapphire-900 dark:text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      // Bullet list items
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-mist-200 dark:text-[#CBD5E1] leading-relaxed">
            {formatted.map((f, i) => typeof f === 'string' ? f.replace(/^[-•]\s/, '') : f)}
          </li>
        );
      }

      // Empty line = paragraph break
      if (trimmed === '') {
        return <br key={idx} />;
      }

      return (
        <p key={idx} className="leading-relaxed">
          {formatted}
        </p>
      );
    });
  };

  return (
    <div className="flex items-start gap-3 py-4 w-full animate-fadeIn group">
      
      {/* Iris Logo Avatar */}
      <div className="w-8 h-8 rounded-full bg-ink-800 dark:bg-[#0f1d2e] border border-ink-500 dark:border-[#1e3854] flex items-center justify-center shrink-0 mt-1 shadow-sm">
        <IrisLogo size={18} />
      </div>

      {/* Conversation Bubble Content */}
      <div className="flex-1 min-w-0">
        
        <div className="bg-white/95 dark:bg-[#0d1b2a]/95 border border-frosted-300/60 dark:border-[#1e3854]/60 rounded-2xl rounded-tl-sm px-5 py-4 shadow-soft text-sapphire-900 dark:text-[#F1F7FB] font-sans">
          <div className="text-sm md:text-base text-mist-200 dark:text-[#CBD5E1] whitespace-pre-wrap leading-relaxed">
            {renderFormattedText(text)}
          </div>
          {message.hospitals && message.hospitals.length > 0 && (
            <HospitalResultsList hospitals={message.hospitals} />
          )}
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-1 mt-2 text-sapphire-700 dark:text-[#CBD5E1] font-medium opacity-90 group-hover:opacity-100 transition-opacity">
          
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-frosted-100 dark:hover:bg-[#16273c] text-sapphire-600 dark:text-[#CBD5E1] hover:text-sapphire-900 dark:hover:text-white transition-colors"
            title="Copy message"
            aria-label="Copy message"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2]" />
            ) : (
              <Copy className="w-4 h-4 stroke-[1.5]" />
            )}
          </button>

          <div className="w-px h-3.5 bg-frosted-300 dark:bg-[#1e3854] mx-1" />

          <button
            onClick={() => setFeedback(feedback === 'like' ? null : 'like')}
            className={`p-1.5 rounded-lg hover:bg-frosted-100 dark:hover:bg-[#16273c] transition-colors ${
              feedback === 'like' 
                ? 'text-sapphire-900 dark:text-white bg-frosted-100 dark:bg-[#16273c] font-bold' 
                : 'text-sapphire-600 dark:text-[#CBD5E1] hover:text-sapphire-900 dark:hover:text-white'
            }`}
            title="Good response"
            aria-label="Good response"
          >
            <ThumbsUp className="w-4 h-4 stroke-[1.5]" />
          </button>

          <button
            onClick={() => setFeedback(feedback === 'dislike' ? null : 'dislike')}
            className={`p-1.5 rounded-lg hover:bg-frosted-100 dark:hover:bg-[#16273c] transition-colors ${
              feedback === 'dislike' 
                ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30' 
                : 'text-sapphire-600 dark:text-[#CBD5E1] hover:text-sapphire-900 dark:hover:text-white'
            }`}
            title="Bad response"
            aria-label="Bad response"
          >
            <ThumbsDown className="w-4 h-4 stroke-[1.5]" />
          </button>

          <span className="text-[11px] text-sapphire-600 dark:text-[#94A3B8] font-mono ml-2 flex items-center gap-1.5 font-semibold">
            <span>{message.timestamp}</span>
          </span>
        </div>

      </div>
    </div>
  );
}
