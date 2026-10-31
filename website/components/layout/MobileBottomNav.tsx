import React from 'react';
import { Home, Compass, PlusCircle, LayoutDashboard, User } from 'lucide-react';
import { AuthUser } from '../../types';

interface MobileBottomNavProps {
  currentUser: AuthUser | null;
  activeHostInquiriesCount: number;
  onOpenMyListings: () => void;
  onOpenAuth: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentUser,
  activeHostInquiriesCount,
  onOpenMyListings,
  onOpenAuth,
}) => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around lg:hidden shadow-lg"
    >
      <a
        href="#home"
        className="flex flex-col items-center gap-0.5 text-slate-600 hover:text-primary transition-colors"
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-medium">Home</span>
      </a>

      <a
        href="#spaces"
        className="flex flex-col items-center gap-0.5 text-slate-600 hover:text-primary transition-colors"
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px] font-medium">Browse</span>
      </a>

      <a
        href="#list-space"
        className="flex flex-col items-center gap-0.5 text-primary"
      >
        <PlusCircle className="w-6 h-6 fill-primary/10 text-primary" />
        <span className="text-[10px] font-bold">List Space</span>
      </a>

      <button
        type="button"
        onClick={onOpenMyListings}
        className="relative flex flex-col items-center gap-0.5 text-slate-600 hover:text-primary transition-colors cursor-pointer"
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[10px] font-medium">Portal</span>
        {activeHostInquiriesCount > 0 && (
          <span className="absolute -top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center">
            {activeHostInquiriesCount}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={currentUser?.fullName || currentUser?.phone ? onOpenMyListings : onOpenAuth}
        className="flex flex-col items-center gap-0.5 text-slate-600 hover:text-primary transition-colors cursor-pointer"
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] font-medium">
          {currentUser?.fullName ? 'Account' : 'Sign In'}
        </span>
      </button>
    </nav>
  );
};
