import React, { useState, useRef, useEffect } from 'react';
import { Menu, ChevronRight, FileText, Edit3, Eye, HelpCircle, Check, Info, LifeBuoy, PlusCircle, LogOut, RefreshCw, Maximize, ZoomIn, ZoomOut, Scissors, Copy, Clipboard } from 'lucide-react';

export default function NestedDropdownMenu({ onNewChat }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null); // 'file' | 'edit' | 'view' | 'help' | null
  const [actionFeedback, setActionFeedback] = useState(null);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveMenu(null);
    }
  };

  const handleAction = (label, callback) => {
    setActionFeedback(label);
    setTimeout(() => setActionFeedback(null), 1800);
    if (callback) callback();
    setIsOpen(false);
    setActiveMenu(null);
  };

  const menuStructure = [
    {
      id: 'file',
      label: 'File',
      icon: FileText,
      items: [
        { label: 'New conversation', icon: PlusCircle, shortcut: 'Ctrl+N', action: () => onNewChat && onNewChat() },
        { label: 'Close window', icon: LogOut, shortcut: 'Ctrl+W', action: () => console.log('Close window') },
        { label: 'Exit', icon: LogOut, action: () => console.log('Exit') },
      ]
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: Edit3,
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', action: () => console.log('Undo') },
        { label: 'Redo', shortcut: 'Ctrl+Y', action: () => console.log('Redo') },
        { label: 'Cut', icon: Scissors, shortcut: 'Ctrl+X', action: () => console.log('Cut') },
        { label: 'Copy', icon: Copy, shortcut: 'Ctrl+C', action: () => console.log('Copy') },
        { label: 'Paste', icon: Clipboard, shortcut: 'Ctrl+V', action: () => console.log('Paste') },
        { label: 'Select All', shortcut: 'Ctrl+A', action: () => console.log('Select All') },
      ]
    },
    {
      id: 'view',
      label: 'View',
      icon: Eye,
      items: [
        { label: 'Actual Size', shortcut: 'Ctrl+0', action: () => console.log('Actual Size') },
        { label: 'Zoom In', icon: ZoomIn, shortcut: 'Ctrl++', action: () => console.log('Zoom In') },
        { label: 'Zoom Out', icon: ZoomOut, shortcut: 'Ctrl+-', action: () => console.log('Zoom Out') },
        { label: 'Full Screen', icon: Maximize, shortcut: 'F11', action: () => console.log('Full Screen') },
        { label: 'Reload', icon: RefreshCw, shortcut: 'Ctrl+R', action: () => window.location.reload() },
      ]
    },
    {
      id: 'help',
      label: 'Help',
      icon: HelpCircle,
      items: [
        { label: 'Get Support', icon: LifeBuoy, action: () => alert('Iris Support: Contact support@iris.health for help.') },
        { label: 'About Iris', icon: Info, action: () => alert('Iris Healthcare Assistant v1.0.0 — Clinical-calm dark interface inspired by Mayo Clinic and ChatGPT.') },
      ]
    }
  ];

  return (
    <div className="relative" ref={menuRef} onKeyDown={handleKeyDown}>
      
      {/* Options Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg text-mist-300 dark:text-[#82A8D2] hover:text-mist-100 dark:hover:text-white hover:bg-ink-700 dark:hover:bg-[#16273c] transition-colors ${
          isOpen ? 'bg-ink-700 dark:bg-[#16273c] text-frosted-500 dark:text-[#38bdf8]' : ''
        }`}
        aria-label="Application Options Menu"
        aria-expanded={isOpen}
      >
        <Menu className="w-5 h-5 stroke-[1.5]" />
      </button>

      {/* Action Toast Notification */}
      {actionFeedback && (
        <div className="fixed top-4 right-4 z-50 px-3 py-2 bg-ink-700 dark:bg-[#0c1622] border border-frosted-500 dark:border-[#1e344d] text-mist-100 dark:text-[#F1F7FB] text-xs rounded-lg shadow-lg flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-frosted-500 dark:text-[#38bdf8]" />
          <span>Action triggered: <strong>{actionFeedback}</strong></span>
        </div>
      )}

      {/* Main Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-48 bg-ink-800 dark:bg-[#0c1622] border border-ink-500 dark:border-[#1e344d] rounded-xl shadow-2xl z-50 py-1.5 animate-fadeIn">
          {menuStructure.map((section) => {
            const SectionIcon = section.icon;
            const isSubmenuActive = activeMenu === section.id;

            return (
              <div
                key={section.id}
                className="relative"
                onMouseEnter={() => setActiveMenu(section.id)}
              >
                {/* Parent Row */}
                <button
                  onClick={() => setActiveMenu(isSubmenuActive ? null : section.id)}
                  className={`w-full px-3 py-2 text-xs flex items-center justify-between text-mist-100 dark:text-[#EAF6F7] hover:bg-ink-700 dark:hover:bg-[#16273c] hover:text-frosted-500 dark:hover:text-[#38bdf8] transition-colors ${
                    isSubmenuActive ? 'bg-ink-700 dark:bg-[#16273c] text-frosted-500 dark:text-[#38bdf8]' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <SectionIcon className="w-4 h-4 text-mist-300 dark:text-[#82A8D2] stroke-[1.5]" />
                    <span className="font-medium">{section.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-mist-300 dark:text-[#82A8D2] stroke-[1.5]" />
                </button>

                {/* Submenu Flyout to the Right */}
                {isSubmenuActive && (
                  <div 
                    className="absolute left-full top-0 ml-1 w-52 bg-ink-800 dark:bg-[#0c1622] border border-ink-500 dark:border-[#1e344d] rounded-xl shadow-2xl py-1.5 z-50 animate-fadeIn"
                    onMouseLeave={() => setActiveMenu(null)}
                  >
                    {section.items.map((item, idx) => {
                      const ItemIcon = item.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleAction(item.label, item.action)}
                          className="w-full px-3 py-2 text-xs flex items-center justify-between text-mist-100 dark:text-[#EAF6F7] hover:bg-ink-600 dark:hover:bg-[#16273c] hover:text-frosted-500 dark:hover:text-[#38bdf8] transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            {ItemIcon ? (
                              <ItemIcon className="w-3.5 h-3.5 text-mist-300 dark:text-[#82A8D2] group-hover:text-frosted-500 dark:group-hover:text-[#38bdf8] stroke-[1.5]" />
                            ) : (
                              <div className="w-3.5" />
                            )}
                            <span className="font-sans">{item.label}</span>
                          </div>
                          {item.shortcut && (
                            <span className="text-[10px] text-mist-300 dark:text-[#64748B] font-mono">
                              {item.shortcut}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
