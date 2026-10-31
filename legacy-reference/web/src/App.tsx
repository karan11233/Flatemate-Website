import React, { useState, useEffect } from 'react';
import { SpaceListing, AuthUser } from './types';
import { MyListingsModal, Inquiry } from './components/MyListingsModal';
import { InterestSuccessModal } from './components/InterestSuccessModal';
import { ExpressInterestModal } from './components/ExpressInterestModal';
import { ReportModal } from './components/ReportModal';
import { AuthModal } from './components/AuthModal';
import {
  isSupabaseConfigured,
  supabase,
  getCurrentUser,
  signOutUser,
  getOrCreateDeviceUserId,
  getCloudSpaces,
  insertCloudSpace,
  updateCloudSpaceStatus,
  getCloudInquiries,
  insertCloudInquiry,
  updateCloudInquiryStatus,
} from './lib/supabase';
import {
  validateContent,
  validateIndianPhone,
  checkPostRateLimit,
  recordPostTimestamp,
} from './lib/moderation';

export function App() {
  // Seamless Device Auth State (Frictionless guest identity)
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => {
    try {
      const saved = localStorage.getItem('flatemate_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    const deviceId = getOrCreateDeviceUserId();
    const savedName = localStorage.getItem('flatemate_user_name') || '';
    const savedPhone = localStorage.getItem('flatemate_user_phone') || '';
    return {
      id: deviceId,
      fullName: savedName || '',
      phone: savedPhone,
    };
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPromptMessage, setAuthPromptMessage] = useState('');
  const [onAuthSuccessCallback, setOnAuthSuccessCallback] = useState<(() => void) | null>(null);

  // Filter States
  const [selectedLocality, setSelectedLocality] = useState<string>('All');
  const [selectedBudget, setSelectedBudget] = useState<string>('Any');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'all' | 'fresh' | 'replacement' | 'seeker'>('all');
  const [searchLookingFor, setSearchLookingFor] = useState<string>('All');
  const [searchLocation, setSearchLocation] = useState<string>('All');
  const [searchBudget, setSearchBudget] = useState<string>('All');

  // Interactive Form States
  const [listingSubmitted, setListingSubmitted] = useState<boolean>(false);

  // Interest Form Inputs (For Success Confirmation)
  const [interestName, setInterestName] = useState('');
  const [interestPhone, setInterestPhone] = useState('');
  const [interestDate, setInterestDate] = useState('');

  // List Space Form Inputs & Tabs
  const [listingTab, setListingTab] = useState<'fresh' | 'replacement' | 'seeker'>('fresh');
  const [spaceTitle, setSpaceTitle] = useState('');
  const [spaceLocation, setSpaceLocation] = useState('');
  const [spaceRent, setSpaceRent] = useState('');
  const [spaceAvailable, setSpaceAvailable] = useState('');
  const [spaceFurnishing, setSpaceFurnishing] = useState('Fully Furnished');
  const [hostName, setHostName] = useState(() => localStorage.getItem('flatemate_user_name') || '');
  const [hostPhone, setHostPhone] = useState(() => localStorage.getItem('flatemate_user_phone') || '');

  // Tab 1: Fresh Flat specific
  const [freshBhk, setFreshBhk] = useState('2BHK Flat');
  const [tenantPreference, setTenantPreference] = useState('Any (Bachelors or Family)');

  // Tab 2: Need Replacement specific
  const [replacementSpots, setReplacementSpots] = useState('1 Person Replacement');
  const [replacementBhk, setReplacementBhk] = useState('3BHK Flat');
  const [replacementRoomType, setReplacementRoomType] = useState('Private Room with Attached Bath');
  const [flatmateHabitPref, setFlatmateHabitPref] = useState('Working Professionals / Any');

  // Tab 3: Seeker Requirement specific (Looking for Flat/Roommate)
  const [seekerLookingFor, setSeekerLookingFor] = useState('Private Room in Shared Flat');
  const [seekerOccupancy, setSeekerOccupancy] = useState('1 Male Bachelor');
  const [seekerMoveIn, setSeekerMoveIn] = useState('Immediate / Flexible');
  const [seekerProfession, setSeekerProfession] = useState('IT / Working Professional');
  const [seekerDiet, setSeekerDiet] = useState('Vegetarian');

  // Custom Description & Highlights/Amenities
  const [spaceDescription, setSpaceDescription] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'WiFi',
    'Attached Bath',
    'Balcony',
    'AC',
  ]);
  const [customAmenityInput, setCustomAmenityInput] = useState('');

  const toggleAmenity = (name: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const handleAddCustomAmenity = () => {
    if (!customAmenityInput.trim()) return;
    const clean = customAmenityInput.trim();
    if (!selectedAmenities.includes(clean)) {
      setSelectedAmenities([...selectedAmenities, clean]);
    }
    setCustomAmenityInput('');
  };

  // Host Portal / "My Listings" State
  const [isMyListingsOpen, setIsMyListingsOpen] = useState(false);
  const [isInterestSuccessOpen, setIsInterestSuccessOpen] = useState(false);
  const [interestModalSpace, setInterestModalSpace] = useState<SpaceListing | null>(null);
  const [lastSubmittedSpace, setLastSubmittedSpace] = useState<SpaceListing | null>(null);

  const [currentHostPhone, setCurrentHostPhone] = useState<string>(() => {
    return localStorage.getItem('flatemate_host_phone') || '';
  });

  useEffect(() => {
    if (currentHostPhone) {
      localStorage.setItem('flatemate_host_phone', currentHostPhone);
    }
  }, [currentHostPhone]);

  // Auth Session Listener
  useEffect(() => {
    async function checkUserSession() {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
        if (user.phone) {
          setCurrentHostPhone(user.phone);
          setHostPhone(user.phone);
        }
        if (user.fullName) setHostName(user.fullName);
      }
    }
    checkUserSession();

    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const u: AuthUser = {
            id: session.user.id,
            email: session.user.email,
            phone: session.user.user_metadata?.phone || '',
            fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          };
          setCurrentUser(u);
          if (u.phone) {
            setCurrentHostPhone(u.phone);
            setHostPhone(u.phone);
          }
          if (u.fullName) setHostName(u.fullName);
        } else {
          const deviceId = getOrCreateDeviceUserId();
          const savedName = localStorage.getItem('flatemate_user_name') || '';
          const savedPhone = localStorage.getItem('flatemate_user_phone') || '';
          setCurrentUser({
            id: deviceId,
            fullName: savedName,
            phone: savedPhone,
          });
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const handleSignOut = async () => {
    await signOutUser();
    localStorage.removeItem('flatemate_user');
    localStorage.removeItem('flatemate_user_name');
    localStorage.removeItem('flatemate_user_phone');
    const deviceId = getOrCreateDeviceUserId();
    setCurrentUser({
      id: deviceId,
      fullName: '',
      phone: '',
    });
    setHostName('');
    setHostPhone('');
  };

  // Saved Listings
  const [savedSpaces, setSavedSpaces] = useState<string[]>([]);

  // Detailed Modal
  const [viewDetailsSpace, setViewDetailsSpace] = useState<SpaceListing | null>(null);

  // Moderation & Reporting State
  const [reportingSpace, setReportingSpace] = useState<SpaceListing | null>(null);
  const [reportedSpaceIds, setReportedSpaceIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('flatemate_reported_spaces');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Photo Upload State for "List Your Space"
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  const toggleSave = (id: string) => {
    setSavedSpaces((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleReportSubmitted = (spaceId: string, reason: string, comment: string) => {
    const updated = [...reportedSpaceIds, spaceId];
    setReportedSpaceIds(updated);
    localStorage.setItem('flatemate_reported_spaces', JSON.stringify(updated));
    console.log(`[Report Logged] Space: ${spaceId}, Reason: ${reason}, Note: ${comment}`);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).slice(0, 4).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setUploadedPhotos((prev) => [...prev, reader.result as string].slice(0, 4));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Real Spaces (starts empty or loads from Supabase / clean localStorage)
  const [spaces, setSpaces] = useState<SpaceListing[]>(() => {
    try {
      const saved = localStorage.getItem('flatemate_spaces_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('flatemate_spaces_data', JSON.stringify(spaces));
  }, [spaces]);

  // Real Inquiries
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    try {
      const saved = localStorage.getItem('flatemate_inquiries_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('flatemate_inquiries_data', JSON.stringify(inquiries));
  }, [inquiries]);

  // Sync Cloud Data from Supabase on Load (Direct database source of truth)
  useEffect(() => {
    async function initCloudSync() {
      if (!isSupabaseConfigured) return;
      
      const cloudSpaces = await getCloudSpaces();
      if (cloudSpaces) {
        setSpaces(cloudSpaces);
      }

      const cloudInquiries = await getCloudInquiries();
      if (cloudInquiries) {
        setInquiries(cloudInquiries);
      }
    }
    initCloudSync();
  }, []);

  // Filter Spaces (Bifurcated by category: All / Full Vacant Flats / Flatmate Replacements)
  const filteredSpaces = spaces.filter((item) => {
    // Category Filter
    if (selectedCategoryTab === 'fresh') {
      if (item.category && item.category !== 'fresh') return false;
      if (!item.category && item.type.toLowerCase().includes('shared')) return false;
    } else if (selectedCategoryTab === 'replacement') {
      if (item.category && item.category !== 'replacement') return false;
      if (!item.category && !item.type.toLowerCase().includes('shared') && !item.type.toLowerCase().includes('room')) return false;
    } else if (selectedCategoryTab === 'seeker') {
      if (item.category !== 'seeker') return false;
    }

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

  // Handle Seeker "Express Interest" via Direct Card Popup
  const handleModalInterestSubmit = (data: {
    seekerName: string;
    seekerPhone: string;
    moveInDate: string;
    note: string;
  }) => {
    if (!interestModalSpace) return;
    const targetSpace = interestModalSpace;

    const newInquiry: Inquiry = {
      id: `inq-${Date.now()}`,
      spaceId: targetSpace.id,
      hostId: targetSpace.userId,
      seekerId: currentUser?.id,
      spaceTitle: targetSpace.type,
      hostName: targetSpace.hostName || 'Resident Host',
      hostPhone: targetSpace.hostPhone || '',
      seekerName: data.seekerName,
      seekerPhone: data.seekerPhone,
      moveInDate: data.moveInDate || 'Immediate',
      note: data.note,
      timestamp: 'Just now',
      status: 'new',
    };

    setInquiries([newInquiry, ...inquiries]);
    if (isSupabaseConfigured) {
      insertCloudInquiry(newInquiry);
    }
    localStorage.setItem('flatemate_user_name', data.seekerName.trim());
    localStorage.setItem('flatemate_user_phone', data.seekerPhone.trim());
    setLastSubmittedSpace(targetSpace);
    setInterestName(data.seekerName);
    setInterestPhone(data.seekerPhone);
    setInterestDate(data.moveInDate);
    setInterestModalSpace(null);
    setIsInterestSuccessOpen(true);
  };

  // Handle Host & Seeker Submission (Fresh Flat, Replacement, or Seeker Requirement)
  const handleListSpaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!spaceRent || !spaceLocation || !hostName || !hostPhone) {
      alert('Please fill out the rent/budget, location, your name, and WhatsApp number.');
      return;
    }

    // 1. Anti-Spam Rate Limit Cooldown (Prevent bot flooding)
    const rateCheck = checkPostRateLimit();
    if (!rateCheck.isAllowed) {
      alert(`🛡️ Anti-Spam Protection: Please wait ${rateCheck.waitSeconds}s before posting another listing.`);
      return;
    }

    // 2. Validate Genuine Indian WhatsApp Mobile Number (No 0000000000 or fake sequences)
    const phoneCheck = validateIndianPhone(hostPhone);
    if (!phoneCheck.isValid) {
      alert(`⚠️ ${phoneCheck.reason}`);
      return;
    }

    // 3. Content Moderation (Block adult terms, escort/NSFW spam, gambling, scam links)
    const textToCheck = `${spaceTitle} ${spaceLocation} ${hostName}`;
    const contentCheck = validateContent(textToCheck);
    if (!contentCheck.isValid) {
      alert(`🚫 Moderation Block: ${contentCheck.reason}`);
      return;
    }

    const cleanHostPhone = hostPhone.replace(/\D/g, '').slice(-10);

    const title = listingTab === 'seeker'
      ? (spaceTitle.trim() || `Looking for ${seekerLookingFor} in ${spaceLocation}`)
      : listingTab === 'fresh'
      ? (spaceTitle.trim() || `${freshBhk} in ${spaceLocation}`)
      : (spaceTitle.trim() || `${replacementSpots} in ${replacementBhk} (${replacementRoomType})`);

    const occupancyText = listingTab === 'seeker'
      ? `${seekerOccupancy} • Move-in: ${seekerMoveIn}`
      : listingTab === 'fresh'
      ? 'Entire Vacant Flat'
      : `${replacementSpots} needed`;

    const furnishingText = listingTab === 'seeker'
      ? `${seekerProfession} • ${seekerDiet}`
      : spaceFurnishing;

    const cleanLoc = spaceLocation.toLowerCase().includes('ahmedabad')
      ? spaceLocation
      : `${spaceLocation}, Ahmedabad`;

    const chosenImage = uploadedPhotos.length > 0 
      ? uploadedPhotos[0] 
      : '';

    const newListing: SpaceListing = {
      id: `space-${Date.now()}`,
      userId: currentUser?.id || getOrCreateDeviceUserId(),
      category: listingTab,
      type: title,
      rent: listingTab === 'seeker' ? `Budget: ₹${Number(spaceRent).toLocaleString()}` : `₹${Number(spaceRent).toLocaleString()}`,
      rawRent: Number(spaceRent),
      location: cleanLoc,
      furnishing: furnishingText,
      occupancy: occupancyText,
      image: chosenImage,
      hostName: hostName.trim() || (listingTab === 'seeker' ? 'Seeker' : 'Host'),
      hostPhone: cleanHostPhone,
      status: 'active',
      verified: true,
      description: spaceDescription.trim() || (
        listingTab === 'seeker'
          ? `I am looking for a space in ${cleanLoc}. Preferred: ${seekerLookingFor}. Budget: ₹${Number(spaceRent).toLocaleString()}/month. Target move-in: ${seekerMoveIn}. Lifestyle: ${seekerDiet}, ${seekerProfession}.`
          : ''
      ),
      amenities: selectedAmenities,
      seekerMoveIn: seekerMoveIn,
      seekerProfession: seekerProfession,
    };

    setSpaces([newListing, ...spaces]);
    if (isSupabaseConfigured) {
      insertCloudSpace(newListing);
    }
    recordPostTimestamp();
    setCurrentHostPhone(cleanHostPhone);
    localStorage.setItem('flatemate_user_name', hostName.trim());
    localStorage.setItem('flatemate_user_phone', cleanHostPhone);
    setCurrentUser(prev => ({
      id: prev?.id || getOrCreateDeviceUserId(),
      fullName: hostName.trim(),
      phone: cleanHostPhone,
    }));
    setUploadedPhotos([]);
    setSpaceDescription('');
    setListingSubmitted(true);
  };

  // Toggle Listing Status (Active vs Rented)
  const handleToggleListingStatus = (spaceId: string) => {
    const target = spaces.find((s) => s.id === spaceId);
    const updatedStatus = target?.status === 'rented' ? 'active' : 'rented';

    setSpaces((prev) =>
      prev.map((s) => {
        if (s.id === spaceId) {
          return {
            ...s,
            status: updatedStatus,
          };
        }
        return s;
      })
    );
    if (isSupabaseConfigured) {
      updateCloudSpaceStatus(spaceId, updatedStatus);
    }
  };

  // Update Inquiry Status
  const handleUpdateInquiryStatus = (inquiryId: string, status: 'new' | 'contacted' | 'visited') => {
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === inquiryId ? { ...inq, status } : inq))
    );
    if (isSupabaseConfigured && status !== 'visited') {
      updateCloudInquiryStatus(inquiryId, status);
    }
  };

  // Total Inquiries count for the active host phone
  const activeHostInquiriesCount = inquiries.filter(
    (inq) => inq.hostPhone && inq.hostPhone.replace(/\D/g, '').endsWith(currentHostPhone.replace(/\D/g, '').slice(-10))
  ).length;

  return (
    <div className="min-h-screen w-full bg-background flex flex-col relative font-sans text-foreground">
      
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5 lg:px-10">
          <a className="flex items-center gap-2.5 font-heading text-xl font-bold tracking-tight text-slate-900 group" href="#home">
            <img 
              src="/assets/flatemate-logo-alt.jpg" 
              alt="Flatemate Logo" 
              className="w-9 h-9 rounded-xl object-cover shadow-xs border border-primary/20 group-hover:scale-105 transition-transform" 
            />
            <span>Flatemate</span>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground lg:flex">
            <a href="#home" className="text-foreground hover:text-primary transition-colors">Home</a>
            <a href="#discover" className="hover:text-primary transition-colors">Discover</a>
            <a href="#spaces" className="hover:text-primary transition-colors">Explore Spaces</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
            <a href="#list-space" className="hover:text-primary transition-colors">List Your Space</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Account Button */}
            {currentUser && (currentUser.fullName || currentUser.phone) ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setIsMyListingsOpen(true)}
                  className="inline-flex items-center gap-1.5 min-h-10 px-2.5 sm:px-3 text-xs sm:text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-black text-xs">
                    {currentUser.fullName ? currentUser.fullName[0].toUpperCase() : 'U'}
                  </span>
                  <span className="hidden sm:inline">{(currentUser.fullName || 'User').split(' ')[0]}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign Out / Clear Profile"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <iconify-icon icon="lucide:log-out" class="text-base"></iconify-icon>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthPromptMessage('Log in or sign up to manage your spaces and inquiries across devices.');
                  setIsAuthModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 min-h-10 px-3 sm:px-3.5 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <iconify-icon icon="lucide:user" class="text-base text-primary"></iconify-icon>
                <span>Log In</span>
              </button>
            )}

            {/* Host Dashboard Button */}
            <button
              type="button"
              onClick={() => setIsMyListingsOpen(true)}
              className="relative inline-flex items-center gap-1.5 min-h-10 px-3 sm:px-3.5 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <iconify-icon icon="lucide:layout-dashboard" class="text-base text-primary"></iconify-icon>
              <span className="hidden sm:inline">Host Portal</span>
              {activeHostInquiriesCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-emerald-600 text-white rounded-full text-[10px] font-extrabold animate-pulse">
                  {activeHostInquiriesCount}
                </span>
              )}
            </button>

            <a 
              href="#list-space" 
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-3.5 sm:px-4 text-xs sm:text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
            >
              Post Free
            </a>
          </div>
        </div>
      </header>

      <main className="pb-20 lg:pb-0">
        
        {/* HERO SECTION (#home) */}
        <section id="home" className="bg-secondary">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 py-14 lg:grid-cols-12 lg:px-10 lg:py-20">
            
            <div className="lg:col-span-6">
              <p className="mb-4 flex items-center gap-2 text-xs font-bold tracking-widest text-primary">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                AHMEDABAD'S DIRECT FLAT & FLATMATES NETWORK
              </p>
              
              <h1 className="max-w-xl text-balance font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-slate-900">
                Find Your Space. Find <span className="text-primary">Your People.</span>
              </h1>
              
              <p className="mt-4 max-w-xl text-pretty text-base sm:text-lg leading-7 text-muted-foreground">
                Browse verified vacant flats, room replacements, and roommate requirements in Ahmedabad. Connect directly on WhatsApp with zero brokerage.
              </p>
              
              {/* Action Buttons: Instant access to both finding and posting requirements */}
              <div className="mt-7 flex flex-wrap gap-2.5 sm:gap-3">
                <a 
                  href="#spaces" 
                  onClick={() => setSelectedCategoryTab('all')}
                  className="inline-flex min-h-11 sm:min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 sm:px-5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-primary/90 transition-all cursor-pointer"
                >
                  <iconify-icon icon="lucide:search" class="text-base"></iconify-icon>
                  <span>Explore Spaces</span>
                </a>
                
                <a 
                  href="#spaces" 
                  onClick={() => setSelectedCategoryTab('seeker')}
                  className="inline-flex min-h-11 sm:min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 sm:px-5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition-all cursor-pointer"
                >
                  <iconify-icon icon="lucide:user-search" class="text-base"></iconify-icon>
                  <span>People Seeking Flats</span>
                </a>

                <a 
                  href="#list-space" 
                  onClick={() => setListingTab('seeker')}
                  className="inline-flex min-h-11 sm:min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-emerald-600/40 bg-emerald-50 text-emerald-800 px-4 sm:px-5 text-xs sm:text-sm font-bold shadow-xs hover:bg-emerald-100 transition-all cursor-pointer"
                >
                  <iconify-icon icon="lucide:plus-circle" class="text-base text-emerald-600"></iconify-icon>
                  <span>Post Flat Requirement</span>
                </a>
                
                <a 
                  href="#list-space" 
                  onClick={() => setListingTab('fresh')}
                  className="inline-flex min-h-11 sm:min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 sm:px-5 text-xs sm:text-sm font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <iconify-icon icon="lucide:building-2" class="text-base text-primary"></iconify-icon>
                  <span>List a Space</span>
                </a>
              </div>
              
              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <iconify-icon icon="lucide:check-circle-2" class="text-emerald-600 text-sm"></iconify-icon>
                  100% Free Forever
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <iconify-icon icon="lucide:check-circle-2" class="text-emerald-600 text-sm"></iconify-icon>
                  Zero Brokerage
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <iconify-icon icon="lucide:check-circle-2" class="text-emerald-600 text-sm"></iconify-icon>
                  Direct WhatsApp Connect
                </span>
              </div>
            </div>

            {/* Hero Image with Floating Quick-Access Cards */}
            <div className="relative lg:col-span-6">
              <div className="overflow-hidden rounded-3xl shadow-xl border border-slate-200 relative group">
                <img 
                  src="/assets/hero.png" 
                  alt="Flatmates in a shared apartment in Ahmedabad" 
                  className="aspect-5/4 w-full object-cover" 
                  width="1536" 
                  height="1024" 
                />

                {/* Floating Badge 1: Instant Seeker Mode */}
                <a
                  href="#spaces"
                  onClick={() => setSelectedCategoryTab('seeker')}
                  className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-emerald-100 flex items-center gap-3 cursor-pointer hover:scale-102 transition-transform"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <iconify-icon icon="lucide:user-search" class="text-xl"></iconify-icon>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">Direct Connect</span>
                    <p className="text-xs font-bold text-slate-900">People Seeking Flats</p>
                    <p className="text-[10px] text-slate-500">Reach flat seekers on WhatsApp</p>
                  </div>
                </a>

                {/* Floating Badge 2: Zero Brokerage */}
                <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md">
                  <iconify-icon icon="lucide:shield-check" class="text-emerald-400"></iconify-icon>
                  <span>100% Zero Brokerage</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 1. DISCOVER SECTION (#discover) - PLACED ABOVE SEARCH */}
        <section id="discover" className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-12 lg:px-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider mb-2">
              <iconify-icon icon="lucide:compass" class="text-sm"></iconify-icon>
              <span>Explore Platform Pathways</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 leading-tight">
              What Brings You to Flatemate?
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Whether you need an entire flat, want to join a roommate in an existing home, or are looking for flatmates.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* PATHWAY 1: SEEKING FULL FLAT */}
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-3 group-hover:scale-105 transition-transform">
                  <iconify-icon icon="lucide:building-2" class="text-xl"></iconify-icon>
                </span>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Seeker • Full Property</span>
                <h3 className="mt-1 font-heading text-base font-bold text-slate-900">Rent Full Vacant Flat</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  For friends, colleagues, or families looking to rent an entire 1BHK, 2BHK, 3BHK or villa.
                </p>
              </div>
              <a 
                href="#spaces" 
                onClick={() => setSelectedCategoryTab('fresh')}
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:underline cursor-pointer"
              >
                <span>Browse Full Flats</span>
                <iconify-icon icon="lucide:arrow-right"></iconify-icon>
              </a>
            </article>

            {/* PATHWAY 2: JOINING OCCUPIED FLAT (REPLACEMENT) */}
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 mb-3 group-hover:scale-105 transition-transform">
                  <iconify-icon icon="lucide:users" class="text-xl"></iconify-icon>
                </span>
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Seeker • Single Room / Bed</span>
                <h3 className="mt-1 font-heading text-base font-bold text-slate-900">Join an Occupied Flat</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Looking for a single room or shared spot where flatmates already live and need a replacement.
                </p>
              </div>
              <a 
                href="#spaces" 
                onClick={() => setSelectedCategoryTab('replacement')}
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:underline cursor-pointer"
              >
                <span>Browse Flat Openings</span>
                <iconify-icon icon="lucide:arrow-right"></iconify-icon>
              </a>
            </article>

            {/* PATHWAY 3: BROWSE PEOPLE SEEKING FLATS */}
            <article className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 mb-3 group-hover:scale-105 transition-transform">
                  <iconify-icon icon="lucide:user-search" class="text-xl"></iconify-icon>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Hosts & Roommates</span>
                <h3 className="mt-1 font-heading text-base font-bold text-slate-900">People Seeking Flats</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Have an empty room or flat? Browse verified seekers and reach out to them directly on WhatsApp.
                </p>
              </div>
              <a 
                href="#spaces" 
                onClick={() => setSelectedCategoryTab('seeker')}
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 group-hover:underline cursor-pointer"
              >
                <span>Browse Flat Seekers</span>
                <iconify-icon icon="lucide:arrow-right"></iconify-icon>
              </a>
            </article>

            {/* PATHWAY 4: POST YOUR REQUIREMENT OR SPACE */}
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 mb-3 group-hover:scale-105 transition-transform">
                  <iconify-icon icon="lucide:plus-circle" class="text-xl"></iconify-icon>
                </span>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Free Post • 0% Brokerage</span>
                <h3 className="mt-1 font-heading text-base font-bold text-slate-900">Post Requirement / Space</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Post what you're looking for or list your vacant apartment in under 2 minutes. 100% free.
                </p>
              </div>
              <a 
                href="#list-space" 
                onClick={() => setListingTab('seeker')}
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:underline cursor-pointer"
              >
                <span>Post for Free</span>
                <iconify-icon icon="lucide:arrow-right"></iconify-icon>
              </a>
            </article>
          </div>
        </section>

        {/* 2. START YOUR SEARCH SECTION (#search) - PLACED BELOW DISCOVER */}
        <section id="search" className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 lg:px-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
            
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-heading font-bold text-slate-900">Find What You Need in Ahmedabad</h3>
                <p className="text-xs text-slate-500">Filter by category, neighborhood, and your monthly budget.</p>
              </div>
              <iconify-icon icon="lucide:sliders-horizontal" class="text-xl text-primary"></iconify-icon>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
              
              <label className="rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold cursor-pointer hover:border-primary transition-colors">
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Listing Category</span>
                <select 
                  value={selectedCategoryTab}
                  onChange={(e) => setSelectedCategoryTab(e.target.value as any)}
                  className="w-full bg-transparent text-slate-900 outline-hidden font-bold cursor-pointer"
                >
                  <option value="all">All Spaces (Flats & Seekers)</option>
                  <option value="fresh">Full Vacant Flats Only</option>
                  <option value="replacement">Flatmate Replacements Only</option>
                  <option value="seeker">People Seeking Flats (Flat Wanted)</option>
                </select>
              </label>

              <label className="rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold cursor-pointer hover:border-primary transition-colors">
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Neighborhood / Hub</span>
                <select 
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full bg-transparent text-slate-900 outline-hidden font-bold cursor-pointer"
                >
                  <option value="All">All Ahmedabad Localities</option>
                  <option value="Satellite">Satellite</option>
                  <option value="Vastrapur">Vastrapur</option>
                  <option value="Navrangpura">Navrangpura</option>
                  <option value="Prahlad Nagar">Prahlad Nagar</option>
                  <option value="Thaltej">Thaltej</option>
                  <option value="Bodakdev">Bodakdev</option>
                  <option value="SG Highway">SG Highway</option>
                  <option value="Bopal">Bopal</option>
                </select>
              </label>

              <label className="rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold cursor-pointer hover:border-primary transition-colors">
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Maximum Monthly Budget</span>
                <select 
                  value={searchBudget}
                  onChange={(e) => setSearchBudget(e.target.value)}
                  className="w-full bg-transparent text-slate-900 outline-hidden font-bold cursor-pointer"
                >
                  <option value="All">Any Monthly Budget</option>
                  <option value="Under ₹7,000">Under ₹7,000 / month</option>
                  <option value="₹7,000 - ₹8,500">₹7,000 - ₹8,500 / month</option>
                  <option value="Above ₹8,500">Above ₹8,500 / month</option>
                </select>
              </label>

              <a 
                href="#spaces"
                onClick={() => {
                  if (searchLocation !== 'All') setSelectedLocality(searchLocation);
                  if (searchBudget !== 'All') setSelectedBudget(searchBudget);
                }}
                className="min-h-11 rounded-xl bg-primary px-5 text-xs sm:text-sm font-bold text-white flex items-center justify-center hover:bg-primary/90 transition-all shadow-sm"
              >
                Filter Listings
              </a>

            </div>

          </div>
        </section>

        {/* 3. EXPLORE SPACES FEED (#spaces) - BIFURCATED INTO FULL FLATS & REPLACEMENTS */}
        <section id="spaces" className="bg-slate-50/70 border-t border-slate-200">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-12 lg:px-10">
            
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider mb-2">
                  <iconify-icon icon="lucide:layout-grid" class="text-sm"></iconify-icon>
                  <span>Ahmedabad Shared Living Feed</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">
                  Available Flats & Room Vacancies
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">
                  Direct listings posted by verified owners and current flatmates. Zero brokerage.
                </p>
              </div>

              <button 
                onClick={() => {
                  setSelectedLocality('All');
                  setSelectedBudget('Any');
                  setSelectedCategoryTab('all');
                  setSearchLocation('All');
                  setSearchBudget('All');
                }}
                className="min-h-10 rounded-xl border border-slate-300 bg-white px-3.5 text-xs font-bold text-slate-700 flex items-center hover:bg-slate-50 transition-colors shadow-2xs self-start md:self-auto cursor-pointer"
              >
                <iconify-icon icon="lucide:rotate-ccw" class="mr-1.5 text-primary text-sm"></iconify-icon>
                Reset filters
              </button>
            </div>

            {/* CATEGORY SWITCHER TABS (Bifurcate: All / Full Vacant Flats / Flatmate Replacements / People Seeking Flats) */}
            <div className="mt-6 flex flex-wrap gap-2 p-1.5 bg-slate-200/70 rounded-2xl max-w-fit">
              <button
                type="button"
                onClick={() => setSelectedCategoryTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategoryTab === 'all'
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Spaces ({spaces.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategoryTab('fresh')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategoryTab === 'fresh'
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <iconify-icon icon="lucide:building-2" class="text-sm"></iconify-icon>
                <span>Full Vacant Flats</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategoryTab('replacement')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategoryTab === 'replacement'
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <iconify-icon icon="lucide:users" class="text-sm"></iconify-icon>
                <span>Flatmate Replacements</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategoryTab('seeker')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategoryTab === 'seeker'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <iconify-icon icon="lucide:user-search" class="text-sm"></iconify-icon>
                <span>People Seeking Flats</span>
              </button>
            </div>

            {/* Quick Ahmedabad Area Chips Bar */}
            <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1 mr-1">
                <iconify-icon icon="lucide:map-pin" class="text-primary"></iconify-icon>
                Locality:
              </span>
              {[
                { label: 'All', value: 'All' },
                { label: 'Satellite', value: 'Satellite' },
                { label: 'Vastrapur', value: 'Vastrapur' },
                { label: 'Prahlad Nagar', value: 'Prahlad' },
                { label: 'Navrangpura', value: 'Navrangpura' },
                { label: 'Bodakdev', value: 'Bodakdev' },
                { label: 'Thaltej', value: 'Thaltej' },
                { label: 'SG Highway', value: 'SG Highway' },
                { label: 'Bopal', value: 'Bopal' },
              ].map((loc) => {
                const isActive = (selectedLocality === loc.value) || (loc.value === 'All' && selectedLocality === 'All');
                return (
                  <button
                    key={loc.value}
                    onClick={() => setSelectedLocality(loc.value)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-primary text-white shadow-xs' 
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {loc.label}
                  </button>
                );
              })}
            </div>

            {/* Budget Filters */}
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="text-xs font-bold text-slate-500 self-center mr-1">Budget:</span>
              {[
                'Any',
                'Under ₹7,000',
                '₹7,000 - ₹8,500',
                'Above ₹8,500',
              ].map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBudget(selectedBudget === b ? 'Any' : b)}
                  className={`px-3 py-1 rounded-lg border font-semibold transition-colors cursor-pointer ${
                    selectedBudget === b
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            {/* Spaces Grid or Empty State */}
            {filteredSpaces.length === 0 ? (
              <div className="mt-8 rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${selectedCategoryTab === 'seeker' ? 'bg-emerald-100 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                  <iconify-icon icon={selectedCategoryTab === 'seeker' ? "lucide:user-search" : "lucide:building-2"} class="text-2xl"></iconify-icon>
                </div>
                <h3 className="font-heading font-bold text-lg text-slate-900">
                  {selectedCategoryTab === 'seeker'
                    ? 'No Flat Seekers Listed Yet'
                    : selectedCategoryTab === 'replacement' 
                    ? 'No Flatmate Replacements Listed Yet' 
                    : selectedCategoryTab === 'fresh'
                    ? 'No Full Vacant Flats Listed Yet'
                    : 'No Spaces Listed in This Selection'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5 leading-relaxed">
                  {selectedCategoryTab === 'seeker'
                    ? 'Looking for a room or flat in Ahmedabad? Post your requirement for free and let hosts connect with you!'
                    : selectedCategoryTab === 'replacement'
                    ? 'Living in an apartment and need 1–2 flatmates to take over a room? Post your opening for free!'
                    : 'Have an available flat or room in Ahmedabad? Be the first to publish with zero brokerage.'}
                </p>
                <a
                  href="#list-space"
                  onClick={() => {
                    if (selectedCategoryTab === 'seeker') setListingTab('seeker');
                    else if (selectedCategoryTab === 'replacement') setListingTab('replacement');
                    else setListingTab('fresh');
                  }}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-sm transition-colors ${
                    selectedCategoryTab === 'seeker' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary hover:bg-primary/90'
                  }`}
                >
                  <iconify-icon icon="lucide:plus"></iconify-icon>
                  <span>{selectedCategoryTab === 'seeker' ? 'Post Your Flat Requirement Free' : 'Post Your Space Free'}</span>
                </a>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredSpaces.map((item) => {
                  const isSaved = savedSpaces.includes(item.id);
                  const isRented = item.status === 'rented';
                  const isReported = reportedSpaceIds.includes(item.id);
                  const isSeeker = item.category === 'seeker';
                  const isReplacement = item.category === 'replacement' || (!item.category && item.type.toLowerCase().includes('shared'));

                  return (
                    <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group">
                      <div>
                        <div className="relative">
                          {item.image && item.image.trim() !== '' && !item.image.includes('/assets/flat') ? (
                            <img 
                              src={item.image} 
                              alt={item.type} 
                              className="aspect-16/10 w-full object-cover" 
                              width="1536" 
                              height="1024" 
                            />
                          ) : isSeeker ? (
                            <div className="aspect-16/10 w-full bg-linear-to-br from-emerald-50 to-teal-50 border-b border-emerald-100 flex flex-col items-center justify-center p-4 text-center select-none">
                              <div className="w-12 h-12 rounded-2xl bg-emerald-100 shadow-xs flex items-center justify-center text-emerald-700 mb-2">
                                <iconify-icon icon="lucide:user-check" class="text-2xl text-emerald-600"></iconify-icon>
                              </div>
                              <span className="text-xs font-bold text-slate-800">Seeking Flat / Roommate</span>
                              <span className="text-[11px] text-slate-500 font-medium mt-0.5">Looking to move in Ahmedabad</span>
                            </div>
                          ) : (
                            <div className="aspect-16/10 w-full bg-slate-100 border-b border-slate-200 flex flex-col items-center justify-center p-4 text-center select-none">
                              <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center text-slate-300 mb-2">
                                <iconify-icon icon="lucide:image" class="text-2xl text-slate-400"></iconify-icon>
                              </div>
                              <span className="text-xs font-bold text-slate-600">No Photos Attached</span>
                              <span className="text-[11px] text-slate-400 font-medium mt-0.5">Contact host directly for video or tour</span>
                            </div>
                          )}
                          {isRented && (
                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center">
                              <span className="bg-rose-600 text-white font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                                {isSeeker ? 'Space Found' : 'Taken / Rented Out'}
                              </span>
                            </div>
                          )}
                          
                          {/* Category Badge (Full Flat vs Replacement vs Seeker) */}
                          <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            {isSeeker ? (
                              <span className="bg-emerald-700/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md backdrop-blur-xs">
                                <iconify-icon icon="lucide:user-search" class="text-xs"></iconify-icon>
                                <span>FLAT WANTED / SEEKER</span>
                              </span>
                            ) : isReplacement ? (
                              <span className="bg-purple-900/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md backdrop-blur-xs">
                                <iconify-icon icon="lucide:users" class="text-xs"></iconify-icon>
                                <span>ROOM REPLACEMENT</span>
                              </span>
                            ) : (
                              <span className="bg-blue-900/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md backdrop-blur-xs">
                                <iconify-icon icon="lucide:building-2" class="text-xs"></iconify-icon>
                                <span>FULL FLAT</span>
                              </span>
                            )}
                          </div>

                          {isReported && (
                            <div className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                              <iconify-icon icon="lucide:alert-triangle" class="text-xs"></iconify-icon>
                              <span>Under Review</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className={`text-xs font-semibold ${isSeeker ? 'text-emerald-700' : 'text-primary'}`}>
                                {item.hostName ? `${isSeeker ? 'SEEKER' : 'HOST'}: ${item.hostName}` : (isSeeker ? 'VERIFIED SEEKER' : 'VERIFIED SPACE')}
                              </p>
                              <h3 className="mt-1 font-heading font-semibold text-slate-900 line-clamp-1">{item.type}</h3>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {/* Copy Platform Listing Link */}
                              <button
                                type="button"
                                title="Copy listing link"
                                onClick={() => {
                                  const url = `${window.location.origin}#spaces`;
                                  navigator.clipboard.writeText(url);
                                  alert(`Copied listing link for "${item.type}" to clipboard!`);
                                }}
                                className="text-slate-400 hover:text-primary p-1.5 transition-colors cursor-pointer"
                              >
                                <iconify-icon icon="lucide:share-2" class="text-base"></iconify-icon>
                              </button>

                              {/* Report Flag Button */}
                              <button
                                type="button"
                                title="Report this listing"
                                onClick={() => setReportingSpace(item)}
                                className="text-slate-400 hover:text-rose-500 p-1.5 transition-colors cursor-pointer"
                              >
                                <iconify-icon icon="lucide:flag" class="text-base"></iconify-icon>
                              </button>

                              {/* Favorite / Heart Button */}
                              <button 
                                onClick={() => toggleSave(item.id)}
                                className={`cursor-pointer transition-colors p-1.5 ${isSaved ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                              >
                                <iconify-icon icon={isSaved ? "lucide:heart-crack" : "lucide:heart"} class="text-lg"></iconify-icon>
                              </button>
                            </div>
                          </div>

                          <p className="mt-3 text-lg font-bold text-slate-900">
                            {item.rent}
                            <span className="text-xs font-medium text-slate-500">
                              {isSeeker ? ' max' : isReplacement ? ' / person / mo' : ' / month'}
                            </span>
                          </p>
                          
                          <p className="mt-1 text-xs sm:text-sm text-slate-600 flex items-center gap-1">
                            <iconify-icon icon="lucide:map-pin" class={isSeeker ? "text-emerald-600" : "text-primary"}></iconify-icon> {item.location}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 font-semibold">{item.furnishing}</span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 font-semibold">{item.occupancy}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 pt-0">
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => setViewDetailsSpace(item)}
                            className="w-full min-h-11 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            View Details
                          </button>
                          {isSeeker ? (
                            <a
                              href={`https://wa.me/91${(item.hostPhone || '').replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(`Hi ${item.hostName || ''}, I saw your post on Flatemate Ahmedabad seeking a flat/roommate (${item.type}). I have a space available that might match your requirement.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full min-h-11 rounded-xl bg-emerald-600 text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-1.5 hover:bg-emerald-700 transition-colors shadow-sm"
                            >
                              <iconify-icon icon="logos:whatsapp-icon" class="text-base"></iconify-icon>
                              <span>Chat WhatsApp</span>
                            </a>
                          ) : (
                            <button 
                              type="button"
                              onClick={() => {
                                setInterestModalSpace(item);
                              }}
                              className="w-full min-h-11 rounded-xl bg-primary text-xs sm:text-sm font-bold text-white flex items-center justify-center hover:bg-primary/90 transition-colors cursor-pointer shadow-sm"
                            >
                              Interested
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

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
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                  <iconify-icon icon="lucide:search" class="text-2xl"></iconify-icon>
                </span>
                <span className="absolute left-[58%] top-7 hidden h-px w-[84%] bg-border md:block"></span>
                <h3 className="mt-5 font-heading text-lg font-bold text-slate-900">Discover</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                  Search flats, rooms, or flatmates based on your needs.
                </p>
              </article>

              <article className="relative text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                  <iconify-icon icon="lucide:layout-list" class="text-2xl"></iconify-icon>
                </span>
                <span className="absolute left-[58%] top-7 hidden h-px w-[84%] bg-border md:block"></span>
                <h3 className="mt-5 font-heading text-lg font-bold text-slate-900">Explore</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                  Review listings, compare details, and find the right fit.
                </p>
              </article>

              <article className="text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                  <iconify-icon icon="lucide:send" class="text-2xl"></iconify-icon>
                </span>
                <h3 className="mt-5 font-heading text-lg font-bold text-slate-900">Connect</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                  Express interest and connect directly with the resident on WhatsApp.
                </p>
              </article>

            </div>
          </div>
        </section>

        {/* LIST YOUR SPACE (#list-space) */}
        <section id="list-space" className="mx-auto w-full max-w-7xl px-3 sm:px-6 py-10 lg:py-16 lg:px-10">
          <div className="rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-200 p-4 sm:p-8 lg:p-10 shadow-sm">
            
            {/* Header Title */}
            <div className="max-w-2xl mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider mb-2">
                <iconify-icon icon="lucide:sparkles" class="text-sm"></iconify-icon>
                <span>Zero Brokerage • Direct Connect</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 leading-tight">
                List Your Space in Ahmedabad
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
                Post your flat or shared vacancy for free. Verified seekers will reach out directly.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              
              {/* LEFT COLUMN: CATEGORY SELECTOR & PERKS (5 Cols on LG) */}
              <div className="lg:col-span-4 flex flex-col justify-between space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Select Listing Type:
                  </label>
                  
                  {/* Category Switcher Tabs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2.5">
                    {/* TAB 1: FRESH FLAT */}
                    <button
                      type="button"
                      onClick={() => setListingTab('fresh')}
                      className={`text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                        listingTab === 'fresh'
                          ? 'bg-white border-primary shadow-md ring-2 ring-primary/20'
                          : 'bg-white/70 border-slate-200 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          listingTab === 'fresh' 
                            ? 'bg-primary text-white shadow-xs' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          <iconify-icon icon="lucide:building-2" class="text-lg"></iconify-icon>
                        </span>
                        <div>
                          <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900">
                            1. List Full Flat
                          </h4>
                          <p className="text-[10px] sm:text-xs text-slate-500">
                            Entire vacant apartment
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* TAB 2: REPLACEMENT */}
                    <button
                      type="button"
                      onClick={() => setListingTab('replacement')}
                      className={`text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                        listingTab === 'replacement'
                          ? 'bg-white border-primary shadow-md ring-2 ring-primary/20'
                          : 'bg-white/70 border-slate-200 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          listingTab === 'replacement' 
                            ? 'bg-primary text-white shadow-xs' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          <iconify-icon icon="lucide:users" class="text-lg"></iconify-icon>
                        </span>
                        <div>
                          <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900">
                            2. Need Flatmate
                          </h4>
                          <p className="text-[10px] sm:text-xs text-slate-500">
                            1–2 room replacement
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* TAB 3: SEEKING FLAT / ROOMMATE */}
                    <button
                      type="button"
                      onClick={() => setListingTab('seeker')}
                      className={`text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                        listingTab === 'seeker'
                          ? 'bg-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                          : 'bg-white/70 border-slate-200 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          listingTab === 'seeker' 
                            ? 'bg-emerald-600 text-white shadow-xs' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          <iconify-icon icon="lucide:user-search" class="text-lg"></iconify-icon>
                        </span>
                        <div>
                          <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900">
                            3. Looking for Flat
                          </h4>
                          <p className="text-[10px] sm:text-xs text-slate-500">
                            Post seeker requirement
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Trust Highlights */}
                <div className="hidden sm:block pt-4 border-t border-slate-200">
                  <ul className="space-y-2 text-xs font-semibold text-slate-600">
                    <li className="flex items-center gap-2">
                      <iconify-icon icon="lucide:check-circle-2" class="text-emerald-600 text-sm shrink-0"></iconify-icon>
                      <span>100% Free forever & zero brokerage</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <iconify-icon icon="lucide:check-circle-2" class="text-emerald-600 text-sm shrink-0"></iconify-icon>
                      <span>Inquiries go straight to your Host Portal</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <iconify-icon icon="lucide:check-circle-2" class="text-emerald-600 text-sm shrink-0"></iconify-icon>
                      <span>Mark taken or edit anytime</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* RIGHT COLUMN: DYNAMIC FORM (8 Cols on LG) */}
              <form onSubmit={handleListSpaceSubmit} className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-7 shadow-md">
                
                {/* Form Category Banner */}
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      listingTab === 'seeker' ? 'bg-emerald-100 text-emerald-700' : 'bg-primary/10 text-primary'
                    }`}>
                      <iconify-icon icon={listingTab === 'seeker' ? "lucide:user-search" : listingTab === 'fresh' ? "lucide:building-2" : "lucide:users"} class="text-base"></iconify-icon>
                    </span>
                    <div>
                      <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900">
                        {listingTab === 'seeker' 
                          ? 'Flat / Roommate Seeker Requirement' 
                          : listingTab === 'fresh' 
                          ? 'Full Flat Details' 
                          : 'Flatmate Replacement Details'}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {listingTab === 'seeker'
                          ? 'Tell hosts what kind of room or flat you are looking for in Ahmedabad'
                          : listingTab === 'fresh' 
                          ? 'Fill out your property details below' 
                          : 'Specify room & roommate details below'}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-black">
                    Free
                  </span>
                </div>

                {listingSubmitted ? (
                  <div className="py-8 text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <iconify-icon icon="lucide:circle-check" class="text-3xl"></iconify-icon>
                    </div>
                    <h4 className="font-bold text-lg text-slate-900">
                      {listingTab === 'seeker' ? 'Your Requirement is Live!' : 'Your Listing is Live!'}
                    </h4>
                    <p className="text-xs text-slate-600 max-w-xs mx-auto">
                      {listingTab === 'seeker'
                        ? 'Your requirement is now visible to hosts and roommates across Ahmedabad. Check your portal or WhatsApp for inquiries!'
                        : 'Your space is now visible in the live Ahmedabad feed. Check your Host Portal for inquiries!'}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-2 pt-2">
                      <button 
                        type="button"
                        onClick={() => {
                          setListingSubmitted(false);
                          setIsMyListingsOpen(true);
                        }}
                        className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-primary/90"
                      >
                        Open Host Portal
                      </button>
                      <button 
                        type="button"
                        onClick={() => setListingSubmitted(false)}
                        className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-50"
                      >
                        Post Another Listing
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    
                    {/* SECTION 1: PROPERTY INFORMATION */}
                    <div>
                      <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <iconify-icon icon={listingTab === 'seeker' ? "lucide:user-search" : "lucide:home"} class={listingTab === 'seeker' ? "text-emerald-600" : "text-primary"}></iconify-icon>
                        <span>{listingTab === 'seeker' ? 'Step 1: Your Requirement' : 'Step 1: Property Information'}</span>
                      </div>

                      {/* FRESH FLAT FIELDS (Single column on mobile, 2 cols on desktop) */}
                      {listingTab === 'fresh' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="mb-1 block text-xs font-bold text-slate-800">Flat BHK / Type *</label>
                            <input 
                              type="text"
                              required
                              value={freshBhk}
                              onChange={(e) => setFreshBhk(e.target.value)}
                              placeholder="e.g. 2BHK / 3.5 BHK Penthouse"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
                            />
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {['1BHK', '2BHK', '3BHK', '4BHK', 'Studio', 'Villa'].map((sugg) => (
                                <button
                                  type="button"
                                  key={sugg}
                                  onClick={() => setFreshBhk(sugg)}
                                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                                    freshBhk === sugg 
                                      ? 'bg-primary text-white border-primary font-bold shadow-2xs' 
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {sugg}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-bold text-slate-800">Total Monthly Rent (₹) *</label>
                            <input 
                              type="number"
                              required
                              value={spaceRent}
                              onChange={(e) => setSpaceRent(e.target.value)}
                              placeholder="e.g. 18000"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-bold text-slate-800">Location in Ahmedabad *</label>
                            <input 
                              type="text"
                              required
                              value={spaceLocation}
                              onChange={(e) => setSpaceLocation(e.target.value)}
                              placeholder="e.g. Satellite / Vastrapur / Thaltej"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-bold text-slate-800">Furnishing Status</label>
                            <input 
                              type="text"
                              value={spaceFurnishing}
                              onChange={(e) => setSpaceFurnishing(e.target.value)}
                              placeholder="e.g. Fully Furnished with AC"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
                            />
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {['Fully Furnished', 'Semi-Furnished', 'Unfurnished'].map((sugg) => (
                                <button
                                  type="button"
                                  key={sugg}
                                  onClick={() => setSpaceFurnishing(sugg)}
                                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                                    spaceFurnishing === sugg 
                                      ? 'bg-primary text-white border-primary font-bold shadow-2xs' 
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {sugg}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-bold text-slate-800">Preferred Tenants</label>
                            <input 
                              type="text"
                              value={tenantPreference}
                              onChange={(e) => setTenantPreference(e.target.value)}
                              placeholder="e.g. Working Pros / Family / Girls"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
                            />
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {['Any / All', 'Working Pros', 'Family Only', 'Bachelors', 'Girls Only'].map((sugg) => (
                                <button
                                  type="button"
                                  key={sugg}
                                  onClick={() => setTenantPreference(sugg)}
                                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                                    tenantPreference === sugg 
                                      ? 'bg-primary text-white border-primary font-bold shadow-2xs' 
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {sugg}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-bold text-slate-800">Available From</label>
                            <input 
                              type="text"
                              value={spaceAvailable}
                              onChange={(e) => setSpaceAvailable(e.target.value)}
                              placeholder="e.g. Immediate / 1st of month"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-bold text-slate-800">Listing Headline / Title (Optional)</label>
                            <input 
                              id="listing-title-input"
                              type="text"
                              value={spaceTitle}
                              onChange={(e) => setSpaceTitle(e.target.value)}
                              placeholder="e.g. Sunny 2BHK with Balcony near Iscon Mall"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
                            />
                          </div>
                        </div>
                      )}

                      {/* REPLACEMENT FIELDS (Single column on mobile, 2 cols on desktop) */}
                      {listingTab === 'replacement' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="mb-1 block text-xs font-bold text-slate-800">Vacancy / Persons Needed *</label>
                            <input 
                              type="text"
                              required
                              value={replacementSpots}
                              onChange={(e) => setReplacementSpots(e.target.value)}
                              placeholder="e.g. 1 Person / 2 Persons"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
                            />
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {['1 Person', '2 Persons', '1 Female Roommate', '1 Male Roommate'].map((sugg) => (
                                <button
                                  type="button"
                                  key={sugg}
                                  onClick={() => setReplacementSpots(sugg)}
                                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                                    replacementSpots === sugg 
                                      ? 'bg-primary text-white border-primary font-bold shadow-2xs' 
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {sugg}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-bold text-slate-800">In What Flat Type? *</label>
                            <input 
                              type="text"
                              required
                              value={replacementBhk}
                              onChange={(e) => setReplacementBhk(e.target.value)}
                              placeholder="e.g. 2BHK Flat / 3BHK Flat"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
                            />
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {['2BHK Flat', '3BHK Flat', '4BHK Flat', 'Independent House'].map((sugg) => (
                                <button
                                  type="button"
                                  key={sugg}
                                  onClick={() => setReplacementBhk(sugg)}
                                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                                    replacementBhk === sugg 
                                      ? 'bg-primary text-white border-primary font-bold shadow-2xs' 
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {sugg}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-bold text-slate-800">Room / Bed Space Offered *</label>
                            <input 
                              type="text"
                              required
                              value={replacementRoomType}
                              onChange={(e) => setReplacementRoomType(e.target.value)}
                              placeholder="e.g. Master Bedroom with Attached Bath & Balcony"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
                            />
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {['Private Room + Attached Bath', 'Private Room (Common Bath)', 'Shared Bed in Master Room'].map((sugg) => (
                                <button
                                  type="button"
                                  key={sugg}
                                  onClick={() => setReplacementRoomType(sugg)}
                                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                                    replacementRoomType === sugg 
                                      ? 'bg-primary text-white border-primary font-bold shadow-2xs' 
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {sugg}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-bold text-slate-800">Rent per Person (₹/month) *</label>
                            <input 
                              type="number"
                              required
                              value={spaceRent}
                              onChange={(e) => setSpaceRent(e.target.value)}
                              placeholder="e.g. 7500"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-bold text-slate-800">Flat Location in Ahmedabad *</label>
                            <input 
                              type="text"
                              required
                              value={spaceLocation}
                              onChange={(e) => setSpaceLocation(e.target.value)}
                              placeholder="e.g. Bodakdev / Navrangpura"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-bold text-slate-800">Move-in Date</label>
                            <input 
                              type="text"
                              value={spaceAvailable}
                              onChange={(e) => setSpaceAvailable(e.target.value)}
                              placeholder="e.g. Immediate / 1st of next month"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-bold text-slate-800">Flatmate Preference</label>
                            <input 
                              type="text"
                              value={flatmateHabitPref}
                              onChange={(e) => setFlatmateHabitPref(e.target.value)}
                              placeholder="e.g. Working Pros / Non-Smoker"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
                            />
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {['Working Pros', 'Vegetarian', 'Non-Smoker', 'Students', 'Open to Any'].map((sugg) => (
                                <button
                                  type="button"
                                  key={sugg}
                                  onClick={() => setFlatmateHabitPref(sugg)}
                                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                                    flatmateHabitPref === sugg 
                                      ? 'bg-primary text-white border-primary font-bold shadow-2xs' 
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {sugg}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SEEKER FIELDS (Looking for flat / flatmate) */}
                      {listingTab === 'seeker' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="mb-1 block text-xs font-bold text-slate-800">What are you looking for? *</label>
                            <input 
                              type="text"
                              required
                              value={seekerLookingFor}
                              onChange={(e) => setSeekerLookingFor(e.target.value)}
                              placeholder="e.g. Private Room in Shared 2BHK/3BHK"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition-all"
                            />
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {['Private Room in Shared Flat', '1BHK / Studio Flat', 'Shared Room / Bed Space', '2BHK Flat'].map((sugg) => (
                                <button
                                  type="button"
                                  key={sugg}
                                  onClick={() => setSeekerLookingFor(sugg)}
                                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                                    seekerLookingFor === sugg 
                                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-2xs' 
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {sugg}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-bold text-slate-800">Max Monthly Budget (₹) *</label>
                            <input 
                              type="number"
                              required
                              value={spaceRent}
                              onChange={(e) => setSpaceRent(e.target.value)}
                              placeholder="e.g. 8000"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition-all"
                            />
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {['6000', '8000', '10000', '12000', '15000'].map((sugg) => (
                                <button
                                  type="button"
                                  key={sugg}
                                  onClick={() => setSpaceRent(sugg)}
                                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                                    spaceRent === sugg 
                                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-2xs' 
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  ₹{sugg}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-bold text-slate-800">Preferred Locations in Ahmedabad *</label>
                            <input 
                              type="text"
                              required
                              value={spaceLocation}
                              onChange={(e) => setSpaceLocation(e.target.value)}
                              placeholder="e.g. Satellite / Vastrapur / Bodakdev"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition-all"
                            />
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {['Satellite', 'Vastrapur', 'Prahlad Nagar', 'Bodakdev', 'SG Highway', 'Navrangpura'].map((sugg) => (
                                <button
                                  type="button"
                                  key={sugg}
                                  onClick={() => setSpaceLocation(prev => prev ? `${prev}, ${sugg}` : sugg)}
                                  className="text-[11px] px-2 py-0.5 rounded-md border bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 transition-all cursor-pointer"
                                >
                                  +{sugg}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-bold text-slate-800">Target Move-in Date *</label>
                            <input 
                              type="text"
                              required
                              value={seekerMoveIn}
                              onChange={(e) => setSeekerMoveIn(e.target.value)}
                              placeholder="e.g. Immediate / Within 15 Days"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition-all"
                            />
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {['Immediate', 'Within 7 Days', 'Within 15 Days', 'Next Month'].map((sugg) => (
                                <button
                                  type="button"
                                  key={sugg}
                                  onClick={() => setSeekerMoveIn(sugg)}
                                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                                    seekerMoveIn === sugg 
                                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-2xs' 
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {sugg}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-bold text-slate-800">Who are you? (Occupancy) *</label>
                            <input 
                              type="text"
                              required
                              value={seekerOccupancy}
                              onChange={(e) => setSeekerOccupancy(e.target.value)}
                              placeholder="e.g. 1 Male Bachelor / 1 Female / Working Couple"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition-all"
                            />
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {['1 Male Bachelor', '1 Female Bachelor', '2 Friends', 'Working Couple'].map((sugg) => (
                                <button
                                  type="button"
                                  key={sugg}
                                  onClick={() => setSeekerOccupancy(sugg)}
                                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                                    seekerOccupancy === sugg 
                                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-2xs' 
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {sugg}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-bold text-slate-800">Profession & Food Preference</label>
                            <div className="grid grid-cols-2 gap-2">
                              <input 
                                type="text"
                                value={seekerProfession}
                                onChange={(e) => setSeekerProfession(e.target.value)}
                                placeholder="Profession (IT / Student)"
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 outline-hidden"
                              />
                              <input 
                                type="text"
                                value={seekerDiet}
                                onChange={(e) => setSeekerDiet(e.target.value)}
                                placeholder="Diet (Veg / Non-veg)"
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 outline-hidden"
                              />
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {['Vegetarian', 'Eggetarian', 'Non-Veg Friendly', 'IT Professional', 'Student'].map((sugg) => (
                                <button
                                  type="button"
                                  key={sugg}
                                  onClick={() => {
                                    if (sugg.includes('arian') || sugg.includes('Veg')) setSeekerDiet(sugg);
                                    else setSeekerProfession(sugg);
                                  }}
                                  className="text-[11px] px-2 py-0.5 rounded-md border bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 cursor-pointer"
                                >
                                  {sugg}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-bold text-slate-800">Headline / Short Note (Optional)</label>
                            <input 
                              type="text"
                              value={spaceTitle}
                              onChange={(e) => setSpaceTitle(e.target.value)}
                              placeholder="e.g. IT Engineer looking for a peaceful room with attached bath in Satellite"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition-all"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SECTION 2: CONTACT DETAILS */}
                    <div className="pt-4 border-t border-slate-100">
                      <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <iconify-icon icon="lucide:user" class="text-primary"></iconify-icon>
                          <span>{listingTab === 'seeker' ? 'Step 2: Your Contact Information (For Hosts to Reach You)' : 'Step 2: Host Contact Information'}</span>
                        </div>
                        {currentUser && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            ✓ Authenticated Host
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="mb-1 block text-xs font-bold text-slate-800">Your Full Name *</label>
                          <input 
                            type="text"
                            required
                            value={hostName}
                            onChange={(e) => setHostName(e.target.value)}
                            placeholder="e.g. Ramesh Patel"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-bold text-slate-800">Your WhatsApp Number *</label>
                          <input 
                            type="tel"
                            required
                            value={hostPhone}
                            onChange={(e) => setHostPhone(e.target.value)}
                            placeholder="e.g. 98765 43210"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
                          />
                          <p className="text-[10px] text-slate-500 mt-1">
                            Seeker inquiries will be tied to this number and your Host Portal.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: AMENITIES & HIGHLIGHTS (Only for Flat & Replacement listings) */}
                    {listingTab !== 'seeker' && (
                      <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <iconify-icon icon="lucide:check-square" class="text-primary"></iconify-icon>
                            <span>Step 3: Amenities & Highlights</span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-semibold">{selectedAmenities.length} selected</span>
                        </div>

                        {/* Pill options */}
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                          {[
                            'AC',
                            'WiFi',
                            'Attached Bath',
                            'Balcony',
                            'Cook / Maid',
                            'Washing Machine',
                            'Fridge',
                            'Car Parking',
                            'Power Backup',
                            'Gym',
                          ].map((amenity) => {
                            const isSel = selectedAmenities.includes(amenity);
                            return (
                              <button
                                type="button"
                                key={amenity}
                                onClick={() => toggleAmenity(amenity)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                  isSel 
                                    ? 'bg-primary text-white shadow-2xs' 
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                                }`}
                              >
                                {isSel && <iconify-icon icon="lucide:check" class="text-xs"></iconify-icon>}
                                <span>{amenity}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom user amenity input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Type custom amenity (e.g. Lift, RO Water)..."
                            value={customAmenityInput}
                            onChange={(e) => setCustomAmenityInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCustomAmenity();
                              }
                            }}
                            className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomAmenity}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 cursor-pointer transition-colors"
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                    )}

                    {/* SECTION 4: DESCRIPTION & PHOTOS (Only for Flat & Replacement listings) */}
                    {listingTab !== 'seeker' && (
                      <div className="pt-4 border-t border-slate-100 space-y-4">
                        <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <iconify-icon icon="lucide:file-text" class="text-primary"></iconify-icon>
                          <span>Step 4: Details & Photos</span>
                        </div>

                        {/* Description textarea */}
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            About the Flat & House Rules (Optional)
                          </label>
                          <textarea
                            rows={3}
                            value={spaceDescription}
                            onChange={(e) => setSpaceDescription(e.target.value)}
                            placeholder="Describe society name, gate timings, maintenance inclusions, distance to bus/metro, house vibe..."
                            className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden resize-none leading-relaxed"
                          />
                        </div>

                        {/* Photo Uploading */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <iconify-icon icon="lucide:camera" class="text-primary text-sm"></iconify-icon>
                              <span>Upload Flat Photos (Optional)</span>
                            </label>
                            <span className="text-[11px] text-slate-500 font-medium">Up to 4 photos</span>
                          </div>

                          {/* Photo Previews */}
                          {uploadedPhotos.length > 0 && (
                            <div className="flex gap-2.5 mb-3 overflow-x-auto pb-1">
                              {uploadedPhotos.map((photo, idx) => (
                                <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 shadow-2xs group">
                                  <img src={photo} alt="Upload preview" className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => setUploadedPhotos((prev) => prev.filter((_, i) => i !== idx))}
                                    className="absolute top-1 right-1 bg-black/75 hover:bg-rose-600 text-white rounded-full p-1 text-xs transition-colors cursor-pointer"
                                    title="Remove photo"
                                  >
                                    <iconify-icon icon="lucide:x"></iconify-icon>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <label className="rounded-xl border-2 border-dashed border-primary/30 hover:border-primary p-3.5 bg-primary/5 hover:bg-primary/10 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-primary cursor-pointer select-none">
                            <iconify-icon icon="lucide:image-plus" class="text-lg"></iconify-icon>
                            <span>
                              {uploadedPhotos.length > 0 ? '+ Add More Photos' : 'Choose Photos from Phone or Camera'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handlePhotoSelect}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    )}

                    {/* SUBMIT BUTTON */}
                    <div className="pt-3">
                      <button 
                        type="submit" 
                        className={`min-h-12 sm:min-h-14 w-full rounded-xl text-sm sm:text-base font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          listingTab === 'seeker'
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-primary hover:bg-primary/90'
                        }`}
                      >
                        <iconify-icon icon={listingTab === 'seeker' ? "lucide:user-search" : listingTab === 'fresh' ? "lucide:building-2" : "lucide:users"} class="text-lg"></iconify-icon>
                        <span>
                          {listingTab === 'seeker'
                            ? 'Post My Requirement (100% Free)'
                            : listingTab === 'fresh'
                            ? 'Publish Fresh Flat (100% Free)'
                            : 'Publish Replacement Request (100% Free)'}
                        </span>
                      </button>
                    </div>

                  </div>
                )}
              </form>

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
                Express interest in listings and connect directly with residents offering shared spaces.
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
                Use the interest form to share your basic details with consent. You can also connect directly on WhatsApp.
              </p>
            </details>

            <details className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-heading font-semibold">
                Does Flatemate charge brokerage?
                <iconify-icon icon="lucide:chevron-down" class="text-xl text-primary transition-transform group-open:rotate-180"></iconify-icon>
              </summary>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Flatemate is designed to help people discover accommodation directly with 0% brokerage.
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
            <div className="flex items-center gap-2.5 font-heading text-xl font-bold tracking-tight">
              <img 
                src="/assets/flatemate-logo-alt.jpg" 
                alt="Flatemate Logo" 
                className="w-9 h-9 rounded-xl object-cover shadow-xs border border-primary/20" 
              />
              <span>Flatemate</span>
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

        {/* Ahmedabad Local SEO Neighborhoods Directory */}
        <div className="border-t border-border bg-slate-50/70 py-6 px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Popular Ahmedabad Locations for Flats & Flatmates (0% Brokerage):
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                'Satellite',
                'Vastrapur',
                'Prahlad Nagar',
                'Bodakdev',
                'Thaltej',
                'SG Highway',
                'Bopal',
                'South Bopal',
                'Navrangpura',
                'Shela',
                'Makarba',
                'Ambawadi',
                'Gota',
                'Chandkheda',
                'Motera',
                'Near IIM Ahmedabad',
                'Near Nirma University',
              ].map((locality) => (
                <a
                  key={locality}
                  href="#spaces"
                  onClick={() => {
                    const clean = locality.replace('Near ', '').split(' ')[0];
                    setSelectedLocality(clean);
                  }}
                  className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-slate-600 hover:text-primary hover:border-primary transition-all font-medium"
                >
                  Flats in {locality}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-muted-foreground sm:flex-row sm:justify-between lg:px-10">
            <span>© 2026 Flatemate. All rights reserved. Zero Brokerage Ahmedabad.</span>
            <span>Built for Ahmedabad shared living & roommate discovery.</span>
          </div>
        </div>
      </footer>

      {/* MOBILE STICKY BOTTOM NAVIGATION BAR */}
      <nav aria-label="Mobile Navigation" className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around lg:hidden shadow-lg">
        <a 
          href="#spaces" 
          className="flex flex-col items-center gap-1 text-slate-600 hover:text-primary transition-colors py-1 px-3"
        >
          <iconify-icon icon="lucide:building-2" class="text-xl"></iconify-icon>
          <span className="text-[11px] font-bold">Flats</span>
        </a>

        <a 
          href="#discover" 
          className="flex flex-col items-center gap-1 text-slate-600 hover:text-primary transition-colors py-1 px-3"
        >
          <iconify-icon icon="lucide:compass" class="text-xl"></iconify-icon>
          <span className="text-[11px] font-bold">Discover</span>
        </a>

        <a 
          href="#list-space" 
          className="flex flex-col items-center gap-1 text-primary hover:text-primary/90 transition-colors py-1 px-3"
        >
          <div className="h-9 w-9 -mt-4 rounded-full bg-primary text-white flex items-center justify-center shadow-lg ring-4 ring-white">
            <iconify-icon icon="lucide:plus" class="text-xl font-black"></iconify-icon>
          </div>
          <span className="text-[11px] font-bold">Post</span>
        </a>

        <button 
          type="button"
          onClick={() => setIsMyListingsOpen(true)}
          className="relative flex flex-col items-center gap-1 text-slate-600 hover:text-primary transition-colors py-1 px-3 cursor-pointer"
        >
          <iconify-icon icon="lucide:layout-dashboard" class="text-xl"></iconify-icon>
          <span className="text-[11px] font-bold">Portal</span>
          {activeHostInquiriesCount > 0 && (
            <span className="absolute top-0 right-2 h-4 min-w-4 px-1 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center">
              {activeHostInquiriesCount}
            </span>
          )}
        </button>
      </nav>

      {/* DETAIL MODAL FOR FLATS */}
      {viewDetailsSpace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-card rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto border border-border shadow-2xl animate-in fade-in zoom-in-95">
            <div className="relative">
              {viewDetailsSpace.image && viewDetailsSpace.image.trim() !== '' && !viewDetailsSpace.image.includes('/assets/flat') ? (
                <img src={viewDetailsSpace.image} alt={viewDetailsSpace.type} className="aspect-16/10 w-full object-cover" />
              ) : viewDetailsSpace.category === 'seeker' ? (
                <div className="aspect-16/10 w-full bg-linear-to-br from-emerald-50 to-teal-50 border-b border-emerald-100 flex flex-col items-center justify-center p-6 text-center select-none">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 shadow-xs flex items-center justify-center text-emerald-700 mb-2">
                    <iconify-icon icon="lucide:user-check" class="text-3xl text-emerald-600"></iconify-icon>
                  </div>
                  <span className="text-sm font-bold text-slate-800">Flat Seeker Profile</span>
                  <span className="text-xs text-slate-500 mt-0.5">Looking for flat / flatmate in Ahmedabad</span>
                </div>
              ) : (
                <div className="aspect-16/10 w-full bg-slate-100 border-b border-slate-200 flex flex-col items-center justify-center p-6 text-center select-none">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-xs flex items-center justify-center text-slate-300 mb-2">
                    <iconify-icon icon="lucide:image" class="text-3xl text-slate-400"></iconify-icon>
                  </div>
                  <span className="text-sm font-bold text-slate-700">No Photos Attached</span>
                  <span className="text-xs text-slate-400 mt-0.5">The host has not uploaded photos for this property</span>
                </div>
              )}
              <button 
                onClick={() => setViewDetailsSpace(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-900 shadow-md transition-colors"
              >
                <iconify-icon icon="lucide:x" class="text-xl"></iconify-icon>
              </button>
            </div>
            <div className="p-6">
              <p className={`text-xs font-semibold ${viewDetailsSpace.category === 'seeker' ? 'text-emerald-700' : 'text-primary'}`}>
                {viewDetailsSpace.hostName ? `${viewDetailsSpace.category === 'seeker' ? 'SEEKER' : 'HOST'}: ${viewDetailsSpace.hostName}` : (viewDetailsSpace.category === 'seeker' ? 'VERIFIED SEEKER' : 'VERIFIED LISTING')}
              </p>
              <h3 className="mt-1 font-heading text-xl font-bold">{viewDetailsSpace.type}</h3>
              <p className="mt-2 text-2xl font-black text-primary">
                {viewDetailsSpace.rent}
                <span className="text-sm font-normal text-muted-foreground">
                  {viewDetailsSpace.category === 'seeker' ? ' max' : '/month'}
                </span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
                <iconify-icon icon="lucide:map-pin"></iconify-icon> {viewDetailsSpace.location}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-secondary px-3 py-1 text-muted-foreground font-semibold">{viewDetailsSpace.furnishing}</span>
                <span className="rounded-full bg-secondary px-3 py-1 text-muted-foreground font-semibold">{viewDetailsSpace.occupancy}</span>
              </div>

              {viewDetailsSpace.amenities && viewDetailsSpace.amenities.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Amenities & Highlights</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewDetailsSpace.amenities.map((a, i) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-700 px-2.5 py-1 text-xs font-semibold border border-emerald-200">
                        <iconify-icon icon="lucide:check" class="text-xs"></iconify-icon> {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {viewDetailsSpace.description && (
                <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <iconify-icon icon="lucide:file-text"></iconify-icon> About the Flat & House Rules
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{viewDetailsSpace.description}</p>
                </div>
              )}
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => setViewDetailsSpace(null)}
                  className="flex-1 py-3 border border-border rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                {viewDetailsSpace.category === 'seeker' ? (
                  <a 
                    href={`https://wa.me/91${(viewDetailsSpace.hostPhone || '').replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(`Hi ${viewDetailsSpace.hostName || ''}, I saw your post on Flatemate Ahmedabad seeking a flat/roommate (${viewDetailsSpace.type}). I have a space available that might match your requirement.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <iconify-icon icon="logos:whatsapp-icon" class="text-lg"></iconify-icon>
                    <span>Connect on WhatsApp</span>
                  </a>
                ) : (
                  <button 
                    type="button"
                    onClick={() => {
                      const space = viewDetailsSpace;
                      setViewDetailsSpace(null);
                      setInterestModalSpace(space);
                    }}
                    className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-bold flex items-center justify-center hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    Express Interest
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HOST DASHBOARD MODAL */}
      <MyListingsModal
        isOpen={isMyListingsOpen}
        onClose={() => setIsMyListingsOpen(false)}
        spaces={spaces}
        inquiries={inquiries}
        currentPhone={currentHostPhone}
        setCurrentPhone={setCurrentHostPhone}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthPromptMessage('Log in to access your listings and inquiries automatically.');
          setIsAuthModalOpen(true);
        }}
        onSignOut={handleSignOut}
        onToggleListingStatus={handleToggleListingStatus}
        onUpdateInquiryStatus={handleUpdateInquiryStatus}
      />

      {/* DEDICATED DIRECT CARD "INTERESTED" POPUP MODAL */}
      <ExpressInterestModal
        isOpen={Boolean(interestModalSpace)}
        onClose={() => setInterestModalSpace(null)}
        space={interestModalSpace}
        currentUser={currentUser}
        onSubmit={handleModalInterestSubmit}
      />

      {/* INSTANT SEEKER SUCCESS MODAL WITH DIRECT WHATSAPP BUTTON */}
      <InterestSuccessModal
        isOpen={isInterestSuccessOpen}
        onClose={() => setIsInterestSuccessOpen(false)}
        space={lastSubmittedSpace}
        seekerName={interestName}
        seekerPhone={interestPhone}
        moveInDate={interestDate}
      />

      {/* REPORT LISTING MODAL */}
      <ReportModal
        isOpen={Boolean(reportingSpace)}
        onClose={() => setReportingSpace(null)}
        space={reportingSpace}
        onReportSubmitted={handleReportSubmitted}
      />

      {/* SUPABASE AUTHENTICATION MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        promptMessage={authPromptMessage}
        onSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
          if (onAuthSuccessCallback) {
            const cb = onAuthSuccessCallback;
            setOnAuthSuccessCallback(null);
            cb();
          }
        }}
      />

    </div>
  );
}

export default App;
