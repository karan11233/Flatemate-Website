import React, { useState } from 'react';
import { Home, Users, ShieldCheck, Heart, PlusCircle, MapPin, ChevronDown, Check } from 'lucide-react';
import { ListingType } from '../types';
import { CITIES } from '../data/mockData';

interface NavbarProps {
  activeTab: ListingType;
  setActiveTab: (tab: ListingType) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  savedCount: number;
  onOpenSaved: () => void;
  onOpenPostListing: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedCity,
  setSelectedCity,
  savedCount,
  onOpenSaved,
  onOpenPostListing,
}) => {
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & City Selector */}
          <div className="flex items-center gap-6">
            <div 
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">Flat<span className="text-brand-600">emate</span></span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-1.5 py-0.5 rounded-md">
                    0% Brokerage
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">Verified Flats & Roommates</span>
              </div>
            </div>

            {/* City Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-lg transition-colors border border-slate-200"
              >
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span>{selectedCity}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {cityDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setCityDropdownOpen(false)} 
                  />
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-20">
                    <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Select City
                    </div>
                    {CITIES.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          setSelectedCity(city);
                          setCityDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-left hover:bg-slate-50 transition-colors ${
                          selectedCity === city ? 'text-brand-600 font-semibold bg-brand-50/60' : 'text-slate-700'
                        }`}
                      >
                        <span>{city}</span>
                        {selectedCity === city && <Check className="w-3.5 h-3.5 text-brand-600" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Center Tabs: Find Flats vs Find Flatmates */}
          <nav className="hidden md:flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveTab('flat')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'flat'
                  ? 'bg-white text-brand-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Explore Flats & Rooms</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('roommate')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'roommate'
                  ? 'bg-white text-brand-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Find Flatmates</span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Wishlist / Saved */}
            <button
              type="button"
              onClick={onOpenSaved}
              className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200/60"
              title="Saved items"
            >
              <Heart className="w-4.5 h-4.5" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Post Listing CTA */}
            <button
              type="button"
              onClick={onOpenPostListing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/25 hover:shadow-lg transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Post Space / Roommate</span>
              <span className="sm:hidden">Post</span>
            </button>
          </div>

        </div>

        {/* Mobile Tab Switcher */}
        <div className="md:hidden flex items-center justify-around pb-3 pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab('flat')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'flat'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Flats & Rooms</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('roommate')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'roommate'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Flatmates</span>
          </button>
        </div>

      </div>
    </header>
  );
};
