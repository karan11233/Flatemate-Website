import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  Phone, 
  User, 
  ShieldCheck 
} from 'lucide-react';
import { FlatListing, VisitBooking } from '../types';

interface ScheduleVisitModalProps {
  flat: FlatListing | null;
  onClose: () => void;
  onSuccess: (booking: VisitBooking) => void;
}

export const ScheduleVisitModal: React.FC<ScheduleVisitModalProps> = ({
  flat,
  onClose,
  onSuccess,
}) => {
  const [visitType, setVisitType] = useState<'In-Person' | 'Video Call'>('In-Person');
  const [selectedDate, setSelectedDate] = useState('Tomorrow');
  const [selectedSlot, setSelectedSlot] = useState('11:00 AM - 12:00 PM');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [isBooked, setIsBooked] = useState(false);

  if (!flat) return null;

  // Next 5 days
  const dateOptions = ['Today', 'Tomorrow', 'This Saturday', 'This Sunday', 'Next Monday'];
  const slotOptions = [
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '02:00 PM - 03:00 PM',
    '04:30 PM - 05:30 PM',
    '06:30 PM - 07:30 PM'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userPhone.trim()) {
      alert('Please provide your name and phone number so the host can confirm the visit.');
      return;
    }

    const booking: VisitBooking = {
      listingId: flat.id,
      listingTitle: flat.title,
      visitType,
      date: selectedDate,
      timeSlot: selectedSlot,
      userName,
      userPhone,
    };

    setIsBooked(true);
    setTimeout(() => {
      onSuccess(booking);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-brand-600 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-brand-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-brand-200" />
            <span>Instant Zero-Brokerage Booking</span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            Schedule a Visit
          </h2>
          <p className="text-xs text-brand-100 mt-1 line-clamp-1">
            {flat.title} • {flat.location}
          </p>
        </div>

        {isBooked ? (
          /* Confirmation Success State */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Visit Successfully Requested!
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              Your <strong>{visitType}</strong> visit has been sent to <strong>{flat.postedBy.name}</strong> for <strong>{selectedDate}</strong> at <strong>{selectedSlot}</strong>.
            </p>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium">
              📱 Confirmation SMS & WhatsApp details dispatched to <strong>{userPhone}</strong>.
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Visit Type Toggle */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Choose Visit Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVisitType('In-Person')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                    visitType === 'In-Person'
                      ? 'border-brand-600 bg-brand-50/70 text-brand-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-brand-600" />
                  <span>In-Person Walkthrough</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVisitType('Video Call')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                    visitType === 'Video Call'
                      ? 'border-brand-600 bg-brand-50/70 text-brand-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Video className="w-4 h-4 text-brand-600" />
                  <span>Live Video Call Tour</span>
                </button>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Preferred Date
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {dateOptions.map((date) => (
                  <button
                    key={date}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-colors border ${
                      selectedDate === date
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Preferred Time Slot
              </label>
              <div className="grid grid-cols-2 gap-2">
                {slotOptions.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-2.5 rounded-xl text-[11px] font-semibold transition-all border text-center flex items-center justify-center gap-1.5 ${
                      selectedSlot === slot
                        ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{slot}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-3 pt-1 border-t border-slate-100">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Arjun Patel"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Your WhatsApp / Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Host Trust Note */}
            <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/60">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Free cancellation anytime. Your contact details are shared only with the verified host.</span>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-brand-500/30 transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Confirm & Request Visit</span>
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
