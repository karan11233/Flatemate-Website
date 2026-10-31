import React, { useState, useEffect } from 'react';
import { SpaceListing, AuthUser } from '../types';
import { validateContent, validateIndianPhone } from '../lib/moderation';

interface ExpressInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  space: SpaceListing | null;
  currentUser?: AuthUser | null;
  onSubmit: (data: {
    seekerName: string;
    seekerPhone: string;
    moveInDate: string;
    note: string;
  }) => void;
}

export const ExpressInterestModal: React.FC<ExpressInterestModalProps> = ({
  isOpen,
  onClose,
  space,
  currentUser,
  onSubmit,
}) => {
  const [name, setName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [moveInDate, setMoveInDate] = useState('');
  const [note, setNote] = useState('');
  const [consent, setConsent] = useState(true);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.fullName) setName(currentUser.fullName);
      if (currentUser.phone) setPhone(currentUser.phone);
    }
  }, [currentUser]);

  if (!isOpen || !space) return null;

  const hostName = space.hostName || 'Listing Host';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Please fill out your name and phone number.');
      return;
    }

    // Phone validation
    const phoneCheck = validateIndianPhone(phone);
    if (!phoneCheck.isValid) {
      alert(`⚠️ ${phoneCheck.reason}`);
      return;
    }

    // Content moderation
    const contentCheck = validateContent(`${name} ${note}`);
    if (!contentCheck.isValid) {
      alert(`🚫 Moderation Block: ${contentCheck.reason}`);
      return;
    }

    onSubmit({
      seekerName: name.trim(),
      seekerPhone: phone.trim(),
      moveInDate: moveInDate.trim(),
      note: note.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between bg-slate-50">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary uppercase tracking-wider mb-1">
              <iconify-icon icon="lucide:sparkles" class="text-sm"></iconify-icon>
              <span>Direct Host Introduction</span>
            </div>
            <h3 className="font-heading text-xl font-bold text-slate-900">
              Connect with {hostName}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              Regarding <strong>{space.type}</strong> • {space.location}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <iconify-icon icon="lucide:x" class="text-xl"></iconify-icon>
          </button>
        </div>

        {/* Space Mini Highlight Card */}
        <div className="px-6 pt-4">
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              {space.image && space.image.trim() !== '' && !space.image.includes('/assets/flat') ? (
                <img
                  src={space.image}
                  alt={space.type}
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center shrink-0">
                  <iconify-icon icon="lucide:home" class="text-xl text-slate-500"></iconify-icon>
                </div>
              )}
              <div>
                <span className="text-xs font-bold text-slate-900 block truncate max-w-[200px]">
                  {space.type}
                </span>
                <span className="text-[11px] text-muted-foreground">{space.furnishing} • {space.occupancy}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-primary">{space.rent}</span>
              <span className="text-[10px] text-muted-foreground block">0% Brokerage</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Yash Patel"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input text-xs font-semibold focus:border-primary outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                WhatsApp / Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input text-xs font-semibold focus:border-primary outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Preferred Move-in Date
            </label>
            <input
              type="text"
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
              placeholder="e.g. Next Monday / Immediate / 1st of month"
              className="w-full px-3.5 py-2.5 rounded-xl border border-input text-xs font-semibold focus:border-primary outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Short Introduction (Optional)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tell the host about your profession, work hours, or habits..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-input text-xs font-semibold focus:border-primary outline-hidden"
            />
          </div>

          {/* Consent Checkbox */}
          <div 
            onClick={() => setConsent(!consent)}
            className="flex items-start gap-2 text-[11px] text-muted-foreground cursor-pointer select-none pt-1"
          >
            <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${consent ? 'bg-primary border-primary text-primary-foreground' : 'border-border'}`}>
              {consent && <iconify-icon icon="lucide:check" class="text-xs"></iconify-icon>}
            </div>
            <span>
              I agree to share these details with <strong>{hostName}</strong> for walkthrough scheduling.
            </span>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="w-full py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <iconify-icon icon="lucide:send" class="text-base"></iconify-icon>
            <span>Send Interest to {hostName}</span>
          </button>

          <p className="text-[10px] text-center text-slate-400">
            🔒 Your inquiry goes directly to {hostName}'s dashboard with instant WhatsApp option.
          </p>
        </form>

      </div>
    </div>
  );
};
