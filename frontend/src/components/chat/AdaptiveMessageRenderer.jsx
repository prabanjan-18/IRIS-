import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  AlertCircle, AlertTriangle, CheckCircle2,
  Copy, Check, RotateCcw, ThumbsUp, ThumbsDown,
  BookOpen, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import IrisLogo from '../shared/IrisLogo';
import HospitalResultsList from './HospitalResultsList';

// ─── Brand palette for recharts ───────────────────────────────────────────────
const CHART_COLORS = ['#254E7A', '#3A6B9F', '#5B8ABF', '#15803D', '#B45309', '#C2410C', '#7E68B0'];

// ─── Triage marker parser ─────────────────────────────────────────────────────
function extractTriage(text) {
  const urgentMatch = text.match(/<!--triage:urgent-->/i);
  const cautionMatch = text.match(/<!--triage:caution-->/i);
  const selfMatch = text.match(/<!--triage:self-?care-->/i);

  let level = null;
  if (urgentMatch) level = 'urgent';
  else if (cautionMatch) level = 'caution';
  else if (selfMatch) level = 'self';

  const cleanText = text
    .replace(/<!--triage:[a-z-]+-->/gi, '')
    .trimStart();

  return { level, cleanText };
}

// ─── Triage chip ──────────────────────────────────────────────────────────────
function TriageChip({ level }) {
  if (!level) return null;

  const configs = {
    urgent: {
      Icon: AlertCircle,
      className: 'bg-red-50 border-red-300 text-red-700',
      label: 'Seek urgent/emergency care',
    },
    caution: {
      Icon: AlertTriangle,
      className: 'bg-amber-50 border-amber-300 text-amber-700',
      label: 'Consider seeing a doctor soon',
    },
    self: {
      Icon: CheckCircle2,
      className: 'bg-emerald-50 border-emerald-300 text-emerald-700',
      label: 'Self-care may be appropriate',
    },
  };

  const { Icon, className, label } = configs[level] || configs.self;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold font-sans mb-4 shadow-sm ${className}`}>
      <Icon className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
      <span>{label}</span>
    </div>
  );
}

// ─── Chart renderer ───────────────────────────────────────────────────────────
function ChartBlock({ raw }) {
  let config;
  try {
    config = JSON.parse(raw);
  } catch {
    // Malformed JSON — fall back to code block
    return (
      <pre className="bg-ink-800/80 border border-ink-500 rounded-xl p-4 text-xs text-mist-300 overflow-x-auto">
        <code>{raw}</code>
      </pre>
    );
  }

  const { type = 'bar', title, data, xKey, yKey, nameKey, valueKey } = config;

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <pre className="bg-ink-800/80 border border-ink-500 rounded-xl p-4 text-xs text-mist-300 overflow-x-auto">
        <code>{raw}</code>
      </pre>
    );
  }

  const containerClass = "w-full my-4 rounded-2xl border border-sapphire-200/60 dark:border-[#1e3854] bg-white/90 dark:bg-[#0f1d2e]/90 shadow-soft p-4";

  return (
    <div className={containerClass}>
      {title && (
        <p className="text-sm font-bold text-sapphire-900 dark:text-[#F1F7FB] font-display mb-4">{title}</p>
      )}
      <ResponsiveContainer width="100%" height={220}>
        {type === 'line' ? (
          <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#CBEBF3" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#1E3A5A' }} />
            <YAxis tick={{ fontSize: 11, fill: '#1E3A5A' }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #CBEBF3' }} />
            <Line type="monotone" dataKey={yKey} stroke="#254E7A" strokeWidth={2} dot={{ r: 4, fill: '#254E7A' }} />
          </LineChart>
        ) : type === 'pie' ? (
          <PieChart>
            <Pie
              data={data}
              dataKey={valueKey || 'value'}
              nameKey={nameKey || 'name'}
              cx="50%"
              cy="50%"
              outerRadius={85}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #CBEBF3' }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        ) : (
          // Default: bar chart
          <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#CBEBF3" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#1E3A5A' }} />
            <YAxis tick={{ fontSize: 11, fill: '#1E3A5A' }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #CBEBF3' }} />
            <Bar dataKey={yKey} radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

// ─── Markdown custom renderers ────────────────────────────────────────────────
function buildMarkdownComponents(onRegenerate) {
  return {
    // Intercept fenced code blocks for chart rendering
    code({ node, inline, className, children, ...props }) {
      const lang = (className || '').replace('language-', '');
      const raw = String(children).replace(/\n$/, '');

      if (!inline && lang === 'chart') {
        return <ChartBlock raw={raw} />;
      }

      if (!inline) {
        return (
          <pre className="bg-[#0F2537]/8 dark:bg-[#07121d] border border-sapphire-200/50 dark:border-[#1e3854] rounded-xl px-4 py-3 overflow-x-auto my-3">
            <code className="text-xs font-mono text-sapphire-800 dark:text-[#38bdf8]">{raw}</code>
          </pre>
        );
      }

      return (
        <code className="bg-sapphire-100 dark:bg-[#14263b] text-sapphire-800 dark:text-[#38bdf8] border border-transparent dark:border-[#1e3854] rounded px-1.5 py-0.5 text-[0.85em] font-mono">
          {children}
        </code>
      );
    },

    // Headings
    h1: ({ children }) => <h1 className="font-display text-xl font-bold text-sapphire-900 dark:text-[#F8FAFC] mt-5 mb-2">{children}</h1>,
    h2: ({ children }) => <h2 className="font-display text-lg font-bold text-sapphire-900 dark:text-[#F8FAFC] mt-4 mb-1.5">{children}</h2>,
    h3: ({ children }) => <h3 className="font-display text-base font-bold text-sapphire-800 dark:text-[#F1F5F9] mt-3 mb-1">{children}</h3>,

    // Paragraphs
    p: ({ children }) => <p className="text-[0.9375rem] leading-relaxed text-mist-200 dark:text-[#CBD5E1] my-2">{children}</p>,

    // Lists
    ul: ({ children }) => <ul className="my-2 pl-5 space-y-1 list-disc marker:text-sapphire-400 dark:marker:text-[#38bdf8] text-mist-200 dark:text-[#CBD5E1]">{children}</ul>,
    ol: ({ children }) => <ol className="my-2 pl-5 space-y-1 list-decimal marker:text-sapphire-400 dark:marker:text-[#38bdf8] text-mist-200 dark:text-[#CBD5E1]">{children}</ol>,
    li: ({ children }) => <li className="text-[0.9375rem] leading-relaxed text-mist-200 dark:text-[#CBD5E1]">{children}</li>,

    // Table with branded header row
    table: ({ children }) => (
      <div className="overflow-x-auto my-4 rounded-xl border border-sapphire-200/60 dark:border-[#1e3854] shadow-soft">
        <table className="w-full text-sm border-collapse">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-sapphire-600 dark:bg-[#162C44] text-white dark:text-[#9FE2EE]">{children}</thead>,
    tbody: ({ children }) => <tbody className="divide-y divide-sapphire-100 dark:divide-[#192e45]">{children}</tbody>,
    tr: ({ children }) => <tr className="hover:bg-frosted-100/60 dark:hover:bg-[#16273c]/50 transition-colors">{children}</tr>,
    th: ({ children }) => (
      <th className="px-4 py-2.5 text-left text-xs font-bold text-frosted-300 uppercase tracking-wider">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-2.5 text-[0.875rem] text-mist-200 dark:text-[#CBD5E1]">{children}</td>
    ),

    // Blockquote
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-sapphire-400 dark:border-[#38bdf8] pl-4 py-1 my-3 italic text-sapphire-700 dark:text-sky-200 bg-frosted-100/40 dark:bg-[#13253a]/60 rounded-r-lg">
        {children}
      </blockquote>
    ),

    // Bold / italic
    strong: ({ children }) => <strong className="font-semibold text-sapphire-900 dark:text-white">{children}</strong>,
    em: ({ children }) => <em className="italic text-mist-300 dark:text-slate-300">{children}</em>,

    // Links
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sapphire-600 dark:text-[#38bdf8] underline underline-offset-2 hover:text-sapphire-800 dark:hover:text-[#7dd3fc] transition-colors"
      >
        {children}
      </a>
    ),

    // Horizontal rule
    hr: () => <hr className="border-sapphire-200/50 dark:border-[#1e3854] my-4" />,
  };
}

// ─── Sources drawer ───────────────────────────────────────────────────────────
function SourcesDrawer({ ragContextUsed }) {
  const [open, setOpen] = useState(false);
  if (!ragContextUsed || ragContextUsed.length === 0) return null;

  return (
    <div className="pt-3 border-t border-sapphire-100 dark:border-[#1e3854] mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-xs font-semibold text-sapphire-600 dark:text-[#38bdf8] hover:text-sapphire-900 dark:hover:text-[#7dd3fc] transition-colors py-1 group/src"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>Memory Context Used ({ragContextUsed.length})</span>
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 group-hover/src:translate-y-0.5 transition-transform" />}
      </button>
      {open && (
        <div className="mt-2 space-y-1.5 animate-fadeIn">
          {ragContextUsed.map((chunk, idx) => (
            <div key={idx} className="text-xs text-mist-300 dark:text-[#94A3B8] px-3 py-2 bg-frosted-100/50 dark:bg-[#08121e] rounded-lg border border-sapphire-100 dark:border-[#192e45] leading-relaxed">
              {chunk}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main renderer ────────────────────────────────────────────────────────────
export default function AdaptiveMessageRenderer({ message, onRegenerate }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const rawText = message.text || message.structuredData?.summary || '';
  const { level: triageLevel, cleanText } = useMemo(() => extractTriage(rawText), [rawText]);

  const markdownComponents = useMemo(() => buildMarkdownComponents(onRegenerate), [onRegenerate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-start gap-3 py-3 w-full animate-fadeIn group">

      {/* Iris Logo Avatar */}
      <div className="w-8 h-8 rounded-full bg-white dark:bg-[#0f1d2e] border border-frosted-300 dark:border-[#1e3854] flex items-center justify-center shrink-0 mt-1 shadow-sm">
        <IrisLogo size={18} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-white/95 dark:bg-[#0d1b2a]/95 border border-frosted-300/60 dark:border-[#1e3854]/60 rounded-2xl rounded-tl-sm px-5 py-4 shadow-soft">

          {/* Conditional triage chip — only if marker present */}
          <TriageChip level={triageLevel} />

          {/* Adaptive Markdown body */}
          <div className="iris-markdown">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {cleanText}
            </ReactMarkdown>
          </div>

          {/* Connected Hospital Results: Mini-map + compact rows */}
          {message.hospitals && message.hospitals.length > 0 && (
            <HospitalResultsList hospitals={message.hospitals} />
          )}

          {/* Sources drawer — only if RAG context was actually retrieved */}
          <SourcesDrawer ragContextUsed={message.ragContextUsed} />

        </div>

        {/* Action bar */}
        <div className="flex items-center gap-1 mt-2 text-sapphire-700 dark:text-[#CBD5E1] font-medium opacity-90 group-hover:opacity-100 transition-opacity">

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-frosted-100 dark:hover:bg-[#16273c] hover:text-sapphire-900 dark:hover:text-white transition-colors"
            title="Copy message"
            aria-label="Copy message"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2]" />
            ) : (
              <Copy className="w-4 h-4 stroke-[1.5]" />
            )}
          </button>

          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="p-1.5 rounded-lg hover:bg-frosted-100 dark:hover:bg-[#16273c] hover:text-sapphire-900 dark:hover:text-white transition-colors"
              title="Regenerate response"
              aria-label="Regenerate response"
            >
              <RotateCcw className="w-4 h-4 stroke-[1.5]" />
            </button>
          )}

          <div className="w-px h-3.5 bg-frosted-300 dark:bg-[#1e3854] mx-1" />

          <button
            onClick={() => setFeedback(feedback === 'like' ? null : 'like')}
            className={`p-1.5 rounded-lg hover:bg-frosted-100 dark:hover:bg-[#16273c] transition-colors ${
              feedback === 'like' ? 'text-sapphire-900 dark:text-white bg-frosted-100 dark:bg-[#16273c]' : 'hover:text-sapphire-900 dark:hover:text-white'
            }`}
            title="Good response"
            aria-label="Good response"
          >
            <ThumbsUp className="w-4 h-4 stroke-[1.5]" />
          </button>

          <button
            onClick={() => setFeedback(feedback === 'dislike' ? null : 'dislike')}
            className={`p-1.5 rounded-lg hover:bg-frosted-100 dark:hover:bg-[#16273c] transition-colors ${
              feedback === 'dislike' ? 'text-red-600 bg-red-50 dark:bg-red-950/30' : 'hover:text-sapphire-900 dark:hover:text-white'
            }`}
            title="Bad response"
            aria-label="Bad response"
          >
            <ThumbsDown className="w-4 h-4 stroke-[1.5]" />
          </button>

          <span className="text-[11px] text-sapphire-600 dark:text-[#94A3B8] font-mono ml-2 font-semibold">
            {message.timestamp}
          </span>
        </div>
      </div>
    </div>
  );
}
