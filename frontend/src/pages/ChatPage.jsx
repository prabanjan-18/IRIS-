import React, { useState, useEffect, useRef } from 'react';
import { FileText, Image as ImageIcon, Maximize2, X, ChevronRight, ChevronLeft, FileSpreadsheet } from 'lucide-react';
import TopBar from '../components/chat/TopBar';
import EmptyState from '../components/chat/EmptyState';
import AdaptiveMessageRenderer from '../components/chat/AdaptiveMessageRenderer';
import NearbyHospitalsCard from '../components/chat/NearbyHospitalsCard';
import ThinkingIndicator from '../components/chat/ThinkingIndicator';
import MessageComposer from '../components/chat/MessageComposer';
import DisclaimerBar from '../components/shared/DisclaimerBar';
import SymptomChips from '../components/chat/SymptomChips';
import { sendMessageToBackend } from '../services/sendMessageToBackend';
import { getUserCoordinates } from '../services/nearbyHospitalsService';
import { useArtifact } from '../context/ArtifactContext';
import { parseArtifactFromText } from '../utils/artifactParser';
import { parseLocationFromText } from '../utils/locationParser';
import { generatePDF } from '../utils/generatePDF';

export default function ChatPage({
  activeChat,
  messages,
  setMessages,
  onOpenMobileSidebar,
  onNewChat,
  isThinking: propIsThinking,
  setIsThinking: propSetIsThinking
}) {
  const [isClinicalMode, setIsClinicalMode] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [localIsThinking, setLocalIsThinking] = useState(false);
  const isThinking = propIsThinking !== undefined ? propIsThinking : localIsThinking;
  const setIsThinking = propSetIsThinking || setLocalIsThinking;
  const [selectedModel, setSelectedModel] = useState('google/gemini-3.8-flash');
  const [inputText, setInputText] = useState('');
  const [cachedLocation, setCachedLocation] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const messagesEndRef = useRef(null);

  const { artifacts, isPanelOpen, togglePanel, openPanel, addArtifact } = useArtifact();

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLightboxImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Attempt to cache browser coordinates silently if user grants access
  useEffect(() => {
    getUserCoordinates()
      .then((coords) => {
        if (coords && coords.lat && coords.lng) {
          setCachedLocation({ lat: coords.lat, lng: coords.lng });
        }
      })
      .catch(() => {
        // Ignored; location lookup falls back cleanly to city text extraction
      });
  }, []);

  // Auto scroll to bottom when new message arrives
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSendMessage = async (text, attachment) => {
    if (!text && !attachment) return;

    // Add User Message
    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: text || (attachment?.dataUrl ? `Please analyze this uploaded image/screenshot: ${attachment.name}` : (attachment ? `Please analyze my attached report: ${attachment.name}` : "")),
      attachment: attachment ? {
        name: attachment.name,
        size: attachment.size,
        type: attachment.type,
        detectedReportType: attachment.detectedReportType,
        pageCount: attachment.pageCount,
        wordCount: attachment.wordCount,
        isImage: !!attachment.dataUrl,
        dataUrl: attachment.dataUrl,
        fileType: attachment.fileType
      } : null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    // Trigger AI thinking state
    setIsThinking(true);

    try {
      const currentSessionId = activeChat?.id || "iris-default-session";
      const docPayload = attachment && attachment.extractedText ? {
        filename: attachment.name,
        fileType: attachment.type,
        extractedText: attachment.extractedText,
        detectedReportType: attachment.detectedReportType,
        pageCount: attachment.pageCount,
        wordCount: attachment.wordCount
      } : null;

      const imagePayload = attachment && attachment.dataUrl ? {
        filename: attachment.name,
        fileType: attachment.fileType || 'image/png',
        dataUrl: attachment.dataUrl
      } : null;

      const defaultPrompt = attachment?.dataUrl
        ? `Please carefully inspect and analyze this uploaded screenshot/image (${attachment.name}). Detail your observations, clinical interpretations, and recommendations.`
        : (attachment ? `Please review and analyze this attached medical document / lab report: ${attachment.name}` : "");

      const assistantMsg = await sendMessageToBackend(
        text || defaultPrompt,
        updatedMessages,
        isClinicalMode,
        selectedModel,
        currentSessionId,
        cachedLocation,
        docPayload,
        imagePayload
      );

      // Parse location intent markers
      let rawText = assistantMsg.text || assistantMsg.reply || "";
      const { locationIntent, cleanText: textWithoutLocation } = parseLocationFromText(rawText);
      if (locationIntent) {
        assistantMsg.locationIntent = locationIntent;
        rawText = textWithoutLocation;
        assistantMsg.text = textWithoutLocation;
        assistantMsg.reply = textWithoutLocation;
      }

      // Parse and register any generated clinical report or table artifact
      const { artifact, cleanText } = parseArtifactFromText(rawText);
      if (artifact) {
        addArtifact(artifact);
        assistantMsg.artifact = artifact;
        if (cleanText) {
          assistantMsg.text = cleanText;
          assistantMsg.reply = cleanText;
        }
        if (artifact.type === 'pdf') {
          setTimeout(() => {
            generatePDF(artifact.title, 'iris-artifact-content').catch(console.error);
          }, 900);
        }
      }

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Error generating response:", error);
    } finally {
      setIsThinking(false);
    }
  };

  const handleRegenerate = async (msgId) => {
    const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user');
    if (!lastUserMsg) return;

    setIsThinking(true);
    try {
      const currentSessionId = activeChat?.id || "iris-default-session";
      const assistantMsg = await sendMessageToBackend(
        lastUserMsg.text,
        messages,
        isClinicalMode,
        selectedModel,
        currentSessionId,
        cachedLocation
      );

      let rawText = assistantMsg.text || assistantMsg.reply || "";
      const { locationIntent, cleanText: textWithoutLocation } = parseLocationFromText(rawText);
      if (locationIntent) {
        assistantMsg.locationIntent = locationIntent;
        rawText = textWithoutLocation;
        assistantMsg.text = textWithoutLocation;
        assistantMsg.reply = textWithoutLocation;
      }

      const { artifact, cleanText } = parseArtifactFromText(rawText);
      if (artifact) {
        addArtifact(artifact);
        assistantMsg.artifact = artifact;
        if (cleanText) {
          assistantMsg.text = cleanText;
          assistantMsg.reply = cleanText;
        }
      }

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Error regenerating response:", error);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSelectSymptom = (symptomLabel) => {
    setInputText((prev) => (prev ? `${prev}, ${symptomLabel}` : `I'm experiencing ${symptomLabel}.`));
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-transparent overflow-hidden relative font-sans">
      
      {/* Pinned Collapse/Expand Toggle for Artifact Panel */}
      {artifacts.length > 0 && (
        <button
          onClick={togglePanel}
          className="fixed top-3 right-4 z-30 lg:absolute lg:top-3 lg:right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#162326]/90 hover:bg-[#1E3036] border border-[#2A3B3F] hover:border-[#9FE2EE]/50 text-[#9FE2EE] text-xs font-semibold shadow-lg backdrop-blur-md transition-all cursor-pointer group/toggle"
          title={isPanelOpen ? "Hide Report Panel" : "View Generated Report"}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-[#9FE2EE]" />
          <span className="hidden sm:inline font-mono">
            {isPanelOpen ? "Hide Report" : "View Report"}
          </span>
          {isPanelOpen ? (
            <ChevronRight className="w-3.5 h-3.5 stroke-[2] transition-transform group-hover/toggle:translate-x-0.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 stroke-[2] transition-transform group-hover/toggle:-translate-x-0.5" />
          )}
        </button>
      )}
      
      {/* Top Header Bar */}
      <TopBar
        onOpenMobileSidebar={onOpenMobileSidebar}
        isThinking={isThinking}
      />

      {/* Main Scrollable Canvas */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 flex flex-col">
        {messages.length === 0 ? (
          <EmptyState
            onSelectSuggestion={(prompt) => {
              setInputText(prompt);
            }}
            onSelectSymptom={handleSelectSymptom}
          />
        ) : (
          <div className="max-w-4xl mx-auto w-full space-y-6 flex-1">
            
            {/* Active Chat Title Badge Header */}
            {activeChat && (
              <div className="text-center py-2 border-b border-frosted-300/40 dark:border-[#1e3854]/40 mb-6">
                <h2 className="font-display text-sm font-bold text-sapphire-900 dark:text-[#F1F7FB]">
                  {activeChat.title}
                </h2>
                <span className="text-[10px] text-sapphire-600 dark:text-slate-300 font-mono font-medium">
                  {activeChat.date || "Active Session"}
                </span>
              </div>
            )}

            {/* Conversation Stream */}
            {messages.map((msg) => {
              if (msg.sender === "user") {
                return (
                  <div key={msg.id} className="flex justify-end my-4 animate-fadeIn">
                    <div className="max-w-xl bg-white/95 dark:bg-[#14263b]/95 text-sapphire-950 dark:text-[#F1F7FB] border border-frosted-300 dark:border-[#223d5d] rounded-2xl rounded-tr-xs px-4 py-3 text-sm md:text-base leading-relaxed shadow-soft font-sans backdrop-blur-sm">
                      {msg.attachment && (
                        msg.attachment.dataUrl ? (
                          <div className="mb-3 rounded-2xl overflow-hidden bg-slate-900/60 dark:bg-[#08121e] border border-frosted-300/80 dark:border-[#1e3854] shadow-md group/img">
                            <div 
                              className="relative cursor-pointer max-h-80 overflow-hidden bg-slate-950/40 flex items-center justify-center p-1"
                              onClick={() => setLightboxImage({ url: msg.attachment.dataUrl, name: msg.attachment.name })}
                              title="Click to zoom image"
                            >
                              <img 
                                src={msg.attachment.dataUrl} 
                                alt={msg.attachment.name || "Screenshot"} 
                                className="w-full max-h-80 object-contain rounded-xl hover:scale-[1.02] transition-transform duration-200"
                              />
                              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-medium text-xs backdrop-blur-xs">
                                <Maximize2 className="w-4 h-4 text-[#38bdf8]" />
                                <span>Click to view full image</span>
                              </div>
                            </div>
                            <div className="p-2.5 bg-frosted-100/90 dark:bg-[#0c1622]/95 border-t border-frosted-200 dark:border-[#1e3854] flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
                                  <ImageIcon className="w-3.5 h-3.5" />
                                </span>
                                <span className="text-xs font-semibold text-sapphire-900 dark:text-[#F1F7FB] truncate">
                                  {msg.attachment.name}
                                </span>
                                {msg.attachment.size && (
                                  <span className="text-[10px] text-sapphire-500 dark:text-[#82A8D2] font-mono">
                                    ({msg.attachment.size})
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => setLightboxImage({ url: msg.attachment.dataUrl, name: msg.attachment.name })}
                                className="text-[11px] text-sapphire-700 dark:text-[#38bdf8] hover:underline font-semibold shrink-0"
                              >
                                View full size
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-2.5 p-2.5 rounded-xl bg-frosted-100/70 dark:bg-[#0c1622]/90 border border-frosted-300 dark:border-[#1e3854] flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-sapphire-800 dark:bg-[#254E7A] text-white flex items-center justify-center shrink-0 shadow-soft">
                              <FileText className="w-4 h-4 text-sky-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-sapphire-900 dark:text-[#F1F7FB] truncate">
                                {msg.attachment.name}
                              </div>
                              <div className="text-[10px] text-sapphire-600 dark:text-[#82A8D2] font-mono flex items-center gap-1.5 mt-0.5">
                                <span className="font-semibold px-1.5 py-0.2 rounded bg-sapphire-100 dark:bg-[#16273c] text-sapphire-800 dark:text-[#38bdf8]">
                                  {msg.attachment.detectedReportType || msg.attachment.type || "Lab Document"}
                                </span>
                                {msg.attachment.pageCount && <span>• {msg.attachment.pageCount} pg</span>}
                                {msg.attachment.size && <span>• {msg.attachment.size}</span>}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                      <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                      <div className="text-[10px] text-sapphire-500 dark:text-slate-300 text-right mt-1.5 font-mono font-medium">
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              }

              // Route to NearbyHospitalsCard for hospital/location queries
              if (msg.responseType === "location_request") {
                return (
                  <NearbyHospitalsCard
                    key={msg.id}
                    message={msg}
                  />
                );
              }

              // All other assistant messages (medical + conversation) → AdaptiveMessageRenderer
              return (
                <AdaptiveMessageRenderer
                  key={msg.id}
                  message={msg}
                  onRegenerate={() => handleRegenerate(msg.id)}
                />
              );
            })}

            {/* Pulsing Loading State */}
            {isThinking && <ThinkingIndicator />}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Symptom Chips in Active View */}
      {messages.length > 0 && (
        <div className="max-w-4xl mx-auto w-full px-4 mb-1">
          <SymptomChips onSelectSymptom={handleSelectSymptom} />
        </div>
      )}

      {/* Bottom Composer & Safety Disclaimer Footer */}
      <div className="w-full shrink-0 bg-transparent pt-1">
        <MessageComposer
          onSendMessage={handleSendMessage}
          isThinkingMode={isThinkingMode}
          setIsThinkingMode={setIsThinkingMode}
          inputText={inputText}
          setInputText={setInputText}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />
        <div className="mt-2">
          <DisclaimerBar />
        </div>
      </div>

      {/* Fullscreen High-Resolution Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fadeIn"
          onClick={() => setLightboxImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="relative max-w-5xl w-full max-h-[92vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="w-full flex items-center justify-between pb-3 text-white px-2">
              <div className="flex items-center gap-2 min-w-0">
                <ImageIcon className="w-4 h-4 text-[#38bdf8] shrink-0" />
                <span className="text-sm font-semibold truncate max-w-lg text-[#F1F7FB]">
                  {lightboxImage.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Close viewer (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Viewport */}
            <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/60 shadow-2xl flex items-center justify-center max-h-[82vh] w-full p-2">
              <img 
                src={lightboxImage.url} 
                alt={lightboxImage.name || "Enlarged image"} 
                className="max-h-[78vh] max-w-full object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
