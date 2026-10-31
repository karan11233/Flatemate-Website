import React from 'react';
import Image from 'next/image';
import { X, MapPin, Check, ShieldCheck, UserCheck, FileText, Image as ImageIcon } from 'lucide-react';
import { SpaceListing } from '../../types';
import { WhatsAppIcon } from '../icons/WhatsAppIcon';

interface ListingDetailModalProps {
  space: SpaceListing | null;
  onClose: () => void;
  onExpressInterest: (space: SpaceListing) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  space,
  onClose,
  onExpressInterest,
}) => {
  if (!space) return null;

  const isSeeker = space.category === 'seeker';
  const cleanPhone = (space.hostPhone || '').replace(/\D/g, '').slice(-10);

  const whatsappMessage = encodeURIComponent(
    isSeeker
      ? `Hi ${space.hostName || ''}, I saw your post on Flatemate Ahmedabad seeking a flat/roommate (${space.type}). I have a space available that might match your requirement.`
      : `Hi ${space.hostName || ''}, I saw your listing on Flatemate for ${space.type} in ${space.location}. Is it still available? I would like to schedule a visit.`
  );

  const whatsappLink = `https://wa.me/91${cleanPhone}?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Visual Header */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100 shrink-0">
          {space.image && space.image.trim() !== '' ? (
            <Image
              src={space.image}
              alt={space.type}
              fill
              className="object-cover"
              sizes="(max-width: 600px) 100vw, 500px"
            />
          ) : isSeeker ? (
            <div className="h-full w-full bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col items-center justify-center p-6 text-center select-none">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-2">
                <UserCheck className="w-8 h-8 text-emerald-600" />
              </div>
              <span className="text-sm font-bold text-slate-800">Flat Seeker Profile</span>
              <span className="text-xs text-slate-500 mt-0.5">Looking for flat / flatmate in Ahmedabad</span>
            </div>
          ) : (
            <div className="h-full w-full bg-slate-100 flex flex-col items-center justify-center p-6 text-center select-none">
              <ImageIcon className="w-10 h-10 text-slate-300 mb-1" />
              <span className="text-xs font-semibold text-slate-400">No Photos Attached</span>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Details Content */}
        <div className="p-6 overflow-y-auto">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isSeeker ? 'text-emerald-700' : 'text-primary'
              }`}
            >
              {space.hostName
                ? `${isSeeker ? 'SEEKER' : 'HOST'}: ${space.hostName}`
                : isSeeker
                ? 'VERIFIED SEEKER'
                : 'VERIFIED LISTING'}
            </span>
            {space.verified && (
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
          </div>

          <h3 className="font-heading text-xl font-bold text-slate-900">
            {space.type}
          </h3>

          <p className="mt-2 text-2xl font-black text-primary font-heading">
            {space.rent}
            <span className="text-sm font-normal text-slate-500 ml-1">
              {isSeeker ? 'max budget' : '/month'}
            </span>
          </p>

          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{space.location}</span>
          </p>

          {/* Furnishing & Occupancy */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              {space.furnishing}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              {space.occupancy}
            </span>
          </div>

          {/* Amenities & Highlights */}
          {space.amenities && space.amenities.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Amenities & Highlights
              </p>
              <div className="flex flex-wrap gap-1.5">
                {space.amenities.map((amenity, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-800 px-2.5 py-1 text-xs font-semibold border border-emerald-200"
                  >
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>{amenity}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {space.description && (
            <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>About the Space & House Rules</span>
              </p>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line mt-1">
                {space.description}
              </p>
            </div>
          )}

          {/* Modal Action Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Close
            </button>

            {isSeeker ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Connect on WhatsApp</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onExpressInterest(space);
                }}
                className="flex-1 py-3 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Express Interest
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
