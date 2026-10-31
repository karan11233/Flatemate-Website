import React, { useState, useEffect } from 'react';
import { Sparkles, X, ShieldCheck, AlertCircle } from 'lucide-react';
import { SpaceListing, AuthUser } from '../../types';
import { validateContent, validateIndianPhone } from '../../lib/moderation';

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const phoneCheck = validateIndianPhone(phone);
    if (!phoneCheck.isValid) {
      setErrorMessage(phoneCheck.reason || 'Invalid phone number.');
      return;
    }

    const contentCheck = validateContent(`${name} ${note}`);
    if (!contentCheck.isValid) {
      setErrorMessage(contentCheck.reason || 'Content contains prohibited words.');
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
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Direct Host Introduction</span>
            </div>
            <h3 className="font-heading text-xl font-bold text-slate-900">
              Connect with {hostName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
              Regarding <strong>{space.type}</strong> • {space.location}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Your Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Your WhatsApp Mobile Number *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210 (10 digits)"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Planned Move-in Date
            </label>
            <input
              type="text"
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
              placeholder="e.g. Immediate / Next Monday / 1st of next month"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Short Note or Introduction (Optional)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. I work at Infocity. Looking for a clean room with peaceful roommates."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-100 p-3 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Your information is delivered directly to this host with zero broker commission.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary hover:bg-primary/95 px-5 py-2.5 text-xs font-bold text-white shadow-xs cursor-pointer"
            >
              Send Move-in Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
