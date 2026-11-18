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

/**
 * Normalizes and validates Indian mobile numbers.
 * Accepts:
 * - 10-digit mobile number: "9825123456", "98251 23456", "98251-23456"
 * - +91 prefixed: "+919825123456", "+91 9825123456", "+91-98251-23456"
 * - 91 prefixed (12 digits): "919825123456"
 * - 0 prefixed (11 digits): "09825123456"
 * Rejects without silent truncation:
 * - Non-string / empty
 * - Excessive digits without valid prefix (e.g. 11+ digits like "123459825123456")
 * - Invalid international prefixes (+1, +44, +92, etc.)
 * - Repetitive dummy numbers (e.g. 9999999999) or sequential placeholder numbers (1234567890)
 * - Numbers starting with 0-5 (Indian mobiles must start with 6, 7, 8, or 9)
 */
export function normalizeIndianPhone(input: any): { phone?: string; error?: string } {
  if (typeof input !== 'string' && typeof input !== 'number') {
    return { error: 'Phone number must be a valid 10-digit Indian mobile number' };
  }

  const raw = String(input).trim();
  if (!raw) {
    return { error: 'Phone number is required (must be a valid 10-digit Indian mobile number)' };
  }

  // Check for invalid characters (only digits, spaces, dashes, parentheses, and leading + allowed)
  if (!/^\+?[\d\s\-()]+$/.test(raw)) {
    return { error: 'Phone number contains invalid characters (must be a valid 10-digit Indian mobile number)' };
  }

  let cleaned = raw.replace(/[\s\-()]/g, '');

  // Handle +91 / 91 / 0 prefix
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith('+')) {
    return { error: 'Only Indian mobile numbers (+91) are supported (must be a valid 10-digit Indian mobile number)' };
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }

  // Must be strictly digits
  if (!/^\d+$/.test(cleaned)) {
    return { error: 'Phone number must contain only numeric digits (must be a valid 10-digit Indian mobile number)' };
  }

  if (cleaned.length < 10) {
    return { error: 'Phone number is too short (must be a valid 10-digit Indian mobile number)' };
  }

  if (cleaned.length > 10) {
    return { error: 'Phone number is too long (must be a valid 10-digit Indian mobile number without truncation)' };
  }

  // Indian mobiles must start with 6, 7, 8, or 9
  if (!/^[6-9]/.test(cleaned)) {
    return { error: 'Indian mobile number must start with 6, 7, 8, or 9 (must be a valid 10-digit Indian mobile number)' };
  }

  // Reject all same digits (e.g. 9999999999, 8888888888)
  if (/^(\d)\1{9}$/.test(cleaned)) {
    return { error: 'Repetitive dummy phone numbers are not allowed (must be a valid 10-digit Indian mobile number)' };
  }

  // Reject obvious dummy sequences
  if (cleaned === '1234567890' || cleaned === '0123456789') {
    return { error: 'Sequential placeholder phone numbers are not allowed (must be a valid 10-digit Indian mobile number)' };
  }

  return { phone: cleaned };
}

export function isValidIndianPhone(input: any): boolean {
  return normalizeIndianPhone(input).phone !== undefined;
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

  // Strict Indian mobile phone validation (no silent truncation)
  const phoneValidation = normalizeIndianPhone(input.contactPhone);
  if (phoneValidation.error || !phoneValidation.phone) {
    return { error: `Contact phone: ${phoneValidation.error}` };
  }
  const contactPhone = phoneValidation.phone;

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
      contactPhone,
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

  // Strict Indian mobile phone validation (no silent truncation)
  const phoneValidation = normalizeIndianPhone(input.seekerPhone);
  if (phoneValidation.error || !phoneValidation.phone) {
    return { error: `Seeker phone: ${phoneValidation.error}` };
  }
  const seekerPhone = phoneValidation.phone;

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
      seekerPhone,
      seekerMessage,
      moveInDate,
    },
  };
}
