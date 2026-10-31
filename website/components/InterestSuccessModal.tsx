import React from 'react';
import { SpaceListing } from '../types';

interface InterestSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  space: SpaceListing | null;
  seekerName: string;
  seekerPhone: string;
  moveInDate: string;
}

export const InterestSuccessModal: React.FC<InterestSuccessModalProps> = ({
  isOpen,
  onClose,
  space,
  seekerName,
  seekerPhone,
  moveInDate,
}) => {
  if (!isOpen || !space) return null;

  const hostName = space.hostName || 'Host';
  const rawHostPhone = (space.hostPhone || '9876543210').replace(/\D/g, '').slice(-10);
  
  const whatsappMessage = `Hi ${hostName}, I saw your listing "${space.type}" in ${space.location} on Flatemate. My name is ${seekerName} (Phone: ${seekerPhone}), and I'm planning to move in around ${moveInDate || 'soon'}. Are you available for a quick chat or visit walkthrough?`;
  
  const whatsappUrl = `https://wa.me/91${rawHostPhone}?text=${encodeURIComponent(whatsappMessage)}`;

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
            Request Sent to {hostName}!
          </h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Your inquiry for <strong>{space.type}</strong> ({space.location}) has been logged in the host's dashboard.
          </p>
        </div>

        {/* Instant WhatsApp Action Box */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-left space-y-3">
          <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
            <iconify-icon icon="lucide:zap" class="text-emerald-600 text-base"></iconify-icon>
            <span>Want a faster response?</span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            Connect directly with {hostName} on WhatsApp with a pre-filled introduction.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <iconify-icon icon="lucide:message-circle" class="text-lg"></iconify-icon>
            <span>Chat on WhatsApp Directly</span>
          </a>
        </div>

        {/* Flatemate Desk Guarantee */}
        <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center gap-2 text-left">
          <iconify-icon icon="lucide:shield-check" class="text-primary text-xl shrink-0"></iconify-icon>
          <span>
            <strong>Flatemate Trust Policy:</strong> Zero brokerage guarantee. If the resident does not respond within 24 hours, Flatemate Desk will assist you.
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 border border-border text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
        >
          Back to Listings
        </button>
      </div>
    </div>
  );
};
