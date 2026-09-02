import React, { useState, useRef, useEffect } from 'react';
import { Plus, ArrowUp, Mic, Brain, Paperclip, X, FileText, Image, Camera, Check } from 'lucide-react';
import ModelSelector from './ModelSelector';

export default function MessageComposer({ onSendMessage, isThinkingMode, setIsThinkingMode, inputText, setInputText, selectedModel, setSelectedModel }) {
  const [attachment, setAttachment] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);

  const textareaRef = useRef(null);
  const docInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const attachMenuRef = useRef(null);

  // Auto-resize textarea height as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  // Close attachment menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target)) {
        setIsAttachMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachment) return;

    onSendMessage(inputText.trim(), attachment);
    setInputText('');
    setAttachment(null);
    setIsAttachMenuOpen(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleDocChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: 'Lab Document',
        icon: FileText
      });
      setIsAttachMenuOpen(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: 'Medical Image',
        icon: Image
      });
      setIsAttachMenuOpen(false);
    }
  };

  const handleCameraChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment({
        name: file.name || 'camera_photo.jpg',
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: 'Camera Photo',
        icon: Camera
      });
      setIsAttachMenuOpen(false);
    }
  };

  const toggleMic = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setInputText((prev) => prev + (prev ? " " : "") + "Experiencing fever and mild cough...");
    }
  };

  const AttachmentIcon = attachment?.icon || Paperclip;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 font-sans">
      
      {/* File Attachment Pill */}
      {attachment && (
        <div className="mb-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-frosted-300 text-xs text-sapphire-900 shadow-soft animate-fadeIn">
          <AttachmentIcon className="w-4 h-4 text-sapphire-600 shrink-0" />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-sapphire-100 text-sapphire-900 font-mono font-bold uppercase">
              {attachment.type}
            </span>
            <span className="font-semibold truncate max-w-xs">{attachment.name}</span>
            <span className="text-[10px] text-sapphire-500 font-mono">({attachment.size})</span>
          </div>
          <button 
            onClick={() => setAttachment(null)}
            className="text-sapphire-500 hover:text-sapphire-900 ml-1 p-0.5 rounded-full hover:bg-frosted-100 transition-colors"
            title="Remove attachment"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Form Composer Container */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-white/95 border border-frosted-300/80 rounded-3xl shadow-card-glow focus-within:border-sapphire-500 transition-all p-2 flex flex-col gap-2 backdrop-blur-md"
      >
        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={docInputRef}
          onChange={handleDocChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt"
        />
        <input
          type="file"
          ref={imageInputRef}
          onChange={handleImageChange}
          className="hidden"
          accept="image/*"
        />
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleCameraChange}
          className="hidden"
          accept="image/*"
          capture="environment"
        />

        {/* Text Area Row */}
        <div className="flex items-start gap-2 px-2 pt-1">
          
          {/* Plus Attach Button with Popover Menu */}
          <div className="relative shrink-0 mt-0.5" ref={attachMenuRef}>
            <button
              type="button"
              onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
              className={`p-2 rounded-full transition-colors ${
                isAttachMenuOpen
                  ? 'bg-sapphire-800 text-white shadow-soft'
                  : 'text-sapphire-600 hover:text-sapphire-900 hover:bg-frosted-100'
              }`}
              title="Add attachment (Lab Report or Image)"
              aria-label="Add attachment options"
            >
              <Plus className={`w-5 h-5 transition-transform duration-200 ${isAttachMenuOpen ? 'rotate-45' : ''}`} />
            </button>

            {/* Attachments Popover Menu */}
            {isAttachMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2.5 w-64 md:w-72 rounded-2xl bg-white border border-frosted-300 shadow-2xl backdrop-blur-xl z-50 p-2 space-y-1 animate-fadeIn">
                <div className="px-2 py-1.5 border-b border-frosted-200 text-[11px] font-bold text-sapphire-900 uppercase tracking-wider">
                  Add Medical Context
                </div>

                {/* Option 1: Lab Document */}
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left hover:bg-frosted-100 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-sapphire-100 text-sapphire-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-sapphire-900">Lab Document / PDF</div>
                    <div className="text-[11px] text-sapphire-600 font-medium">Blood test, lab report, prescription</div>
                  </div>
                </button>

                {/* Option 2: Medical Image */}
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left hover:bg-frosted-100 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Image className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-sapphire-900">Medical Image / Photo</div>
                    <div className="text-[11px] text-sapphire-600 font-medium">Skin rash, scan, symptom photo</div>
                  </div>
                </button>

                {/* Option 3: Camera Capture */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left hover:bg-frosted-100 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Camera className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-sapphire-900">Take Photo</div>
                    <div className="text-[11px] text-sapphire-600 font-medium">Snap photo with device camera</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Flexible Textarea Input */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your symptoms or ask a health question..."
            className="flex-1 bg-transparent text-sapphire-900 placeholder:text-sapphire-400 font-medium text-sm md:text-base focus:outline-none resize-none py-1.5 px-1 max-h-44 scrollbar-thin"
          />
        </div>

        {/* Controls Toolbar Row */}
        <div className="flex items-center justify-between px-2 pt-1 border-t border-frosted-300/40 flex-wrap gap-2">
          
          {/* Left Toolbar: Reasoning Toggle & Model Selector */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsThinkingMode(!isThinkingMode)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
                isThinkingMode
                  ? 'bg-sapphire-100 border-sapphire-400 text-sapphire-900'
                  : 'bg-frosted-100/60 border-frosted-300 text-sapphire-700 hover:text-sapphire-900'
              }`}
              title="Enable multi-step clinical reasoning model"
            >
              <Brain className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Reasoning</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isThinkingMode ? 'bg-sapphire-700' : 'bg-sapphire-400'}`} />
            </button>

            {/* Model Switching Dropdown inside Prompt Input Area */}
            <ModelSelector
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              dropUp={true}
            />
          </div>

          {/* Right: Mic & Circular Send Button */}
          <div className="flex items-center gap-2">
            
            {/* Speech Mic Button */}
            <button
              type="button"
              onClick={toggleMic}
              className={`p-2 rounded-full transition-colors ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'text-sapphire-600 hover:text-sapphire-900 hover:bg-frosted-100'
              }`}
              title={isRecording ? "Stop dictation" : "Dictate symptoms"}
              aria-label="Voice input"
            >
              <Mic className="w-4 h-4 stroke-[1.5]" />
            </button>

            {/* Circular Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() && !attachment}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                inputText.trim() || attachment
                  ? 'bg-sapphire-800 text-white hover:bg-sapphire-900 hover:scale-105 active:scale-95 shadow-soft'
                  : 'bg-frosted-300/60 text-sapphire-400 cursor-not-allowed opacity-50'
              }`}
              aria-label="Send message"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>

          </div>
        </div>

      </form>
    </div>
  );
}
