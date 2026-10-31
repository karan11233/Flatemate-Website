import React from 'react';
import { ArrowRight } from 'lucide-react';

export const PreFooterCTA: React.FC = () => {
  return (
    <section className="mx-4 sm:mx-6 lg:mx-10 mb-14 lg:mb-20">
      <div className="rounded-2xl bg-gradient-to-r from-primary to-indigo-700 p-8 sm:p-12 text-center text-white shadow-xl max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-4xl font-extrabold font-heading max-w-2xl mx-auto leading-tight">
          Ready to Find Your Next Flat or Roommate in Ahmedabad?
        </h2>
        <p className="mt-3 text-sm sm:text-base text-indigo-100 max-w-xl mx-auto">
          Skip high agent commissions. Browse verified flats or post your room requirement in under two minutes.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#spaces"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-xs sm:text-sm font-bold text-primary shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <span>Browse Ahmedabad Feed</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#list-space"
            className="rounded-xl border border-white/40 bg-white/10 backdrop-blur-xs px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            Post Your Space Free
          </a>
        </div>
      </div>
    </section>
  );
};
