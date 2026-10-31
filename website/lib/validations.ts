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

  const rent = Number(input.rent);
  if (isNaN(rent) || rent < 0 || rent > 500000) {
    return { error: 'Rent must be between ₹0 and ₹5,00,000' };
  }

  const deposit = Number(input.deposit || 0);
  if (isNaN(deposit) || deposit < 0 || deposit > 1000000) {
    return { error: 'Deposit must be a positive amount' };
  }

  const validTypes = ['room', 'entire_flat', 'seeking_flat'];
  const listingType = validTypes.includes(input.listingType) ? input.listingType : 'room';

  const validGenders = ['any', 'female', 'male'];
  const genderPreference = validGenders.includes(input.genderPreference) ? input.genderPreference : 'any';

  const validFurnishings = ['fully_furnished', 'semi_furnished', 'unfurnished'];
  const furnishing = validFurnishings.includes(input.furnishing) ? input.furnishing : 'semi_furnished';

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

  const images = Array.isArray(input.images)
    ? input.images.map((img: any) => String(img).trim()).filter(Boolean).slice(0, 10)
    : [];

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
  if (!spaceId) {
    return { error: 'Space ID is required' };
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
  const moveInDate = input.moveInDate ? String(input.moveInDate).trim() : undefined;

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
