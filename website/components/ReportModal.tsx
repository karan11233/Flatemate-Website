import React, { useState } from 'react';
import { SpaceListing } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  space: SpaceListing | null;
  onReportSubmitted: (spaceId: string, reason: string, comment: string) => void;
}

export const REPORT_REASONS = [
  'Already Rented Out / Unavailable',
  'Broker Posing as Direct Owner',
  'Fake Price or Hidden Brokerage/Charges',
  'Wrong or Invalid Phone Number',
  'Spam, Adult Content or Fake Photos',
  'Suspicious or Scam Behaviour',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  space,
  onReportSubmitted,
}) => {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !space) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReportSubmitted(space.id, selectedReason, comment);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setComment('');
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div 
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <iconify-icon icon="lucide:check-circle" class="text-3xl"></iconify-icon>
            </div>
            <h3 className="font-heading text-xl font-bold text-slate-900">
              Report Submitted
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Thank you for keeping our community safe. Our admin moderation team will review <strong>{space.type}</strong> within 2 hours.
            </p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between bg-rose-50/50">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <iconify-icon icon="lucide:flag" class="text-xl"></iconify-icon>
                </span>
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900">
                    Report This Listing
                  </h3>
                  <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                    {space.type}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <iconify-icon icon="lucide:x" class="text-xl"></iconify-icon>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Why are you reporting this listing? <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2">
                  {REPORT_REASONS.map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                        selectedReason === reason
                          ? 'border-rose-400 bg-rose-50/50 text-rose-950 font-semibold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        checked={selectedReason === reason}
                        onChange={() => setSelectedReason(reason)}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Additional Details (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Host asked for deposit before visit..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-rose-400 outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-11 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <iconify-icon icon="lucide:shield-alert" class="text-base"></iconify-icon>
                  <span>Submit Report</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
