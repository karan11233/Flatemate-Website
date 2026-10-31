import { describe, it, expect } from 'vitest';
import { validateIndianPhone, validateContent } from '../lib/moderation';
import { cn } from '../lib/utils';

describe('Phase 2 Foundation: Utilities & Moderation', () => {
  it('cn() correctly merges tailwind classes without conflict', () => {
    const result = cn('px-4 py-2', 'bg-primary', { 'text-white': true, 'hidden': false });
    expect(result).toBe('px-4 py-2 bg-primary text-white');
  });

  it('validateIndianPhone correctly validates genuine 10-digit mobile numbers', () => {
    expect(validateIndianPhone('9876543211').isValid).toBe(true);
    expect(validateIndianPhone('+91 9876543211').isValid).toBe(true);
    expect(validateIndianPhone('8123456789').isValid).toBe(true);
  });

  it('validateIndianPhone rejects fake or dummy repetitive sequences', () => {
    expect(validateIndianPhone('9999999999').isValid).toBe(false);
    expect(validateIndianPhone('1234567890').isValid).toBe(false);
    expect(validateIndianPhone('9876543210').isValid).toBe(false);
    expect(validateIndianPhone('5551234567').isValid).toBe(false); // Does not start with 6-9
    expect(validateIndianPhone('12345').isValid).toBe(false);
  });

  it('validateContent flags restricted profanity and scam links', () => {
    expect(validateContent('Beautiful 2BHK flat in Satellite').isValid).toBe(true);
    expect(validateContent('Join my telegram link for crypto earnings').isValid).toBe(false);
    expect(validateContent('Call girl service available').isValid).toBe(false);
  });
});
