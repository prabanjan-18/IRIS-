import React from 'react';
import { Menu } from 'lucide-react';
import IrisLogo from '../shared/IrisLogo';

export default function TopBar({ onOpenMobileSidebar }) {
  return (
    <header className="w-full h-14 border-b border-frosted-300/40 bg-white/70 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-20 shadow-soft md:hidden">
      
      {/* Mobile Drawer Button & Logo */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenMobileSidebar}
          className="flex items-center gap-2.5 p-1.5 rounded-xl text-sapphire-700 hover:text-sapphire-900 hover:bg-frosted-100 transition-colors cursor-pointer"
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          <Menu className="w-5 h-5 stroke-[1.5]" />
          <div className="flex items-center gap-1.5">
            <IrisLogo size={20} />
            <span className="font-display font-bold text-base text-sapphire-900">Iris</span>
          </div>
        </button>
      </div>

    </header>
  );
}
