import React from 'react';
import { Compass, Sparkles, PlusCircle } from 'lucide-react';
import { SpaceListing } from '../../types';
import { ListingCard } from '../cards/ListingCard';

interface ListingFeedProps {
  spaces: SpaceListing[];
  savedSpaceIds: string[];
  selectedLocality: string;
  onSelectLocality: (locality: string) => void;
  onToggleSave: (id: string) => void;
  onOpenDetails: (space: SpaceListing) => void;
  onExpressInterest: (space: SpaceListing) => void;
  onReport: (space: SpaceListing) => void;
  onResetFilters: () => void;
}

export const ListingFeed: React.FC<ListingFeedProps> = ({
  spaces,
  savedSpaceIds,
  selectedLocality,
  onSelectLocality,
  onToggleSave,
  onOpenDetails,
  onExpressInterest,
  onReport,
  onResetFilters,
}) => {
  const quickAreas = [
    { label: 'All Ahmedabad', value: 'All' },
    { label: 'Satellite', value: 'Satellite' },
    { label: 'Vastrapur', value: 'Vastrapur' },
    { label: 'Prahlad Nagar', value: 'Prahlad Nagar' },
    { label: 'Navrangpura', value: 'Navrangpura' },
    { label: 'Bopal', value: 'Bopal' },
  ];

  return (
    <section id="spaces" className="bg-slate-50/70 border-t border-slate-200 py-10 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Feed Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
              Ahmedabad Shared Living Feed
            </h2>
            <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-700">
              {spaces.length} {spaces.length === 1 ? 'opening' : 'openings'}
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Updated in real time • Zero Brokerage
          </span>
        </div>

        {/* Quick Area Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-6">
          <span className="text-xs font-bold text-slate-400 shrink-0">Popular:</span>
          {quickAreas.map((area) => (
            <button
              key={area.value}
              type="button"
              onClick={() => onSelectLocality(area.value)}
              className={`rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedLocality === area.value
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {area.label}
            </button>
          ))}
        </div>

        {/* Listings Grid or Empty State */}
        {spaces.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => (
              <ListingCard
                key={space.id}
                space={space}
                isSaved={savedSpaceIds.includes(space.id)}
                onToggleSave={onToggleSave}
                onOpenDetails={onOpenDetails}
                onExpressInterest={onExpressInterest}
                onReport={onReport}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center max-w-xl mx-auto my-8">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-800 font-heading">
              No listings found matching your current filter
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Try adjusting your locality or budget filter, or be the first in Ahmedabad to post your vacant space or room requirement!
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onResetFilters}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Reset Filters
              </button>
              <a
                href="#list-space"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary/95 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Post for Free</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
