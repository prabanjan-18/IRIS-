import React, { useState } from 'react';
import { Plus, PanelLeftClose, MessageSquare } from 'lucide-react';
import IrisLogo from '../shared/IrisLogo';
import NestedDropdownMenu from './NestedDropdownMenu';
import SidebarSearch from './SidebarSearch';
import ChatList from './ChatList';
import UserProfile from './UserProfile';

export default function Sidebar({
  chats = [],
  activeChatId,
  onSelectChat,
  onNewChat,
  onRenameChat,
  onDeleteChat,
  isMobileOpen,
  setIsMobileOpen
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Sidebar Shell — Glassmorphism Light */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 bg-white/70 backdrop-blur-xl border-r border-frosted-300/40 flex flex-col justify-between transition-all duration-300 ease-in-out shadow-glass ${
          isCollapsed ? 'w-16' : 'w-72'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* TOP SECTION: Header & Actions */}
        <div className="p-3 flex flex-col gap-3 min-h-0 flex-1">
          
          {/* Header Row: Logo Wordmark & Collapse Toggle */}
          {isCollapsed ? (
            <div className="flex items-center justify-center py-1">
              <button
                onClick={() => setIsCollapsed(false)}
                className="p-2 rounded-xl hover:bg-white/80 border border-transparent hover:border-frosted-300 text-sapphire-800 transition-all group cursor-pointer shadow-soft"
                title="Open sidebar"
                aria-label="Open sidebar"
              >
                <IrisLogo size={24} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 px-1 py-1">
                <IrisLogo size={24} />
                <span className="font-display text-lg font-bold tracking-tight text-mist-100">
                  Iris
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-frosted-500/15 text-frosted-700 border border-frosted-500/30">
                  Health
                </span>
              </div>

              {/* Close Sidebar Button */}
              <button
                onClick={() => setIsCollapsed(true)}
                className="hidden md:flex p-1.5 rounded-lg text-mist-300 hover:text-mist-100 hover:bg-frosted-100/60 transition-colors cursor-pointer"
                title="Close sidebar"
                aria-label="Close sidebar"
              >
                <PanelLeftClose className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>
          )}

          {/* Icon Utility Row: Options & Search */}
          {!isCollapsed ? (
            <div className="flex items-center justify-between px-1 py-1 bg-frosted-100/50 rounded-xl border border-frosted-300/40">
              <div className="flex items-center gap-1">
                <NestedDropdownMenu onNewChat={onNewChat} />
                <SidebarSearch chats={chats} onSelectChat={onSelectChat} />
              </div>
              
              <div className="text-[11px] font-sans text-mist-300 pr-2.5">
                Clinical AI
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2 border-b border-frosted-300/30">
              <NestedDropdownMenu onNewChat={onNewChat} />
              <SidebarSearch chats={chats} onSelectChat={onSelectChat} />
            </div>
          )}

          {/* "New chat" Full Width Action Button */}
          {!isCollapsed ? (
            <button
              onClick={onNewChat}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 hover:bg-white border border-frosted-300/50 text-mist-100 hover:text-frosted-700 text-xs font-semibold flex items-center justify-between transition-all group shadow-soft"
            >
              <div className="flex items-center gap-2.5 font-sans">
                <Plus className="w-4 h-4 text-frosted-700 group-hover:rotate-90 transition-transform stroke-[2]" />
                <span>New chat</span>
              </div>
              <span className="text-[10px] text-mist-300 font-mono">⌘K</span>
            </button>
          ) : (
            <button
              onClick={onNewChat}
              className="p-2.5 mx-auto rounded-xl bg-frosted-500 text-white hover:bg-frosted-700 transition-colors shadow-soft"
              title="Start New Chat"
            >
              <Plus className="w-5 h-5 stroke-[2]" />
            </button>
          )}

          {/* Conversations Section */}
          {!isCollapsed ? (
            <ChatList
              chats={chats}
              activeChatId={activeChatId}
              onSelectChat={onSelectChat}
              onRenameChat={onRenameChat}
              onDeleteChat={onDeleteChat}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center gap-2 overflow-y-auto py-2">
              {chats.slice(0, 8).map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    chat.id === activeChatId ? 'bg-frosted-500 text-white' : 'text-mist-300 hover:bg-frosted-100/60'
                  }`}
                  title={chat.title}
                >
                  <MessageSquare className="w-4 h-4 stroke-[1.5]" />
                </button>
              ))}
            </div>
          )}

        </div>

        {/* BOTTOM SECTION: User Account Footer */}
        <div className="p-2">
          <UserProfile isCollapsed={isCollapsed} />
        </div>
      </aside>
    </>
  );
}
