export type ListingType = 'flat' | 'roommate';

export type ListingCategory = 'fresh' | 'replacement' | 'seeker';

export interface SpaceListing {
  id: string;
  userId?: string;
  category?: 'fresh' | 'replacement' | 'seeker';
  type: string;
  rent: string;
  location: string;
  city?: string;
  furnishing: string;
  occupancy: string;
  image?: string;
  rawRent: number;
  hostName?: string;
  hostPhone?: string;
  status?: 'active' | 'rented';
  verified?: boolean;
  reportCount?: number;
  description?: string;
  amenities?: string[];
  seekerMoveIn?: string;
  seekerProfession?: string;
  createdAt?: string;
}

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
  createdAt?: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  fullName?: string;
}

export interface FlatListing {
  id: string;
  title: string;
  type: '1 BHK' | '2 BHK' | '3 BHK' | 'Private Room' | 'Shared Room' | 'Studio';
  rent: number;
  deposit: number;
  maintenance: number;
  location: string;
  area: string;
  city: string;
  furnishing: 'Fully Furnished' | 'Semi-Furnished' | 'Unfurnished';
  genderPreference: 'Any' | 'Male' | 'Female';
  images: string[];
  amenities: string[];
  verified: boolean;
  zeroBrokerage: boolean;
  availableFrom: string;
  postedBy: {
    name: string;
    role: 'Owner' | 'Current Flatmate';
    avatar: string;
    verified: boolean;
    responseTime: string;
    phone?: string;
  };
  description: string;
  rules: string[];
  nearbyMetro?: string;
}

export interface FlatmateProfile {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  avatar: string;
  profession: string;
  company?: string;
  budget: {
    min: number;
    max: number;
  };
  preferredLocations: string[];
  city: string;
  moveInDate: string;
  verified: boolean;
  activeStatus: 'Active Now' | 'Active Today' | 'Active 2d ago';
  responseTime: string;
  responseRate: string;
  bio: string;
  lifestyle: {
    cleanliness: 1 | 2 | 3 | 4 | 5;
    sleepCycle: 'Early Bird' | 'Night Owl' | 'Flexible';
    diet: 'Vegetarian' | 'Non-Vegetarian' | 'Vegan' | 'Any';
    smoking: 'Non-Smoker' | 'Smoker' | 'Outside Only';
    drinking: 'Teetotaler' | 'Social' | 'Regular';
    petFriendly: boolean;
    guests: 'Flexible' | 'Weekends Only' | 'Quiet Hours Preferred';
  };
  interests: string[];
}

export interface VisitBooking {
  listingId: string;
  listingTitle: string;
  visitType: 'In-Person' | 'Video Call';
  date: string;
  timeSlot: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}
