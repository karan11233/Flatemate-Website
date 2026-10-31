import React, { useState } from 'react';
import { LayoutDashboard, X, Phone, CheckCircle2, Clock, Eye, AlertCircle } from 'lucide-react';
import { SpaceListing, Inquiry, AuthUser } from '../../types';
import { WhatsAppIcon } from '../icons/WhatsAppIcon';

interface MyListingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaces: SpaceListing[];
  inquiries: Inquiry[];
  currentPhone: string;
  setCurrentPhone: (phone: string) => void;
  currentUser?: AuthUser | null;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
  onToggleListingStatus: (spaceId: string) => void;
  onUpdateInquiryStatus: (inquiryId: string, status: 'new' | 'contacted' | 'visited') => void;
}

export const MyListingsModal: React.FC<MyListingsModalProps> = ({
  isOpen,
  onClose,
  spaces,
  inquiries,
  currentPhone,
  setCurrentPhone,
  currentUser,
  onOpenAuth,
  onSignOut,
  onToggleListingStatus,
  onUpdateInquiryStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'inquiries'>('listings');
  const [phoneInput, setPhoneInput] = useState(currentPhone || '');

  if (!isOpen) return null;

  // Filter listings owned by this user/phone
  const mySpaces = spaces.filter((s) => {
    if (currentUser?.id && s.userId === currentUser.id) return true;
    if (currentPhone && s.hostPhone && s.hostPhone.endsWith(currentPhone.slice(-10))) return true;
    return false;
  });

  const mySpaceIds = mySpaces.map((s) => s.id);

  // Inbound inquiries for these spaces
  const myInquiries = inquiries.filter((inq) => {
    if (mySpaceIds.includes(inq.spaceId)) return true;
    if (currentUser?.id && inq.hostId === currentUser.id) return true;
    if (currentPhone && inq.hostPhone && inq.hostPhone.endsWith(currentPhone.slice(-10))) return true;
    return false;
  });

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phoneInput.replace(/\D/g, '').slice(-10);
    if (clean.length === 10) {
      setCurrentPhone(clean);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900">
                Host Portal & Leads
              </h3>
              <p className="text-xs text-slate-500">
                Manage your active listings and inbound tenant inquiries
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phone Filter / Sign-in Status Banner */}
        <div className="p-4 bg-slate-100/60 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {currentUser?.fullName ? (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">
                Logged in as <strong>{currentUser.fullName}</strong>
              </span>
              <button
                type="button"
                onClick={onSignOut}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <form onSubmit={handlePhoneSubmit} className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-slate-600 font-medium shrink-0">Filter by Mobile:</span>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="10-digit phone"
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs w-32 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                className="rounded-lg bg-slate-800 text-white px-3 py-1 font-bold cursor-pointer hover:bg-slate-900"
              >
                Set
              </button>
            </form>
          )}

          {!currentUser?.fullName && onOpenAuth && (
            <button
              type="button"
              onClick={onOpenAuth}
              className="text-primary font-bold hover:underline cursor-pointer"
            >
              Log in for full ownership →
            </button>
          )}
        </div>

        {/* Portal Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'listings'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>My Listings</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px]">
              {mySpaces.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inquiries')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'inquiries'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Inbound Inquiries</span>
            <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px]">
              {myInquiries.length}
            </span>
          </button>
        </div>

        {/* Portal Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'listings' && (
            <div className="space-y-3">
              {mySpaces.length > 0 ? (
                mySpaces.map((space) => (
                  <div
                    key={space.id}
                    className="rounded-xl border border-slate-200 p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            space.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {space.status === 'active' ? 'Active on Feed' : 'Marked as Rented'}
                        </span>
                        <span className="text-xs font-bold text-primary">{space.rent}</span>
                      </div>
                      <h4 className="mt-1 font-bold text-sm text-slate-900">{space.type}</h4>
                      <p className="text-xs text-slate-500">{space.location}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleListingStatus(space.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                          space.status === 'active'
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {space.status === 'active' ? 'Mark as Rented' : 'Reactivate'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-500 text-xs">
                  <p>No listings found for this mobile session.</p>
                  <p className="mt-1">
                    Post a flat or enter the matching 10-digit number above.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'inquiries' && (
            <div className="space-y-3">
              {myInquiries.length > 0 ? (
                myInquiries.map((inq) => {
                  const seekerPhone = inq.seekerPhone.replace(/\D/g, '').slice(-10);
                  const replyMsg = encodeURIComponent(
                    `Hi ${inq.seekerName}, I saw your inquiry for my listing on Flatemate (${inq.spaceTitle}). Let's discuss!`
                  );
                  const waLink = `https://wa.me/91${seekerPhone}?text=${replyMsg}`;

                  return (
                    <div
                      key={inq.id}
                      className="rounded-xl border border-slate-200 p-4 bg-white shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900">
                              {inq.seekerName}
                            </h4>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                              {inq.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">
                            +91 {seekerPhone} • Move-in: {inq.moveInDate || 'Flexible'}
                          </p>
                        </div>

                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold transition-colors shadow-2xs"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>

                      {inq.note && (
                        <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50 text-xs text-slate-700 border border-slate-100">
                          {inq.note}
                        </div>
                      )}

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Regarding: {inq.spaceTitle}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onUpdateInquiryStatus(inq.id, 'contacted')}
                            className="hover:text-primary cursor-pointer"
                          >
                            Mark Contacted
                          </button>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => onUpdateInquiryStatus(inq.id, 'visited')}
                            className="hover:text-primary cursor-pointer"
                          >
                            Mark Visited
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-slate-500 text-xs">
                  <p>No inquiries received yet.</p>
                  <p className="mt-1">
                    When seekers click &ldquo;Interested&rdquo; on your listings, their leads will appear here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
