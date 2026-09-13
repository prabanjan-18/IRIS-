import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, MoreHorizontal, Edit2, Trash2, MessageSquare } from 'lucide-react';

export default function ChatList({ chats = [], activeChatId, onSelectChat, onRenameChat, onDeleteChat }) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [openKebabId, setOpenKebabId] = useState(null);

  const displayChats = chats.slice(0, 15);
  const hasMoreThan15 = chats.length > 15;

  const handleStartRename = (e, chat) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
    setOpenKebabId(null);
  };

  const handleSaveRename = (chatId) => {
    if (editTitle.trim()) {
      onRenameChat(chatId, editTitle.trim());
    }
    setEditingChatId(null);
  };

  const handleDelete = (e, chatId) => {
    e.stopPropagation();
    onDeleteChat(chatId);
    setOpenKebabId(null);
  };

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col">
      {/* Section Header with Hover Chevron */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-2 py-1.5 flex items-center justify-between group text-mist-300 dark:text-[#82A8D2] hover:text-mist-100 dark:hover:text-white transition-colors"
      >
        <span className="text-xs font-medium uppercase tracking-wider font-sans">
          Chats
        </span>
        {/* Chevron fades in on hover */}
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 stroke-[1.5]" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 stroke-[1.5]" />
          )}
        </span>
      </button>

      {/* Expanded List Container */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto pr-1 space-y-0.5 mt-1 font-sans">
          {displayChats.length > 0 ? (
            displayChats.map((chat) => {
              const isActive = chat.id === activeChatId;
              const isEditing = editingChatId === chat.id;
              const isKebabOpen = openKebabId === chat.id;

              return (
                <div
                  key={chat.id}
                  onClick={() => !isEditing && onSelectChat(chat.id)}
                  className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-all ${
                    isActive
                      ? 'bg-ink-600/90 dark:bg-[#14283f] text-frosted-500 dark:text-[#38bdf8] font-medium border-l-2 border-frosted-500 dark:border-[#38bdf8]'
                      : 'text-mist-100 dark:text-[#CBD5E1] hover:bg-ink-700/70 dark:hover:bg-[#102236]/70 hover:text-mist-100 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 stroke-[1.5] ${
                      isActive ? 'text-frosted-500 dark:text-[#38bdf8]' : 'text-mist-300 dark:text-[#64748B]'
                    }`} />
                    
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => handleSaveRename(chat.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(chat.id);
                          if (e.key === 'Escape') setEditingChatId(null);
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-ink-900 dark:bg-[#0a1420] border border-frosted-500 dark:border-[#38bdf8] text-mist-100 dark:text-[#F1F7FB] px-1.5 py-0.5 rounded text-xs focus:outline-none"
                      />
                    ) : (
                      <span className="truncate">{chat.title}</span>
                    )}
                  </div>

                  {/* Kebab Action Menu on Hover */}
                  {!isEditing && (
                    <div className="relative shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenKebabId(isKebabOpen ? null : chat.id);
                        }}
                        className={`p-1 rounded hover:bg-ink-500 dark:hover:bg-[#1e3854] text-mist-300 dark:text-[#82A8D2] hover:text-mist-100 dark:hover:text-white transition-opacity ${
                          isKebabOpen || isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                        aria-label="Conversation Options"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.5]" />
                      </button>

                      {/* Dropdown Options */}
                      {isKebabOpen && (
                        <div 
                          className="absolute right-0 top-full mt-1 w-32 bg-ink-800 dark:bg-[#0c1622] border border-ink-500 dark:border-[#1e344d] rounded-lg shadow-xl z-50 py-1 text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => handleStartRename(e, chat)}
                            className="w-full px-2.5 py-1.5 text-left flex items-center gap-2 hover:bg-ink-600 dark:hover:bg-[#16273c] text-mist-100 dark:text-[#EAF6F7] hover:text-frosted-500 dark:hover:text-[#38bdf8]"
                          >
                            <Edit2 className="w-3 h-3 text-mist-300 dark:text-[#82A8D2] stroke-[1.5]" />
                            Rename
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, chat.id)}
                            className="w-full px-2.5 py-1.5 text-left flex items-center gap-2 hover:bg-ink-600 dark:hover:bg-[#16273c] text-triage-urgent dark:text-red-400"
                          >
                            <Trash2 className="w-3 h-3 text-triage-urgent dark:text-red-400 stroke-[1.5]" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-2 py-4 text-xs text-mist-300 dark:text-slate-400 text-center italic">
              No conversations yet
            </div>
          )}

          {/* View All Conversations Pagination Trigger */}
          {hasMoreThan15 && (
            <button
              onClick={() => navigate('/conversations')}
              className="w-full mt-2 py-2 px-3 text-left text-xs font-medium text-frosted-500 dark:text-[#38bdf8] hover:text-frosted-300 dark:hover:text-[#7dd3fc] hover:bg-ink-700/50 dark:hover:bg-[#102236]/60 rounded-lg flex items-center justify-between transition-colors group"
            >
              <span>View all conversations ({chats.length})</span>
              <ChevronRight className="w-3.5 h-3.5 text-frosted-500 dark:text-[#38bdf8] group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
