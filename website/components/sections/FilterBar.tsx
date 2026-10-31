import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { ListingCategory } from '../../types';
import { AHMEDABAD_LOCALITIES, BUDGET_RANGES } from '../../data/mockData';

interface FilterBarProps {
  selectedCategory: ListingCategory | 'all';
  selectedLocality: string;
  selectedBudget: string;
  onSelectCategory: (category: ListingCategory | 'all') => void;
  onSelectLocality: (locality: string) => void;
  onSelectBudget: (budget: string) => void;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedCategory,
  selectedLocality,
  selectedBudget,
  onSelectCategory,
  onSelectLocality,
  onSelectBudget,
  onResetFilters,
}) => {
  const isFiltered =
    selectedCategory !== 'all' ||
    selectedLocality !== 'All' ||
    selectedBudget !== 'Any';

  return (
    <section id="search" className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 lg:px-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100/90 border border-slate-200/60 w-max max-w-full">
            <button
              type="button"
              onClick={() => onSelectCategory('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Listings
            </button>
            <button
              type="button"
              onClick={() => onSelectCategory('fresh')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'fresh'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fresh Flats
            </button>
            <button
              type="button"
              onClick={() => onSelectCategory('replacement')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'replacement'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Need Replacement
            </button>
            <button
              type="button"
              onClick={() => onSelectCategory('seeker')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'seeker'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Looking for Flat
            </button>
          </div>

          {/* Locality & Budget Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Locality Dropdown */}
            <div className="relative min-w-[160px] sm:min-w-[190px]">
              <select
                value={selectedLocality}
                onChange={(e) => onSelectLocality(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                {AHMEDABAD_LOCALITIES.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc === 'All' ? 'All Ahmedabad Localities' : loc}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <Filter className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Budget Dropdown */}
            <div className="relative min-w-[140px] sm:min-w-[160px]">
              <select
                value={selectedBudget}
                onChange={(e) => onSelectBudget(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                {BUDGET_RANGES.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <Filter className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Reset Button */}
            {isFiltered && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
