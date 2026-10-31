import React from 'react';
import { Check, X } from 'lucide-react';
import { SpaceListing } from '../../types';
import { WhatsAppIcon } from '../icons/WhatsAppIcon';

interface InterestSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  space: SpaceListing | null;
  seekerName: string;
  seekerPhone: string;
  moveInDate?: string;
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

  const hostName = space.hostName || 'Listing Host';
  const cleanPhone = (space.hostPhone || '').replace(/\D/g, '').slice(-10);

  const whatsappMessage = encodeURIComponent(
    `Hi ${hostName}, I am ${seekerName}. I just expressed interest in your flat/room listing on Flatemate (${space.type} in ${space.location})${
      moveInDate ? ` with planned move-in: ${moveInDate}` : ''
    }. Would love to discuss details or schedule a visit!`
  );

  const whatsappLink = `https://wa.me/91${cleanPhone}?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8" />
        </div>

        <h3 className="font-heading text-xl font-extrabold text-slate-900">
          Request Sent to {hostName}!
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
          Your move-in interest has been recorded in the host&apos;s portal. You can also connect directly right now on WhatsApp for instant confirmation.
        </p>

        {/* Host Contact Card */}
        <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-200/80 p-4 text-left text-xs">
          <p className="font-bold text-slate-800">{space.type}</p>
          <p className="text-slate-500 mt-0.5">{space.location}</p>
          <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-slate-500">Host Contact:</span>
            <span className="font-mono font-bold text-slate-800">+91 {cleanPhone}</span>
          </div>
        </div>

        {/* Primary WhatsApp Action */}
        <div className="mt-6 space-y-2.5">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-all cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4" />
            <span>Chat Directly on WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Done & Return to Feed
          </button>
        </div>
      </div>
    </div>
  );
};
