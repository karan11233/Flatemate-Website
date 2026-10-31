import React, { useState } from 'react';
import { SpaceListing, AuthUser } from '../types';

export interface Inquiry {
  id: string;
  spaceId: string;
  hostId?: string;
  seekerId?: string;
  spaceTitle: string;
  hostName: string;
  hostPhone: string;
  seekerName: string;
  seekerPhone: string;
  moveInDate: string;
  note: string;
  timestamp: string;
  status: 'new' | 'contacted' | 'visited';
}

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
  const [inputPhone, setInputPhone] = useState(currentPhone || '');

  if (!isOpen) return null;

  // Filter listings posted by this host
  const hostListings = spaces.filter((s) => {
    if (currentUser?.id && s.userId === currentUser.id) return true;
    if (currentUser?.phone && s.hostPhone && s.hostPhone.endsWith(currentUser.phone.slice(-10))) return true;
    if (currentPhone && s.hostPhone && s.hostPhone.replace(/\D/g, '').endsWith(currentPhone.replace(/\D/g, '').slice(-10))) return true;
    return false;
  });

  // Filter inquiries received for these listings
  const hostListingIds = hostListings.map((s) => s.id);
  const hostInquiries = inquiries.filter((inq) => {
    if (currentUser?.id && inq.hostId === currentUser.id) return true;
    if (hostListingIds.includes(inq.spaceId)) return true;
    if (currentUser?.phone && inq.hostPhone && inq.hostPhone.endsWith(currentUser.phone.slice(-10))) return true;
    if (currentPhone && inq.hostPhone && inq.hostPhone.replace(/\D/g, '').endsWith(currentPhone.replace(/\D/g, '').slice(-10))) return true;
    return false;
  });

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPhone.trim().length >= 10) {
      setCurrentPhone(inputPhone.trim());
    } else {
      alert('Please enter a valid 10-digit phone number.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <iconify-icon icon="lucide:layout-dashboard" class="text-lg"></iconify-icon>
            </span>
            <div>
              <h2 className="font-heading text-lg font-bold text-slate-900">
                Host Portal & Inquiries
              </h2>
              <p className="text-xs text-muted-foreground">
                Manage your listed properties and connect with interested seekers
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <iconify-icon icon="lucide:x" class="text-xl"></iconify-icon>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* User Account / Phone Lookup */}
          {(currentUser?.fullName || currentUser?.phone || currentPhone) ? (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                  {currentUser?.fullName ? currentUser.fullName[0].toUpperCase() : 'H'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-heading font-bold text-sm text-slate-900">
                      {currentUser?.fullName || 'Verified Ahmedabad Host'}
                    </h4>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <iconify-icon icon="lucide:check-circle"></iconify-icon> Connected
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {(currentUser?.phone || currentPhone) ? `+91 ${currentUser?.phone || currentPhone}` : 'Device Identity Active'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const newPhone = prompt('Enter 10-digit WhatsApp phone number to look up listings:', currentPhone || '');
                    if (newPhone && newPhone.replace(/\D/g, '').length >= 10) {
                      setCurrentPhone(newPhone.replace(/\D/g, '').slice(-10));
                    }
                  }}
                  className="text-xs font-bold text-slate-700 hover:text-primary border border-slate-200 hover:bg-white px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  Switch Phone
                </button>
                {onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 border border-rose-200 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <form onSubmit={handlePhoneSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Find Your Listings & Inquiries by WhatsApp Number
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">Enter your 10-digit number to instantly pull up your active listings and seeker leads.</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">+91</span>
                    <input
                      type="tel"
                      required
                      value={inputPhone}
                      onChange={(e) => setInputPhone(e.target.value)}
                      placeholder="98765 43210"
                      className="w-full pl-11 pr-3 py-2 rounded-xl border border-input text-xs font-semibold bg-white outline-hidden focus:border-primary"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="self-end sm:self-auto mt-auto px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  Find My Listings
                </button>
              </form>
            </div>
          )}

          {/* SECTION 1: INCOMING INQUIRIES FEED */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2">
                <iconify-icon icon="lucide:inbox" class="text-primary text-lg"></iconify-icon>
                <span>Seeker Inquiries ({hostInquiries.length})</span>
              </h3>
              <span className="text-xs text-muted-foreground font-medium">
                Live requests from verified seekers
              </span>
            </div>

            {hostInquiries.length === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                <iconify-icon icon="lucide:message-square" class="text-3xl text-slate-300 block mb-2"></iconify-icon>
                <p className="font-semibold text-slate-700">No inquiries received yet for this number.</p>
                <p className="mt-1">When seekers click "I'm Interested" on your listing, their contact details and move-in dates appear here instantly!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {hostInquiries.map((inq) => {
                  const whatsappUrl = `https://wa.me/91${inq.seekerPhone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(
                    `Hi ${inq.seekerName}, I received your inquiry on Flatemate regarding ${inq.spaceTitle}. Are you available for a quick chat?`
                  )}`;

                  return (
                    <div
                      key={inq.id}
                      className="p-4 rounded-2xl border border-border bg-card shadow-xs hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900">{inq.seekerName}</span>
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <iconify-icon icon="lucide:phone" class="text-xs"></iconify-icon>
                            +91 {inq.seekerPhone.replace(/\D/g, '').slice(-10)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">{inq.timestamp}</span>
                        </div>

                        <p className="text-xs text-slate-600">
                          Interested in: <strong className="text-slate-800">{inq.spaceTitle}</strong>
                        </p>

                        <div className="text-xs text-slate-500 flex items-center gap-3 pt-0.5">
                          <span>Move-in: <strong className="text-slate-700">{inq.moveInDate || 'Flexible'}</strong></span>
                          {inq.note && (
                            <span className="italic text-slate-500">"{inq.note}"</span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons to connect with seeker */}
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => onUpdateInquiryStatus(inq.id, 'contacted')}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                        >
                          <iconify-icon icon="lucide:message-circle" class="text-base"></iconify-icon>
                          <span>WhatsApp</span>
                        </a>

                        <a
                          href={`tel:+91${inq.seekerPhone.replace(/\D/g, '').slice(-10)}`}
                          onClick={() => onUpdateInquiryStatus(inq.id, 'contacted')}
                          className="p-2 border border-border rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                          title="Call Seeker"
                        >
                          <iconify-icon icon="lucide:phone-call" class="text-base"></iconify-icon>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 2: HOST'S POSTED SPACES & LIVE STATUS TOGGLE */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2">
                <iconify-icon icon="lucide:home" class="text-primary text-lg"></iconify-icon>
                <span>Your Listed Spaces ({hostListings.length})</span>
              </h3>
              <a
                href="#list-space"
                onClick={onClose}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <iconify-icon icon="lucide:plus"></iconify-icon>
                <span>Post Another Space</span>
              </a>
            </div>

            {hostListings.length === 0 ? (
              <div className="text-center py-6 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                <p>No listings associated with this phone number yet.</p>
                <a
                  href="#list-space"
                  onClick={onClose}
                  className="mt-2 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold"
                >
                  Post Your Space for Free
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {hostListings.map((listing) => {
                  const isRented = listing.status === 'rented';
                  return (
                    <div
                      key={listing.id}
                      className="p-4 rounded-2xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        {listing.image && listing.image.trim() !== '' && !listing.image.includes('/assets/flat') ? (
                          <img
                            src={listing.image}
                            alt={listing.type}
                            className="w-14 h-14 rounded-xl object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <iconify-icon icon="lucide:building-2" class="text-2xl text-slate-400"></iconify-icon>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900">{listing.type}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isRented 
                                ? 'bg-slate-100 text-slate-500' 
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {isRented ? '🔴 Rented Out' : '🟢 Live & Accepting Inquiries'}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{listing.location}</p>
                          <p className="text-xs font-extrabold text-primary mt-0.5">{listing.rent}/month</p>
                        </div>
                      </div>

                      {/* State management action buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onToggleListingStatus(listing.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                            isRented
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {isRented ? 'Re-activate Listing' : 'Mark as Rented Out'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-muted-foreground">
          <span>Flatemate Instant Host Desk</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
