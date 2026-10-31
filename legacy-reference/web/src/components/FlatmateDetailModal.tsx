import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Briefcase, 
  MapPin, 
  Sparkles, 
  MessageSquare, 
  Heart, 
  Clock, 
  Zap, 
  CheckCircle2,
  Calendar,
  Coffee,
  Moon,
  Sun,
  Flame,
  Wine
} from 'lucide-react';
import { FlatmateProfile } from '../types';

interface FlatmateDetailModalProps {
  flatmate: FlatmateProfile | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (mate: FlatmateProfile) => void;
  onSendMessage: (mate: FlatmateProfile) => void;
}

export const FlatmateDetailModal: React.FC<FlatmateDetailModalProps> = ({
  flatmate,
  onClose,
  isSaved,
  onToggleSave,
  onSendMessage,
}) => {
  if (!flatmate) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-purple-50 text-purple-700 px-3 py-1 rounded-lg border border-purple-200/60">
              Potential Flatmate
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Looking in {flatmate.city}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleSave(flatmate)}
              className={`p-2 rounded-full hover:bg-slate-100 transition-colors ${
                isSaved ? 'text-rose-500' : 'text-slate-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-7">
          
          {/* Top Hero: Avatar & Bio */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="relative">
              <img
                src={flatmate.avatar}
                alt={flatmate.name}
                className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-xl"
              />
              {flatmate.activeStatus === 'Active Now' && (
                <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 rounded-full border-3 border-white active-pulse-dot" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {flatmate.name}, {flatmate.age}
                </h2>
                {flatmate.verified && (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Shield
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-600 font-semibold mt-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>{flatmate.profession} {flatmate.company ? `@ ${flatmate.company}` : ''}</span>
              </div>

              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg mt-2">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>{flatmate.responseTime} • {flatmate.responseRate} response rate</span>
              </div>
            </div>
          </div>

          {/* Verification Trust Box */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Flatemate 2-Step Trust Guarantee</span>
            </div>
            <div className="flex items-center gap-4 text-emerald-800 font-semibold">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Govt ID Checked
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Phone OTP Verified
              </span>
            </div>
          </div>

          {/* Budget & Desired Localities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Budget Range
              </span>
              <div className="text-lg font-extrabold text-slate-900">
                {formatCurrency(flatmate.budget.min)} - {formatCurrency(flatmate.budget.max)}
                <span className="text-xs text-slate-400 font-normal"> / mo</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Move-in Date
              </span>
              <div className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-600" />
                <span>{flatmate.moveInDate}</span>
              </div>
            </div>
          </div>

          {/* Preferred Areas */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Preferred Localities
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {flatmate.preferredLocations.map((loc, idx) => (
                <span
                  key={idx}
                  className="bg-brand-50 text-brand-700 border border-brand-200/80 text-xs font-semibold px-3 py-1 rounded-xl flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3 text-brand-600" />
                  {loc}
                </span>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              About Me
            </span>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              "{flatmate.bio}"
            </p>
          </div>

          {/* Lifestyle Compatibility Matrix */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block mb-3">
              Lifestyle & Habits Radar
            </span>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              
              {/* Cleanliness */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 block">Cleanliness</span>
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" /> {flatmate.lifestyle.cleanliness}/5 Clean
                </span>
              </div>

              {/* Sleep Cycle */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 block">Sleep Routine</span>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                  {flatmate.lifestyle.sleepCycle === 'Early Bird' ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
                  {flatmate.lifestyle.sleepCycle}
                </span>
              </div>

              {/* Diet */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 block">Dietary Habit</span>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                  <Coffee className="w-3.5 h-3.5 text-emerald-600" />
                  {flatmate.lifestyle.diet}
                </span>
              </div>

              {/* Smoking */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 block">Smoking</span>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                  <Flame className="w-3.5 h-3.5 text-slate-400" />
                  {flatmate.lifestyle.smoking}
                </span>
              </div>

              {/* Drinking */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 block">Drinking</span>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                  <Wine className="w-3.5 h-3.5 text-purple-500" />
                  {flatmate.lifestyle.drinking}
                </span>
              </div>

              {/* Pets */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 block">Pet Friendly</span>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                  {flatmate.lifestyle.petFriendly ? '🐾 Yes, Loves Pets' : '❌ Prefers No Pets'}
                </span>
              </div>

            </div>
          </div>

          {/* Interests */}
          {flatmate.interests && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Hobbies & Passions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {flatmate.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg"
                  >
                    #{interest}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-0 z-20 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Target Budget</span>
            <span className="text-base font-extrabold text-slate-900">
              Up to {formatCurrency(flatmate.budget.max)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onSendMessage(flatmate)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-500/30 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Connect & Message</span>
          </button>
        </div>

      </div>
    </div>
  );
};
