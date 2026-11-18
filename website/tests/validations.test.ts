import { describe, it, expect } from 'vitest';
import {
  isValidUUID,
  isValidMoveInDate,
  isApprovedImageSource,
  normalizeIndianPhone,
  isValidIndianPhone,
  validateSpaceInput,
  validateInquiryInput,
} from '../lib/validations';

describe('Flatemate Validation & Sanitization Tests', () => {

  describe('1. UUID Validation (isValidUUID)', () => {
    it('accepts valid RFC 4122 UUIDs', () => {
      expect(isValidUUID('c56a4180-65aa-42ec-a945-5fd21dec0538')).toBe(true);
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(isValidUUID('A56A4180-65AA-42EC-A945-5FD21DEC0538')).toBe(true);
    });

    it('rejects invalid or malformed UUID strings', () => {
      expect(isValidUUID('')).toBe(false);
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('c56a4180-65aa-42ec-a945-5fd21dec053')).toBe(false); // Too short
      expect(isValidUUID('c56a4180-65aa-42ec-a945-5fd21dec05389')).toBe(false); // Too long
      expect(isValidUUID("'; DROP TABLE spaces; --")).toBe(false);
      expect(isValidUUID(null as any)).toBe(false);
      expect(isValidUUID(undefined as any)).toBe(false);
      expect(isValidUUID(12345 as any)).toBe(false);
    });
  });

  describe('2. Move-In Date Validation (isValidMoveInDate)', () => {
    it('accepts valid future and current ISO date strings (YYYY-MM-DD)', () => {
      expect(isValidMoveInDate('2026-11-20')).toBe(true);
      expect(isValidMoveInDate('2026-12-31')).toBe(true);
      expect(isValidMoveInDate('2027-06-15')).toBe(true);
    });

    it('rejects arbitrary text and non-ISO strings', () => {
      expect(isValidMoveInDate('Immediate')).toBe(false);
      expect(isValidMoveInDate('Next Monday')).toBe(false);
      expect(isValidMoveInDate('15/12/2026')).toBe(false);
      expect(isValidMoveInDate('')).toBe(false);
      expect(isValidMoveInDate(null as any)).toBe(false);
    });

    it('rejects invalid calendar dates', () => {
      expect(isValidMoveInDate('2026-02-30')).toBe(false); // Feb 30 does not exist
      expect(isValidMoveInDate('2026-13-01')).toBe(false); // Month 13
      expect(isValidMoveInDate('2026-04-31')).toBe(false); // April has 30 days
    });

    it('rejects dates in the distant past or unreasonable future', () => {
      expect(isValidMoveInDate('2020-01-01')).toBe(false);
      expect(isValidMoveInDate('2050-01-01')).toBe(false);
    });
  });

  describe('3. Image Source Validation (isApprovedImageSource)', () => {
    it('accepts internal assets and trusted hosts', () => {
      expect(isApprovedImageSource('/assets/flat1.png')).toBe(true);
      expect(isApprovedImageSource('/images/banner.jpg')).toBe(true);
      expect(isApprovedImageSource('https://images.unsplash.com/photo-123')).toBe(true);
      expect(isApprovedImageSource('https://xyz.supabase.co/storage/v1/object/public/listings/1.png')).toBe(true);
      expect(isApprovedImageSource('https://flatemate.app/assets/img.jpg')).toBe(true);
    });

    it('rejects dangerous URI schemes (XSS protection)', () => {
      expect(isApprovedImageSource('javascript:alert(1)')).toBe(false);
      expect(isApprovedImageSource('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isApprovedImageSource('vbscript:msgbox(1)')).toBe(false);
    });

    it('rejects path traversal in local paths', () => {
      expect(isApprovedImageSource('/assets/../../etc/passwd')).toBe(false);
      expect(isApprovedImageSource('/assets/<script>')).toBe(false);
    });

    it('rejects unapproved third-party hosts', () => {
      expect(isApprovedImageSource('https://evil-tracking.com/pixel.png')).toBe(false);
      expect(isApprovedImageSource('http://unknown-cdn.net/image.jpg')).toBe(false);
    });
  });

  describe('4. Space Input Validation (validateSpaceInput)', () => {
    const validSpace = {
      title: 'Spacious 2BHK in Navrangpura',
      description: 'Looking for a flatmate in a fully furnished 2BHK apartment near commerce six roads.',
      location: 'Navrangpura',
      rent: 12000,
      deposit: 24000,
      listingType: 'room',
      genderPreference: 'any',
      furnishing: 'fully_furnished',
      roomType: 'Private Room',
      contactName: 'Karan Patel',
      contactPhone: '9825123456',
      consentWhatsappContact: true,
      images: ['/assets/flat1.png'],
      amenities: ['WiFi', 'AC'],
    };

    it('accepts a fully compliant space payload', () => {
      const res = validateSpaceInput(validSpace);
      expect(res.error).toBeUndefined();
      expect(res.data).toBeDefined();
      expect(res.data?.city).toBe('Ahmedabad');
      expect(res.data?.rent).toBe(12000);
      expect(res.data?.consentWhatsappContact).toBe(true);
    });

    it('strictly rejects invalid listingType without silent fallback', () => {
      const invalid = { ...validSpace, listingType: 'bungalow' };
      const res = validateSpaceInput(invalid);
      expect(res.error).toContain("Invalid listingType 'bungalow'");
      expect(res.data).toBeUndefined();
    });

    it('strictly rejects invalid genderPreference without silent fallback', () => {
      const invalid = { ...validSpace, genderPreference: 'couples_only' };
      const res = validateSpaceInput(invalid);
      expect(res.error).toContain("Invalid genderPreference 'couples_only'");
      expect(res.data).toBeUndefined();
    });

    it('strictly rejects invalid furnishing without silent fallback', () => {
      const invalid = { ...validSpace, furnishing: 'luxury_furnished' };
      const res = validateSpaceInput(invalid);
      expect(res.error).toContain("Invalid furnishing 'luxury_furnished'");
      expect(res.data).toBeUndefined();
    });

    it('rejects non-finite, negative, or excessive rent amounts', () => {
      expect(validateSpaceInput({ ...validSpace, rent: -500 }).error).toBeDefined();
      expect(validateSpaceInput({ ...validSpace, rent: NaN }).error).toBeDefined();
      expect(validateSpaceInput({ ...validSpace, rent: Infinity }).error).toBeDefined();
      expect(validateSpaceInput({ ...validSpace, rent: 9999999 }).error).toBeDefined();
    });

    it('rejects non-finite or negative deposit amounts', () => {
      expect(validateSpaceInput({ ...validSpace, deposit: -100 }).error).toBeDefined();
      expect(validateSpaceInput({ ...validSpace, deposit: Infinity }).error).toBeDefined();
    });

    it('rejects unapproved image source URLs', () => {
      const invalid = { ...validSpace, images: ['javascript:stealCookies()'] };
      const res = validateSpaceInput(invalid);
      expect(res.error).toContain('Invalid or unapproved image source URL');
    });

    it('rejects invalid contact phone numbers', () => {
      expect(validateSpaceInput({ ...validSpace, contactPhone: '123' }).error).toContain('valid 10-digit');
      expect(validateSpaceInput({ ...validSpace, contactPhone: 'abcdefghij' }).error).toContain('valid 10-digit');
    });
  });

  describe('5. Inquiry Input Validation (validateInquiryInput)', () => {
    const validInquiry = {
      spaceId: 'c56a4180-65aa-42ec-a945-5fd21dec0538',
      seekerName: 'Priya Sharma',
      seekerPhone: '9876543210',
      seekerMessage: 'Interested in visiting this Saturday.',
      moveInDate: '2026-12-01',
    };

    it('accepts a fully compliant inquiry payload', () => {
      const res = validateInquiryInput(validInquiry);
      expect(res.error).toBeUndefined();
      expect(res.data).toBeDefined();
      expect(res.data?.spaceId).toBe('c56a4180-65aa-42ec-a945-5fd21dec0538');
      expect(res.data?.moveInDate).toBe('2026-12-01');
    });

    it('strictly rejects non-UUID spaceId', () => {
      const invalid = { ...validInquiry, spaceId: 'not-a-uuid-123' };
      const res = validateInquiryInput(invalid);
      expect(res.error).toBe('Space ID must be a valid UUID');
      expect(res.data).toBeUndefined();
    });

    it('strictly rejects malformed move-in dates', () => {
      const invalid = { ...validInquiry, moveInDate: 'Next Monday' };
      const res = validateInquiryInput(invalid);
      expect(res.error).toContain('Move-in date must be a valid date in YYYY-MM-DD format');
      expect(res.data).toBeUndefined();
    });

    it('allows optional move-in date when omitted or empty', () => {
      const withoutDate = { ...validInquiry, moveInDate: undefined };
      const res = validateInquiryInput(withoutDate);
      expect(res.error).toBeUndefined();
      expect(res.data?.moveInDate).toBeUndefined();
    });

    it('rejects invalid seeker phone numbers', () => {
      const invalid = { ...validInquiry, seekerPhone: '12345' };
      const res = validateInquiryInput(invalid);
      expect(res.error).toContain('valid 10-digit');
    });
  });

  describe('6. Indian Mobile Number Validation (normalizeIndianPhone & isValidIndianPhone)', () => {
    it('accepts clean 10-digit Indian mobile numbers starting with 6, 7, 8, or 9', () => {
      expect(normalizeIndianPhone('9825123456')).toEqual({ phone: '9825123456' });
      expect(normalizeIndianPhone('8825123456')).toEqual({ phone: '8825123456' });
      expect(normalizeIndianPhone('7825123456')).toEqual({ phone: '7825123456' });
      expect(normalizeIndianPhone('6825123456')).toEqual({ phone: '6825123456' });
      expect(isValidIndianPhone('9825123456')).toBe(true);
    });

    it('accepts numbers formatted with spaces, dashes, or parentheses', () => {
      expect(normalizeIndianPhone('98251 23456')).toEqual({ phone: '9825123456' });
      expect(normalizeIndianPhone('98251-23456')).toEqual({ phone: '9825123456' });
      expect(normalizeIndianPhone('(98251) 23456')).toEqual({ phone: '9825123456' });
      expect(isValidIndianPhone('98251-23456')).toBe(true);
    });

    it('accepts valid +91 prefix variants', () => {
      expect(normalizeIndianPhone('+919825123456')).toEqual({ phone: '9825123456' });
      expect(normalizeIndianPhone('+91 98251 23456')).toEqual({ phone: '9825123456' });
      expect(normalizeIndianPhone('+91-98251-23456')).toEqual({ phone: '9825123456' });
      expect(isValidIndianPhone('+91 98251 23456')).toBe(true);
    });

    it('accepts 12-digit numbers with 91 country code prefix', () => {
      expect(normalizeIndianPhone('919825123456')).toEqual({ phone: '9825123456' });
      expect(isValidIndianPhone('919825123456')).toBe(true);
    });

    it('accepts 11-digit numbers with leading 0 trunk prefix', () => {
      expect(normalizeIndianPhone('09825123456')).toEqual({ phone: '9825123456' });
      expect(isValidIndianPhone('09825123456')).toBe(true);
    });

    it('strictly rejects excessively long numbers WITHOUT silent truncation', () => {
      // Previously, slice(-10) silently converted this to 9825123456. Now must reject!
      const longInput1 = '123459825123456';
      expect(normalizeIndianPhone(longInput1).phone).toBeUndefined();
      expect(normalizeIndianPhone(longInput1).error).toContain('too long');

      const longInput2 = '98251234567'; // 11 digits without prefix
      expect(normalizeIndianPhone(longInput2).phone).toBeUndefined();
      expect(isValidIndianPhone(longInput2)).toBe(false);

      const longInput3 = '+9198251234567'; // 11 digits after +91
      expect(normalizeIndianPhone(longInput3).phone).toBeUndefined();
      expect(isValidIndianPhone(longInput3)).toBe(false);
    });

    it('strictly rejects non-Indian international country codes', () => {
      expect(normalizeIndianPhone('+14155552671').phone).toBeUndefined();
      expect(normalizeIndianPhone('+14155552671').error).toContain('Only Indian mobile numbers (+91)');

      expect(normalizeIndianPhone('+923001234567').phone).toBeUndefined();
      expect(normalizeIndianPhone('+447911123456').phone).toBeUndefined();
      expect(isValidIndianPhone('+14155552671')).toBe(false);
    });

    it('strictly rejects numbers starting with invalid digits (0-5)', () => {
      expect(normalizeIndianPhone('5825123456').phone).toBeUndefined();
      expect(normalizeIndianPhone('4825123456').phone).toBeUndefined();
      expect(normalizeIndianPhone('1825123456').phone).toBeUndefined();
      expect(isValidIndianPhone('5825123456')).toBe(false);
    });

    it('strictly rejects dummy and sequential placeholder numbers', () => {
      expect(normalizeIndianPhone('9999999999').phone).toBeUndefined();
      expect(normalizeIndianPhone('9999999999').error).toContain('Repetitive dummy phone');

      expect(normalizeIndianPhone('8888888888').phone).toBeUndefined();
      expect(normalizeIndianPhone('1234567890').phone).toBeUndefined();
      expect(isValidIndianPhone('9999999999')).toBe(false);
      expect(isValidIndianPhone('1234567890')).toBe(false);
    });

    it('strictly rejects non-numeric or malformed input', () => {
      expect(normalizeIndianPhone('').phone).toBeUndefined();
      expect(normalizeIndianPhone('abcdefghij').phone).toBeUndefined();
      expect(normalizeIndianPhone('98251abcde').phone).toBeUndefined();
      expect(normalizeIndianPhone(null).phone).toBeUndefined();
      expect(normalizeIndianPhone(undefined).phone).toBeUndefined();
    });
  });
});
