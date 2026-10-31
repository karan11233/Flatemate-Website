import React from 'react';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section id="home" className="bg-secondary border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 lg:py-20 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Hero Copy */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-xs font-bold text-primary mb-5 shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span>AHMEDABAD&apos;S DIRECT FLAT & FLATMATES NETWORK</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 font-heading leading-[1.15]">
              Find Flats & Flatmates in Ahmedabad with{' '}
              <span className="text-primary">0% Brokerage</span>
            </h1>

            <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Browse verified vacant flats, room replacements, and roommate requirements across Ahmedabad. Connect directly on WhatsApp with zero brokerage.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <a
                href="#spaces"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-primary/95 transition-all cursor-pointer"
              >
                <span>Browse Ahmedabad Flats</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#list-space"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                <span>List Your Flat / Room</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="mt-10 pt-8 border-t border-slate-200/80 grid grid-cols-3 gap-3 sm:gap-6 text-center lg:text-left">
              <div>
                <span className="block text-xl sm:text-2xl font-black text-primary font-heading">
                  0%
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  Zero Brokerage
                </span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-black text-tertiary font-heading">
                  Direct
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  WhatsApp Connect
                </span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-black text-slate-900 font-heading">
                  Verified
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  Authentic Listings
                </span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md aspect-4/3 rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100">
              <Image
                src="/hero.png"
                alt="Flatmates in a shared apartment in Ahmedabad"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 backdrop-blur-xs px-2.5 py-1 text-[11px] font-bold text-white w-max mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% Broker-Free Zone</span>
                </div>
                <p className="text-sm font-bold">Satellite • Vastrapur • Prahlad Nagar</p>
                <p className="text-xs text-slate-200">Connect with genuine roommates in minutes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
