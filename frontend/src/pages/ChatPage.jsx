import React, { useState, useEffect, useRef } from 'react';
import { FileText } from 'lucide-react';
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
  const [selectedModel, setSelectedModel] = useState('openrouter/free');
  const [inputText, setInputText] = useState('');
  const [cachedLocation, setCachedLocation] = useState(null);
  const messagesEndRef = useRef(null);

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
      text: text || (attachment ? `Please analyze my attached report: ${attachment.name}` : ""),
      attachment: attachment ? {
        name: attachment.name,
        size: attachment.size,
        type: attachment.type,
        detectedReportType: attachment.detectedReportType,
        pageCount: attachment.pageCount,
        wordCount: attachment.wordCount
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

      const assistantMsg = await sendMessageToBackend(
        text || (attachment ? `Please review and analyze this attached medical document / lab report: ${attachment.name}` : ""),
        updatedMessages,
        isClinicalMode,
        selectedModel,
        currentSessionId,
        cachedLocation,
        docPayload
      );
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

    </div>
  );
}
