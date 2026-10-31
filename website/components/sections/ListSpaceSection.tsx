import React, { useState } from 'react';
import Image from 'next/image';
import { Home, Users, Search, Plus, Check, X, ShieldCheck, UploadCloud, AlertCircle } from 'lucide-react';
import { ListingCategory, SpaceListing, AuthUser } from '../../types';
import { validateIndianPhone, validateContent } from '../../lib/moderation';

interface ListSpaceSectionProps {
  currentUser: AuthUser | null;
  onAddListing: (listing: SpaceListing) => void;
}

export const ListSpaceSection: React.FC<ListSpaceSectionProps> = ({
  currentUser,
  onAddListing,
}) => {
  const [activeTab, setActiveTab] = useState<ListingCategory>('fresh');
  const [spaceTitle, setSpaceTitle] = useState('');
  const [spaceLocation, setSpaceLocation] = useState('');
  const [spaceRent, setSpaceRent] = useState('');
  const [spaceFurnishing, setSpaceFurnishing] = useState('Fully Furnished');
  const [spaceDescription, setSpaceDescription] = useState('');
  const [hostName, setHostName] = useState(() => currentUser?.fullName || '');
  const [hostPhone, setHostPhone] = useState(() => currentUser?.phone || '');

  // Category specific states
  const [freshBhk, setFreshBhk] = useState('2BHK Flat');
  const [tenantPreference, setTenantPreference] = useState('Any (Bachelors or Family)');
  const [replacementSpots, setReplacementSpots] = useState('1 Person Replacement');
  const [replacementBhk, setReplacementBhk] = useState('3BHK Flat');
  const [replacementRoomType, setReplacementRoomType] = useState('Private Room with Attached Bath');
  const [seekerLookingFor, setSeekerLookingFor] = useState('Private Room in Shared Flat');
  const [seekerOccupancy, setSeekerOccupancy] = useState('1 Male Bachelor');
  const [seekerMoveIn, setSeekerMoveIn] = useState('Immediate');
  const [seekerProfession, setSeekerProfession] = useState('IT / Working Professional');
  const [seekerDiet, setSeekerDiet] = useState('Vegetarian');

  // Amenities state
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'WiFi',
    'Attached Bath',
    'Balcony',
    'Air Conditioner',
  ]);
  const [customAmenity, setCustomAmenity] = useState('');

  // Photos state (Data URLs for mock preview)
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);

  const availableAmenities = [
    'WiFi',
    'Air Conditioner',
    'Attached Bath',
    'Balcony',
    'RO Water',
    'Daily Maid',
    'Power Backup',
    'Geyser',
    'Washing Machine',
    'Covered Parking',
    'Lift',
    '24/7 Security',
  ];

  const ahmedabadSuggestions = [
    'Satellite',
    'Vastrapur',
    'Prahlad Nagar',
    'Bodakdev',
    'SG Highway',
    'Navrangpura',
  ];

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleAddCustomAmenity = () => {
    if (!customAmenity.trim()) return;
    const clean = customAmenity.trim();
    if (!selectedAmenities.includes(clean)) {
      setSelectedAmenities([...selectedAmenities, clean]);
    }
    setCustomAmenity('');
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files)
      .slice(0, 4)
      .forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setUploadedPhotos((prev) => [...prev, reader.result as string].slice(0, 4));
          }
        };
        reader.readAsDataURL(file);
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic Validation
    if (!spaceLocation.trim()) {
      setFormError('Please enter the location or neighborhood in Ahmedabad.');
      return;
    }

    if (!spaceRent.trim() || isNaN(Number(spaceRent)) || Number(spaceRent) <= 0) {
      setFormError('Please enter a valid monthly rent amount in Rupees.');
      return;
    }

    const phoneValidation = validateIndianPhone(hostPhone);
    if (!phoneValidation.isValid) {
      setFormError(phoneValidation.reason || 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    const contentValidation = validateContent(`${spaceTitle} ${spaceLocation} ${spaceDescription}`);
    if (!contentValidation.isValid) {
      setFormError(contentValidation.reason || 'Content contains restricted terms.');
      return;
    }

    const cleanLocation = spaceLocation.toLowerCase().includes('ahmedabad')
      ? spaceLocation.trim()
      : `${spaceLocation.trim()}, Ahmedabad`;

    const title =
      activeTab === 'seeker'
        ? spaceTitle.trim() || `Looking for ${seekerLookingFor} in ${spaceLocation}`
        : activeTab === 'fresh'
        ? spaceTitle.trim() || `${freshBhk} in ${spaceLocation}`
        : spaceTitle.trim() || `${replacementSpots} in ${replacementBhk} (${replacementRoomType})`;

    const occupancyText =
      activeTab === 'seeker'
        ? `${seekerOccupancy} • Move-in: ${seekerMoveIn}`
        : activeTab === 'fresh'
        ? `Entire Flat • ${tenantPreference}`
        : `${replacementSpots} needed`;

    const furnishingText =
      activeTab === 'seeker'
        ? `${seekerProfession} • ${seekerDiet}`
        : spaceFurnishing;

    const chosenImage = uploadedPhotos.length > 0 ? uploadedPhotos[0] : '/flat1.png';

    const newListing: SpaceListing = {
      id: `space-${Date.now()}`,
      userId: currentUser?.id || `usr_${Date.now()}`,
      category: activeTab,
      type: title,
      rent: activeTab === 'seeker' ? `Budget: ₹${Number(spaceRent).toLocaleString()}` : `₹${Number(spaceRent).toLocaleString()}`,
      rawRent: Number(spaceRent),
      location: cleanLocation,
      city: 'Ahmedabad',
      furnishing: furnishingText,
      occupancy: occupancyText,
      image: chosenImage,
      hostName: hostName.trim() || (activeTab === 'seeker' ? 'Seeker' : 'Host'),
      hostPhone: hostPhone.replace(/\D/g, '').slice(-10),
      status: 'active',
      verified: true,
      description: spaceDescription.trim() || (activeTab === 'seeker' ? `Looking for shared living in ${cleanLocation}` : 'Available shared room with zero brokerage.'),
      amenities: selectedAmenities,
      seekerMoveIn,
      seekerProfession,
      createdAt: new Date().toISOString(),
    };

    onAddListing(newListing);
    setSubmissionSuccess(true);

    // Scroll to success notification
    const section = document.getElementById('list-space');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="list-space" className="mx-auto w-full max-w-7xl px-3 sm:px-6 py-10 lg:py-16 lg:px-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side Banner Card */}
        <div className="lg:col-span-4 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-lg">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-indigo-200 mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Free • Zero Brokerage</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold font-heading leading-tight">
            List Your Space or Requirement in Ahmedabad
          </h3>

          <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Whether you have a vacant flat, need an urgent flatmate replacement, or are searching for a room, publish here in under 2 minutes.
          </p>

          <ul className="mt-6 space-y-3.5 text-xs text-slate-200">
            <li className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>Direct WhatsApp connections with seekers</span>
            </li>
            <li className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>No broker calls, no commission fees</span>
            </li>
            <li className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>Instant visibility across Ahmedabad feed</span>
            </li>
          </ul>

          <div className="mt-8 pt-6 border-t border-white/10 text-[11px] text-slate-400">
            <span>Demo Mode Notice: Listing will appear immediately in your local feed!</span>
          </div>
        </div>

        {/* Right Side Form Card */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-xs">
          {submissionSuccess ? (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 font-heading">
                Listing Published Successfully!
              </h4>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                Your listing has been added to the live Ahmedabad feed. Potential flatmates can now contact you directly on WhatsApp.
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSubmissionSuccess(false);
                    setSpaceTitle('');
                    setSpaceLocation('');
                    setSpaceRent('');
                    setSpaceDescription('');
                    setUploadedPhotos([]);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Post Another Listing
                </button>
                <a
                  href="#spaces"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary/95 cursor-pointer"
                >
                  View in Live Feed
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Category 3-Tab Switcher */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Select What You Are Posting *
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setActiveTab('fresh')}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'fresh'
                        ? 'bg-white text-primary shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Home className="w-4 h-4 mb-1" />
                    <span>Fresh Flat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('replacement')}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'replacement'
                        ? 'bg-white text-primary shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Users className="w-4 h-4 mb-1" />
                    <span>Replacement</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('seeker')}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'seeker'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Search className="w-4 h-4 mb-1" />
                    <span>Seeker Post</span>
                  </button>
                </div>
              </div>

              {formError && (
                <div className="mb-5 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Dynamic Category Specific Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {activeTab === 'fresh' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Apartment Size (BHK) *
                      </label>
                      <select
                        value={freshBhk}
                        onChange={(e) => setFreshBhk(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                      >
                        <option>1BHK Flat</option>
                        <option>2BHK Flat</option>
                        <option>3BHK Flat</option>
                        <option>4BHK Flat / Penthouse</option>
                        <option>Private Room in Flat</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tenant Preference
                      </label>
                      <select
                        value={tenantPreference}
                        onChange={(e) => setTenantPreference(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                      >
                        <option>Any (Bachelors or Family)</option>
                        <option>Male Bachelors</option>
                        <option>Female Bachelors</option>
                        <option>Family Preferred</option>
                        <option>Working Professionals Only</option>
                      </select>
                    </div>
                  </>
                )}

                {activeTab === 'replacement' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Replacement Spots Needed *
                      </label>
                      <select
                        value={replacementSpots}
                        onChange={(e) => setReplacementSpots(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                      >
                        <option>1 Person Replacement</option>
                        <option>2 Persons Replacement</option>
                        <option>Immediate Urgency</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Room Type *
                      </label>
                      <select
                        value={replacementRoomType}
                        onChange={(e) => setReplacementRoomType(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                      >
                        <option>Private Room with Attached Bath</option>
                        <option>Shared Double Occupancy Room</option>
                        <option>Single Room with Common Bath</option>
                      </select>
                    </div>
                  </>
                )}

                {activeTab === 'seeker' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Looking For *
                      </label>
                      <select
                        value={seekerLookingFor}
                        onChange={(e) => setSeekerLookingFor(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                      >
                        <option>Private Room in Shared Flat</option>
                        <option>Shared Room in Flat</option>
                        <option>Full 1BHK/2BHK for Myself</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Target Move-in Date
                      </label>
                      <select
                        value={seekerMoveIn}
                        onChange={(e) => setSeekerMoveIn(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                      >
                        <option>Immediate</option>
                        <option>Within 1 Week</option>
                        <option>1st of Next Month</option>
                        <option>Flexible</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Location Input & Suggestion Chips */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location / Neighborhood in Ahmedabad *
                </label>
                <input
                  type="text"
                  value={spaceLocation}
                  onChange={(e) => setSpaceLocation(e.target.value)}
                  placeholder="e.g. Satellite, Vastrapur, Bodakdev"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="font-semibold">Quick suggest:</span>
                  {ahmedabadSuggestions.map((sugg) => (
                    <button
                      key={sugg}
                      type="button"
                      onClick={() => setSpaceLocation(sugg)}
                      className="rounded-md bg-slate-100 hover:bg-slate-200 px-2 py-0.5 text-slate-700 cursor-pointer"
                    >
                      {sugg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rent & Furnishing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {activeTab === 'seeker' ? 'Max Monthly Budget (₹) *' : 'Monthly Rent (₹) *'}
                  </label>
                  <input
                    type="number"
                    value={spaceRent}
                    onChange={(e) => setSpaceRent(e.target.value)}
                    placeholder="e.g. 8500"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Furnishing Status *
                  </label>
                  <select
                    value={spaceFurnishing}
                    onChange={(e) => setSpaceFurnishing(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                  >
                    <option>Fully Furnished</option>
                    <option>Semi-Furnished</option>
                    <option>Unfurnished</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description & House Rules
                </label>
                <textarea
                  rows={3}
                  value={spaceDescription}
                  onChange={(e) => setSpaceDescription(e.target.value)}
                  placeholder="Tell potential roommates about the flat, amenities, cook/maid setup, and habits..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              {/* Amenities Selector */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Amenities & Highlights
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {availableAmenities.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-600 border border-transparent hover:bg-slate-200'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-emerald-600" />}
                        <span>{amenity}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Amenity Adder */}
                <div className="flex items-center gap-2 max-w-xs">
                  <input
                    type="text"
                    value={customAmenity}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    placeholder="+ Add custom amenity"
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-1 text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomAmenity();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAmenity}
                    className="rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Photo Uploader */}
              {activeTab !== 'seeker' && (
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Property Photos (Upload up to 4 photos)
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    {uploadedPhotos.map((photo, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                        <Image src={photo} alt="Preview" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => setUploadedPhotos((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white hover:bg-slate-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {uploadedPhotos.length < 4 && (
                      <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-primary flex flex-col items-center justify-center text-slate-400 hover:text-primary transition-colors cursor-pointer bg-slate-50">
                        <UploadCloud className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold">Add Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* Host Contact Details */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    placeholder="e.g. Meet Patel"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp Number (10 digits) *
                  </label>
                  <input
                    type="tel"
                    value={hostPhone}
                    onChange={(e) => setHostPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full rounded-xl bg-primary hover:bg-primary/95 py-3 text-sm font-bold text-white shadow-md transition-all cursor-pointer"
              >
                Publish Listing Free (0% Brokerage)
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
