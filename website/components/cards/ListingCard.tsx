import React from 'react';
import Image from 'next/image';
import { MapPin, ShieldCheck, Heart, Flag, Check, UserCheck, Image as ImageIcon } from 'lucide-react';
import { SpaceListing } from '../../types';
import { WhatsAppIcon } from '../icons/WhatsAppIcon';

interface ListingCardProps {
  space: SpaceListing;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onOpenDetails: (space: SpaceListing) => void;
  onExpressInterest: (space: SpaceListing) => void;
  onReport: (space: SpaceListing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  space,
  isSaved,
  onToggleSave,
  onOpenDetails,
  onExpressInterest,
  onReport,
}) => {
  const isSeeker = space.category === 'seeker';
  const cleanPhone = (space.hostPhone || '').replace(/\D/g, '').slice(-10);

  const whatsappMessage = encodeURIComponent(
    isSeeker
      ? `Hi ${space.hostName || ''}, I saw your post on Flatemate Ahmedabad seeking a flat/roommate (${space.type}). I have a space available that might match your requirement.`
      : `Hi ${space.hostName || ''}, I saw your listing on Flatemate for ${space.type} in ${space.location}. Is it still available? I would like to schedule a visit.`
  );

  const whatsappLink = `https://wa.me/91${cleanPhone}?text=${whatsappMessage}`;

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden">
      <div>
        {/* Card Header Media */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100 cursor-pointer" onClick={() => onOpenDetails(space)}>
          {space.image && space.image.trim() !== '' ? (
            <Image
              src={space.image}
              alt={space.type}
              fill
              className="object-cover group-hover:scale-103 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : isSeeker ? (
            <div className="h-full w-full bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col items-center justify-center p-4 text-center select-none">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-2">
                <UserCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-slate-800">Flat Seeker Profile</span>
              <span className="text-[11px] text-slate-500 font-medium mt-0.5">Looking to move in Ahmedabad</span>
            </div>
          ) : (
            <div className="h-full w-full bg-slate-100 flex flex-col items-center justify-center p-4 text-center select-none">
              <ImageIcon className="w-8 h-8 text-slate-300 mb-1" />
              <span className="text-xs font-semibold text-slate-400">Verified Listing</span>
            </div>
          )}

          {/* Top Floating Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-1.5">
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-sm backdrop-blur-md ${
                  isSeeker
                    ? 'bg-emerald-600 text-white'
                    : space.category === 'replacement'
                    ? 'bg-amber-600 text-white'
                    : 'bg-primary text-white'
                }`}
              >
                {isSeeker ? 'Flat Seeker' : space.category === 'replacement' ? 'Replacement' : 'Fresh Flat'}
              </span>
              {space.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-emerald-700 shadow-xs">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verified</span>
                </span>
              )}
            </div>

            {/* Save Heart Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(space.id);
              }}
              className="pointer-events-auto p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md transition-all cursor-pointer"
              title={isSaved ? 'Remove from saved' : 'Save listing'}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isSaved ? 'fill-rose-500 text-rose-500' : 'text-slate-600 hover:text-rose-500'
                }`}
              />
            </button>
          </div>

          {/* Price Overlay Banner */}
          <div className="absolute bottom-2.5 left-2.5">
            <span className="rounded-lg bg-slate-900/85 backdrop-blur-md px-2.5 py-1 text-xs font-extrabold text-white shadow-sm">
              {space.rent}
            </span>
          </div>
        </div>

        {/* Card Body Details */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3
                onClick={() => onOpenDetails(space)}
                className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors cursor-pointer line-clamp-1 font-heading"
              >
                {space.type}
              </h3>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{space.location}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => onReport(space)}
              title="Report listing"
              className="p-1 text-slate-300 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Occupancy and Furnishing Badges */}
          <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-semibold text-slate-600">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 truncate max-w-[150px]">
              {space.furnishing}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 truncate max-w-[150px]">
              {space.occupancy}
            </span>
          </div>

          {/* Amenities Chips */}
          {space.amenities && space.amenities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1 text-[10px] font-medium text-slate-600">
              {space.amenities.slice(0, 3).map((amenity, idx) => (
                <span key={idx} className="inline-flex items-center gap-0.5 rounded-sm bg-emerald-50 px-1.5 py-0.5 text-emerald-800 border border-emerald-100">
                  <Check className="w-2.5 h-2.5" />
                  <span>{amenity}</span>
                </span>
              ))}
              {space.amenities.length > 3 && (
                <span className="rounded-sm bg-slate-100 px-1.5 py-0.5 text-slate-500">
                  +{space.amenities.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Host Info Snippet */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
                {(space.hostName || 'H').charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-slate-800 truncate max-w-[110px]">
                {space.hostName || (isSeeker ? 'Seeker' : 'Host')}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              ⚡ Replies in minutes
            </span>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 flex items-center gap-2">
        {isSeeker ? (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-2.5 text-xs font-bold text-white shadow-2xs transition-colors cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4" />
            <span>Connect on WhatsApp</span>
          </a>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onExpressInterest(space)}
              className="flex-1 rounded-xl bg-primary hover:bg-primary/95 px-3 py-2.5 text-xs font-bold text-white shadow-2xs transition-colors cursor-pointer"
            >
              Interested
            </button>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-50 hover:bg-emerald-100 px-3 py-2.5 text-xs font-bold text-emerald-800 transition-colors cursor-pointer"
              title="Chat directly on WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
            </a>
          </>
        )}
      </div>
    </div>
  );
};
