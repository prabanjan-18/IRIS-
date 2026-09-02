import React, { useState, useRef, useEffect } from 'react';
import { Search, X, MessageSquare, ChevronRight } from 'lucide-react';

export default function SidebarSearch({ chats = [], onSelectChat }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close panel on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    (c.lastMessagePreview && c.lastMessagePreview.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="relative" ref={containerRef}>
      {/* Search Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg text-mist-300 hover:text-mist-100 hover:bg-ink-700 transition-colors ${
          isOpen ? 'bg-ink-700 text-frosted-500' : ''
        }`}
        aria-label="Search past conversations"
      >
        <Search className="w-5 h-5 stroke-[1.5]" />
      </button>

      {/* Inline Popover / Search Panel */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-72 bg-ink-800 border border-ink-500 rounded-xl shadow-2xl z-50 p-2.5 animate-fadeIn">
          {/* Input Header */}
          <div className="relative flex items-center mb-2">
            <Search className="w-4 h-4 text-mist-300 absolute left-2.5 stroke-[1.5]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-7 py-1.5 bg-ink-900 border border-ink-500 focus:border-frosted-500 rounded-lg text-xs text-mist-100 placeholder:text-mist-300 focus:outline-none transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2 text-mist-300 hover:text-mist-100 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Results List */}
          <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
            {filteredChats.length > 0 ? (
              filteredChats.slice(0, 8).map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => {
                    onSelectChat(chat.id);
                    setIsOpen(false);
                  }}
                  className="w-full p-2 text-left rounded-lg hover:bg-ink-700 transition-colors group flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-mist-100 group-hover:text-frosted-500 truncate">
                      {chat.title}
                    </div>
                    <div className="text-[11px] text-mist-300 truncate">
                      {chat.lastMessagePreview}
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-mist-300 group-hover:text-frosted-500 shrink-0 mt-0.5" />
                </button>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-mist-300">
                <MessageSquare className="w-6 h-6 mx-auto mb-1.5 opacity-40 stroke-[1.5]" />
                No conversations found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
