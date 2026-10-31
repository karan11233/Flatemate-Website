import React from 'react';
import { 
  ShieldCheck, 
  Heart, 
  MapPin, 
  Zap, 
  MessageSquare, 
  Briefcase, 
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { FlatmateProfile } from '../types';

interface FlatmateCardProps {
  flatmate: FlatmateProfile;
  isSaved: boolean;
  onToggleSave: (mate: FlatmateProfile) => void;
  onSelect: (mate: FlatmateProfile) => void;
  onMessage: (mate: FlatmateProfile) => void;
}

export const FlatmateCard: React.FC<FlatmateCardProps> = ({
  flatmate,
  isSaved,
  onToggleSave,
  onSelect,
  onMessage,
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div 
      onClick={() => onSelect(flatmate)}
      className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      <div className="p-5">
        
        {/* Header: Avatar, Name, Active status & Save button */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5">
            {/* Avatar with active indicator dot */}
            <div className="relative">
              <img
                src={flatmate.avatar}
                alt={flatmate.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform"
              />
              {flatmate.activeStatus === 'Active Now' && (
                <span 
                  className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white active-pulse-dot" 
                  title="Active Now"
                />
              )}
            </div>

            {/* Name & Title */}
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-brand-600 transition-colors">
                  {flatmate.name}, {flatmate.age}
                </h3>
                {flatmate.verified && (
                  <span title="Identity & SMS Verified" className="text-emerald-600">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                )}
              </div>

              {/* Profession & Company */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mt-0.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">
                  {flatmate.profession} {flatmate.company ? `@ ${flatmate.company}` : ''}
                </span>
              </div>

              {/* Response Time Indicator */}
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1.5 w-fit">
                <Zap className="w-3 h-3 text-emerald-600" />
                <span>{flatmate.responseTime}</span>
              </div>
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(flatmate);
            }}
            className={`p-2 rounded-xl border transition-colors shadow-2xs ${
              isSaved
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-slate-50 text-slate-400 hover:text-rose-500 border-slate-200 hover:bg-rose-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Short Bio */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
          "{flatmate.bio}"
        </p>

        {/* Budget & Move-in */}
        <div className="grid grid-cols-2 gap-2 mb-4 bg-brand-50/40 p-2.5 rounded-xl border border-brand-100/60">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Budget Range
            </span>
            <span className="text-xs font-extrabold text-brand-700">
              {formatCurrency(flatmate.budget.min)} - {formatCurrency(flatmate.budget.max)}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Move-in Date
            </span>
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {flatmate.moveInDate}
            </span>
          </div>
        </div>

        {/* Lifestyle Chips */}
        <div className="mb-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Lifestyle Traits
          </div>
          <div className="flex flex-wrap gap-1.5">
            {/* Cleanliness */}
            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2 py-0.5 rounded-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Cleanliness {flatmate.lifestyle.cleanliness}/5
            </span>

            {/* Sleep Cycle */}
            <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg">
              {flatmate.lifestyle.sleepCycle}
            </span>

            {/* Diet */}
            <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg">
              {flatmate.lifestyle.diet}
            </span>

            {/* Smoking */}
            <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg">
              {flatmate.lifestyle.smoking}
            </span>

            {/* Pet friendly */}
            {flatmate.lifestyle.petFriendly && (
              <span className="text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/60 px-2 py-0.5 rounded-lg">
                🐾 Pet Friendly
              </span>
            )}
          </div>
        </div>

        {/* Preferred Locations */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Looking in
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
            <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span className="truncate">{flatmate.preferredLocations.join(', ')} ({flatmate.city})</span>
          </div>
        </div>

      </div>

      {/* Card Action Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(flatmate);
          }}
          className="flex items-center justify-center py-2 px-3 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-bold transition-colors"
        >
          View Profile
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMessage(flatmate);
          }}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs shadow-brand-500/25 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Connect</span>
        </button>
      </div>

    </div>
  );
};
