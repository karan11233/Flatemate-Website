import React from 'react';
import { ShieldCheck, Sparkles, Heart, CheckCircle2, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top 3 Trust Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm mb-1">0% Brokerage Forever</h4>
              <p className="text-slate-400 leading-relaxed text-xs">
                Connect straight with verified house owners and current flatmates. Zero middleman commission fees.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm mb-1">2-Step Verified Profiles</h4>
              <p className="text-slate-400 leading-relaxed text-xs">
                Government ID checks, selfie matching, and phone OTP verification to keep you safe from spam and scams.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm mb-1">Active Response Policy</h4>
              <p className="text-slate-400 leading-relaxed text-xs">
                No ghosting! Dormant listings are automatically pruned. We showcase live response rates on every profile.
              </p>
            </div>
          </div>
        </div>

        {/* Links & Cities */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10">
          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Popular Cities</h5>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Flats in Bengaluru</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Flats in Mumbai</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Flats in Delhi NCR</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Flats in Pune</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Flats in Hyderabad</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Find Flatmates</h5>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Roommates in Koramangala</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Roommates in HSR Layout</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Roommates in Bandra West</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Roommates in Cyber City</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Roommates in Koregaon Park</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Trust & Security</h5>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Verification Process</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Zero Brokerage Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Digital Rent Agreement Help</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Scam Prevention Guide</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Community Guidelines</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Flatemate Web</h5>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              Building high-trust shared living. Discover authentic flats, schedule tours, and connect with like-minded people.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Safe & direct co-living</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div>
            © {new Date().getFullYear()} Flatemate Technologies. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
