import React, { useState, useEffect, useRef } from 'react';
import TopBar from '../components/chat/TopBar';
import EmptyState from '../components/chat/EmptyState';
import StructuredHealthCard from '../components/chat/StructuredHealthCard';
import ThinkingIndicator from '../components/chat/ThinkingIndicator';
import MessageComposer from '../components/chat/MessageComposer';
import DisclaimerBar from '../components/shared/DisclaimerBar';
import SymptomChips from '../components/chat/SymptomChips';
import { sendMessageToBackend } from '../services/sendMessageToBackend';

export default function ChatPage({
  activeChat,
  messages,
  setMessages,
  onOpenMobileSidebar,
  onNewChat
}) {
  const [isClinicalMode, setIsClinicalMode] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openrouter/free');
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

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
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    // Trigger AI thinking state
    setIsThinking(true);

    try {
      // Call service backend API with selectedModel and session ID
      const currentSessionId = activeChat?.id || "iris-default-session";
      const assistantMsg = await sendMessageToBackend(text, updatedMessages, isClinicalMode, selectedModel, currentSessionId);
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
      const assistantMsg = await sendMessageToBackend(lastUserMsg.text, messages, isClinicalMode, selectedModel, currentSessionId);
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
              <div className="text-center py-2 border-b border-frosted-300/40 mb-6">
                <h2 className="font-display text-sm font-bold text-sapphire-900">
                  {activeChat.title}
                </h2>
                <span className="text-[10px] text-sapphire-600 font-mono font-semibold">
                  {activeChat.date || "Active Session"}
                </span>
              </div>
            )}

            {/* Conversation Stream */}
            {messages.map((msg) => {
              if (msg.sender === "user") {
                return (
                  <div key={msg.id} className="flex justify-end my-4 animate-fadeIn">
                    <div className="max-w-xl bg-white/95 text-sapphire-950 border border-frosted-300 rounded-2xl rounded-tr-xs px-4 py-3 text-sm md:text-base leading-relaxed shadow-soft font-sans backdrop-blur-sm">
                      <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                      <div className="text-[10px] text-sapphire-500 text-right mt-1.5 font-mono font-medium">
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <StructuredHealthCard
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
