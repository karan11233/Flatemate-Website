import React, { useState } from 'react';
import { 
  Heart, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Wifi, 
  Wind, 
  Car, 
  Sparkles,
  Zap,
  Eye
} from 'lucide-react';
import { FlatListing } from '../types';

interface FlatCardProps {
  flat: FlatListing;
  isSaved: boolean;
  onToggleSave: (flat: FlatListing) => void;
  onSelect: (flat: FlatListing) => void;
  onScheduleVisit: (flat: FlatListing) => void;
}

export const FlatCard: React.FC<FlatCardProps> = ({
  flat,
  isSaved,
  onToggleSave,
  onSelect,
  onScheduleVisit,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % flat.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + flat.images.length) % flat.images.length);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div 
      onClick={() => onSelect(flat)}
      className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
        <img
          src={flat.images[currentImageIndex] || flat.images[0]}
          alt={flat.title}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            {flat.zeroBrokerage && (
              <span className="bg-white/95 backdrop-blur-md text-brand-700 text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm border border-brand-100 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-brand-600" />
                <span>0% BROKERAGE</span>
              </span>
            )}
            {flat.verified && (
              <span className="bg-emerald-600/95 backdrop-blur-md text-white text-[11px] font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>VERIFIED</span>
              </span>
            )}
          </div>

          {/* Heart Save Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(flat);
            }}
            className={`pointer-events-auto p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
              isSaved 
                ? 'bg-rose-500 text-white scale-110' 
                : 'bg-white/90 text-slate-700 hover:bg-white hover:text-rose-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Image Carousel Controls */}
        {flat.images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 pointer-events-none">
              {flat.images.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Bottom Property Tag inside Image */}
        <div className="absolute bottom-3 left-3 pointer-events-none flex items-center gap-2">
          <span className="text-xs font-bold text-white bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-white/20">
            {flat.type}
          </span>
          <span className="text-xs font-semibold text-white/90 drop-shadow-sm">
            {flat.furnishing}
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Price & Deposit */}
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {formatCurrency(flat.rent)}
              </span>
              <span className="text-xs font-semibold text-slate-500"> / month</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 font-medium">Deposit: </span>
              <span className="text-xs font-bold text-slate-700">{formatCurrency(flat.deposit)}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 mb-1.5">
            {flat.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mb-3">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{flat.location}, {flat.city}</span>
          </div>

          {/* Quick Amenities */}
          <div className="flex items-center gap-1.5 flex-wrap mb-4">
            {flat.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
              >
                {amenity}
              </span>
            ))}
            {flat.amenities.length > 3 && (
              <span className="text-[11px] font-semibold text-slate-400">
                +{flat.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Footer: Posted By info + Action buttons */}
        <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={flat.postedBy.avatar}
                alt={flat.postedBy.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-200"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 line-clamp-1">
                  {flat.postedBy.name}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {flat.postedBy.role}
                </span>
              </div>
            </div>

            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-600" />
              <span>{flat.postedBy.responseTime}</span>
            </span>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(flat);
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Details</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onScheduleVisit(flat);
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs shadow-brand-500/30 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule Visit</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
