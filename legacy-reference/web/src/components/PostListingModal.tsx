import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  Home, 
  MapPin, 
  DollarSign, 
  Sparkles, 
  ShieldCheck, 
  Upload, 
  Check
} from 'lucide-react';
import { FlatListing, FlatmateProfile } from '../types';
import { CITIES, POPULAR_AREAS } from '../data/mockData';

interface PostListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFlat: (flat: FlatListing) => void;
}

export const PostListingModal: React.FC<PostListingModalProps> = ({
  isOpen,
  onClose,
  onAddFlat,
}) => {
  const [listingType, setListingType] = useState<'Private Room' | '2 BHK' | '1 BHK' | '3 BHK'>('Private Room');
  const [title, setTitle] = useState('');
  const [city, setCity] = useState(CITIES[0]);
  const [area, setArea] = useState(POPULAR_AREAS[CITIES[0]][0] || 'Koramangala');
  const [location, setLocation] = useState('');
  const [rent, setRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [furnishing, setFurnishing] = useState<'Fully Furnished' | 'Semi-Furnished' | 'Unfurnished'>('Fully Furnished');
  const [genderPreference, setGenderPreference] = useState<'Any' | 'Male' | 'Female'>('Any');
  const [description, setDescription] = useState('');
  const [hostName, setHostName] = useState('');
  const [hostPhone, setHostPhone] = useState('');

  // Selected Amenities
  const availableAmenities = [
    'High-speed WiFi',
    'Air Conditioner',
    'Attached Balcony',
    'Daily Maid Service',
    'Gym & Pool',
    'Power Backup',
    'Washing Machine',
    'Covered Parking',
    'Cook Available'
  ];
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'High-speed WiFi',
    'Air Conditioner',
    'Washing Machine'
  ]);

  if (!isOpen) return null;

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !rent || !hostName) {
      alert('Please fill out the title, rent, and your name.');
      return;
    }

    const newFlat: FlatListing = {
      id: `custom-flat-${Date.now()}`,
      title,
      type: listingType,
      rent: Number(rent),
      deposit: Number(deposit) || Number(rent) * 2,
      maintenance: 1500,
      location: location || `${area}, ${city}`,
      area,
      city,
      furnishing,
      genderPreference,
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
      ],
      amenities: selectedAmenities,
      verified: true,
      zeroBrokerage: true,
      availableFrom: 'Immediately',
      postedBy: {
        name: hostName,
        role: 'Current Flatmate',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        verified: true,
        responseTime: '⚡ Typically replies in 15 mins',
        phone: hostPhone || '+91 98765 00000',
      },
      description: description || 'Great room available in a friendly flat. Reach out for viewing!',
      rules: ['Respect quiet hours on weeknights', 'Clean common spaces after use'],
      nearbyMetro: `${area} Junction (800m)`
    };

    onAddFlat(newFlat);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-50 text-brand-600">
              <PlusCircle className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Post Your Space / Room
              </h2>
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" /> 100% Free • Zero Brokerage
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          
          {/* Space Type Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Listing Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Private Room', '1 BHK', '2 BHK', '3 BHK'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setListingType(type)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                    listingType === type
                      ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Headline / Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master Bedroom with Attached Bath in 3BHK Gated Society"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-hidden"
            />
          </div>

          {/* City & Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">City *</label>
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setArea(POPULAR_AREAS[e.target.value]?.[0] || '');
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 outline-hidden"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Locality / Area *</label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Koramangala 4th Block"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-hidden"
              />
            </div>
          </div>

          {/* Rent & Deposit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Monthly Rent (₹) *</label>
              <input
                type="number"
                required
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                placeholder="e.g. 20000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Security Deposit (₹)</label>
              <input
                type="number"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                placeholder="e.g. 40000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-hidden"
              />
            </div>
          </div>

          {/* Furnishing & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Furnishing Status</label>
              <select
                value={furnishing}
                onChange={(e) => setFurnishing(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 outline-hidden"
              >
                <option value="Fully Furnished">Fully Furnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Preferred Tenant / Flatmate</label>
              <select
                value={genderPreference}
                onChange={(e) => setGenderPreference(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 outline-hidden"
              >
                <option value="Any">Any Gender</option>
                <option value="Male">Male Only</option>
                <option value="Female">Female Only</option>
              </select>
            </div>
          </div>

          {/* Amenities Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Included Amenities</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableAmenities.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-[11px] font-semibold border transition-all text-left ${
                      isSelected
                        ? 'bg-brand-50 text-brand-700 border-brand-200 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${isSelected ? 'bg-brand-600 text-white' : 'border border-slate-300'}`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">About the Space & Roommates</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell seekers about the vibe, cook/maid setup, and neighborhood..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-hidden"
            />
          </div>

          {/* Host Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Your Name *</label>
              <input
                type="text"
                required
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="e.g. Varun Kapoor"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Your WhatsApp Number *</label>
              <input
                type="tel"
                required
                value={hostPhone}
                onChange={(e) => setHostPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-hidden"
              />
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-brand-500/30 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Publish Zero-Brokerage Listing</span>
          </button>

        </form>

      </div>
    </div>
  );
};
