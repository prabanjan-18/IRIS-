import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from './components/sidebar/Sidebar';
import ChatPage from './pages/ChatPage';
import AllConversationsPage from './pages/AllConversationsPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/shared/ProtectedRoute';
import { ArtifactProvider } from './context/ArtifactContext';
import ArtifactPanel from './components/artifact/ArtifactPanel';

function loadSavedChats() {
  try {
    const saved = localStorage.getItem('iris_chats');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Failed to load chats from localStorage", e);
  }
  const defaultId = `chat-${Date.now()}`;
  return [{
    id: defaultId,
    title: "New Health Consultation",
    lastMessagePreview: "How can I help you today?",
    timestamp: "Just now",
    date: new Date().toISOString().split('T')[0],
    triage: "self",
    category: "General Health"
  }];
}

function loadSavedMessages() {
  try {
    const saved = localStorage.getItem('iris_messages');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load messages from localStorage", e);
  }
  return {};
}

function MainAppLayout() {
  const [chats, setChats] = useState(loadSavedChats);
  const [messagesMap, setMessagesMap] = useState(loadSavedMessages);
  const [activeChatId, setActiveChatId] = useState(() => {
    const initialChats = loadSavedChats();
    return initialChats[0]?.id || `chat-${Date.now()}`;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  // Sync to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('iris_chats', JSON.stringify(chats));
    } catch (e) {}
  }, [chats]);

  React.useEffect(() => {
    try {
      localStorage.setItem('iris_messages', JSON.stringify(messagesMap));
    } catch (e) {}
  }, [messagesMap]);

  // Active chat object
  const activeChat = chats.find(c => c.id === activeChatId) || chats[0] || null;

  // Messages array for active chat
  const activeMessages = activeChatId ? (messagesMap[activeChatId] || []) : [];

  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
    setIsMobileSidebarOpen(false);
  };

  const handleNewChat = () => {
    const newId = `chat-${Date.now()}`;
    const newChatObj = {
      id: newId,
      title: "New Health Consultation",
      lastMessagePreview: "Started a new conversation...",
      timestamp: "Just now",
      date: new Date().toISOString().split('T')[0],
      triage: "self",
      category: "General Health"
    };

    setChats(prev => [newChatObj, ...prev]);
    setMessagesMap(prev => ({
      ...prev,
      [newId]: []
    }));
    setActiveChatId(newId);
    setIsMobileSidebarOpen(false);
  };

  const handleRenameChat = (chatId, newTitle) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, title: newTitle } : c));
  };

  const handleDeleteChat = (chatId) => {
    setChats(prev => {
      const remaining = prev.filter(c => c.id !== chatId);
      if (remaining.length === 0) {
        const newId = `chat-${Date.now()}`;
        const newChat = {
          id: newId,
          title: "New Health Consultation",
          lastMessagePreview: "How can I help you today?",
          timestamp: "Just now",
          date: new Date().toISOString().split('T')[0],
          triage: "self",
          category: "General Health"
        };
        setActiveChatId(newId);
        return [newChat];
      }
      if (activeChatId === chatId) {
        setActiveChatId(remaining[0].id);
      }
      return remaining;
    });
  };

  const setMessagesForActiveChat = (newMessagesOrUpdater) => {
    const targetChatId = activeChatId || chats[0]?.id || `chat-${Date.now()}`;
    if (!activeChatId) {
      setActiveChatId(targetChatId);
    }

    setMessagesMap(prevMap => {
      const currentMessages = prevMap[targetChatId] || [];
      const updated = typeof newMessagesOrUpdater === 'function' 
        ? newMessagesOrUpdater(currentMessages)
        : newMessagesOrUpdater;

      // Update last message preview and title in chats list
      if (updated.length > 0) {
        const lastMsg = updated[updated.length - 1];
        const preview = lastMsg.text || (lastMsg.structuredData?.summary) || "Health response provided.";
        
        const firstUserMsg = updated.find(m => m.sender === 'user');
        const dynamicTitle = firstUserMsg 
          ? (firstUserMsg.text.length > 30 ? firstUserMsg.text.slice(0, 30) + '...' : firstUserMsg.text)
          : "Health Consultation";

        setChats(prevChats => {
          const chatExists = prevChats.some(c => c.id === targetChatId);
          if (chatExists) {
            return prevChats.map(c => c.id === targetChatId ? {
              ...c,
              title: c.title === "New Health Consultation" ? dynamicTitle : c.title,
              lastMessagePreview: preview,
              timestamp: "Just now"
            } : c);
          } else {
            return [{
              id: targetChatId,
              title: dynamicTitle,
              lastMessagePreview: preview,
              timestamp: "Just now",
              date: new Date().toISOString().split('T')[0],
              triage: "self",
              category: "General Health"
            }, ...prevChats];
          }
        });
      }

      return {
        ...prevMap,
        [targetChatId]: updated
      };
    });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-transparent font-sans">
      
      {/* Global Sidebar Shell */}
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        isThinking={isThinking}
      />

      {/* Main App Routes View */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Routes>
          <Route
            path="/"
            element={
              <ChatPage
                activeChat={activeChat}
                messages={activeMessages}
                setMessages={setMessagesForActiveChat}
                onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
                onNewChat={handleNewChat}
                isThinking={isThinking}
                setIsThinking={setIsThinking}
              />
            }
          />
          <Route
            path="/conversations"
            element={
              <AllConversationsPage
                chats={chats}
                onSelectChat={handleSelectChat}
                onDeleteChat={handleDeleteChat}
              />
            }
          />
        </Routes>
      </div>

      {/* Column 3: Slide-out Clinical Artifact Panel */}
      <ArtifactPanel />

    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <ArtifactProvider>
                <MainAppLayout />
              </ArtifactProvider>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
