import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  SlidersHorizontal, 
  User, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  Check,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function UserProfile({ isCollapsed = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const menuRef = useRef(null);
  const { theme, toggleTheme, isDark } = useTheme();

  const user = {
    name: "Sean",
    email: "abc@gmail.com",
    initials: "SN"
  };

  // Close popup menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (label) => {
    setToastMessage(`Selected: ${label}`);
    setTimeout(() => setToastMessage(null), 2000);
    setIsOpen(false);
  };

  const handleToggleTheme = (e) => {
    if (e) e.stopPropagation();
    toggleTheme();
    const nextMode = !isDark ? 'Dark Mode' : 'Light Mode';
    setToastMessage(`Switched to ${nextMode}`);
    setTimeout(() => setToastMessage(null), 2000);
  };

  return (
    <div className="relative w-full" ref={menuRef}>
      
      {/* Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 left-6 z-50 px-3.5 py-2 bg-sapphire-900 dark:bg-[#0c1622] text-white dark:text-[#F1F7FB] text-xs font-semibold rounded-xl shadow-2xl flex items-center gap-2 animate-fadeIn border border-sapphire-700 dark:border-[#1e3854]">
          <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Popover Menu (Appears above Profile Button when clicked) */}
      {isOpen && (
        <div className={`absolute bottom-full mb-2 ${isCollapsed ? 'left-0 w-64' : 'left-0 right-0 w-64 md:w-68'} bg-white/98 dark:bg-[#0c1622]/98 border border-frosted-300 dark:border-[#1e344d] shadow-2xl rounded-2xl p-2 z-50 backdrop-blur-xl animate-fadeIn text-sapphire-900 dark:text-[#EAF6F7]`}>
          
          {/* TOP SECTION: User Account Info */}
          <button
            onClick={() => handleAction('Account Details')}
            className="w-full p-2.5 rounded-xl hover:bg-frosted-100/70 dark:hover:bg-[#16273c] transition-colors flex items-center justify-between group text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-sapphire-800 dark:bg-[#254E7A] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-soft">
                {user.initials}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-sapphire-900 dark:text-[#F1F7FB] truncate">
                  {user.name}
                </div>
                <div className="text-[11px] text-sapphire-600 dark:text-slate-300 font-mono font-medium truncate">
                  {user.email}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-sapphire-400 dark:text-[#5B8ABF] group-hover:text-sapphire-900 dark:group-hover:text-white transition-colors shrink-0 stroke-[1.8]" />
          </button>

          <div className="my-1.5 border-b border-frosted-200/80 dark:border-[#1e344d]" />

          {/* THEME TOGGLE OPTION */}
          <div 
            onClick={handleToggleTheme}
            className="w-full px-3 py-2 rounded-xl flex items-center justify-between hover:bg-frosted-100/70 dark:hover:bg-[#16273c] transition-colors group cursor-pointer select-none"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} theme`}
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-frosted-100 dark:bg-[#16273c]">
                {isDark ? (
                  <Moon className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform stroke-[2]" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform stroke-[2]" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-sapphire-900 dark:text-[#EAF6F7]">Theme</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-sapphire-100/80 dark:bg-[#1e344d] text-sapphire-800 dark:text-[#38bdf8] border border-sapphire-200/50 dark:border-[#254E7A]/50">
                  {isDark ? 'Dark' : 'Light'}
                </span>
              </div>
            </div>

            {/* Tactile Pill Toggle Switch */}
            <div
              role="switch"
              aria-checked={isDark}
              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-300 ease-in-out ${
                isDark ? 'bg-[#2563EB]' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white shadow-md transform transition duration-300 ease-in-out ${
                  isDark ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              >
                {isDark ? (
                  <Moon className="w-2 h-2 text-[#2563EB] stroke-[3]" />
                ) : (
                  <Sun className="w-2 h-2 text-amber-500 stroke-[3]" />
                )}
              </span>
            </div>
          </div>

          <div className="my-1.5 border-b border-frosted-200/80 dark:border-[#1e344d]" />

          {/* MIDDLE SECTION: Primary Settings & Features */}
          <div className="space-y-0.5">
            
            {/* Upgrade Plan */}
            <button
              onClick={() => handleAction('Upgrade plan')}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-3 hover:bg-frosted-100/70 dark:hover:bg-[#16273c] text-sapphire-900 dark:text-[#EAF6F7] transition-colors group"
            >
              <Sparkles className="w-4 h-4 text-sapphire-700 dark:text-[#5B8ABF] group-hover:scale-110 transition-transform stroke-[1.8]" />
              <span>Upgrade plan</span>
            </button>

            {/* Personalization */}
            <button
              onClick={() => handleAction('Personalization')}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-3 hover:bg-frosted-100/70 dark:hover:bg-[#16273c] text-sapphire-900 dark:text-[#EAF6F7] transition-colors group"
            >
              <SlidersHorizontal className="w-4 h-4 text-sapphire-700 dark:text-[#5B8ABF] group-hover:scale-110 transition-transform stroke-[1.8]" />
              <span>Personalization</span>
            </button>

            {/* Profile */}
            <button
              onClick={() => handleAction('Profile')}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-3 hover:bg-frosted-100/70 dark:hover:bg-[#16273c] text-sapphire-900 dark:text-[#EAF6F7] transition-colors group"
            >
              <User className="w-4 h-4 text-sapphire-700 dark:text-[#5B8ABF] group-hover:scale-110 transition-transform stroke-[1.8]" />
              <span>Profile</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => handleAction('Settings')}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-3 hover:bg-frosted-100/70 dark:hover:bg-[#16273c] text-sapphire-900 dark:text-[#EAF6F7] transition-colors group"
            >
              <Settings className="w-4 h-4 text-sapphire-700 dark:text-[#5B8ABF] group-hover:scale-110 transition-transform stroke-[1.8]" />
              <span>Settings</span>
            </button>

          </div>

          <div className="my-1.5 border-b border-frosted-200/80 dark:border-[#1e344d]" />

          {/* BOTTOM SECTION: Help & Logout */}
          <div className="space-y-0.5">
            
            {/* Help */}
            <button
              onClick={() => handleAction('Help')}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between hover:bg-frosted-100/70 dark:hover:bg-[#16273c] text-sapphire-900 dark:text-[#EAF6F7] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-4 h-4 text-sapphire-700 dark:text-[#5B8ABF] group-hover:scale-110 transition-transform stroke-[1.8]" />
                <span>Help</span>
              </div>
              <ChevronRight className="w-4 h-4 text-sapphire-400 dark:text-[#5B8ABF] group-hover:text-sapphire-900 dark:group-hover:text-white transition-colors stroke-[1.8]" />
            </button>

            {/* Log out */}
            <button
              onClick={() => handleAction('Log out')}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-950/30 text-red-700 dark:text-red-400 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform stroke-[1.8]" />
                <span>Log out</span>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors stroke-[1.8]" />
            </button>

          </div>

        </div>
      )}

      {/* Main Bottom User Profile Trigger Button */}
      {isCollapsed ? (
        <div className="p-2 flex justify-center border-t border-frosted-300/40 dark:border-[#1e344d]/60">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-9 h-9 rounded-full bg-sapphire-800 dark:bg-[#254E7A] text-white text-xs font-bold flex items-center justify-center shadow-soft hover:scale-105 transition-all"
            title={`${user.name} (${user.email})`}
            aria-label="User Profile Menu"
          >
            {user.initials}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full p-2.5 border-t border-frosted-300/40 dark:border-[#1e344d]/60 flex items-center justify-between rounded-xl transition-all text-left shadow-soft ${
            isOpen 
              ? 'bg-white dark:bg-[#132337] border-sapphire-400 dark:border-[#38bdf8] ring-2 ring-sapphire-200 dark:ring-[#1e3a5f]' 
              : 'bg-white/80 hover:bg-white dark:bg-[#0e1b2b]/80 dark:hover:bg-[#14263b] border-frosted-300 dark:border-[#1e3854]'
          }`}
          aria-label="User Profile Menu"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* User Avatar Circle */}
            <div className="w-9 h-9 rounded-full bg-sapphire-800 dark:bg-[#254E7A] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-soft font-sans">
              {user.initials}
            </div>

            {/* User Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-sapphire-900 dark:text-[#F1F7FB] truncate font-sans">
                  {user.name}
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-sapphire-600 dark:text-[#38bdf8] shrink-0" />
              </div>
              <p className="text-[11px] text-sapphire-600 dark:text-slate-300 font-mono font-medium truncate">
                {user.email}
              </p>
            </div>
          </div>
        </button>
      )}

    </div>
  );
}
