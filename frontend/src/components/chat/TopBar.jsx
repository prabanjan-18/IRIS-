import React from 'react';
import { Menu } from 'lucide-react';
import IrisLogo from '../shared/IrisLogo';

export default function TopBar({ onOpenMobileSidebar, isThinking = false }) {
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

    </header>
  );
}
