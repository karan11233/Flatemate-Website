import { FlatListing, FlatmateProfile } from '../types';

export const CITIES = [
  'Bengaluru',
  'Mumbai',
  'Delhi NCR',
  'Pune',
  'Hyderabad'
];

export const POPULAR_AREAS: Record<string, string[]> = {
  'Bengaluru': ['Koramangala', 'HSR Layout', 'Indiranagar', 'Whitefield', 'Bellandur', 'Marathahalli'],
  'Mumbai': ['Bandra West', 'Andheri West', 'Powai', 'Lower Parel', 'Juhu'],
  'Delhi NCR': ['Cyber City Gurugram', 'Hauz Khas', 'Noida Sector 62', 'Saket', 'DLF Phase 5'],
  'Pune': ['Koregaon Park', 'Kalyani Nagar', 'Baner', 'Viman Nagar', 'Hinjewadi'],
  'Hyderabad': ['Hitec City', 'Gachibowli', 'Kondapur', 'Madhapur', 'Jubilee Hills']
};

export const MOCK_FLATS: FlatListing[] = [
  {
    id: 'flat-1',
    title: 'Spacious Master Bedroom in Luxury 3BHK Gated Society',
    type: 'Private Room',
    rent: 22000,
    deposit: 40000,
    maintenance: 2500,
    location: 'Green Glen Layout, Bellandur',
    area: 'Bellandur',
    city: 'Bengaluru',
    furnishing: 'Fully Furnished',
    genderPreference: 'Any',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['High-speed WiFi', 'Air Conditioner', 'Attached Balcony', 'Daily Maid Service', 'Gym & Pool', 'Power Backup', 'Washing Machine', 'Covered Parking'],
    verified: true,
    zeroBrokerage: true,
    availableFrom: 'Immediately',
    postedBy: {
      name: 'Rohan Sharma',
      role: 'Current Flatmate',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      verified: true,
      responseTime: '⚡ Typically replies in 15 mins',
      phone: '+91 98765 43210'
    },
    description: 'Looking for a chill, working professional to take up the attached-bath master bedroom in our 3BHK flat. Walking distance to EcoWorld tech park. Cook and maid already set up and shared equally.',
    rules: ['No loud music after 11 PM on weekdays', 'Smoking allowed in balcony only', 'Friendly to pets'],
    nearbyMetro: 'Bellandur Gate (1.2 km)'
  },
  {
    id: 'flat-2',
    title: 'Modern Minimalist 2BHK with Private Terrace & City View',
    type: '2 BHK',
    rent: 42000,
    deposit: 80000,
    maintenance: 3000,
    location: '12th Main, 4th Block, Koramangala',
    area: 'Koramangala',
    city: 'Bengaluru',
    furnishing: 'Fully Furnished',
    genderPreference: 'Any',
    images: [
      'https://images.unsplash.com/photo-1502005229762-ae1b465ab01e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['High-speed WiFi', 'Smart TV', 'Private Terrace', 'Modular Kitchen', 'Air Conditioner', '24x7 Security', 'Cook Available'],
    verified: true,
    zeroBrokerage: true,
    availableFrom: '1st of Next Month',
    postedBy: {
      name: 'Priya Nambiar',
      role: 'Owner',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      verified: true,
      responseTime: '⚡ Replies in under 1 hr',
      phone: '+91 98200 11223'
    },
    description: 'Direct owner listing with 0% brokerage. Completely redesigned contemporary 2BHK with imported wooden flooring, custom closets, and full sunlit balcony terrace. Quiet leafy lane, 5 mins from Sony World signal.',
    rules: ['Bachelors and families welcome', 'Deposit negotiable for long leases'],
    nearbyMetro: 'Sony World Junction (600m)'
  },
  {
    id: 'flat-3',
    title: 'Sunny Private Room in Sector 2 HSR Layout',
    type: 'Private Room',
    rent: 17500,
    deposit: 35000,
    maintenance: 1200,
    location: '19th Cross, Sector 2, HSR Layout',
    area: 'HSR Layout',
    city: 'Bengaluru',
    furnishing: 'Semi-Furnished',
    genderPreference: 'Female',
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Fiber WiFi', 'Dedicated Work Desk', 'RO Purifier', 'Washing Machine', 'Refrigerator', 'Balcony', 'Geyser'],
    verified: true,
    zeroBrokerage: true,
    availableFrom: 'Immediately',
    postedBy: {
      name: 'Ananya Verma',
      role: 'Current Flatmate',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      verified: true,
      responseTime: '⚡ Typically replies in 30 mins',
      phone: '+91 97111 88990'
    },
    description: 'Looking for a female flatmate in a 3BHK. Both existing flatmates work in tech and design. Huge park across the street, plenty of cafes nearby. Kitchen has full setup with microwave, fridge and RO.',
    rules: ['Female flatmates only', 'Visitors allowed with mutual heads-up'],
    nearbyMetro: 'Agara Junction (900m)'
  },
  {
    id: 'flat-4',
    title: 'Chic 1 BHK Studio Apartment near Pali Hill',
    type: 'Studio',
    rent: 48000,
    deposit: 90000,
    maintenance: 2000,
    location: 'Off Carter Road, Bandra West',
    area: 'Bandra West',
    city: 'Mumbai',
    furnishing: 'Fully Furnished',
    genderPreference: 'Any',
    images: [
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Sea Breeze Balcony', 'High Speed WiFi', 'Smart Lock Access', 'Designer Interiors', 'Air Conditioner', 'Daily Housekeeping'],
    verified: true,
    zeroBrokerage: true,
    availableFrom: '15th of this month',
    postedBy: {
      name: 'Kabir Mehta',
      role: 'Owner',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      verified: true,
      responseTime: '⚡ Replies in 2 hrs',
      phone: '+91 99300 44556'
    },
    description: 'Boutique studio designed for digital nomads and media professionals. 2 mins walk to Carter Road promenade. Zero brokerage, registered rent agreement assistance provided.',
    rules: ['Strictly zero smoking indoors', 'Subletting not allowed'],
    nearbyMetro: 'Khar Road Station (1.4 km)'
  },
  {
    id: 'flat-5',
    title: 'Private Room in Premium Highrise next to DLF Cyber City',
    type: 'Private Room',
    rent: 26000,
    deposit: 50000,
    maintenance: 3200,
    location: 'DLF Phase 2, near CyberHub',
    area: 'Cyber City Gurugram',
    city: 'Delhi NCR',
    furnishing: 'Fully Furnished',
    genderPreference: 'Male',
    images: [
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Swimming Pool', 'Clubhouse & Gym', 'Central AC', 'Daily Cook', 'Covered Parking', 'High Speed Internet', '24x7 Power Backup'],
    verified: true,
    zeroBrokerage: true,
    availableFrom: 'Immediately',
    postedBy: {
      name: 'Aditya Singhania',
      role: 'Current Flatmate',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      verified: true,
      responseTime: '⚡ Typically replies in 45 mins',
      phone: '+91 98112 33445'
    },
    description: '1 room vacant in an upscale 4BHK. Society has full amenities including tennis courts and infinity pool. Walking distance to Rapid Metro and Cyber City offices.',
    rules: ['Professional bachelors only', 'Alcohol ok in moderation'],
    nearbyMetro: 'DLF Phase 2 Rapid Metro (400m)'
  },
  {
    id: 'flat-6',
    title: 'Bohemian 3BHK Flat in Koregaon Park with Garden',
    type: '3 BHK',
    rent: 36000,
    deposit: 70000,
    maintenance: 1800,
    location: 'Lane 7, Koregaon Park',
    area: 'Koregaon Park',
    city: 'Pune',
    furnishing: 'Fully Furnished',
    genderPreference: 'Any',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Private Garden', 'Pet Friendly', 'Wooden Dining Set', 'Fiber WiFi', 'Dedicated Maid', 'Inverter Backup'],
    verified: true,
    zeroBrokerage: true,
    availableFrom: 'Immediately',
    postedBy: {
      name: 'Neha Deshmukh',
      role: 'Owner',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      verified: true,
      responseTime: '⚡ Typically replies in 1 hr',
      phone: '+91 98901 23456'
    },
    description: 'Charming vintage ground floor flat with a lush private patio garden. Perfect for creative professionals, startup founders or roommates with pets.',
    rules: ['Pets warmly welcomed', 'Keep patio plants watered'],
    nearbyMetro: 'Kalyani Nagar Metro (1.8 km)'
  }
];

export const MOCK_FLATMATES: FlatmateProfile[] = [
  {
    id: 'mate-1',
    name: 'Tanvi Nair',
    age: 25,
    gender: 'Female',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    profession: 'Senior Product Designer',
    company: 'Swiggy',
    budget: { min: 18000, max: 26000 },
    preferredLocations: ['Indiranagar', 'Koramangala', 'Domlur'],
    city: 'Bengaluru',
    moveInDate: 'Within 2 weeks',
    verified: true,
    activeStatus: 'Active Now',
    responseTime: '⚡ Typically replies in 20 mins',
    responseRate: '98%',
    bio: 'Hey! Moving closer to my office. I work hybrid (2 days from home, 3 days office). Very clean, quiet on weekdays, enjoy weekend brunch, coffee walks, and yoga.',
    lifestyle: {
      cleanliness: 5,
      sleepCycle: 'Early Bird',
      diet: 'Vegetarian',
      smoking: 'Non-Smoker',
      drinking: 'Social',
      petFriendly: true,
      guests: 'Weekends Only'
    },
    interests: ['UI/UX', 'Specialty Coffee', 'Pilates', 'Indie Music', 'Plants']
  },
  {
    id: 'mate-2',
    name: 'Aravind Kulkarni',
    age: 27,
    gender: 'Male',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    profession: 'Backend Engineer',
    company: 'Razorpay',
    budget: { min: 20000, max: 30000 },
    preferredLocations: ['HSR Layout', 'Koramangala', 'Bellandur'],
    city: 'Bengaluru',
    moveInDate: '1st of next month',
    verified: true,
    activeStatus: 'Active Now',
    responseTime: '⚡ Replies in under 1 hr',
    responseRate: '96%',
    bio: 'Software engineer who loves cooking healthy meals and playing weekend badminton. Looking for flatmates who value mutual space and cleanliness.',
    lifestyle: {
      cleanliness: 4,
      sleepCycle: 'Flexible',
      diet: 'Non-Vegetarian',
      smoking: 'Non-Smoker',
      drinking: 'Social',
      petFriendly: true,
      guests: 'Flexible'
    },
    interests: ['Coding', 'Badminton', 'Culinary Cooking', 'Board Games', 'Podcasts']
  },
  {
    id: 'mate-3',
    name: 'Shreya Sengupta',
    age: 24,
    gender: 'Female',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    profession: 'Marketing Lead',
    company: 'Nykaa',
    budget: { min: 22000, max: 35000 },
    preferredLocations: ['Bandra West', 'Khar', 'Santacruz'],
    city: 'Mumbai',
    moveInDate: 'Immediately',
    verified: true,
    activeStatus: 'Active Today',
    responseTime: '⚡ Replies in 2 hrs',
    responseRate: '92%',
    bio: 'Extroverted introvert! I respect quiet hours, always keep common areas spotless, and make delicious weekend pastas. Have a friendly hypoallergenic cat named Mochi.',
    lifestyle: {
      cleanliness: 5,
      sleepCycle: 'Night Owl',
      diet: 'Any',
      smoking: 'Outside Only',
      drinking: 'Social',
      petFriendly: true,
      guests: 'Flexible'
    },
    interests: ['Fashion', 'Cats', 'Art Galleries', 'Vinyl Records', 'Baking']
  },
  {
    id: 'mate-4',
    name: 'Vikramaditya Rao',
    age: 28,
    gender: 'Male',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    profession: 'Management Consultant',
    company: 'McKinsey & Co',
    budget: { min: 25000, max: 40000 },
    preferredLocations: ['Cyber City Gurugram', 'DLF Phase 5', 'Golf Course Road'],
    city: 'Delhi NCR',
    moveInDate: 'Next Month',
    verified: true,
    activeStatus: 'Active Today',
    responseTime: '⚡ Typically replies in 1 hr',
    responseRate: '94%',
    bio: 'Travel frequently for client projects during weekdays. Looking for a neat, quiet flat with good amenities and like-minded professionals.',
    lifestyle: {
      cleanliness: 4,
      sleepCycle: 'Early Bird',
      diet: 'Any',
      smoking: 'Non-Smoker',
      drinking: 'Teetotaler',
      petFriendly: false,
      guests: 'Quiet Hours Preferred'
    },
    interests: ['Running', 'Marathons', 'Economics', 'Golf', 'Reading']
  },
  {
    id: 'mate-5',
    name: 'Disha Patel',
    age: 26,
    gender: 'Female',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    profession: 'Architectural Consultant',
    company: 'Studio Lotus',
    budget: { min: 16000, max: 24000 },
    preferredLocations: ['Koregaon Park', 'Kalyani Nagar', 'Viman Nagar'],
    city: 'Pune',
    moveInDate: 'Flexible',
    verified: true,
    activeStatus: 'Active Now',
    responseTime: '⚡ Replies in 15 mins',
    responseRate: '99%',
    bio: 'Passionate about plant care, ceramics, and sustainable interior design. Looking for a bright, sunlit room with friendly flatmates.',
    lifestyle: {
      cleanliness: 5,
      sleepCycle: 'Flexible',
      diet: 'Vegetarian',
      smoking: 'Non-Smoker',
      drinking: 'Social',
      petFriendly: true,
      guests: 'Weekends Only'
    },
    interests: ['Interior Design', 'Ceramics', 'Houseplants', 'Cycling', 'Documentaries']
  }
];
