import React, { useState } from 'react';

interface SpaceListing {
  id: string;
  type: string;
  rent: string;
  location: string;
  furnishing: string;
  occupancy: string;
  image: string;
  rawRent: number;
}

interface FlatmateProfile {
  id: string;
  name: string;
  age: number;
  role: string;
  preferred: string;
  budget: string;
  moveIn: string;
  tags: string[];
  image: string;
}

export function App() {
  // Filter States
  const [selectedLocality, setSelectedLocality] = useState<string>('All');
  const [selectedBudget, setSelectedBudget] = useState<string>('Any');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchLookingFor, setSearchLookingFor] = useState<string>('All');
  const [searchLocation, setSearchLocation] = useState<string>('All');
  const [searchBudget, setSearchBudget] = useState<string>('All');

  // Interactive Form States
  const [interestSubmitted, setInterestSubmitted] = useState<boolean>(false);
  const [listingSubmitted, setListingSubmitted] = useState<boolean>(false);
  const [selectedSpaceForInterest, setSelectedSpaceForInterest] = useState<SpaceListing | null>(null);

  // Interest Form Inputs
  const [interestName, setInterestName] = useState('');
  const [interestPhone, setInterestPhone] = useState('');
  const [interestDate, setInterestDate] = useState('');
  const [interestNote, setInterestNote] = useState('');
  const [consentChecked, setConsentChecked] = useState(true);

  // List Space Form Inputs
  const [spaceCategory, setSpaceCategory] = useState('Flat / Room / Flatmate Requirement');
  const [spaceTitle, setSpaceTitle] = useState('');
  const [spaceLocation, setSpaceLocation] = useState('');
  const [spaceRent, setSpaceRent] = useState('');
  const [spaceAvailable, setSpaceAvailable] = useState('');
  const [spaceFurnishing, setSpaceFurnishing] = useState('Fully Furnished');

  // Saved Listings
  const [savedSpaces, setSavedSpaces] = useState<string[]>([]);

  // Detailed Modal
  const [viewDetailsSpace, setViewDetailsSpace] = useState<SpaceListing | null>(null);
  const [viewDetailsFlatmate, setViewDetailsFlatmate] = useState<FlatmateProfile | null>(null);

  const toggleSave = (id: string) => {
    setSavedSpaces((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Spaces Data
  const defaultSpaces: SpaceListing[] = [
    {
      id: 'space-1',
      type: '2BHK Shared Apartment',
      rent: '₹8,500',
      rawRent: 8500,
      location: 'Satellite, Ahmedabad',
      furnishing: 'Fully Furnished',
      occupancy: '1 spot available',
      image: '/assets/flat1.png',
    },
    {
      id: 'space-2',
      type: 'Private Room in 3BHK',
      rent: '₹7,000',
      rawRent: 7000,
      location: 'Vastrapur, Ahmedabad',
      furnishing: 'Semi-Furnished',
      occupancy: 'Available now',
      image: '/assets/flat2.png',
    },
    {
      id: 'space-3',
      type: 'Shared Room in 2BHK',
      rent: '₹5,500',
      rawRent: 5500,
      location: 'Navrangpura, Ahmedabad',
      furnishing: 'Furnished',
      occupancy: '1 spot available',
      image: '/assets/flat3.png',
    },
    {
      id: 'space-4',
      type: 'Private Room in 3BHK',
      rent: '₹9,000',
      rawRent: 9000,
      location: 'Prahlad Nagar, Ahmedabad',
      furnishing: 'Fully Furnished',
      occupancy: 'Private room',
      image: '/assets/flat4.png',
    },
    {
      id: 'space-5',
      type: '2BHK Shared Flat',
      rent: '₹7,500',
      rawRent: 7500,
      location: 'Thaltej, Ahmedabad',
      furnishing: 'Semi-Furnished',
      occupancy: 'Shared home',
      image: '/assets/flat5.png',
    },
    {
      id: 'space-6',
      type: 'Room in Shared Apartment',
      rent: '₹6,500',
      rawRent: 6500,
      location: 'Bodakdev, Ahmedabad',
      furnishing: 'Furnished',
      occupancy: 'Shared room',
      image: '/assets/flat6.png',
    },
  ];

  const [spaces, setSpaces] = useState<SpaceListing[]>(defaultSpaces);

  // Flatmates Data
  const flatmates: FlatmateProfile[] = [
    {
      id: 'mate-1',
      name: 'Aarav',
      age: 24,
      role: 'Working Professional',
      preferred: 'Satellite',
      budget: '₹8,000–₹12,000',
      moveIn: '1 July',
      tags: ['Non-smoker', 'Early riser'],
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      id: 'mate-2',
      name: 'Nisha',
      age: 23,
      role: 'Design Student',
      preferred: 'Navrangpura',
      budget: '₹6,000–₹8,500',
      moveIn: '15 June',
      tags: ['Vegetarian', 'Quiet evenings'],
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
      id: 'mate-3',
      name: 'Kabir',
      age: 26,
      role: 'Product Analyst',
      preferred: 'Vastrapur',
      budget: '₹9,000–₹11,000',
      moveIn: '1 August',
      tags: ['Gym routine', 'Weekend cook'],
      image: 'https://randomuser.me/api/portraits/men/75.jpg',
    },
    {
      id: 'mate-4',
      name: 'Rhea',
      age: 25,
      role: 'Marketing Associate',
      preferred: 'Thaltej',
      budget: '₹7,500–₹10,000',
      moveIn: '20 June',
      tags: ['Pet friendly', 'Social'],
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
  ];

  // Filter Spaces
  const filteredSpaces = spaces.filter((item) => {
    if (selectedLocality !== 'All' && !item.location.toLowerCase().includes(selectedLocality.toLowerCase())) {
      return false;
    }
    if (selectedBudget === 'Under ₹7,000' && item.rawRent >= 7000) return false;
    if (selectedBudget === '₹7,000 - ₹8,500' && (item.rawRent < 7000 || item.rawRent > 8500)) return false;
    if (selectedBudget === 'Above ₹8,500' && item.rawRent <= 8500) return false;

    if (searchLocation !== 'All' && !item.location.toLowerCase().includes(searchLocation.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleInterestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interestName || !interestPhone) {
      alert('Please fill out your name and phone number.');
      return;
    }
    setInterestSubmitted(true);
  };

  const handleListSpaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceTitle || !spaceRent || !spaceLocation) {
      alert('Please fill out the title, rent, and location.');
      return;
    }
    const newListing: SpaceListing = {
      id: `space-${Date.now()}`,
      type: spaceTitle,
      rent: `₹${spaceRent}`,
      rawRent: Number(spaceRent),
      location: `${spaceLocation}, Ahmedabad`,
      furnishing: spaceFurnishing,
      occupancy: '1 spot available',
      image: '/assets/flat1.png',
    };
    setSpaces([newListing, ...spaces]);
    setListingSubmitted(true);
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col relative font-sans text-foreground">
      
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <a className="flex items-center gap-2 font-heading text-xl font-bold" href="#home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <iconify-icon icon="lucide:house" class="text-lg"></iconify-icon>
            </span>
            Flatemate
          </a>

          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground lg:flex">
            <a href="#home" className="text-foreground hover:text-primary transition-colors">Home</a>
            <a href="#spaces" className="hover:text-primary transition-colors">Find Flats</a>
            <a href="#people" className="hover:text-primary transition-colors">Find Flatmates</a>
            <a href="#list-space" className="hover:text-primary transition-colors">List Your Space</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
          </nav>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => alert('Log In modal: Ready to integrate with phone OTP.')}
              className="hidden min-h-11 px-3 text-sm font-semibold sm:block cursor-pointer hover:text-primary transition-colors"
            >
              Log In
            </button>
            <a 
              href="#list-space" 
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      <main>
        
        {/* HERO SECTION (#home) */}
        <section id="home" className="bg-secondary">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-12 lg:px-10 lg:py-24">
            
            <div className="lg:col-span-6">
              <p className="mb-5 flex items-center gap-2 text-xs font-bold tracking-widest text-primary">
                <span className="h-2 w-2 rounded-full bg-tertiary"></span>
                MAKING SHARED LIVING SIMPLE
              </p>
              
              <h1 className="max-w-xl text-balance font-heading text-5xl font-bold leading-tight tracking-tight lg:text-6xl">
                Find Your Space. Find <span className="text-primary">Your People.</span>
              </h1>
              
              <p className="mt-6 max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
                Discover flats, shared rooms, and compatible flatmates in Ahmedabad. Skip the endless WhatsApp searches and make finding your next home easier.
              </p>
              
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a 
                  href="#search" 
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
                >
                  <iconify-icon icon="lucide:search" class="text-lg"></iconify-icon>
                  Find a Flat or Flatmate
                </a>
                
                <a 
                  href="#list-space" 
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors"
                >
                  <iconify-icon icon="lucide:plus" class="text-lg text-primary"></iconify-icon>
                  Post a Free Listing
                </a>
              </div>
              
              <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                <iconify-icon icon="lucide:circle-check" class="text-base text-tertiary"></iconify-icon>
                Starting in Ahmedabad <span>•</span> Free to explore <span>•</span> Simple to connect
              </p>
            </div>

            {/* Hero Image & Floating Cards */}
            <div className="relative lg:col-span-6">
              <div className="overflow-hidden rounded-xl shadow-md">
                <img 
                  src="/assets/hero.png" 
                  alt="Two roommates in a warm, sunlit modern shared apartment" 
                  className="aspect-5/4 w-full object-cover" 
                  width="1536" 
                  height="1024" 
                />
              </div>

              {/* Bottom-left Floating Card */}
              <div className="absolute -bottom-5 -left-4 max-w-56 rounded-xl border border-border bg-card p-4 shadow-md">
                <p className="text-xs font-semibold text-primary">ILLUSTRATIVE LISTING</p>
                <p className="mt-1 font-heading text-base font-bold">2BHK Shared Flat</p>
                <p className="mt-2 text-sm font-bold">₹8,500/month</p>
                <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                  <iconify-icon icon="lucide:map-pin"></iconify-icon> Satellite, Ahmedabad
                </p>
              </div>

              {/* Top-right Floating Card */}
              <div className="absolute -right-3 top-8 max-w-56 rounded-xl border border-border bg-card p-4 shadow-md">
                <p className="text-xs font-semibold text-tertiary">ILLUSTRATIVE PROFILE</p>
                <p className="mt-1 font-heading text-sm font-bold">Looking for a Flatmate</p>
                <p className="mt-2 text-xs text-muted-foreground">Budget: ₹7,000–₹10,000</p>
                <p className="mt-1 text-xs text-muted-foreground">Vastrapur, Ahmedabad</p>
              </div>
            </div>

          </div>
        </section>

        {/* SEARCH BAR SECTION (#search) */}
        <section id="search" className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
          <div className="rounded-xl border border-border bg-card p-6 shadow-md">
            
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-heading font-semibold">Start Your Search</h2>
                <p className="mt-1 text-sm text-muted-foreground">Tell us what you’re looking for in Ahmedabad.</p>
              </div>
              <iconify-icon icon="lucide:sliders-horizontal" class="text-xl text-primary"></iconify-icon>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              
              <label className="rounded-lg border border-input px-4 py-3 text-sm cursor-pointer hover:border-primary transition-colors">
                <span className="block text-xs text-muted-foreground">Looking For</span>
                <div className="mt-1 flex items-center justify-between font-semibold">
                  <select 
                    value={searchLookingFor}
                    onChange={(e) => setSearchLookingFor(e.target.value)}
                    className="w-full bg-transparent outline-hidden cursor-pointer"
                  >
                    <option value="All">Flat / Room / Flatmate</option>
                    <option value="Flat">Flats & Rooms Only</option>
                    <option value="Flatmate">Flatmates Only</option>
                  </select>
                </div>
              </label>

              <label className="rounded-lg border border-input px-4 py-3 text-sm cursor-pointer hover:border-primary transition-colors">
                <span className="block text-xs text-muted-foreground">Preferred Location</span>
                <div className="mt-1 flex items-center justify-between font-semibold">
                  <select 
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full bg-transparent outline-hidden cursor-pointer"
                  >
                    <option value="All">Choose locality</option>
                    <option value="Satellite">Satellite</option>
                    <option value="Vastrapur">Vastrapur</option>
                    <option value="Navrangpura">Navrangpura</option>
                    <option value="Prahlad Nagar">Prahlad Nagar</option>
                    <option value="Thaltej">Thaltej</option>
                    <option value="Bodakdev">Bodakdev</option>
                  </select>
                </div>
              </label>

              <label className="rounded-lg border border-input px-4 py-3 text-sm cursor-pointer hover:border-primary transition-colors">
                <span className="block text-xs text-muted-foreground">Maximum Monthly Budget</span>
                <div className="mt-1 flex items-center justify-between font-semibold">
                  <select 
                    value={searchBudget}
                    onChange={(e) => setSearchBudget(e.target.value)}
                    className="w-full bg-transparent outline-hidden cursor-pointer"
                  >
                    <option value="All">Any budget</option>
                    <option value="Under ₹7,000">Under ₹7,000</option>
                    <option value="₹7,000 - ₹8,500">₹7,000 - ₹8,500</option>
                    <option value="Above ₹8,500">Above ₹8,500</option>
                  </select>
                </div>
              </label>

              <a 
                href="#spaces"
                onClick={() => {
                  if (searchLocation !== 'All') setSelectedLocality(searchLocation);
                  if (searchBudget !== 'All') setSelectedBudget(searchBudget);
                }}
                className="min-h-12 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                Search Listings
              </a>

            </div>

          </div>
        </section>

        {/* WHAT BRINGS YOU HERE */}
        <section className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-sm font-bold text-primary">DISCOVER</p>
            <h2 className="mt-2 text-3xl font-heading font-bold">What Brings You Here?</h2>
            <p className="mt-3 text-muted-foreground">Whether you’re searching for a home or have space to share, start here.</p>
          </div>

          <div className="mt-9 grid grid-cols-1 gap-5 md:grid-cols-3">
            
            <article className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-primary">
                <iconify-icon icon="lucide:building-2" class="text-xl"></iconify-icon>
              </span>
              <h3 className="mt-5 font-heading text-lg font-semibold">Find a Flat</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Browse available flats and shared rooms that match your location and budget.
              </p>
              <a href="#spaces" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                Explore Flats <iconify-icon icon="lucide:arrow-right"></iconify-icon>
              </a>
            </article>

            <article className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-primary">
                <iconify-icon icon="lucide:users" class="text-xl"></iconify-icon>
              </span>
              <h3 className="mt-5 font-heading text-lg font-semibold">Find a Flatmate</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Discover people looking for a shared home with similar preferences.
              </p>
              <a href="#people" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                Explore Flatmates <iconify-icon icon="lucide:arrow-right"></iconify-icon>
              </a>
            </article>

            <article className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-primary">
                <iconify-icon icon="lucide:house-plus" class="text-xl"></iconify-icon>
              </span>
              <h3 className="mt-5 font-heading text-lg font-semibold">List Your Space</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Have an available room, flat, or flatmate requirement? Post it for free.
              </p>
              <a href="#list-space" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                Create Listing <iconify-icon icon="lucide:arrow-right"></iconify-icon>
              </a>
            </article>

          </div>
        </section>

        {/* EXPLORE SPACES (#spaces) */}
        <section id="spaces" className="bg-secondary">
          <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-10">
            
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-bold text-primary">EXPLORE SPACES</p>
                <h2 className="mt-2 text-3xl font-heading font-bold">Spaces You Might Love</h2>
                <p className="mt-3 text-muted-foreground">
                  Explore flats and shared rooms across Ahmedabad. <span className="font-semibold">Sample listings for prototype preview.</span>
                </p>
              </div>
              <button 
                onClick={() => {
                  setSelectedLocality('All');
                  setSelectedBudget('Any');
                }}
                className="min-h-11 rounded-lg border border-border bg-card px-4 text-sm font-semibold flex items-center hover:bg-slate-50 transition-colors"
              >
                <iconify-icon icon="lucide:funnel" class="mr-2 text-primary"></iconify-icon>
                Reset filters
              </button>
            </div>

            {/* Filter Pills */}
            <div className="mt-7 flex flex-wrap gap-2">
              <button 
                onClick={() => setSelectedLocality(selectedLocality === 'Satellite' ? 'All' : 'Satellite')}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                  selectedLocality === 'Satellite' 
                    ? 'border-primary bg-accent text-primary' 
                    : 'border-border bg-card hover:bg-slate-50'
                }`}
              >
                Satellite
              </button>
              <button 
                onClick={() => setSelectedLocality(selectedLocality === 'Vastrapur' ? 'All' : 'Vastrapur')}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                  selectedLocality === 'Vastrapur' 
                    ? 'border-primary bg-accent text-primary' 
                    : 'border-border bg-card hover:bg-slate-50'
                }`}
              >
                Vastrapur
              </button>
              <button 
                onClick={() => setSelectedLocality(selectedLocality === 'Navrangpura' ? 'All' : 'Navrangpura')}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                  selectedLocality === 'Navrangpura' 
                    ? 'border-primary bg-accent text-primary' 
                    : 'border-border bg-card hover:bg-slate-50'
                }`}
              >
                Navrangpura
              </button>
              <button 
                onClick={() => setSelectedBudget(selectedBudget === 'Under ₹7,000' ? 'Any' : 'Under ₹7,000')}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                  selectedBudget === 'Under ₹7,000' 
                    ? 'border-primary bg-accent text-primary' 
                    : 'border-border bg-card hover:bg-slate-50'
                }`}
              >
                Under ₹7,000
              </button>
              <button 
                onClick={() => setSelectedBudget(selectedBudget === '₹7,000 - ₹8,500' ? 'Any' : '₹7,000 - ₹8,500')}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                  selectedBudget === '₹7,000 - ₹8,500' 
                    ? 'border-primary bg-accent text-primary' 
                    : 'border-border bg-card hover:bg-slate-50'
                }`}
              >
                ₹7,000 - ₹8,500
              </button>
            </div>

            {/* Flat Listings Grid */}
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredSpaces.map((item) => {
                const isSaved = savedSpaces.includes(item.id);
                return (
                  <article key={item.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all">
                    <img 
                      src={item.image} 
                      alt={item.type} 
                      className="aspect-16/10 w-full object-cover" 
                      width="1536" 
                      height="1024" 
                    />
                    
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-semibold text-primary">SAMPLE LISTING</p>
                          <h3 className="mt-1 font-heading font-semibold">{item.type}</h3>
                        </div>
                        <button 
                          onClick={() => toggleSave(item.id)}
                          className={`cursor-pointer transition-colors ${isSaved ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500'}`}
                        >
                          <iconify-icon icon={isSaved ? "lucide:heart-crack" : "lucide:heart"} class="text-xl"></iconify-icon>
                        </button>
                      </div>

                      <p className="mt-3 text-lg font-bold">
                        {item.rent}<span className="text-sm font-medium text-muted-foreground">/month</span>
                      </p>
                      
                      <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
                        <iconify-icon icon="lucide:map-pin"></iconify-icon> {item.location}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-secondary px-3 py-1 text-muted-foreground font-medium">{item.furnishing}</span>
                        <span className="rounded-full bg-secondary px-3 py-1 text-muted-foreground font-medium">{item.occupancy}</span>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => setViewDetailsSpace(item)}
                          className="w-full min-h-11 rounded-lg border border-border text-sm font-bold hover:bg-slate-50 transition-colors"
                        >
                          View Details
                        </button>
                        <a 
                          href="#express-interest"
                          onClick={() => setSelectedSpaceForInterest(item)}
                          className="w-full min-h-11 rounded-lg bg-primary text-sm font-bold text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                        >
                          Interested
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-10 text-center">
              <a 
                href="#search" 
                onClick={() => {
                  setSelectedLocality('All');
                  setSelectedBudget('Any');
                }}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-bold text-primary hover:bg-slate-50 transition-colors"
              >
                Explore All Flats <iconify-icon icon="lucide:arrow-right"></iconify-icon>
              </a>
            </div>

          </div>
        </section>

        {/* FIND FLATMATE SECTION (#people) */}
        <section id="people" className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-10">
          
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold text-primary">FIND YOUR FLATMATE</p>
              <h2 className="mt-2 text-3xl font-heading font-bold">Find People You’d Love Living With</h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                A great home is about more than four walls. Find someone whose lifestyle fits yours. <span className="font-semibold">Illustrative profiles only.</span>
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-slate-50">Budget</button>
            <button className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-slate-50">Preferred Location</button>
            <button className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-slate-50">Occupation</button>
            <button className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-slate-50">Lifestyle</button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {flatmates.map((mate) => (
              <article key={mate.id} className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <img 
                    src={mate.image} 
                    alt={`Illustrative profile of ${mate.name}`} 
                    className="h-12 w-12 rounded-full object-cover" 
                  />
                  <div>
                    <h3 className="font-heading font-semibold">{mate.name}, {mate.age}</h3>
                    <p className="text-xs text-muted-foreground">{mate.role}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Preferred:</span> {mate.preferred}</p>
                  <p><span className="text-muted-foreground">Budget:</span> {mate.budget}</p>
                  <p><span className="text-muted-foreground">Move-in:</span> {mate.moveIn}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {mate.tags.map((tag, idx) => (
                    <span key={idx} className="rounded-full bg-secondary px-2 py-1 text-xs text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>

                <button 
                  onClick={() => setViewDetailsFlatmate(mate)}
                  className="mt-5 w-full min-h-11 rounded-lg border border-border text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  View Profile
                </button>
              </article>
            ))}
          </div>

          <div className="mt-9 text-center">
            <a href="#search" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
              Explore All Flatmates <iconify-icon icon="lucide:arrow-right"></iconify-icon>
            </a>
          </div>

        </section>

        {/* HOW IT WORKS SECTION (#how-it-works) */}
        <section id="how-it-works" className="bg-secondary">
          <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-10">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold text-primary">HOW IT WORKS</p>
              <h2 className="mt-2 text-3xl font-heading font-bold">Finding Your Next Home Is Simple</h2>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              
              <article className="relative text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  01
                </span>
                <span className="absolute left-[58%] top-7 hidden h-px w-[84%] bg-border md:block"></span>
                <iconify-icon icon="lucide:search" class="mt-5 text-2xl text-primary"></iconify-icon>
                <h3 className="mt-3 font-heading text-lg font-semibold">Discover</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                  Search flats, rooms, or flatmates based on your needs.
                </p>
              </article>

              <article className="relative text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  02
                </span>
                <span className="absolute left-[58%] top-7 hidden h-px w-[84%] bg-border md:block"></span>
                <iconify-icon icon="lucide:layout-list" class="mt-5 text-2xl text-primary"></iconify-icon>
                <h3 className="mt-3 font-heading text-lg font-semibold">Explore</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                  Review listings, compare details, and find the right fit.
                </p>
              </article>

              <article className="text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  03
                </span>
                <iconify-icon icon="lucide:send" class="mt-5 text-2xl text-primary"></iconify-icon>
                <h3 className="mt-3 font-heading text-lg font-semibold">Connect</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                  Express interest and request contact with the listing owner.
                </p>
              </article>

            </div>
          </div>
        </section>

        {/* LIST YOUR SPACE (#list-space) */}
        <section id="list-space" className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-10">
          <div className="grid grid-cols-1 gap-10 rounded-xl bg-accent p-7 lg:grid-cols-2 lg:p-12">
            
            <div className="flex flex-col justify-center">
              <p className="text-sm font-bold text-primary">LIST YOUR SPACE</p>
              <h2 className="mt-3 max-w-lg text-3xl font-heading font-bold text-balance">
                Have a Space? Find the Right Person.
              </h2>
              <p className="mt-4 max-w-lg text-pretty leading-7 text-accent-foreground">
                Post your available flat, room, or flatmate requirement in minutes and reach people actively searching in Ahmedabad.
              </p>

              <ul className="mt-7 space-y-3 text-sm font-semibold">
                <li className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-tertiary text-white">
                    <iconify-icon icon="lucide:check" class="text-sm"></iconify-icon>
                  </span>
                  Free to post
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-tertiary text-white">
                    <iconify-icon icon="lucide:check" class="text-sm"></iconify-icon>
                  </span>
                  Simple listing process
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-tertiary text-white">
                    <iconify-icon icon="lucide:check" class="text-sm"></iconify-icon>
                  </span>
                  Reach interested people
                </li>
              </ul>

              <button 
                onClick={() => {
                  const el = document.getElementById('listing-title-input');
                  el?.focus();
                }}
                className="mt-8 inline-flex min-h-12 w-fit items-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <iconify-icon icon="lucide:plus"></iconify-icon>
                Post a Free Listing
              </button>
            </div>

            {/* Listing Form */}
            <form onSubmit={handleListSpaceSubmit} className="rounded-xl border border-border bg-card p-5 shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-lg font-semibold">Create your listing</h3>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                  Preview
                </span>
              </div>

              {listingSubmitted ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <iconify-icon icon="lucide:circle-check" class="text-2xl"></iconify-icon>
                  </div>
                  <h4 className="font-bold text-base">Listing Created Successfully!</h4>
                  <p className="text-xs text-muted-foreground">
                    Your space has been posted and added to the "Spaces You Might Love" section.
                  </p>
                  <button 
                    type="button"
                    onClick={() => setListingSubmitted(false)}
                    className="mt-2 text-xs font-bold text-primary hover:underline"
                  >
                    Post another space
                  </button>
                </div>
              ) : (
                <>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <label className="col-span-2">
                      <span className="mb-1 block text-xs font-medium">What are you listing?</span>
                      <select 
                        value={spaceCategory}
                        onChange={(e) => setSpaceCategory(e.target.value)}
                        className="w-full rounded-lg border border-input px-3 py-2.5 text-sm bg-transparent outline-hidden"
                      >
                        <option>Flat / Room / Flatmate Requirement</option>
                        <option>Full Flat</option>
                        <option>Private Room in Shared Flat</option>
                        <option>Shared Room</option>
                      </select>
                    </label>

                    <label className="col-span-2">
                      <span className="mb-1 block text-xs font-medium">Property Title</span>
                      <input 
                        id="listing-title-input"
                        type="text"
                        required
                        value={spaceTitle}
                        onChange={(e) => setSpaceTitle(e.target.value)}
                        placeholder="e.g. Sunny 2BHK near ISRO"
                        className="w-full rounded-lg border border-input px-3 py-2.5 text-sm outline-hidden focus:border-primary"
                      />
                    </label>

                    <label>
                      <span className="mb-1 block text-xs font-medium">Location</span>
                      <input 
                        type="text"
                        required
                        value={spaceLocation}
                        onChange={(e) => setSpaceLocation(e.target.value)}
                        placeholder="Ahmedabad locality"
                        className="w-full rounded-lg border border-input px-3 py-2.5 text-sm outline-hidden focus:border-primary"
                      />
                    </label>

                    <label>
                      <span className="mb-1 block text-xs font-medium">Monthly Rent or Budget</span>
                      <input 
                        type="number"
                        required
                        value={spaceRent}
                        onChange={(e) => setSpaceRent(e.target.value)}
                        placeholder="₹"
                        className="w-full rounded-lg border border-input px-3 py-2.5 text-sm outline-hidden focus:border-primary"
                      />
                    </label>

                    <label>
                      <span className="mb-1 block text-xs font-medium">Available From</span>
                      <input 
                        type="text"
                        value={spaceAvailable}
                        onChange={(e) => setSpaceAvailable(e.target.value)}
                        placeholder="Select date / Immediately"
                        className="w-full rounded-lg border border-input px-3 py-2.5 text-sm outline-hidden focus:border-primary"
                      />
                    </label>

                    <label>
                      <span className="mb-1 block text-xs font-medium">Furnishing</span>
                      <select 
                        value={spaceFurnishing}
                        onChange={(e) => setSpaceFurnishing(e.target.value)}
                        className="w-full rounded-lg border border-input px-3 py-2.5 text-sm bg-transparent outline-hidden"
                      >
                        <option>Fully Furnished</option>
                        <option>Semi-Furnished</option>
                        <option>Unfurnished</option>
                      </select>
                    </label>

                    <label className="col-span-2">
                      <span className="mb-1 block text-xs font-medium">Property Images & Description</span>
                      <div className="rounded-lg border border-dashed border-input px-3 py-4 text-muted-foreground flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                        <iconify-icon icon="lucide:image" class="mr-2 text-lg text-primary"></iconify-icon>
                        <span>Add photos and a short description</span>
                      </div>
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    className="mt-4 min-h-11 w-full rounded-lg bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Publish Listing
                  </button>
                </>
              )}

            </form>

          </div>
        </section>

        {/* EXPRESS INTEREST SECTION (#express-interest) */}
        <section id="express-interest" className="bg-secondary">
          <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-10">
            
            <div className="max-w-2xl">
              <p className="text-sm font-bold text-primary">EXPRESS INTEREST</p>
              <h2 className="mt-2 text-3xl font-heading font-bold">Interested in a Listing? Make the First Move.</h2>
              <p className="mt-3 text-muted-foreground">
                A simple, consent-led request gives listing owners the details they need to decide whether to connect.
              </p>
            </div>

            <div className="mt-9 grid grid-cols-1 gap-6 lg:grid-cols-2">
              
              {/* Left Listing Preview */}
              <article className="rounded-xl border border-border bg-card p-7 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-primary">LISTING PREVIEW</p>
                  <h3 className="mt-2 font-heading text-xl font-bold">
                    {selectedSpaceForInterest ? selectedSpaceForInterest.type : '2BHK Shared Flat — Satellite'}
                  </h3>
                  <p className="mt-2 text-lg font-bold">
                    {selectedSpaceForInterest ? `${selectedSpaceForInterest.rent}/month` : '₹8,500/month'}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {selectedSpaceForInterest 
                      ? `${selectedSpaceForInterest.furnishing} · ${selectedSpaceForInterest.occupancy} · ${selectedSpaceForInterest.location}`
                      : 'Fully furnished · 1 spot available · Sample listing'}
                  </p>
                </div>

                <div className="mt-6">
                  <button 
                    onClick={() => {
                      const input = document.getElementById('interest-name-input');
                      input?.focus();
                    }}
                    className="min-h-11 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    I’m Interested
                  </button>
                </div>
              </article>

              {/* Right Request Form */}
              <article className="rounded-xl border border-border bg-card p-6 shadow-md">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-lg font-semibold">Send interest request</h3>
                  <button 
                    onClick={() => setInterestSubmitted(false)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <iconify-icon icon="lucide:x" class="text-xl"></iconify-icon>
                  </button>
                </div>

                <form onSubmit={handleInterestSubmit}>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <label>
                      <span className="mb-1 block text-xs font-medium">Your Name</span>
                      <input 
                        id="interest-name-input"
                        type="text"
                        required
                        value={interestName}
                        onChange={(e) => setInterestName(e.target.value)}
                        placeholder="Your name"
                        className="w-full rounded-lg border border-input px-3 py-2.5 text-sm outline-hidden focus:border-primary"
                      />
                    </label>

                    <label>
                      <span className="mb-1 block text-xs font-medium">Phone Number</span>
                      <input 
                        type="tel"
                        required
                        value={interestPhone}
                        onChange={(e) => setInterestPhone(e.target.value)}
                        placeholder="+91"
                        className="w-full rounded-lg border border-input px-3 py-2.5 text-sm outline-hidden focus:border-primary"
                      />
                    </label>

                    <label className="col-span-2">
                      <span className="mb-1 block text-xs font-medium">Preferred Move-in Date</span>
                      <input 
                        type="text"
                        value={interestDate}
                        onChange={(e) => setInterestDate(e.target.value)}
                        placeholder="Select date / e.g. Next week"
                        className="w-full rounded-lg border border-input px-3 py-2.5 text-sm outline-hidden focus:border-primary"
                      />
                    </label>

                    <label className="col-span-2">
                      <span className="mb-1 block text-xs font-medium">Short Introduction (Optional)</span>
                      <textarea 
                        rows={2}
                        value={interestNote}
                        onChange={(e) => setInterestNote(e.target.value)}
                        placeholder="Tell them a little about yourself"
                        className="w-full rounded-lg border border-input px-3 py-2.5 text-sm outline-hidden focus:border-primary"
                      />
                    </label>
                  </div>

                  <p 
                    onClick={() => setConsentChecked(!consentChecked)}
                    className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground cursor-pointer select-none"
                  >
                    <span className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded border ${consentChecked ? 'border-primary text-primary bg-accent' : 'border-border'}`}>
                      {consentChecked && <iconify-icon icon="lucide:check" class="text-xs"></iconify-icon>}
                    </span>
                    I agree to share these details with the listing owner.
                  </p>

                  <button 
                    type="submit" 
                    className="mt-4 min-h-11 w-full rounded-lg bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Send Interest Request
                  </button>

                  {interestSubmitted && (
                    <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-tertiary">
                      <iconify-icon icon="lucide:circle-check"></iconify-icon>
                      Interest request sent successfully.
                    </p>
                  )}
                </form>
              </article>

            </div>

          </div>
        </section>

        {/* WHY FLATEMATE */}
        <section className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-sm font-bold text-primary">WHY FLATEMATE</p>
            <h2 className="mt-2 text-3xl font-heading font-bold">Less Searching. More Living.</h2>
          </div>

          <div className="mt-9 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            
            <article className="rounded-xl border border-border p-5 hover:border-primary/40 transition-colors">
              <iconify-icon icon="lucide:inbox" class="text-2xl text-primary"></iconify-icon>
              <h3 className="mt-4 font-heading font-semibold">No Endless Group Searching</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Find relevant flats and flatmates without scrolling through hundreds of WhatsApp messages.
              </p>
            </article>

            <article className="rounded-xl border border-border p-5 hover:border-primary/40 transition-colors">
              <iconify-icon icon="lucide:link" class="text-2xl text-primary"></iconify-icon>
              <h3 className="mt-4 font-heading font-semibold">Direct Connections</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Express interest in listings and connect with people offering shared accommodation.
              </p>
            </article>

            <article className="rounded-xl border border-border p-5 hover:border-primary/40 transition-colors">
              <iconify-icon icon="lucide:users" class="text-2xl text-primary"></iconify-icon>
              <h3 className="mt-4 font-heading font-semibold">Better Flatmate Discovery</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Explore budget, location, and lifestyle preferences before making a decision.
              </p>
            </article>

            <article className="rounded-xl border border-border p-5 hover:border-primary/40 transition-colors">
              <iconify-icon icon="lucide:eye" class="text-2xl text-primary"></iconify-icon>
              <h3 className="mt-4 font-heading font-semibold">Simple and Transparent</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Understand rent, occupancy, and property details before expressing interest.
              </p>
            </article>

          </div>
        </section>

        {/* TRUST & SAFETY */}
        <section className="bg-secondary">
          <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-10">
            <div className="max-w-2xl">
              <p className="text-sm font-bold text-primary">TRUST & SAFETY</p>
              <h2 className="mt-2 text-3xl font-heading font-bold">Find Your Next Home With More Confidence.</h2>
            </div>

            <div className="mt-9 grid grid-cols-1 gap-6 md:grid-cols-3">
              <article className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-card text-primary shadow-xs">
                  <iconify-icon icon="lucide:circle-alert" class="text-xl"></iconify-icon>
                </span>
                <p className="text-sm leading-6">Report suspicious or misleading listings.</p>
              </article>

              <article className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-card text-primary shadow-xs">
                  <iconify-icon icon="lucide:shield" class="text-xl"></iconify-icon>
                </span>
                <p className="text-sm leading-6">Share personal contact information only with consent.</p>
              </article>

              <article className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-card text-primary shadow-xs">
                  <iconify-icon icon="lucide:calendar-check" class="text-xl"></iconify-icon>
                </span>
                <p className="text-sm leading-6">Review listing information and arrange a visit before making payments.</p>
              </article>
            </div>

            <p className="mt-9 rounded-lg border border-border bg-card p-4 text-sm leading-6 text-muted-foreground">
              Flatemate helps people discover accommodation. Users should independently verify property details before making commitments.
            </p>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="mx-auto w-full max-w-4xl px-6 py-16 lg:px-10">
          <div className="text-center">
            <p className="text-sm font-bold text-primary">FAQ</p>
            <h2 className="mt-2 text-3xl font-heading font-bold">Questions, Answered Clearly.</h2>
          </div>

          <div className="mt-9 divide-y divide-border rounded-xl border border-border">
            
            <details open className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-heading font-semibold">
                What is Flatemate?
                <iconify-icon icon="lucide:chevron-down" class="text-xl text-primary transition-transform group-open:rotate-180"></iconify-icon>
              </summary>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Flatemate helps people in Ahmedabad discover rental flats, shared rooms, and potential flatmates in one simple place.
              </p>
            </details>

            <details className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-heading font-semibold">
                How do I find flats in Ahmedabad?
                <iconify-icon icon="lucide:chevron-down" class="text-xl text-primary transition-transform group-open:rotate-180"></iconify-icon>
              </summary>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Choose your locality, budget, and preferred type of space, then browse relevant listings.
              </p>
            </details>

            <details className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-heading font-semibold">
                Is it free to browse listings?
                <iconify-icon icon="lucide:chevron-down" class="text-xl text-primary transition-transform group-open:rotate-180"></iconify-icon>
              </summary>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Yes, browsing listings is free and does not require an account.
              </p>
            </details>

            <details className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-heading font-semibold">
                Can I post my flat for free?
                <iconify-icon icon="lucide:chevron-down" class="text-xl text-primary transition-transform group-open:rotate-180"></iconify-icon>
              </summary>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Yes. You can submit an available flat, room, or flatmate requirement without a listing fee.
              </p>
            </details>

            <details className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-heading font-semibold">
                How do I find a flatmate?
                <iconify-icon icon="lucide:chevron-down" class="text-xl text-primary transition-transform group-open:rotate-180"></iconify-icon>
              </summary>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Filter illustrative profiles by location, budget, occupation, and lifestyle preferences, then express interest when available.
              </p>
            </details>

            <details className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-heading font-semibold">
                How do I contact a listing owner?
                <iconify-icon icon="lucide:chevron-down" class="text-xl text-primary transition-transform group-open:rotate-180"></iconify-icon>
              </summary>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Use the interest form to share your basic details with consent. The owner can then decide whether to connect.
              </p>
            </details>

            <details className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-heading font-semibold">
                Does Flatemate charge brokerage?
                <iconify-icon icon="lucide:chevron-down" class="text-xl text-primary transition-transform group-open:rotate-180"></iconify-icon>
              </summary>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Flatemate is designed to help people discover accommodation and express interest; review each opportunity carefully before committing.
              </p>
            </details>

            <details className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-heading font-semibold">
                How can I report a suspicious listing?
                <iconify-icon icon="lucide:chevron-down" class="text-xl text-primary transition-transform group-open:rotate-180"></iconify-icon>
              </summary>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Use the report option associated with a listing and include the details that look misleading or suspicious.
              </p>
            </details>

          </div>
        </section>

        {/* BOTTOM BANNER CTA */}
        <section className="mx-6 mb-16 rounded-xl bg-primary lg:mx-10">
          <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-16 text-center">
            <h2 className="max-w-2xl text-balance font-heading text-4xl font-bold text-primary-foreground">
              Your Next Home Starts Here.
            </h2>
            <p className="mt-4 max-w-xl text-pretty text-primary-foreground opacity-90">
              Find the right flat, discover compatible flatmates, or list your space for free.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a 
                href="#spaces" 
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-card px-6 text-sm font-bold text-foreground shadow-md hover:bg-slate-50 transition-colors"
              >
                Explore Listings <iconify-icon icon="lucide:arrow-right"></iconify-icon>
              </a>
              <a 
                href="#list-space" 
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border px-6 text-sm font-bold text-primary-foreground hover:bg-white/10 transition-colors"
              >
                Post a Free Listing <iconify-icon icon="lucide:plus"></iconify-icon>
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-border">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-5 lg:px-10">
          
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 font-heading text-xl font-bold">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <iconify-icon icon="lucide:house" class="text-lg"></iconify-icon>
              </span>
              Flatemate
            </div>
            <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
              Find your space. Find your people.
            </p>
            <div className="mt-5 flex gap-3 text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors"><iconify-icon icon="lucide:instagram" class="text-xl"></iconify-icon></a>
              <a href="#" className="hover:text-primary transition-colors"><iconify-icon icon="lucide:linkedin" class="text-xl"></iconify-icon></a>
              <a href="#" className="hover:text-primary transition-colors"><iconify-icon icon="lucide:twitter" class="text-xl"></iconify-icon></a>
            </div>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold">Explore</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><a href="#spaces" className="hover:text-foreground">Find Flats</a></li>
              <li><a href="#people" className="hover:text-foreground">Find Flatmates</a></li>
              <li><a href="#list-space" className="hover:text-foreground">List Your Space</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold">Company</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">About</a></li>
              <li><a href="#how-it-works" className="hover:text-foreground">How It Works</a></li>
              <li><a href="#" className="hover:text-foreground">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold">Legal</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-foreground">Safety Guidelines</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-border">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-muted-foreground sm:flex-row sm:justify-between lg:px-10">
            <span>© 2026 Flatemate. All rights reserved.</span>
            <span>Built for Ahmedabad shared living.</span>
          </div>
        </div>
      </footer>

      {/* DETAIL MODAL FOR FLATS */}
      {viewDetailsSpace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card rounded-2xl max-w-lg w-full overflow-hidden border border-border shadow-2xl animate-in fade-in zoom-in-95">
            <div className="relative">
              <img src={viewDetailsSpace.image} alt={viewDetailsSpace.type} className="aspect-16/10 w-full object-cover" />
              <button 
                onClick={() => setViewDetailsSpace(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-900 shadow-md transition-colors"
              >
                <iconify-icon icon="lucide:x" class="text-xl"></iconify-icon>
              </button>
            </div>
            <div className="p-6">
              <p className="text-xs font-semibold text-primary">SAMPLE LISTING</p>
              <h3 className="mt-1 font-heading text-xl font-bold">{viewDetailsSpace.type}</h3>
              <p className="mt-2 text-2xl font-black text-primary">{viewDetailsSpace.rent}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
              <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
                <iconify-icon icon="lucide:map-pin"></iconify-icon> {viewDetailsSpace.location}
              </p>
              <div className="mt-4 flex gap-2 text-xs">
                <span className="rounded-full bg-secondary px-3 py-1 text-muted-foreground font-semibold">{viewDetailsSpace.furnishing}</span>
                <span className="rounded-full bg-secondary px-3 py-1 text-muted-foreground font-semibold">{viewDetailsSpace.occupancy}</span>
              </div>
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => setViewDetailsSpace(null)}
                  className="flex-1 py-3 border border-border rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                <a 
                  href="#express-interest"
                  onClick={() => {
                    setSelectedSpaceForInterest(viewDetailsSpace);
                    setViewDetailsSpace(null);
                  }}
                  className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-bold flex items-center justify-center hover:bg-primary/90 transition-colors"
                >
                  Express Interest
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL FOR FLATMATE */}
      {viewDetailsFlatmate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card rounded-2xl max-w-md w-full p-6 border border-border shadow-2xl animate-in fade-in zoom-in-95 relative">
            <button 
              onClick={() => setViewDetailsFlatmate(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <iconify-icon icon="lucide:x" class="text-xl"></iconify-icon>
            </button>
            <div className="flex items-center gap-4">
              <img src={viewDetailsFlatmate.image} alt={viewDetailsFlatmate.name} className="w-16 h-16 rounded-full object-cover border-2 border-primary" />
              <div>
                <h3 className="font-heading text-xl font-bold">{viewDetailsFlatmate.name}, {viewDetailsFlatmate.age}</h3>
                <p className="text-xs font-semibold text-primary">{viewDetailsFlatmate.role}</p>
                <p className="text-xs text-muted-foreground">Looking in {viewDetailsFlatmate.preferred}</p>
              </div>
            </div>
            <div className="mt-6 space-y-2 text-sm bg-secondary p-4 rounded-xl border border-border">
              <p><span className="text-muted-foreground font-medium">Budget:</span> <strong>{viewDetailsFlatmate.budget}</strong></p>
              <p><span className="text-muted-foreground font-medium">Expected Move-in:</span> <strong>{viewDetailsFlatmate.moveIn}</strong></p>
              <p><span className="text-muted-foreground font-medium">Location:</span> <strong>{viewDetailsFlatmate.preferred}, Ahmedabad</strong></p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {viewDetailsFlatmate.tags.map((tag, idx) => (
                <span key={idx} className="rounded-full bg-accent text-primary px-3 py-1 text-xs font-semibold">
                  {tag}
                </span>
              ))}
            </div>
            <button 
              onClick={() => {
                alert(`Interest request sent to connect with ${viewDetailsFlatmate.name}!`);
                setViewDetailsFlatmate(null);
              }}
              className="mt-6 w-full py-3 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <iconify-icon icon="lucide:send"></iconify-icon>
              <span>Connect with {viewDetailsFlatmate.name}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
