import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  FileDown, FileText, Copy, Check, Maximize2, Minimize2,
  X, ChevronRight, Table, FileSpreadsheet, Sparkles
} from 'lucide-react';
import { useArtifact } from '../../context/ArtifactContext';
import { generatePDF } from '../../utils/generatePDF';
import { downloadMarkdown } from '../../utils/downloadMarkdown';

export default function ArtifactPanel() {
  const {
    artifacts,
    activeArtifactId,
    currentArtifact,
    isPanelOpen,
    isFullscreen,
    setActiveArtifact,
    removeArtifact,
    closePanel,
    toggleFullscreen
  } = useArtifact();

  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!isPanelOpen) return null;

  const handleCopy = async () => {
    if (!currentArtifact?.markdown) return;
    try {
      await navigator.clipboard.writeText(currentArtifact.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy artifact content:', err);
    }
  };

  const handleDownloadPdf = async () => {
    if (!currentArtifact || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      await generatePDF(currentArtifact.title, 'iris-artifact-content');
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadMd = () => {
    if (!currentArtifact?.markdown) return;
    downloadMarkdown(currentArtifact.title, currentArtifact.markdown);
  };

  // Base panel layout classes
  const panelClasses = isFullscreen
    ? "fixed inset-0 z-50 w-screen h-screen bg-[#121E21] flex flex-col shadow-2xl animate-fadeIn"
    : "fixed inset-0 z-40 lg:relative lg:inset-auto lg:z-10 w-full lg:w-[420px] shrink-0 bg-[#121E21] border-l border-[#2A3B3F] flex flex-col h-full shadow-2xl lg:shadow-none transition-all duration-300 animate-slideLeft";

  return (
    <aside className={panelClasses} aria-label="Clinical Artifact Panel">
      
      {/* ─── Panel Header ────────────────────────────────────────────── */}
      <div className="h-14 border-b border-[#2A3B3F] px-4 flex items-center justify-between shrink-0 bg-[#0F1A1C]/80 backdrop-blur-md">
        
        {/* Title & Type Badge */}
        <div className="flex items-center gap-2 min-w-0 pr-2">
          {currentArtifact?.type === 'table' ? (
            <Table className="w-4 h-4 text-[#9FE2EE] shrink-0" />
          ) : (
            <FileSpreadsheet className="w-4 h-4 text-[#9FE2EE] shrink-0" />
          )}
          <h3
            className="font-serif font-bold text-sm text-[#EAF6F7] truncate max-w-[180px] lg:max-w-[200px]"
            title={currentArtifact?.title}
          >
            {currentArtifact?.title || 'Report & Clinical Artifact'}
          </h3>
        </div>

        {/* Action Row */}
        <div className="flex items-center gap-1 text-[#8CA3A8]">
          
          {/* Download PDF */}
          <button
            onClick={handleDownloadPdf}
            disabled={!currentArtifact || isGeneratingPdf}
            className="p-1.5 rounded-lg hover:bg-[#1C2C30] hover:text-[#9FE2EE] transition-colors cursor-pointer disabled:opacity-40"
            title="Download PDF Document"
            aria-label="Download PDF Document"
          >
            {isGeneratingPdf ? (
              <span className="w-4 h-4 rounded-full border-2 border-[#9FE2EE] border-t-transparent animate-spin inline-block" />
            ) : (
              <FileDown className="w-4 h-4 stroke-[1.7]" />
            )}
          </button>

          {/* Download Markdown */}
          <button
            onClick={handleDownloadMd}
            disabled={!currentArtifact}
            className="p-1.5 rounded-lg hover:bg-[#1C2C30] hover:text-[#9FE2EE] transition-colors cursor-pointer disabled:opacity-40"
            title="Download Raw Markdown (.md)"
            aria-label="Download Raw Markdown"
          >
            <FileText className="w-4 h-4 stroke-[1.7]" />
          </button>

          {/* Copy to Clipboard */}
          <button
            onClick={handleCopy}
            disabled={!currentArtifact}
            className="p-1.5 rounded-lg hover:bg-[#1C2C30] hover:text-[#9FE2EE] transition-colors cursor-pointer disabled:opacity-40"
            title={copied ? "Copied!" : "Copy content to clipboard"}
            aria-label="Copy content"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400 stroke-[2]" />
            ) : (
              <Copy className="w-4 h-4 stroke-[1.7]" />
            )}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg hover:bg-[#1C2C30] hover:text-[#9FE2EE] transition-colors cursor-pointer hidden lg:flex"
            title={isFullscreen ? "Exit Fullscreen" : "Open in Fullscreen"}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Open in Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 stroke-[1.7]" />
            ) : (
              <Maximize2 className="w-4 h-4 stroke-[1.7]" />
            )}
          </button>

          {/* Close Panel Button */}
          <button
            onClick={closePanel}
            className="p-1.5 rounded-lg hover:bg-red-950/40 hover:text-red-300 text-[#8CA3A8] transition-colors cursor-pointer ml-1"
            title="Close Panel"
            aria-label="Close Panel"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>

        </div>
      </div>

      {/* ─── Multi-Artifact Session Tabs ─────────────────────────────── */}
      {artifacts.length > 1 && (
        <div className="px-4 py-2 border-b border-[#2A3B3F] bg-[#0D1618] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {artifacts.map((art) => {
            const isActive = art.id === activeArtifactId;
            return (
              <div
                key={art.id}
                className={`group/tab flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#9FE2EE]/15 text-[#9FE2EE] border border-[#9FE2EE]/40 font-semibold"
                    : "bg-[#162326] text-[#8CA3A8] border border-[#2A3B3F] hover:text-[#EAF6F7] hover:border-[#3E5358]"
                }`}
                onClick={() => setActiveArtifact(art.id)}
                title={art.title}
              >
                <span className="truncate max-w-[120px]">
                  {art.title}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeArtifact(art.id);
                  }}
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 hover:text-red-300 hover:bg-red-950/50 transition-opacity"
                  title="Remove artifact"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Content Area (Scrollable Markdown Canvas) ───────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">
        {currentArtifact ? (
          <div
            id="iris-artifact-content"
            className="w-full text-[#CBD5E1] text-sm leading-[1.75] font-sans space-y-4"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="font-serif font-bold text-2xl text-[#EAF6F7] mt-2 mb-4 border-b border-[#2A3B3F] pb-2 tracking-tight">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="font-serif font-bold text-lg text-[#EAF6F7] mt-6 mb-3 tracking-tight">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="font-serif font-semibold text-base text-[#9FE2EE] mt-5 mb-2">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-3 text-[#CBD5E1] leading-[1.75]">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-1.5 mb-4 text-[#CBD5E1] pl-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-1.5 mb-4 text-[#CBD5E1] pl-1">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-[#CBD5E1] leading-relaxed">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-[#EAF6F7]">{children}</strong>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-[#38BDF8] bg-[#162326] px-4 py-3 rounded-r-xl my-4 text-[#BAE6FD] text-xs leading-relaxed italic shadow-xs">
                    {children}
                  </blockquote>
                ),
                // Clinical Data Grid Table Styling
                table: ({ children }) => (
                  <div className="w-full overflow-x-auto my-4 rounded-xl border border-[#2A3B3F] shadow-md bg-[#101A1D]">
                    <table className="w-full text-left border-collapse text-xs">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-[#1B2E33] border-b border-[#2A3B3F] text-[#9FE2EE] font-semibold uppercase tracking-wider text-[11px]">
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-[#2A3B3F]/60">
                    {children}
                  </tbody>
                ),
                tr: ({ children }) => (
                  <tr className="odd:bg-[#162326] even:bg-[#101A1D] hover:bg-[#1E3036]/60 transition-colors">
                    {children}
                  </tr>
                ),
                th: ({ children }) => (
                  <th className="px-3.5 py-2.5 font-semibold text-[#9FE2EE] border-r border-[#2A3B3F]/40 last:border-r-0">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-3.5 py-2.5 text-[#EAF6F7] border-r border-[#2A3B3F]/30 last:border-r-0">
                    {children}
                  </td>
                ),
                code: ({ inline, children }) => {
                  if (inline) {
                    return (
                      <code className="px-1.5 py-0.5 rounded bg-[#101A1D] text-[#9FE2EE] font-mono text-xs border border-[#2A3B3F]">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <pre className="p-3.5 rounded-xl bg-[#0B1416] border border-[#2A3B3F] text-xs font-mono text-[#EAF6F7] overflow-x-auto my-3">
                      <code>{children}</code>
                    </pre>
                  );
                }
              }}
            >
              {currentArtifact.markdown}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-[#8CA3A8] space-y-3 px-4">
            <Sparkles className="w-8 h-8 text-[#9FE2EE]/60" />
            <p className="text-sm font-medium text-[#EAF6F7]">No Active Report</p>
            <p className="text-xs text-[#8CA3A8] max-w-xs">
              Ask Iris to generate a clinical report, comparison table, or symptom summary to view it here.
            </p>
          </div>
        )}
      </div>

      {/* ─── Bottom Download Bar ──────────────────────────────────── */}
      {currentArtifact && (
        <div className="px-4 py-3 border-t border-[#2A3B3F] bg-[#0F1A1C]/90 space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#9FE2EE]/10 hover:bg-[#9FE2EE]/20 border border-[#9FE2EE]/30 hover:border-[#9FE2EE]/60 text-[#9FE2EE] text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Download as PDF — choose save location"
            >
              {isGeneratingPdf ? (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-[#9FE2EE] border-t-transparent animate-spin inline-block" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span>{isGeneratingPdf ? 'Generating…' : 'Download PDF'}</span>
            </button>
            <button
              onClick={handleDownloadMd}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#162326] hover:bg-[#1E3036] border border-[#2A3B3F] hover:border-[#9FE2EE]/40 text-[#EAF6F7] text-xs font-semibold transition-all cursor-pointer"
              title="Download as Markdown — choose save location"
            >
              <FileText className="w-3.5 h-3.5 text-[#9FE2EE]" />
              <span>Download .md</span>
            </button>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#8CA3A8] font-mono">
            <span className="truncate max-w-[200px]">{currentArtifact.title}</span>
            <span className="text-[#9FE2EE]">Ready to Export</span>
          </div>
        </div>
      )}
      {!currentArtifact && (
        <div className="px-4 py-2.5 border-t border-[#2A3B3F] bg-[#0F1A1C]/90 text-[11px] text-[#8CA3A8] flex items-center justify-center font-mono">
          No report loaded
        </div>
      )}

    </aside>
  );
}
