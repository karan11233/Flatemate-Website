import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  MessageSquare, 
  Heart, 
  ChevronLeft, 
  ChevronRight,
  Check,
  Zap,
  Phone,
  Share2,
  Clock
} from 'lucide-react';
import { FlatListing } from '../types';

interface FlatDetailModalProps {
  flat: FlatListing | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (flat: FlatListing) => void;
  onScheduleVisit: (flat: FlatListing) => void;
  onContactHost: (flat: FlatListing) => void;
}

export const FlatDetailModal: React.FC<FlatDetailModalProps> = ({
  flat,
  onClose,
  isSaved,
  onToggleSave,
  onScheduleVisit,
  onContactHost,
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!flat) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header with Close & Actions */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-brand-50 text-brand-700 px-3 py-1 rounded-lg border border-brand-200/60">
              {flat.type}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {flat.furnishing}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
              title="Share link"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={() => onToggleSave(flat)}
              className={`p-2 rounded-full hover:bg-slate-100 transition-colors ${
                isSaved ? 'text-rose-500' : 'text-slate-600'
              }`}
              title="Save to favorites"
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
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Main Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
              <img
                src={flat.images[activeImageIdx]}
                alt={flat.title}
                className="w-full h-full object-cover"
              />
              {flat.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveImageIdx((prev) => (prev - 1 + flat.images.length) % flat.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 text-slate-800 shadow-lg hover:bg-white transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImageIdx((prev) => (prev + 1) % flat.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 text-slate-800 shadow-lg hover:bg-white transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Row */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {flat.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    idx === activeImageIdx ? 'border-brand-600 ring-2 ring-brand-500/30' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Pricing & Key Summary Grid */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Monthly Rent
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {formatCurrency(flat.rent)}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">0% Brokerage</span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Security Deposit
              </span>
              <div className="text-xl sm:text-2xl font-bold text-slate-800">
                {formatCurrency(flat.deposit)}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Refundable</span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Maintenance
              </span>
              <div className="text-xl sm:text-2xl font-bold text-slate-800">
                ₹{flat.maintenance}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">per month</span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Available From
              </span>
              <div className="text-base sm:text-lg font-bold text-emerald-700 flex items-center gap-1 mt-1">
                <Clock className="w-4 h-4" />
                <span>{flat.availableFrom}</span>
              </div>
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified Listing
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Gender: <strong className="text-slate-800">{flat.genderPreference}</strong>
              </span>
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
              {flat.title}
            </h2>

            <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium mb-4">
              <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
              <span>{flat.location}, {flat.city}</span>
              {flat.nearbyMetro && (
                <span className="text-xs text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md ml-2 font-semibold">
                  🚇 {flat.nearbyMetro}
                </span>
              )}
            </div>

            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              {flat.description}
            </p>
          </div>

          {/* Amenities Grid */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">
              Included Amenities & Furnishings
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {flat.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700"
                >
                  <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* House Rules */}
          {flat.rules && flat.rules.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">
                House Preferences & Rules
              </h3>
              <div className="space-y-2">
                {flat.rules.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                    <span className="text-brand-600 font-bold">•</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hosted By Profile Card */}
          <div className="bg-brand-50/50 rounded-2xl border border-brand-100 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={flat.postedBy.avatar}
                alt={flat.postedBy.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-slate-900 text-base">
                    {flat.postedBy.name}
                  </h4>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  {flat.postedBy.role} • 0% Brokerage Guarantee
                </div>
                <div className="text-[11px] font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-600" />
                  <span>{flat.postedBy.responseTime}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onContactHost(flat)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-brand-200 bg-white hover:bg-brand-50 text-brand-700 text-xs font-bold transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message</span>
              </button>
              {flat.postedBy.phone && (
                <a
                  href={`tel:${flat.postedBy.phone}`}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-brand-600 transition-colors"
                  title="Call host"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-0 z-20 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-500 font-medium block">All inclusive rent</span>
            <span className="text-xl font-extrabold text-slate-900">
              {formatCurrency(flat.rent)}
              <span className="text-xs text-slate-400 font-normal"> / mo</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => onContactHost(flat)}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Ask Question</span>
            </button>
            <button
              type="button"
              onClick={() => onScheduleVisit(flat)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-500/30 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule a Visit</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
