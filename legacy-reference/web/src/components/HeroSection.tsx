import React from 'react';
import { Search, ShieldCheck, Zap, Sparkles, MapPin, X } from 'lucide-react';
import { ListingType } from '../types';
import { POPULAR_AREAS } from '../data/mockData';

interface HeroSectionProps {
  activeTab: ListingType;
  selectedCity: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectArea: (area: string) => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (val: boolean) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  activeTab,
  selectedCity,
  searchQuery,
  setSearchQuery,
  onSelectArea,
  verifiedOnly,
  setVerifiedOnly,
}) => {
  const currentAreas = POPULAR_AREAS[selectedCity] || [];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-slate-50 border-b border-slate-200/60 pt-8 pb-10">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-radial from-brand-100/50 to-transparent pointer-events-none blur-3xl opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Trust Badges Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% ID Verified Listings</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold shadow-xs">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Zero Brokerage Fees</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold shadow-xs">
            <Zap className="w-4 h-4 text-purple-600" />
            <span>Active Response Guarantee</span>
          </div>
        </div>

        {/* Headline */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {activeTab === 'flat' ? (
              <>
                Rent Verified Homes in <span className="text-brand-600">{selectedCity}</span>
              </>
            ) : (
              <>
                Find Compatible Flatmates in <span className="text-brand-600">{selectedCity}</span>
              </>
            )}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            {activeTab === 'flat'
              ? 'Connect directly with verified owners & existing flatmates. No middlemen, no spam, no brokerage fees.'
              : 'Match with working professionals and students based on lifestyle habits, cleanliness, and budget.'}
          </p>
        </div>

        {/* Search Bar Container */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/90 p-2 sm:p-2.5">
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            
            {/* Input with Search icon */}
            <div className="flex-1 relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'flat'
                    ? `Search area, landmark or flat type in ${selectedCity}...`
                    : `Search by profession, locality or interest in ${selectedCity}...`
                }
                className="w-full pl-11 pr-8 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 rounded-xl outline-hidden focus:ring-2 focus:ring-brand-500/30 transition-all border border-transparent focus:border-brand-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filter: Verified Only */}
            <button
              type="button"
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                verifiedOnly
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Only</span>
            </button>

          </div>

          {/* Quick Locality Suggestions */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 shrink-0 px-1">
              <MapPin className="w-3 h-3" /> Popular:
            </span>
            {currentAreas.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => onSelectArea(area)}
                className={`text-xs px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors ${
                  searchQuery.toLowerCase().includes(area.toLowerCase())
                    ? 'bg-brand-600 text-white font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {area}
              </button>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};
