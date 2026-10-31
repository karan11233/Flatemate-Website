import React, { useState } from 'react';
import { Flag, X, AlertTriangle } from 'lucide-react';
import { SpaceListing } from '../../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  space: SpaceListing | null;
  onReportSubmitted: (spaceId: string, reason: string, comment: string) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  space,
  onReportSubmitted,
}) => {
  const [reason, setReason] = useState('Fake listing / scam');
  const [comment, setComment] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !space) return null;

  const reasons = [
    'Fake listing / scam',
    'Broker posing as direct flatmate/owner',
    'Already rented / unavailable',
    'Incorrect rent or misleading photos',
    'Inappropriate language or behavior',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReportSubmitted(space.id, reason, comment.trim());
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-600">
            <Flag className="w-5 h-5" />
            <h3 className="font-heading text-lg font-bold text-slate-900">
              Report Listing
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-emerald-600" />
            </div>
            <h4 className="font-bold text-slate-900">Report Received</h4>
            <p className="text-xs text-slate-500 mt-1">
              Thank you for keeping Flatemate safe. We have hidden this listing from your view.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <p className="text-xs text-slate-500">
              Why are you reporting <strong>{space.type}</strong>?
            </p>

            <div className="space-y-2">
              {reasons.map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700"
                >
                  <input
                    type="radio"
                    name="report_reason"
                    value={r}
                    checked={reason === r}
                    onChange={(e) => setReason(e.target.value)}
                    className="accent-primary"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Additional Comments (Optional)
              </label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Provide any details to help our moderation team..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-xs"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
