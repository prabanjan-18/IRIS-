import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  SlidersHorizontal, 
  User as UserIcon, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  Check,
  Sun,
  Moon,
  LogIn
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function UserProfile({ isCollapsed = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, logout } = useAuth();

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

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSignOut = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  const handleAction = (label) => {
    showToast(`Selected: ${label}`);
    setIsOpen(false);
  };

  const handleToggleTheme = (e) => {
    if (e) e.stopPropagation();
    toggleTheme();
    const nextMode = !isDark ? 'Dark Mode' : 'Light Mode';
    showToast(`Switched to ${nextMode}`);
  };

  const getInitials = (name, email) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const displayName = user?.name || user?.email?.split('@')[0] || "User";
  const userEmail = user?.email || "";
  const avatarUrl = user?.picture || null;
  const initials = getInitials(user?.name, user?.email);

  return (
    <div className="relative w-full" ref={menuRef}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 left-6 z-50 px-3.5 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-fadeIn border text-xs font-semibold bg-sapphire-900 dark:bg-[#0c1622] text-white dark:text-[#F1F7FB] border-sapphire-700 dark:border-[#1e3854]">
          <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[2.5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Popover Menu (Visible when user profile is clicked) */}
      {isOpen && user && (
        <div className={`absolute bottom-full mb-2 ${isCollapsed ? 'left-0 w-64' : 'left-0 right-0 w-64 md:w-68'} bg-white/98 dark:bg-[#0c1622]/98 border border-frosted-300 dark:border-[#1e344d] shadow-2xl rounded-2xl p-2 z-50 backdrop-blur-xl animate-fadeIn text-sapphire-900 dark:text-[#EAF6F7]`}>
          
          {/* Account Details Header */}
          <div className="p-2.5 rounded-xl bg-frosted-100/50 dark:bg-[#132337]/50 border border-frosted-200 dark:border-[#1e3854] flex items-center gap-3">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={displayName} 
                className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-emerald-400/40 shadow-soft" 
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sapphire-800 to-frosted-600 dark:from-[#1b3a5c] dark:to-[#2563EB] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-soft">
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-sapphire-900 dark:text-[#F1F7FB] truncate">
                  {displayName}
                </span>
              </div>
              <div className="text-[11px] text-[#8CA3A8] font-mono truncate">
                {userEmail}
              </div>
              <div className="mt-1 inline-flex items-center gap-1 text-[9px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                <ShieldCheck className="w-2.5 h-2.5" /> Authenticated
              </div>
            </div>
          </div>

          <div className="my-1.5 border-b border-frosted-200/80 dark:border-[#1e344d]" />

          {/* Theme Toggle */}
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

          {/* Quick Actions */}
          <div className="space-y-0.5">
            <button
              onClick={() => handleAction('Clinical Profile')}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-3 hover:bg-frosted-100/70 dark:hover:bg-[#16273c] text-sapphire-900 dark:text-[#EAF6F7] transition-colors group cursor-pointer"
            >
              <UserIcon className="w-4 h-4 text-sapphire-700 dark:text-[#5B8ABF] group-hover:scale-110 transition-transform stroke-[1.8]" />
              <span>Clinical Profile</span>
            </button>

            <button
              onClick={() => handleAction('Settings')}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-3 hover:bg-frosted-100/70 dark:hover:bg-[#16273c] text-sapphire-900 dark:text-[#EAF6F7] transition-colors group cursor-pointer"
            >
              <Settings className="w-4 h-4 text-sapphire-700 dark:text-[#5B8ABF] group-hover:scale-110 transition-transform stroke-[1.8]" />
              <span>Settings</span>
            </button>
          </div>

          <div className="my-1.5 border-b border-frosted-200/80 dark:border-[#1e344d]" />

          {/* Sign Out Button */}
          <div className="space-y-0.5">
            <button
              onClick={handleSignOut}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-950/30 text-red-700 dark:text-red-400 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform stroke-[1.8]" />
                <span>Sign out</span>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors stroke-[1.8]" />
            </button>
          </div>

        </div>
      )}

      {/* Main Profile Trigger Button in Sidebar Footer */}
      {user ? (
        isCollapsed ? (
          <div className="p-2 flex justify-center border-t border-frosted-300/40 dark:border-[#1e344d]/60">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative w-9 h-9 rounded-full shadow-soft hover:scale-105 transition-all cursor-pointer"
              title={`${displayName} (${userEmail})`}
              aria-label="User Profile Menu"
            >
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={displayName} 
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-400/40" 
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-sapphire-800 dark:bg-[#254E7A] text-white text-xs font-bold flex items-center justify-center">
                  {initials}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0a1420]" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full p-2.5 border-t border-frosted-300/40 dark:border-[#1e344d]/60 flex items-center justify-between rounded-xl transition-all text-left shadow-soft cursor-pointer ${
              isOpen 
                ? 'bg-white dark:bg-[#132337] border-sapphire-400 dark:border-[#38bdf8] ring-2 ring-sapphire-200 dark:ring-[#1e3a5f]' 
                : 'bg-white/80 hover:bg-white dark:bg-[#0e1b2b]/80 dark:hover:bg-[#14263b] border-frosted-300 dark:border-[#1e3854]'
            }`}
            aria-label="User Profile Menu"
            aria-expanded={isOpen}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={displayName} 
                  className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-frosted-300 dark:ring-[#1e3854] shadow-soft" 
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-sapphire-800 dark:bg-[#254E7A] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-soft font-sans">
                  {initials}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-sapphire-900 dark:text-[#F1F7FB] truncate font-sans">
                    {displayName}
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                </div>
                <p className="text-[11px] text-[#8CA3A8] font-mono font-medium truncate">
                  {userEmail}
                </p>
              </div>
            </div>
          </button>
        )
      ) : (
        <div className="p-2 border-t border-frosted-300/40 dark:border-[#1e344d]/60">
          <button
            onClick={() => navigate('/login')}
            className="w-full p-2.5 rounded-xl bg-white/80 hover:bg-white dark:bg-[#0e1b2b] dark:hover:bg-[#14263b] border border-frosted-300 dark:border-[#1e3854] flex items-center justify-center gap-2 text-xs font-semibold text-sapphire-900 dark:text-[#F1F7FB] shadow-soft cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-frosted-700 dark:text-[#38bdf8]" />
            {!isCollapsed && <span>Sign in to Iris</span>}
          </button>
        </div>
      )}

    </div>
  );
}
