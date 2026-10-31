import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  RotateCcw, 
  Check, 
  CheckCircle2, 
  X, 
  Heart, 
  Clock, 
  SlidersHorizontal,
  Home,
  Users,
  Zap,
  ArrowRight,
  Phone,
  Building2,
  Calendar
} from 'lucide-react';

interface MatchItem {
  id: string;
  category: string;
  title: string;
  name: string;
  role: string;
  location: string;
  rent: number;
  matchScore: number;
  furnishing: string;
  occupancy: string;
  status: string;
  tags: string[];
  image: string;
  avatar: string;
  availableDate: string;
  description: string;
}

export function ElevateConcept() {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');

  // 3D Card Stack active index
  const [activeStackIndex, setActiveStackIndex] = useState(1); // 0: left, 1: center, 2: right

  // Modals state
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);
  const [requestIntroMatch, setRequestIntroMatch] = useState<MatchItem | null>(null);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Request form state
  const [reqName, setReqName] = useState('');
  const [reqPhone, setReqPhone] = useState('');
  const [reqDate, setReqDate] = useState('');
  const [reqMessage, setReqMessage] = useState('');
  const [reqConsent, setReqConsent] = useState(true);

  // Saved items
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Sample ElevateMatch Dataset
  const matches: MatchItem[] = [
    {
      id: 'em-1',
      category: '2BHK Shared Flat',
      title: 'Spacious Sunlit Master Bedroom in Premium Gated Society',
      name: 'Sarath A.',
      role: 'Current Flatmate (Software Engineer)',
      location: 'Satellite, Ahmedabad',
      rent: 8500,
      matchScore: 98,
      furnishing: 'Fully Furnished',
      occupancy: '1 Spot Open',
      status: 'Open to move-in immediately',
      tags: ['Non-smoker', 'Early riser', 'Wi-Fi Included', 'Attached Bath'],
      image: '/assets/flat1.png',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      availableDate: 'Immediate',
      description: 'Looking for a compatible roommate to take up the attached-bath master room. Peaceful gated society near ISRO, cook and maid are already set up.',
    },
    {
      id: 'em-2',
      category: 'Private Room in 3BHK',
      title: 'Air-conditioned Private Room with Balcony Garden',
      name: 'Ajay B.',
      role: 'Host & Resident (Product Designer)',
      location: 'Vastrapur, Ahmedabad',
      rent: 7000,
      matchScore: 96,
      furnishing: 'Semi-Furnished',
      occupancy: 'Available Now',
      status: 'Ready for scheduled walkthrough',
      tags: ['Vegetarian', 'Quiet evenings', 'Balcony', 'RO Water'],
      image: '/assets/flat2.png',
      avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
      availableDate: '1st of Month',
      description: 'Cosy sunlit private room in Vastrapur lake area. Walking distance to cafes and metro station. Ideal for professionals or postgraduates.',
    },
    {
      id: 'em-3',
      category: '1BHK Studio Apartment',
      title: 'Contemporary Minimalist Studio with Smart Access',
      name: 'Vishal K.',
      role: 'Property Owner (Zero Brokerage)',
      location: 'Prahlad Nagar, Ahmedabad',
      rent: 9000,
      matchScore: 94,
      furnishing: 'Fully Furnished',
      occupancy: 'Full Space',
      status: 'Open for 6+ month leases',
      tags: ['Pet friendly', 'Covered Parking', 'Power Backup', 'Gym'],
      image: '/assets/flat4.png',
      avatar: 'https://randomuser.me/api/portraits/men/46.jpg',
      availableDate: 'Within 7 Days',
      description: 'Direct owner listing with zero brokerage fees. Brand new furnishing including refrigerator, microwave, and high-speed fiber line.',
    },
    {
      id: 'em-4',
      category: 'Shared Room in 2BHK',
      title: 'Economical Shared Space next to University Hub',
      name: 'Nisha P.',
      role: 'Current Flatmate (Design Student)',
      location: 'Navrangpura, Ahmedabad',
      rent: 5500,
      matchScore: 92,
      furnishing: 'Furnished',
      occupancy: '1 Spot Available',
      status: 'Immediate move-in',
      tags: ['Student Friendly', 'Quiet Study', 'Cook Setup', 'Metro 400m'],
      image: '/assets/flat3.png',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      availableDate: 'Immediate',
      description: 'Friendly flatmate setup near CEPT / Ahmedabad University. Peaceful environment, kitchen fully equipped.',
    },
    {
      id: 'em-5',
      category: '2BHK Shared Flat',
      title: 'Serene Greenery-Facing Flat in Quiet Residential Lane',
      name: 'Rhea S.',
      role: 'Current Flatmate (Marketing Associate)',
      location: 'Thaltej, Ahmedabad',
      rent: 7500,
      matchScore: 91,
      furnishing: 'Semi-Furnished',
      occupancy: 'Private Room in 2BHK',
      status: 'Open to like-minded flatmates',
      tags: ['Pet Friendly', 'Social & Warm', 'Power Backup', 'Inverter'],
      image: '/assets/flat5.png',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      availableDate: '20th June',
      description: 'Spacious flat with a huge terrace and garden view. Looking for a respectful, friendly working flatmate who loves pets.',
    },
    {
      id: 'em-6',
      category: 'Room in Shared Apartment',
      title: 'Highrise Room with Panoramic City Skyline Views',
      name: 'Kabir M.',
      role: 'Current Flatmate (Product Analyst)',
      location: 'Bodakdev, Ahmedabad',
      rent: 6500,
      matchScore: 90,
      furnishing: 'Furnished',
      occupancy: '1 Spot Available',
      status: 'Open to move-in immediately',
      tags: ['Gym Routine', 'Weekend Cook', 'Highrise View', '24x7 Security'],
      image: '/assets/flat6.png',
      avatar: 'https://randomuser.me/api/portraits/men/85.jpg',
      availableDate: 'Immediate',
      description: '14th floor room with great ventilation. Society has a full swimming pool, clubhouse, and underground parking.',
    }
  ];

  // Filtered Results
  const filteredMatches = matches.filter((item) => {
    if (selectedCategory && item.category !== selectedCategory) return false;
    if (selectedLocality && !item.location.toLowerCase().includes(selectedLocality.toLowerCase())) return false;
    if (selectedBudget === 'under7000' && item.rent >= 7000) return false;
    if (selectedBudget === '7000to9000' && (item.rent < 7000 || item.rent > 9000)) return false;
    if (selectedBudget === 'above9000' && item.rent <= 9000) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchesTitle = item.title.toLowerCase().includes(q);
      const matchesLoc = item.location.toLowerCase().includes(q);
      const matchesTags = item.tags.some(t => t.toLowerCase().includes(q));
      const matchesRole = item.role.toLowerCase().includes(q);
      if (!matchesTitle && !matchesLoc && !matchesTags && !matchesRole) return false;
    }

    return true;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedLocality('');
    setSelectedBudget('');
  };

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqName || !reqPhone) {
      alert('Please fill out your name and phone number.');
      return;
    }
    setRequestSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-slate-950 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-white">Flatemate Desk Active:</span>
            <span>Zero brokerage introductions across Ahmedabad</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-400">
            <span>⚡ Average intro turnaround: 2 hrs</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">100% Verified Workplaces & IDs</span>
          </div>
        </div>
      </div>

      {/* 2. RECRUITER-STYLE HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-950">
                  Flat<span className="text-indigo-600">emate</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider -mt-1">
                  Managed Co-Living
                </span>
              </div>
            </a>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#whyFlatemate" className="hover:text-indigo-600 transition-colors">Why Flatemate</a>
            <a href="#meetFlatMatch" className="hover:text-indigo-600 transition-colors">Meet FlatMatch</a>
            <a href="#howItWorks" className="hover:text-indigo-600 transition-colors">How It Works</a>
            <a href="#hiringDesk" className="hover:text-indigo-600 transition-colors">Flatemate Desk</a>
            <a href="#faqs" className="hover:text-indigo-600 transition-colors">FAQs</a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            <a
              href="#meetFlatMatch"
              className="hidden sm:inline-flex px-4 py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Browse Matches
            </a>
            <a
              href="#meetFlatMatch"
              className="inline-flex px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-md shadow-indigo-600/20 transition-all hover:shadow-lg"
            >
              Request Walkthrough
            </a>
          </div>

        </div>
      </header>

      {/* 3. HERO BANNER SECTION (ElevateMe 3D Card Stack Concept) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white pt-16 pb-24">
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-96 bg-indigo-600/15 blur-3xl pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-700/50 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Managed Co-Living & Roommate Match</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12]">
                From discovery to move-in — <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400">Flatemate manages every step.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                Share your living preferences, explore verified career-ready flatmates, and request managed introductions through one coordinated co-living experience.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href="#meetFlatMatch"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <Search className="w-4 h-4" />
                  <span>Browse Matches</span>
                </a>
                <a
                  href="#howItWorks"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-slate-700 hover:border-slate-500 bg-white/5 hover:bg-white/10 text-white font-bold text-sm rounded-xl transition-all"
                >
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>Talk To Flatemate Desk</span>
                </a>
              </div>

              {/* Trust Subtext */}
              <div className="flex items-center gap-6 pt-4 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" /> 100% ID Verified
                </span>
                <span>•</span>
                <span>0% Middleman Commission</span>
                <span>•</span>
                <span>Ahmedabad Network</span>
              </div>
            </div>

            {/* Right: ElevateMe 3D Stack Carousel Preview */}
            <div className="lg:col-span-6 relative flex justify-center">
              
              {/* Stack Controls Top */}
              <div className="w-full max-w-md">
                <div className="flex items-center justify-between mb-3 text-xs text-slate-400 font-semibold px-2">
                  <span className="flex items-center gap-1 text-indigo-300">
                    <Sparkles className="w-3.5 h-3.5" /> Featured Top Matches
                  </span>
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveStackIndex(idx)}
                        className={`h-2 rounded-full transition-all ${activeStackIndex === idx ? 'w-6 bg-indigo-400' : 'w-2 bg-slate-700 hover:bg-slate-500'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* 3D Stack Cards Container */}
                <div className="relative h-[420px] w-full">
                  {matches.slice(0, 3).map((card, idx) => {
                    // Position calculations for 3D stack
                    const isCenter = idx === activeStackIndex;
                    const isLeft = (activeStackIndex === 0 && idx === 1) || (activeStackIndex === 1 && idx === 0) || (activeStackIndex === 2 && idx === 1);
                    const isRight = (activeStackIndex === 0 && idx === 2) || (activeStackIndex === 1 && idx === 2) || (activeStackIndex === 2 && idx === 0);

                    return (
                      <div
                        key={card.id}
                        onClick={() => setActiveStackIndex(idx)}
                        className={`absolute inset-0 bg-white text-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200/80 transition-all duration-500 cursor-pointer flex flex-col justify-between ${
                          isCenter 
                            ? 'z-30 scale-100 opacity-100 translate-y-0 rotate-0 shadow-indigo-950/50' 
                            : isLeft 
                              ? 'z-20 scale-95 opacity-80 -translate-x-6 translate-y-4 -rotate-2 pointer-events-auto' 
                              : 'z-10 scale-90 opacity-60 translate-x-6 translate-y-8 rotate-2 pointer-events-auto'
                        }`}
                      >
                        {/* Card Top */}
                        <div>
                          {/* Category & Match Score */}
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-3 py-1 rounded-full">
                              {card.category}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              {card.matchScore}% Match
                            </span>
                          </div>

                          {/* Identity Header */}
                          <div className="flex items-center gap-3.5 mb-4">
                            <img
                              src={card.avatar}
                              alt={card.name}
                              className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-50 shadow-sm"
                            />
                            <div>
                              <h3 className="text-base font-extrabold text-slate-950">
                                {card.name}
                              </h3>
                              <p className="text-xs text-slate-500 font-medium">
                                {card.role}
                              </p>
                              <p className="text-xs text-indigo-600 font-semibold flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" /> {card.location}
                              </p>
                            </div>
                          </div>

                          {/* Rent Banner */}
                          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-baseline justify-between mb-4">
                            <div>
                              <span className="text-xs text-slate-400 font-medium block">Monthly Rent</span>
                              <span className="text-xl font-black text-slate-900">
                                ₹{card.rent.toLocaleString()}
                                <span className="text-xs text-slate-500 font-normal"> / mo</span>
                              </span>
                            </div>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                              0% Brokerage
                            </span>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1.5">
                            {card.tags.map((tag, tIdx) => (
                              <span key={tIdx} className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-lg">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>{card.status}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRequestIntroMatch(card);
                              }}
                              className="py-2.5 px-3 rounded-xl border border-indigo-200 hover:border-indigo-400 bg-indigo-50/70 text-indigo-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                            >
                              <span>Request Intro</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMatch(card);
                              }}
                              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center justify-center"
                            >
                              View Profile
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 4. RECRUITER TECH SLIDER (Infinite Marquee Ticker) */}
      <div className="bg-indigo-900 text-indigo-200 py-3.5 border-y border-indigo-800 overflow-hidden relative">
        <div className="flex items-center gap-8 whitespace-nowrap animate-marquee font-bold text-xs uppercase tracking-wider">
          <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-400" /> Private Rooms</span>
          <span>•</span>
          <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-indigo-400" /> 0% Brokerage Guarantee</span>
          <span>•</span>
          <span>Full 2BHK & 3BHK Flats</span>
          <span>•</span>
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 2-Step Verified Flatmates</span>
          <span>•</span>
          <span>Pet Friendly Spaces</span>
          <span>•</span>
          <span>Satellite & Vastrapur Hubs</span>
          <span>•</span>
          <span>Dedicated Work Desks & Wi-Fi</span>
          <span>•</span>
          <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-400" /> Average Response &lt; 2 Hours</span>
          <span>•</span>
          <span>Vegetarian Households</span>
          <span>•</span>
          <span>Student & Professional Living</span>
        </div>
      </div>

      {/* 5. HIRING JOURNEY SECTION ("Stop searching everywhere. Start meeting the right people.") */}
      <section id="whyFlatemate" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden">
            {/* Subtle Gradient Circle */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-3xl mb-12">
              <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase block mb-2">
                The Focused Journey
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Stop searching everywhere. Start meeting the right people.
              </h2>
              <p className="mt-4 text-slate-400 text-base leading-relaxed">
                Flatemate brings verified spaces, structured roommate compatibility, and human coordination into one seamless co-living journey.
              </p>
            </div>

            {/* 3 Step Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Step 1 */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 relative hover:border-indigo-500/50 transition-colors">
                <span className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-400 font-extrabold text-base flex items-center justify-center mb-5 border border-indigo-500/30">
                  1
                </span>
                <h3 className="text-lg font-bold text-white mb-2">
                  Too many portals. Too little certainty.
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Scattered WhatsApp groups, ghosting brokers, and outdated photos make house hunting slow, stressful, and chaotic.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 relative hover:border-indigo-500/50 transition-colors">
                <span className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-400 font-extrabold text-base flex items-center justify-center mb-5 border border-indigo-500/30">
                  2
                </span>
                <h3 className="text-lg font-bold text-white mb-2">
                  Verified spaces & flatmates in one place.
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Review structured profiles built around cleanliness habits, sleep cycles, dietary preferences, mobility, and verified photos.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 relative hover:border-indigo-500/50 transition-colors">
                <span className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-400 font-extrabold text-base flex items-center justify-center mb-5 border border-indigo-500/30">
                  3
                </span>
                <h3 className="text-lg font-bold text-white mb-2">
                  One request. A managed introduction.
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tell us who or what interests you. Flatemate verifies the request, coordinates access, and arranges the walkthrough.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 6. TRUST LOGOS ("Our Flatmates & Residents Work At") */}
      <section className="py-12 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
            Connecting Pre-Screened Professionals Working Across Leading Hubs
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-slate-400 font-extrabold text-lg opacity-80">
            <span>TCS Innovation</span>
            <span>Adani Group</span>
            <span>ISRO Space Labs</span>
            <span>Swiggy HQ</span>
            <span>Deloitte</span>
            <span>Zomato</span>
            <span>Torrent Tech</span>
          </div>
        </div>
      </section>

      {/* 7. MEET ELEVATEMATCH / FLATMATCH (Search Command Center) */}
      <section id="meetFlatMatch" className="py-20 bg-slate-100/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Search Box Header */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xl mb-10">
            <div className="max-w-2xl mb-8">
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-3">
                Meet FlatMatch
              </span>
              <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
                Tell us who or what you’re looking for.
              </h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                A clean search experience that ranks the strongest compatibility fit first and takes you directly to the shortlist.
              </p>
            </div>

            {/* Unified Filter Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              
              {/* Search Field */}
              <div className="md:col-span-4 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by locality, tags or role..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-indigo-600 outline-hidden transition-all"
                />
              </div>

              {/* Space Category Select */}
              <div className="md:col-span-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
                >
                  <option value="">Space Category (All)</option>
                  <option value="2BHK Shared Flat">2BHK Shared Flat</option>
                  <option value="Private Room in 3BHK">Private Room in 3BHK</option>
                  <option value="1BHK Studio Apartment">1BHK Studio Apartment</option>
                  <option value="Shared Room in 2BHK">Shared Room in 2BHK</option>
                  <option value="Room in Shared Apartment">Room in Shared Apartment</option>
                </select>
              </div>

              {/* Locality Select */}
              <div className="md:col-span-2">
                <select
                  value={selectedLocality}
                  onChange={(e) => setSelectedLocality(e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
                >
                  <option value="">Locality (All)</option>
                  <option value="Satellite">Satellite</option>
                  <option value="Vastrapur">Vastrapur</option>
                  <option value="Navrangpura">Navrangpura</option>
                  <option value="Prahlad Nagar">Prahlad Nagar</option>
                  <option value="Thaltej">Thaltej</option>
                  <option value="Bodakdev">Bodakdev</option>
                </select>
              </div>

              {/* Budget Select */}
              <div className="md:col-span-2">
                <select
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
                >
                  <option value="">Budget (All)</option>
                  <option value="under7000">Under ₹7,000</option>
                  <option value="7000to9000">₹7,000 - ₹9,000</option>
                  <option value="above9000">Above ₹9,000</option>
                </select>
              </div>

              {/* Clear Filter Button */}
              <div className="md:col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-200 text-slate-600 transition-colors"
                  title="Reset filters"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Results Counter */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Showing <strong>{filteredMatches.length}</strong> matching shortlisted verified spaces</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Ready for immediate intro
              </span>
            </div>
          </div>

          {/* Shortlist Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((item) => {
              const isSaved = savedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedMatch(item)}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    {/* Image Header with Top Match Badge */}
                    <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="bg-emerald-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {item.matchScore}% Match
                        </span>

                        <button
                          type="button"
                          onClick={(e) => toggleSave(item.id, e)}
                          className={`p-2 rounded-full backdrop-blur-md shadow-md transition-colors ${
                            isSaved ? 'bg-rose-500 text-white' : 'bg-white/90 text-slate-700 hover:text-rose-500'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      <div className="absolute bottom-2.5 left-3 bg-black/60 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-0.5 rounded-md">
                        {item.category}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5">
                      {/* Host Identity */}
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {item.role}
                          </p>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-bold text-slate-800 line-clamp-1 mb-2">
                        {item.title}
                      </h3>

                      {/* Location & Rent */}
                      <div className="flex items-baseline justify-between mb-3">
                        <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>{item.location}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-slate-900">₹{item.rent.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400 font-normal"> / mo</span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {item.tags.slice(0, 3).map((tag, tIdx) => (
                          <span key={tIdx} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 mb-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{item.status}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRequestIntroMatch(item);
                        }}
                        className="py-2 px-3 rounded-lg border border-indigo-200 hover:border-indigo-400 bg-white text-indigo-700 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                      >
                        <span>Request Intro</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMatch(item);
                        }}
                        className="py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 8. HOW IT WORKS (From Profile to Conversation in 4 Steps) */}
      <section id="howItWorks" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl mb-14">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block mb-2">
              Managed Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              From profile to conversation, in four steps.
            </h2>
            <p className="mt-2 text-slate-600 text-sm">
              How Flatemate turns messy WhatsApp searching into a coordinated, stress-free move.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 hover:border-indigo-400 transition-colors">
              <span className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm mb-4">
                01
              </span>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">Discover</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Describe your living preferences, preferred area, budget, and move-in timeline.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 hover:border-indigo-400 transition-colors">
              <span className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm mb-4">
                02
              </span>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">Review</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Explore structured profiles, transparent rent breakdowns, amenities, and habits.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 hover:border-indigo-400 transition-colors">
              <span className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm mb-4">
                03
              </span>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">Request</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ask Flatemate for a verified candidate package or a managed direct intro.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 hover:border-indigo-400 transition-colors">
              <span className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm mb-4">
                04
              </span>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">Move In</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Coordinate the video walkthrough or physical tour and move in with peace of mind.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 9. FLATEMATE HIRING DESK / HOST DESK */}
      <section id="hiringDesk" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-2">
                Flatemate Managed Desk
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-4">
                Have a flat or need to replace a roommate? Let us handle the inquiries.
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Instead of fielding dozens of random calls and WhatsApp messages, post your space on Flatemate. We verify seekers, filter for compatibility, and send you only pre-qualified introductions.
              </p>

              <div className="space-y-3 text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Free for residents & house owners</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>We screen for lifestyle, cleanliness, and occupation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Introductions made only with mutual consent</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8">
              <h3 className="font-extrabold text-xl mb-1">Talk to Flatemate Desk</h3>
              <p className="text-xs text-slate-400 mb-6">We'll get back to you within 2 working hours.</p>

              <form onSubmit={(e) => { e.preventDefault(); alert('Request sent to Flatemate Desk! A team coordinator will reach out shortly.'); }} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Your Full Name</label>
                  <input type="text" required placeholder="e.g. Varun Mehta" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-hidden focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">WhatsApp / Phone Number</label>
                  <input type="tel" required placeholder="+91 98765 43210" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-hidden focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">What are you offering or looking for?</label>
                  <input type="text" required placeholder="e.g. 1 Private Room available in Satellite 3BHK" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-hidden focus:border-indigo-500" />
                </div>
                <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors">
                  Submit to Flatemate Desk
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* 10. FAQS (ElevateMe Style) */}
      <section id="faqs" className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block mb-2">FAQs</span>
            <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden">
            <details open className="p-5 group">
              <summary className="font-bold text-sm text-slate-900 cursor-pointer list-none flex items-center justify-between">
                How does Flatemate verify flatmates and spaces?
                <ChevronRight className="w-4 h-4 text-indigo-600 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Every listing undergoes a 2-step verification check: Government ID check and phone OTP verification to eliminate scam listings and fake profiles.
              </p>
            </details>

            <details className="p-5 group">
              <summary className="font-bold text-sm text-slate-900 cursor-pointer list-none flex items-center justify-between">
                Is there any brokerage or commission fee?
                <ChevronRight className="w-4 h-4 text-indigo-600 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Zero brokerage! Flatemate connects flat-seekers directly with current residents and owners without any middleman charges.
              </p>
            </details>

            <details className="p-5 group">
              <summary className="font-bold text-sm text-slate-900 cursor-pointer list-none flex items-center justify-between">
                How does a managed introduction request work?
                <ChevronRight className="w-4 h-4 text-indigo-600 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                When you click "Request Intro", you submit your details and preferred move-in date. Our desk shares the request with the host and coordinates the walkthrough.
              </p>
            </details>

            <details className="p-5 group">
              <summary className="font-bold text-sm text-slate-900 cursor-pointer list-none flex items-center justify-between">
                Which areas in Ahmedabad are currently supported?
                <ChevronRight className="w-4 h-4 text-indigo-600 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                We have active, verified listings in Satellite, Vastrapur, Navrangpura, Prahlad Nagar, Thaltej, and Bodakdev.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-base">Flatemate</span>
            <span>• Managed Co-Living Experience</span>
          </div>
          <div>© {new Date().getFullYear()} Flatemate Technologies. Built for Ahmedabad shared living.</div>
        </div>
      </footer>

      {/* 12. ELEVATEME-STYLE "REQUEST INTRO" MODAL */}
      {requestIntroMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            
            {requestSubmitted ? (
              /* Thank You State (ElevateMe Thankyou Screen) */
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-950">
                  Your request has been sent!
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Your intro request has been forwarded to the Flatemate team. We’ll notify you as soon as <strong>{requestIntroMatch.name}</strong> responds — we’ll coordinate within a few working hours.
                </p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium text-left space-y-1">
                  <div>✓ We’ll share your request with <strong>{requestIntroMatch.name}</strong>.</div>
                  <div>✓ We’ll update you once they confirm walkthrough slots.</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRequestSubmitted(false);
                    setRequestIntroMatch(null);
                  }}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Close Window
                </button>
              </div>
            ) : (
              /* Input Form */
              <div>
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Request a Managed Introduction</h3>
                    <p className="text-[11px] text-slate-400">Connecting with {requestIntroMatch.name} ({requestIntroMatch.category})</p>
                  </div>
                  <button
                    onClick={() => setRequestIntroMatch(null)}
                    className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSendRequest} className="p-6 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={reqName}
                      onChange={(e) => setReqName(e.target.value)}
                      placeholder="e.g. Yash Patel"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Phone / WhatsApp Number *</label>
                    <input
                      type="tel"
                      required
                      value={reqPhone}
                      onChange={(e) => setReqPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Expected Move-in Date</label>
                    <input
                      type="text"
                      value={reqDate}
                      onChange={(e) => setReqDate(e.target.value)}
                      placeholder="e.g. Next week or 1st of month"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Short Introduction (Optional)</label>
                    <textarea
                      rows={2}
                      value={reqMessage}
                      onChange={(e) => setReqMessage(e.target.value)}
                      placeholder="Tell the host a bit about your work and lifestyle..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                    />
                  </div>

                  <div 
                    onClick={() => setReqConsent(!reqConsent)}
                    className="flex items-start gap-2 text-[11px] text-slate-500 cursor-pointer select-none"
                  >
                    <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${reqConsent ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                      {reqConsent && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>I consent to Flatemate sharing my inquiry details with the verified resident.</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Send Managed Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 13. VIEW PROFILE / SPACE DETAILS MODAL */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="relative aspect-16/9">
              <img src={selectedMatch.image} alt={selectedMatch.title} className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedMatch(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-md"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                {selectedMatch.matchScore}% Match Fit
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <img src={selectedMatch.avatar} alt={selectedMatch.name} className="w-12 h-12 rounded-2xl object-cover border border-slate-200" />
                <div>
                  <h3 className="font-extrabold text-base text-slate-950">{selectedMatch.name}</h3>
                  <p className="text-xs text-slate-500">{selectedMatch.role}</p>
                </div>
              </div>

              <h2 className="text-lg font-bold text-slate-900 mb-2">{selectedMatch.title}</h2>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">{selectedMatch.description}</p>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs mb-4">
                <div><span className="text-slate-400 block">Monthly Rent</span><strong>₹{selectedMatch.rent.toLocaleString()}</strong></div>
                <div><span className="text-slate-400 block">Location</span><strong>{selectedMatch.location}</strong></div>
                <div><span className="text-slate-400 block">Furnishing</span><strong>{selectedMatch.furnishing}</strong></div>
                <div><span className="text-slate-400 block">Move-in</span><strong>{selectedMatch.availableDate}</strong></div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMatch(null)}
                  className="flex-1 py-3 border border-slate-300 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const match = selectedMatch;
                    setSelectedMatch(null);
                    setRequestIntroMatch(match);
                  }}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                >
                  Request Intro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ElevateConcept;
