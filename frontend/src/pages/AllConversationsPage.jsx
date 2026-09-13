import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, MessageSquare, Trash2, Calendar, Tag, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import IrisLogo from '../components/shared/IrisLogo';

export default function AllConversationsPage({ chats = [], onSelectChat, onDeleteChat }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filtered chats list
  const filteredChats = chats.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.lastMessagePreview && c.lastMessagePreview.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || c.triage === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'All Conversations' },
    { id: 'self', label: 'Self-Care 🟢' },
    { id: 'caution', label: 'Caution 🟡' },
    { id: 'urgent', label: 'Urgent 🔴' },
  ];

  const handleOpenChat = (chatId) => {
    onSelectChat(chatId);
    navigate('/');
  };

  const getTriageBadge = (triage) => {
    if (triage === 'urgent') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-300">
          <AlertCircle className="w-3 h-3 stroke-[2]" /> Urgent
        </span>
      );
    }
    if (triage === 'caution') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <AlertTriangle className="w-3 h-3 stroke-[2]" /> Caution
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
        <CheckCircle2 className="w-3 h-3 stroke-[2]" /> Self-Care
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-transparent overflow-y-auto text-sapphire-900 dark:text-[#F1F7FB] font-sans">
      
      {/* Header Bar */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#0a1420]/85 backdrop-blur-md border-b border-frosted-300/40 dark:border-[#192e45]/60 px-6 py-4 flex items-center justify-between shadow-soft">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#132337] hover:bg-frosted-100 dark:hover:bg-[#16273c] border border-frosted-300 dark:border-[#1e3854] text-sapphire-900 dark:text-[#F1F7FB] font-bold text-xs transition-all group shadow-soft"
          >
            <ArrowLeft className="w-4 h-4 text-sapphire-700 dark:text-[#38bdf8] group-hover:-translate-x-1 transition-transform" />
            <span>Back to chat</span>
          </button>

          <div className="flex items-center gap-2.5">
            <IrisLogo size={24} />
            <h1 className="font-display text-xl font-bold tracking-tight text-sapphire-900 dark:text-[#F1F7FB]">
              All Consultation History
            </h1>
          </div>
        </div>

        <div className="text-xs text-sapphire-700 dark:text-[#82A8D2] font-mono font-semibold hidden sm:block">
          Total Archive: {chats.length} conversations
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto w-full px-6 py-8 flex-1">
        
        {/* Search & Category Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          
          {/* Live Search Bar */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-sapphire-500 dark:text-[#82A8D2] absolute left-3.5 top-3 stroke-[1.5]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, symptom, or preview..."
              className="w-full pl-10 pr-4 py-2 bg-white/90 dark:bg-[#0e1b2b] border border-frosted-300 dark:border-[#1e3854] focus:border-sapphire-500 dark:focus:border-[#38bdf8] rounded-xl text-sm text-sapphire-900 dark:text-[#F1F7FB] placeholder:text-sapphire-400 dark:placeholder:text-[#64748B] font-medium focus:outline-none transition-colors shadow-soft"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                  selectedCategory === cat.id
                    ? 'bg-sapphire-800 text-white border-sapphire-800 dark:bg-[#2563EB] dark:border-[#2563EB] shadow-soft'
                    : 'bg-white/80 dark:bg-[#0e1b2b]/80 border-frosted-300 dark:border-[#1e3854] text-sapphire-700 dark:text-[#82A8D2] hover:text-sapphire-900 dark:hover:text-[#F1F7FB]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>

        {/* Conversations Grid */}
        {filteredChats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleOpenChat(chat.id)}
                className="group p-5 rounded-2xl bg-white/90 dark:bg-[#0d1b2a]/90 border border-frosted-300 dark:border-[#1e3854] hover:border-sapphire-400 dark:hover:border-[#38bdf8] transition-all cursor-pointer shadow-soft hover:shadow-card-glow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-display text-base font-bold text-sapphire-900 dark:text-[#F1F7FB] group-hover:text-sapphire-600 dark:group-hover:text-[#38bdf8] transition-colors line-clamp-1">
                      {chat.title}
                    </h3>
                    {getTriageBadge(chat.triage)}
                  </div>

                  <p className="text-xs text-sapphire-700 dark:text-[#94A3B8] font-sans leading-relaxed line-clamp-2 mb-4">
                    {chat.lastMessagePreview}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-frosted-200 dark:border-[#1e3854]/60 text-xs text-sapphire-700 dark:text-[#82A8D2] font-medium">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-sapphire-600 dark:text-[#38bdf8] stroke-[1.5]" />
                      {chat.timestamp}
                    </span>
                    {chat.category && (
                      <span className="flex items-center gap-1 font-mono text-[11px] text-sapphire-600 dark:text-[#38bdf8] font-semibold">
                        <Tag className="w-3 h-3 stroke-[1.5]" />
                        {chat.category}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-sapphire-600 dark:text-[#82A8D2] hover:text-red-700 dark:hover:text-red-400 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4 stroke-[1.5]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/80 dark:bg-[#0d1b2a]/80 rounded-2xl border border-frosted-300 dark:border-[#1e3854] shadow-soft">
            <MessageSquare className="w-10 h-10 mx-auto text-sapphire-500 dark:text-[#38bdf8] mb-3 opacity-50 stroke-[1.5]" />
            <h3 className="font-display text-lg font-bold text-sapphire-900 dark:text-[#F1F7FB] mb-1">
              No conversations found
            </h3>
            <p className="text-xs text-sapphire-700 dark:text-[#94A3B8] max-w-sm mx-auto font-medium">
              No medical consultation records match your search criteria. Try adjusting your search query or filters.
            </p>
          </div>
        )}

      </main>
    </div>
  );
}
