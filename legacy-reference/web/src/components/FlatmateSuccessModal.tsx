import React from 'react';
import { FlatmateProfile } from './ConnectFlatmateModal';

interface FlatmateSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  flatmate: FlatmateProfile | null;
  seekerName: string;
  seekerPhone: string;
  moveInDate: string;
  note: string;
}

export const FlatmateSuccessModal: React.FC<FlatmateSuccessModalProps> = ({
  isOpen,
  onClose,
  flatmate,
  seekerName,
  seekerPhone,
  moveInDate,
  note,
}) => {
  if (!isOpen || !flatmate) return null;

  const rawPhone = (flatmate.phone || '9822114455').replace(/\D/g, '').slice(-10);

  const introText = note ? ` Note: "${note}"` : '';
  const whatsappMessage = `Hi ${flatmate.name}, I found your flatmate profile on Flatemate (looking in ${flatmate.preferred}, budget ${flatmate.budget}). My name is ${seekerName} (Phone: ${seekerPhone}). Move-in around ${moveInDate || 'soon'}.${introText} Would you like to connect and see if we can flat hunt or share a flat together?`;

  const whatsappUrl = `https://wa.me/91${rawPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-border animate-in fade-in zoom-in-95 text-center space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Check Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <iconify-icon icon="lucide:check-circle" class="text-3xl"></iconify-icon>
        </div>

        <div>
          <h3 className="font-heading text-xl font-bold text-slate-900">
            Request Sent to {flatmate.name}!
          </h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Your connection request has been logged. You can now chat directly with <strong>{flatmate.name}</strong> on WhatsApp to discuss flat preferences.
          </p>
        </div>

        {/* Profile Snapshot */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center gap-3 text-left">
          <img
            src={flatmate.image}
            alt={flatmate.name}
            className="w-12 h-12 rounded-full object-cover border border-primary"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-900">{flatmate.name}, {flatmate.age}</h4>
            <p className="text-[11px] text-muted-foreground">{flatmate.role} • {flatmate.preferred}</p>
          </div>
          <span className="text-xs font-black text-primary">{flatmate.budget}</span>
        </div>

        {/* Direct WhatsApp Action Box */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-left space-y-3">
          <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
            <iconify-icon icon="lucide:zap" class="text-emerald-600 text-base"></iconify-icon>
            <span>Instant Chat</span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            Open WhatsApp right now to send your pre-filled introduction to {flatmate.name}.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <iconify-icon icon="lucide:message-circle" class="text-lg"></iconify-icon>
            <span>Start WhatsApp Chat with {flatmate.name}</span>
          </a>

          <a
            href={`tel:+91${rawPhone}`}
            className="w-full py-2.5 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <iconify-icon icon="lucide:phone" class="text-sm"></iconify-icon>
            <span>Call +91 {rawPhone.slice(0, 5)} {rawPhone.slice(5)}</span>
          </a>
        </div>

        <button
          onClick={onClose}
          className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          Close & continue browsing
        </button>
      </div>
    </div>
  );
};
