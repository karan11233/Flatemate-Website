/**
 * Content Moderation & Anti-Spam Guard for Flatemate
 */

// Common spam, scam, and adult keywords to block
const BANNED_KEYWORDS = [
  // Adult / Escort / NSFW terms
  'escort', 'call girl', 'callboy', 'massage parlour', 'sex', 'nude', 'dating', 
  'hookup', 'adult', 'xxx', 'porn', 'bhabhi', 'sensual', 'intimate',
  
  // Financial Scams / Spam
  'crypto', 'bitcoin', 'lottery', 'earn money', 'work from home 50000', 
  'telegram link', 'whatsapp group link', 'casino', 'betting', 'rummy', 'fast cash',
  
  // Vulgarities / Abusive terms (common English and Hinglish)
  'fuck', 'bitch', 'asshole', 'chutiya', 'madarchod', 'bhosdike', 'gandu', 'harami'
];

/**
 * Validates text content against adult, vulgar, and spam keywords.
 * Returns { isValid: true } or { isValid: false, reason: string }
 */
export function validateContent(text: string): { isValid: boolean; reason?: string } {
  if (!text) return { isValid: true };
  
  const lower = text.toLowerCase();

  for (const word of BANNED_KEYWORDS) {
    // Word boundary or substring check for high-risk words
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lower) || lower.includes(word)) {
      return {
        isValid: false,
        reason: `Your listing contains restricted or inappropriate language ("${word}"). Please remove it to proceed.`,
      };
    }
  }

  // Check for suspicious external URLs in user input
  if (/https?:\/\/(?!flatemate|localhost)/i.test(lower) && !lower.includes('images.unsplash.com')) {
    return {
      isValid: false,
      reason: 'External links are not allowed in listing titles or descriptions for community safety.',
    };
  }

  return { isValid: true };
}

/**
 * Validates genuine Indian 10-digit mobile numbers
 * (Must start with 6, 7, 8, or 9 and cannot be repetitive dummy sequences)
 */
export function validateIndianPhone(phone: string): { isValid: boolean; reason?: string } {
  const clean = phone.replace(/\D/g, '').slice(-10);

  if (clean.length !== 10) {
    return {
      isValid: false,
      reason: 'Please enter a valid 10-digit Indian WhatsApp mobile number.',
    };
  }

  // Must start with 6, 7, 8, or 9
  if (!/^[6-9]/.test(clean)) {
    return {
      isValid: false,
      reason: 'Mobile number must start with 6, 7, 8, or 9.',
    };
  }

  // Reject obvious fake/dummy numbers (e.g., 9999999999, 0000000000, 1234567890)
  const isAllSameDigit = /^(\d)\1{9}$/.test(clean);
  const isSequence = clean === '9876543210' || clean === '1234567890';

  if (isAllSameDigit || isSequence) {
    return {
      isValid: false,
      reason: 'Please enter your actual active WhatsApp number, not a placeholder sequence.',
    };
  }

  return { isValid: true };
}

/**
 * Cooldown rate-limiter: Prevents bot flooding (max 1 listing every 30 seconds per device)
 */
const LAST_POST_KEY = 'flatemate_last_post_time';

export function checkPostRateLimit(): { isAllowed: boolean; waitSeconds?: number } {
  const lastPost = localStorage.getItem(LAST_POST_KEY);
  if (!lastPost) return { isAllowed: true };

  const elapsed = (Date.now() - parseInt(lastPost, 10)) / 1000;
  const COOLDOWN_SECONDS = 30;

  if (elapsed < COOLDOWN_SECONDS) {
    return {
      isAllowed: false,
      waitSeconds: Math.ceil(COOLDOWN_SECONDS - elapsed),
    };
  }

  return { isAllowed: true };
}

export function recordPostTimestamp() {
  localStorage.setItem(LAST_POST_KEY, Date.now().toString());
}
