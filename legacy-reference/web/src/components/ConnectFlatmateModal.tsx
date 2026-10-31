import React, { useState } from 'react';
import { validateContent, validateIndianPhone } from '../lib/moderation';

export interface FlatmateProfile {
  id: string;
  name: string;
  age: number;
  role: string;
  preferred: string;
  budget: string;
  moveIn: string;
  tags: string[];
  image: string;
  phone?: string;
  bio?: string;
}

interface ConnectFlatmateModalProps {
  isOpen: boolean;
  onClose: () => void;
  flatmate: FlatmateProfile | null;
  onSubmit: (data: {
    seekerName: string;
    seekerPhone: string;
    moveInDate: string;
    note: string;
  }) => void;
}

export const ConnectFlatmateModal: React.FC<ConnectFlatmateModalProps> = ({
  isOpen,
  onClose,
  flatmate,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [note, setNote] = useState('');
  const [consent, setConsent] = useState(true);

  if (!isOpen || !flatmate) return null;

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
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 flex flex-col my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between bg-slate-50">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary uppercase tracking-wider mb-1">
              <iconify-icon icon="lucide:user-check" class="text-sm"></iconify-icon>
              <span>Connect with Flatmate</span>
            </div>
            <h3 className="font-heading text-xl font-bold text-slate-900">
              Meet {flatmate.name}, {flatmate.age}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {flatmate.role} • Looking in {flatmate.preferred}
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

        {/* Profile Card Highlight */}
        <div className="px-6 pt-4">
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center gap-3.5">
            <img
              src={flatmate.image}
              alt={flatmate.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-primary shadow-xs"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 truncate">
                  {flatmate.name}
                </span>
                <span className="text-xs font-black text-primary">
                  {flatmate.budget}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Target Move-in: <strong>{flatmate.moveIn}</strong>
              </p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {flatmate.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold bg-white text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Share your intro so {flatmate.name} can check if your lifestyles, routine, and budget match.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Your Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your WhatsApp Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-xs text-slate-400 font-bold">+91</span>
                <input
                  type="tel"
                  required
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 pl-11 pr-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Target Move-in
              </label>
              <input
                type="text"
                placeholder="e.g. Immediately / 1st July"
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                className="w-full h-11 px-3.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Introduce Yourself (Occupation, habits, work schedule)
            </label>
            <textarea
              rows={2}
              placeholder={`Hi ${flatmate.name}, I work in IT at SG Highway and I'm looking for a clean, peaceful shared flat around ${flatmate.preferred}...`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
            />
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
            />
            <span className="text-[11px] text-muted-foreground leading-snug">
              Allow Flatemate to share my contact with {flatmate.name} for flatmate matching via WhatsApp.
            </span>
          </label>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!consent}
              className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <iconify-icon icon="lucide:message-circle" class="text-base"></iconify-icon>
              <span>Connect on WhatsApp</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
