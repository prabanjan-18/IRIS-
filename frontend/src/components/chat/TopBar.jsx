import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import IrisLogo from '../shared/IrisLogo';
import { useAuth } from '../../context/AuthContext';

function GoogleIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  );
}

export default function TopBar({ onOpenMobileSidebar, isThinking = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="w-full h-14 border-b border-frosted-300/40 dark:border-[#192e45]/60 bg-white/70 dark:bg-[#0a1420]/85 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-20 shadow-soft md:hidden">
      
      {/* Mobile Drawer Button & Logo */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenMobileSidebar}
          className="flex items-center gap-2.5 p-1.5 rounded-xl text-sapphire-700 dark:text-[#82A8D2] hover:text-sapphire-900 dark:hover:text-white hover:bg-frosted-100 dark:hover:bg-[#16273c] transition-colors cursor-pointer"
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          <Menu className="w-5 h-5 stroke-[1.5]" />
          <div className="flex items-center gap-1.5">
            <IrisLogo size={20} isProcessing={isThinking} />
            <span className="font-display font-bold text-base text-sapphire-900 dark:text-[#F1F7FB]">Iris</span>
          </div>
        </button>
      </div>

      {/* Right Side: User Profile or Google Sign In */}
      <div className="flex items-center gap-2">
        {user ? (
          <button 
            onClick={onOpenMobileSidebar}
            className="flex items-center gap-2 p-1 rounded-full border border-frosted-300 dark:border-[#1e3854] bg-white/80 dark:bg-[#132337]/80 cursor-pointer"
            title={user.name || user.email}
          >
            {user.picture ? (
              <img src={user.picture} alt={user.name || "User"} className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-sapphire-800 text-white text-[11px] font-bold flex items-center justify-center">
                {(user.name || user.email || "U").slice(0, 2).toUpperCase()}
              </div>
            )}
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#132337] border border-frosted-300 dark:border-[#1e3854] hover:border-sapphire-400 text-xs font-semibold text-sapphire-900 dark:text-[#F1F7FB] shadow-xs cursor-pointer"
          >
            <GoogleIcon className="w-3.5 h-3.5" />
            <span>Sign in</span>
          </button>
        )}
      </div>

    </header>
  );
}
