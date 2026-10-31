import React from 'react';
import Image from 'next/image';

interface FooterProps {
  onSelectLocality: (locality: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectLocality }) => {
  const localities = [
    'Satellite',
    'Vastrapur',
    'Prahlad Nagar',
    'Bodakdev',
    'SG Highway',
    'Bopal',
    'South Bopal',
    'Navrangpura',
    'Thaltej',
    'Near IIM Ahmedabad',
    'Paldi',
  ];

  return (
    <footer className="border-t border-border bg-white pt-12 pb-24 lg:pb-12 text-slate-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-slate-900 border border-slate-700 shadow-sm flex items-center justify-center">
                <Image
                  src="/flatemate-logo-alt.jpg"
                  alt="Flatemate Logo"
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 font-heading">
                Flatemate
              </span>
            </div>
            <p className="text-sm text-slate-500 max-w-md leading-relaxed">
              Ahmedabad&apos;s dedicated flatmate and flat rental community. We eliminate broker commissions and let tenants, room seekers, and primary hosts connect directly on WhatsApp with authentic listings.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-primary">
              <span className="rounded-md bg-accent px-2.5 py-1">0% Brokerage</span>
              <span className="rounded-md bg-accent px-2.5 py-1">Direct Host Connect</span>
              <span className="rounded-md bg-accent px-2.5 py-1">Verified Community</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 font-heading">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>
                <a href="#home" className="hover:text-primary transition-colors">
                  Home Overview
                </a>
              </li>
              <li>
                <a href="#discover" className="hover:text-primary transition-colors">
                  Browse by Need
                </a>
              </li>
              <li>
                <a href="#spaces" className="hover:text-primary transition-colors">
                  Ahmedabad Feed
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-primary transition-colors">
                  How it Works
                </a>
              </li>
              <li>
                <a href="#list-space" className="hover:text-primary transition-colors">
                  Post Your Listing
                </a>
              </li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 font-heading">
              Safety & Policies
            </h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>
                <span className="hover:text-primary transition-colors cursor-pointer">
                  Zero Brokerage Guarantee
                </span>
              </li>
              <li>
                <span className="hover:text-primary transition-colors cursor-pointer">
                  Community Guidelines
                </span>
              </li>
              <li>
                <span className="hover:text-primary transition-colors cursor-pointer">
                  Anti-Scam Tips
                </span>
              </li>
              <li>
                <span className="hover:text-primary transition-colors cursor-pointer">
                  Report Suspicious Listing
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Ahmedabad Local SEO Neighborhoods Directory */}
        <div className="mt-10 pt-8 border-t border-slate-100">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            Popular Ahmedabad Locations for Flats & Flatmates (0% Brokerage):
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
            {localities.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => {
                  onSelectLocality(loc);
                  const el = document.getElementById('spaces');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-primary transition-colors underline decoration-slate-300 underline-offset-2 cursor-pointer"
              >
                Flats in {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Legal Copyright */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>© 2026 Flatemate. All rights reserved. Zero Brokerage Ahmedabad.</span>
          <span>Built for Ahmedabad shared living & roommate discovery.</span>
        </div>
      </div>
    </footer>
  );
};
