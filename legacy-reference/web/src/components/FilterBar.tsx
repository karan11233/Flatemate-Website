import React from 'react';
import { SlidersHorizontal, RotateCcw, Sparkles } from 'lucide-react';
import { ListingType } from '../types';

interface FilterBarProps {
  activeTab: ListingType;
  selectedBhk: string;
  setSelectedBhk: (bhk: string) => void;
  selectedFurnishing: string;
  setSelectedFurnishing: (f: string) => void;
  selectedGender: string;
  setSelectedGender: (g: string) => void;
  priceFilter: string;
  setPriceFilter: (p: string) => void;
  dietFilter: string;
  setDietFilter: (d: string) => void;
  petFriendlyOnly: boolean;
  setPetFriendlyOnly: (v: boolean) => void;
  cleanlinessFilter: number | null;
  setCleanlinessFilter: (c: number | null) => void;
  onReset: () => void;
  resultsCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeTab,
  selectedBhk,
  setSelectedBhk,
  selectedFurnishing,
  setSelectedFurnishing,
  selectedGender,
  setSelectedGender,
  priceFilter,
  setPriceFilter,
  dietFilter,
  setDietFilter,
  petFriendlyOnly,
  setPetFriendlyOnly,
  cleanlinessFilter,
  setCleanlinessFilter,
  onReset,
  resultsCount,
}) => {
  const bhkOptions = ['All Types', 'Private Room', '1 BHK', '2 BHK', '3 BHK', 'Studio'];
  const furnishingOptions = ['All', 'Fully Furnished', 'Semi-Furnished', 'Unfurnished'];
  const genderOptions = ['Any', 'Male', 'Female'];
  const priceOptions = ['All Budgets', 'Under ₹20,000', '₹20k - ₹35k', 'Above ₹35,000'];
  const dietOptions = ['All Diets', 'Vegetarian', 'Non-Vegetarian'];

  const hasActiveFilters = 
    selectedBhk !== 'All Types' ||
    selectedFurnishing !== 'All' ||
    selectedGender !== 'Any' ||
    priceFilter !== 'All Budgets' ||
    dietFilter !== 'All Diets' ||
    petFriendlyOnly ||
    cleanlinessFilter !== null;

  return (
    <div className="bg-white border-b border-slate-200/90 sticky top-18 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 lg:pb-0 no-scrollbar">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider pr-1 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" />
              <span>Filters</span>
            </div>

            {/* Price Filter */}
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-hidden hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              {priceOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            {activeTab === 'flat' ? (
              <>
                {/* BHK / Type */}
                <select
                  value={selectedBhk}
                  onChange={(e) => setSelectedBhk(e.target.value)}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-hidden hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                >
                  {bhkOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>

                {/* Furnishing */}
                <select
                  value={selectedFurnishing}
                  onChange={(e) => setSelectedFurnishing(e.target.value)}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-hidden hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                >
                  {furnishingOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt === 'All' ? 'Any Furnishing' : opt}</option>
                  ))}
                </select>
              </>
            ) : (
              <>
                {/* Diet */}
                <select
                  value={dietFilter}
                  onChange={(e) => setDietFilter(e.target.value)}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-hidden hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                >
                  {dietOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>

                {/* Cleanliness Minimum */}
                <select
                  value={cleanlinessFilter ?? 'all'}
                  onChange={(e) => setCleanlinessFilter(e.target.value === 'all' ? null : Number(e.target.value))}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-hidden hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                >
                  <option value="all">Any Cleanliness</option>
                  <option value="4">Cleanliness: 4+ / 5</option>
                  <option value="5">Cleanliness: Immaculate 5/5</option>
                </select>

                {/* Pet Friendly Toggle */}
                <button
                  type="button"
                  onClick={() => setPetFriendlyOnly(!petFriendlyOnly)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-colors shrink-0 flex items-center gap-1 ${
                    petFriendlyOnly
                      ? 'bg-purple-50 text-purple-700 border-purple-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>🐾 Pet Friendly</span>
                </button>
              </>
            )}

            {/* Gender Preference */}
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-hidden hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              {genderOptions.map((opt) => (
                <option key={opt} value={opt}>{opt === 'Any' ? 'Any Gender' : `${opt} Only`}</option>
              ))}
            </select>

            {/* Clear All Reset */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onReset}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Results count & Quick Info */}
          <div className="flex items-center justify-between lg:justify-end gap-3 text-xs text-slate-500 font-medium border-t lg:border-t-0 pt-2 lg:pt-0">
            <span className="font-semibold text-slate-800">
              Showing <span className="text-brand-600">{resultsCount}</span> {activeTab === 'flat' ? 'available flats' : 'compatible flatmates'}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-emerald-700 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Direct from verified residents
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
