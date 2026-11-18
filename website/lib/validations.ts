/**
 * Flatemate Input Validations & Sanitization
 * Strict server-side validation for listings, inquiries, and user profiles.
 */

export interface ValidatedSpaceInput {
  title: string;
  description: string;
  location: string;
  city: string;
  rent: number;
  deposit: number;
  listingType: 'room' | 'entire_flat' | 'seeking_flat';
  genderPreference: 'any' | 'female' | 'male';
  furnishing: 'fully_furnished' | 'semi_furnished' | 'unfurnished';
  roomType: string;
  amenities: string[];
  images: string[];
  contactName: string;
  contactPhone: string;
  consentWhatsappContact: boolean;
}

export interface ValidatedInquiryInput {
  spaceId: string;
  seekerName: string;
  seekerPhone: string;
  seekerMessage?: string;
  moveInDate?: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validate UUID format (v1-v5)
 */
export function isValidUUID(id: string): boolean {
  return typeof id === 'string' && UUID_REGEX.test(id.trim());
}

/**
 * Validate move-in date format (YYYY-MM-DD) and reasonable bounds
 */
export function isValidMoveInDate(dateStr: string): boolean {
  if (typeof dateStr !== 'string') return false;
  const match = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (month < 1 || month > 12 || day < 1 || day > 31) return false;

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return false;
  }

  // Reasonableness bounds: between 2024 and 2035
  if (year < 2024 || year > 2035) return false;

  // Cannot be more than 30 days in the past
  const pastCutoff = new Date();
  pastCutoff.setUTCDate(pastCutoff.getUTCDate() - 30);
  pastCutoff.setUTCHours(0, 0, 0, 0);

  return date >= pastCutoff;
}

/**
 * Restrict images to application-controlled and approved sources
 */
export function isApprovedImageSource(url: string): boolean {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  // Internal application assets
  if (trimmed.startsWith('/assets/') || trimmed.startsWith('/images/')) {
    return !trimmed.includes('..') && !/[<>"]/.test(trimmed);
  }

  // Disallow javascript, data, vbscript URIs
  if (/^(javascript|vbscript|data):/i.test(trimmed)) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();
    const approvedHosts = [
      'supabase.co',
      'supabase.in',
      'unsplash.com',
      'images.unsplash.com',
      'cloudinary.com',
      'flatemate.app',
      'localhost',
      '127.0.0.1',
    ];

    return approvedHosts.some((h) => hostname === h || hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

export function validateSpaceInput(input: any): { data?: ValidatedSpaceInput; error?: string } {
  if (!input || typeof input !== 'object') {
    return { error: 'Invalid input payload' };
  }

  const title = String(input.title || '').trim();
  if (title.length < 5 || title.length > 120) {
    return { error: 'Title must be between 5 and 120 characters' };
  }

  const description = String(input.description || '').trim();
  if (description.length < 20 || description.length > 2000) {
    return { error: 'Description must be between 20 and 2000 characters' };
  }

  const location = String(input.location || '').trim();
  if (!location) {
    return { error: 'Neighborhood/location is required' };
  }

  // Finite rent check
  if (typeof input.rent !== 'number' && typeof input.rent !== 'string') {
    return { error: 'Rent must be a valid number' };
  }
  const rent = Number(input.rent);
  if (!Number.isFinite(rent) || isNaN(rent) || rent < 0 || rent > 500000) {
    return { error: 'Rent must be a valid number between ₹0 and ₹5,00,000' };
  }

  // Finite deposit check
  if (input.deposit !== undefined && input.deposit !== null) {
    if (typeof input.deposit !== 'number' && typeof input.deposit !== 'string') {
      return { error: 'Deposit must be a valid number' };
    }
    const deposit = Number(input.deposit);
    if (!Number.isFinite(deposit) || isNaN(deposit) || deposit < 0 || deposit > 1000000) {
      return { error: 'Deposit must be a positive number up to ₹10,00,000' };
    }
  }
  const deposit = Number(input.deposit || 0);

  // Strict enum validation - no silent fallbacks
  const validTypes = ['room', 'entire_flat', 'seeking_flat'];
  if (!validTypes.includes(input.listingType)) {
    return { error: `Invalid listingType '${input.listingType}'. Allowed: ${validTypes.join(', ')}` };
  }
  const listingType = input.listingType as 'room' | 'entire_flat' | 'seeking_flat';

  const validGenders = ['any', 'female', 'male'];
  if (!validGenders.includes(input.genderPreference)) {
    return { error: `Invalid genderPreference '${input.genderPreference}'. Allowed: ${validGenders.join(', ')}` };
  }
  const genderPreference = input.genderPreference as 'any' | 'female' | 'male';

  const validFurnishings = ['fully_furnished', 'semi_furnished', 'unfurnished'];
  if (!validFurnishings.includes(input.furnishing)) {
    return { error: `Invalid furnishing '${input.furnishing}'. Allowed: ${validFurnishings.join(', ')}` };
  }
  const furnishing = input.furnishing as 'fully_furnished' | 'semi_furnished' | 'unfurnished';

  const roomType = String(input.roomType || 'Private Room').trim();

  const contactName = String(input.contactName || '').trim();
  if (contactName.length < 2 || contactName.length > 80) {
    return { error: 'Contact name must be between 2 and 80 characters' };
  }

  const phoneDigits = String(input.contactPhone || '').replace(/\D/g, '').slice(-10);
  if (phoneDigits.length !== 10) {
    return { error: 'Contact phone must be a valid 10-digit Indian mobile number' };
  }

  // Explicit opt-in consent: must be true boolean
  const consentWhatsappContact = Boolean(input.consentWhatsappContact === true);

  const amenities = Array.isArray(input.amenities)
    ? input.amenities.map((a: any) => String(a).trim()).filter(Boolean).slice(0, 30)
    : [];

  const rawImages = Array.isArray(input.images) ? input.images : [];
  const images: string[] = [];
  for (const img of rawImages) {
    const cleanImg = String(img || '').trim();
    if (!cleanImg) continue;
    if (!isApprovedImageSource(cleanImg)) {
      return { error: `Invalid or unapproved image source URL: ${cleanImg.slice(0, 60)}` };
    }
    images.push(cleanImg);
    if (images.length >= 10) break;
  }

  return {
    data: {
      title,
      description,
      location,
      city: 'Ahmedabad',
      rent,
      deposit,
      listingType,
      genderPreference,
      furnishing,
      roomType,
      amenities,
      images,
      contactName,
      contactPhone: phoneDigits,
      consentWhatsappContact,
    },
  };
}

export function validateInquiryInput(input: any): { data?: ValidatedInquiryInput; error?: string } {
  if (!input || typeof input !== 'object') {
    return { error: 'Invalid input payload' };
  }

  const spaceId = String(input.spaceId || '').trim();
  if (!isValidUUID(spaceId)) {
    return { error: 'Space ID must be a valid UUID' };
  }

  const seekerName = String(input.seekerName || '').trim();
  if (seekerName.length < 2 || seekerName.length > 80) {
    return { error: 'Name must be between 2 and 80 characters' };
  }

  const phoneDigits = String(input.seekerPhone || '').replace(/\D/g, '').slice(-10);
  if (phoneDigits.length !== 10) {
    return { error: 'Phone must be a valid 10-digit Indian mobile number' };
  }

  const seekerMessage = input.seekerMessage ? String(input.seekerMessage).trim().slice(0, 1000) : undefined;

  let moveInDate: string | undefined = undefined;
  if (input.moveInDate) {
    const d = String(input.moveInDate).trim();
    if (d) {
      if (!isValidMoveInDate(d)) {
        return { error: 'Move-in date must be a valid date in YYYY-MM-DD format' };
      }
      moveInDate = d;
    }
  }

  return {
    data: {
      spaceId,
      seekerName,
      seekerPhone: phoneDigits,
      seekerMessage,
      moveInDate,
    },
  };
}
