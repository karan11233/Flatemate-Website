import React from 'react';
import { X, Heart, Trash2, Home, Users, ArrowRight } from 'lucide-react';
import { FlatListing, FlatmateProfile } from '../types';

interface SavedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedFlats: FlatListing[];
  savedFlatmates: FlatmateProfile[];
  onRemoveFlat: (flat: FlatListing) => void;
  onRemoveFlatmate: (mate: FlatmateProfile) => void;
  onSelectFlat: (flat: FlatListing) => void;
  onSelectFlatmate: (mate: FlatmateProfile) => void;
}

export const SavedDrawer: React.FC<SavedDrawerProps> = ({
  isOpen,
  onClose,
  savedFlats,
  savedFlatmates,
  onRemoveFlat,
  onRemoveFlatmate,
  onSelectFlat,
  onSelectFlatmate,
}) => {
  if (!isOpen) return null;

  const totalSaved = savedFlats.length + savedFlatmates.length;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Saved Spaces & Profiles
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                {totalSaved} items bookmarked
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {totalSaved === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">
                No saved items yet
              </h3>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Click the heart icon on any flat or flatmate card to save them here for easy comparison.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Browse Listings
              </button>
            </div>
          ) : (
            <>
              {/* Saved Flats */}
              {savedFlats.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <Home className="w-3.5 h-3.5 text-brand-600" />
                    <span>Saved Flats & Rooms ({savedFlats.length})</span>
                  </div>

                  <div className="space-y-2.5">
                    {savedFlats.map((flat) => (
                      <div
                        key={flat.id}
                        onClick={() => {
                          onSelectFlat(flat);
                          onClose();
                        }}
                        className="p-3 rounded-2xl border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all flex items-center gap-3 cursor-pointer group"
                      >
                        <img
                          src={flat.images[0]}
                          alt={flat.title}
                          className="w-16 h-16 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-brand-600 transition-colors">
                            {flat.title}
                          </h4>
                          <span className="text-[11px] text-slate-500 font-medium block truncate">
                            {flat.location}
                          </span>
                          <span className="text-xs font-black text-brand-700 mt-1 block">
                            {formatCurrency(flat.rent)} <span className="text-[10px] text-slate-400 font-normal">/ mo</span>
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFlat(flat);
                          }}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Saved Flatmates */}
              {savedFlatmates.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <Users className="w-3.5 h-3.5 text-brand-600" />
                    <span>Saved Flatmates ({savedFlatmates.length})</span>
                  </div>

                  <div className="space-y-2.5">
                    {savedFlatmates.map((mate) => (
                      <div
                        key={mate.id}
                        onClick={() => {
                          onSelectFlatmate(mate);
                          onClose();
                        }}
                        className="p-3 rounded-2xl border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all flex items-center gap-3 cursor-pointer group"
                      >
                        <img
                          src={mate.avatar}
                          alt={mate.name}
                          className="w-14 h-14 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-brand-600 transition-colors">
                            {mate.name}, {mate.age}
                          </h4>
                          <span className="text-[11px] text-slate-500 font-medium block truncate">
                            {mate.profession}
                          </span>
                          <span className="text-xs font-extrabold text-brand-700 mt-0.5 block">
                            Budget: Up to {formatCurrency(mate.budget.max)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFlatmate(mate);
                          }}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {totalSaved > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <span>Back to Browsing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
