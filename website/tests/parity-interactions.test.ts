import { describe, it, expect } from 'vitest';
import { INITIAL_MOCK_SPACES, INITIAL_MOCK_INQUIRIES } from '../data/mockData';
import { SpaceListing, Inquiry } from '../types';

describe('Phase 3 Feature Parity: Interaction & Filtering Logic', () => {
  it('correctly filters spaces by category', () => {
    const fresh = INITIAL_MOCK_SPACES.filter((s) => s.category === 'fresh');
    const replacement = INITIAL_MOCK_SPACES.filter((s) => s.category === 'replacement');
    const seeker = INITIAL_MOCK_SPACES.filter((s) => s.category === 'seeker');

    expect(fresh.length).toBeGreaterThan(0);
    expect(replacement.length).toBeGreaterThan(0);
    expect(seeker.length).toBeGreaterThan(0);
    expect(fresh.length + replacement.length + seeker.length).toBe(INITIAL_MOCK_SPACES.length);
  });

  it('correctly filters spaces by Ahmedabad locality', () => {
    const satelliteFlats = INITIAL_MOCK_SPACES.filter((s) =>
      s.location.toLowerCase().includes('satellite')
    );
    expect(satelliteFlats.length).toBeGreaterThanOrEqual(1);
    expect(satelliteFlats.every((s) => s.location.includes('Satellite'))).toBe(true);
  });

  it('correctly filters spaces by budget thresholds', () => {
    const under7k = INITIAL_MOCK_SPACES.filter((s) => s.rawRent <= 7000);
    expect(under7k.length).toBeGreaterThan(0);
    expect(under7k.every((s) => s.rawRent <= 7000)).toBe(true);

    const midBudget = INITIAL_MOCK_SPACES.filter((s) => s.rawRent >= 7000 && s.rawRent <= 10000);
    expect(midBudget.length).toBeGreaterThan(0);
    expect(midBudget.every((s) => s.rawRent >= 7000 && s.rawRent <= 10000)).toBe(true);
  });

  it('generates valid WhatsApp deep link message with encoded components', () => {
    const space = INITIAL_MOCK_SPACES[0];
    const cleanPhone = (space.hostPhone || '').replace(/\D/g, '').slice(-10);
    const msg = `Hi ${space.hostName}, I saw your listing on Flatemate for ${space.type} in ${space.location}.`;
    const link = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`;

    expect(link).toContain('https://wa.me/919876543210');
    expect(link).toContain('Hi%20Meet%20Patel');
  });

  it('correctly toggles listing status between active and rented', () => {
    let spaces = [...INITIAL_MOCK_SPACES];
    const targetId = 'space-1';

    // Toggle to rented
    spaces = spaces.map((s) =>
      s.id === targetId ? { ...s, status: s.status === 'active' ? 'rented' : 'active' } : s
    );
    expect(spaces.find((s) => s.id === targetId)?.status).toBe('rented');

    // Toggle back to active
    spaces = spaces.map((s) =>
      s.id === targetId ? { ...s, status: s.status === 'active' ? 'rented' : 'active' } : s
    );
    expect(spaces.find((s) => s.id === targetId)?.status).toBe('active');
  });

  it('correctly associates inquiry leads with host listings', () => {
    const space = INITIAL_MOCK_SPACES[0];
    const hostInquiries = INITIAL_MOCK_INQUIRIES.filter((i) => i.spaceId === space.id);
    expect(hostInquiries.length).toBeGreaterThanOrEqual(1);
    expect(hostInquiries[0].hostName).toBe(space.hostName);
  });
});
