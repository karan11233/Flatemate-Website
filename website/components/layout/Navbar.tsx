import React from 'react';
import Image from 'next/image';
import { AuthUser } from '../../types';
import { User, LogOut } from 'lucide-react';

interface NavbarProps {
  currentUser: AuthUser | null;
  activeHostInquiriesCount: number;
  onOpenMyListings: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeHostInquiriesCount,
  onOpenMyListings,
  onOpenAuth,
  onSignOut,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        {/* Brand Logo */}
        <a href="#home" className="flex items-center gap-2.5">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-slate-900 border border-slate-700 shadow-sm flex items-center justify-center">
            <Image
              src="/flatemate-logo-alt.jpg"
              alt="Flatemate Logo"
              width={40}
              height={40}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 font-heading">
              Flatemate
            </span>
            <span className="block text-[10px] font-semibold tracking-wider text-primary uppercase">
              Ahmedabad
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground lg:flex">
          <a href="#home" className="hover:text-primary transition-colors">
            Home
          </a>
          <a href="#discover" className="hover:text-primary transition-colors">
            Explore Flats
          </a>
          <a href="#spaces" className="hover:text-primary transition-colors">
            Ahmedabad Feed
          </a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">
            How it Works
          </a>
          <a href="#list-space" className="hover:text-primary transition-colors">
            List Space
          </a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* My Listings Portal Trigger */}
          <button
            type="button"
            onClick={onOpenMyListings}
            className="relative hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <span>My Listings</span>
            {activeHostInquiriesCount > 0 && (
              <span className="h-4 min-w-4 px-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                {activeHostInquiriesCount}
              </span>
            )}
          </button>

          {/* User Authentication Status */}
          {currentUser?.fullName || currentUser?.phone ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenMyListings}
                className="flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-slate-600" />
                <span className="max-w-[90px] truncate">
                  {currentUser.fullName || currentUser.phone}
                </span>
              </button>
              <button
                type="button"
                onClick={onSignOut}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="text-xs font-semibold text-slate-700 hover:text-primary px-2.5 py-1.5 transition-colors cursor-pointer"
            >
              Sign In
            </button>
          )}

          {/* Primary Post CTA */}
          <a
            href="#list-space"
            className="rounded-xl bg-primary px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:opacity-95 transition-opacity"
          >
            List Space Free
          </a>
        </div>
      </div>
    </header>
  );
};
