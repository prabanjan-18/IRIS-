import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  RotateCcw, 
  ThumbsUp, 
  ThumbsDown, 
  Check, 
  ExternalLink,
  BookOpen
} from 'lucide-react';
import IrisLogo from '../shared/IrisLogo';

export default function StructuredHealthCard({ message, onRegenerate }) {
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'like' | 'dislike' | null

  const data = message.structuredData || (message.text ? { 
    summary: message.text, 
    triageLevel: "self", 
    triageLabel: "IRIS Health Response" 
  } : null);

  const handleCopy = () => {
    if (!data) return;
    const textContent = `
[Iris Health Analysis]
Triage: ${data.triageLabel}
Summary: ${data.summary}

Possible Causes:
${data.causes?.map(c => `- ${c}`).join('\n')}

Self-Care Steps:
${data.selfCare?.map(s => `- ${s}`).join('\n')}

When to Seek Care:
${data.whenToSeekCare?.map(w => `- ${w}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render Triage Badge
  const renderTriageBadge = () => {
    if (!data?.triageLevel) return null;

    let badgeBg = "bg-emerald-500/15 border-emerald-500/40 text-emerald-400";
    let Icon = CheckCircle2;

    if (data.triageLevel === "caution") {
      badgeBg = "bg-amber-500/15 border-amber-500/40 text-amber-400";
      Icon = AlertTriangle;
    } else if (data.triageLevel === "urgent") {
      badgeBg = "bg-triage-urgent/15 border-triage-urgent/40 text-triage-urgent";
      Icon = AlertCircle;
    }

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold font-sans mb-4 shadow-sm ${badgeBg}`}>
        <Icon className="w-4 h-4 stroke-[2]" />
        <span>{data.triageLabel || "Clinical Assessment"}</span>
      </div>
    );
  };

  return (
    <div className="flex items-start gap-3 py-4 w-full animate-fadeIn group">
      
      {/* Iris Logo Mark Avatar */}
      <div className="w-8 h-8 rounded-full bg-ink-800 dark:bg-[#0f1d2e] border border-ink-500 dark:border-[#1e3854] flex items-center justify-center shrink-0 mt-1 shadow-sm">
        <IrisLogo size={18} />
      </div>

      {/* Main Structured Health Card Container */}
      <div className="flex-1 min-w-0">
        
        <div className="bg-ink-700 dark:bg-[#0d1b2a]/95 border border-ink-500 dark:border-[#1e3854] rounded-2xl p-5 md:p-6 shadow-card-glow text-mist-100 dark:text-[#F8FAFC] font-sans space-y-5">
          
          {/* Triage Chip */}
          {renderTriageBadge()}

          {/* Overview Summary */}
          {data?.summary && (
            <div className="space-y-1.5">
              <h3 className="font-display text-lg font-bold text-mist-100 dark:text-[#F8FAFC] tracking-tight">
                Overview
              </h3>
              <p className="text-base leading-relaxed text-mist-100/95 dark:text-[#CBD5E1] font-sans">
                {data.summary}
              </p>
            </div>
          )}

          {/* Possible Causes Section */}
          {data?.causes && data.causes.length > 0 && (
            <div className="pt-3 border-t border-ink-500/60 dark:border-[#1e3854]/60 space-y-2">
              <h3 className="font-display text-base font-bold text-sapphire-900 dark:text-[#F1F7FB] tracking-tight">
                Possible Causes
              </h3>
              <ul className="space-y-1.5 pl-4 list-disc marker:text-sapphire-600 dark:marker:text-[#38bdf8] text-sm text-mist-200 dark:text-[#CBD5E1] leading-relaxed font-sans">
                {data.causes.map((cause, idx) => (
                  <li key={idx}>{cause}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Self-Care Steps Section */}
          {data?.selfCare && data.selfCare.length > 0 && (
            <div className="pt-3 border-t border-ink-500/60 dark:border-[#1e3854]/60 space-y-2">
              <h3 className="font-display text-base font-bold text-sapphire-900 dark:text-[#F1F7FB] tracking-tight">
                Self-Care Recommendations
              </h3>
              <ul className="space-y-1.5 pl-4 list-disc marker:text-emerald-600 dark:marker:text-emerald-400 text-sm text-mist-200 dark:text-[#CBD5E1] leading-relaxed font-sans">
                {data.selfCare.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {/* When to Seek Care Section */}
          {data?.whenToSeekCare && data.whenToSeekCare.length > 0 && (
            <div className="pt-3 border-t border-ink-500/60 dark:border-[#1e3854]/60 space-y-2">
              <h3 className="font-display text-base font-bold text-amber-800 dark:text-amber-300 tracking-tight flex items-center gap-2">
                When to Seek Professional Medical Care
              </h3>
              <ul className="space-y-1.5 pl-4 list-disc marker:text-amber-600 dark:marker:text-amber-400 text-sm text-mist-200 dark:text-[#CBD5E1] leading-relaxed font-sans">
                {data.whenToSeekCare.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Collapsible RAG Sources Drawer */}
          {data?.sources && data.sources.length > 0 && (
            <div className="pt-3 border-t border-ink-500/60 dark:border-[#1e3854]/60">
              <button
                onClick={() => setIsSourcesOpen(!isSourcesOpen)}
                className="flex items-center justify-between w-full text-xs font-semibold text-sapphire-700 dark:text-[#38bdf8] hover:text-sapphire-900 dark:hover:text-[#7dd3fc] transition-colors py-1 group/src"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 stroke-[1.5]" />
                  <span>Clinical Evidence & RAG Sources ({data.sources.length})</span>
                </div>
                {isSourcesOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4 group-hover/src:translate-y-0.5 transition-transform" />
                )}
              </button>

              {isSourcesOpen && (
                <div className="mt-3 space-y-2.5 animate-fadeIn">
                  {data.sources.map((src, idx) => (
                    <a
                      key={idx}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-xl bg-ink-800/80 dark:bg-[#08121e] border border-ink-500 dark:border-[#192e45] hover:border-sapphire-500/60 dark:hover:border-[#38bdf8]/60 transition-all group/card"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs font-semibold text-sapphire-800 dark:text-[#38bdf8] group-hover/card:underline mb-1">
                        <span>{src.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 text-mist-300 dark:text-[#CBD5E1] group-hover/card:text-sapphire-700 dark:group-hover/card:text-white" />
                      </div>
                      <p className="text-xs text-mist-300 dark:text-[#94A3B8] leading-normal line-clamp-2">
                        "{src.snippet}"
                      </p>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Action Icon Bar Below Assistant Message */}
        <div className="flex items-center gap-1 mt-2 text-sapphire-700 dark:text-[#CBD5E1] font-medium opacity-90 group-hover:opacity-100 transition-opacity">
          
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-frosted-100 dark:hover:bg-[#16273c] text-sapphire-600 dark:text-[#CBD5E1] hover:text-sapphire-900 dark:hover:text-white transition-colors"
            title="Copy card text"
            aria-label="Copy message"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2]" />
            ) : (
              <Copy className="w-4 h-4 stroke-[1.5]" />
            )}
          </button>

          <button
            onClick={onRegenerate}
            className="p-1.5 rounded-lg hover:bg-frosted-100 dark:hover:bg-[#16273c] text-sapphire-600 dark:text-[#CBD5E1] hover:text-sapphire-900 dark:hover:text-white transition-colors"
            title="Regenerate response"
            aria-label="Regenerate response"
          >
            <RotateCcw className="w-4 h-4 stroke-[1.5]" />
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
