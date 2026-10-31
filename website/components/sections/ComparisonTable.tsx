import React from 'react';
import { Check, X } from 'lucide-react';

export const ComparisonTable: React.FC = () => {
  const comparisons = [
    {
      feature: 'Brokerage / Commission Fee',
      traditional: '1 to 2 Months Rent (₹15,000–₹35,000)',
      flatemate: '₹0 (Always Free Forever)',
      flatemateWins: true,
    },
    {
      feature: 'Direct WhatsApp Contact',
      traditional: 'Blocked by broker middlemen',
      flatemate: '1-Click Direct WhatsApp with Host',
      flatemateWins: true,
    },
    {
      feature: 'Listing Authenticity',
      traditional: 'Recycled, bait-and-switch photos',
      flatemate: 'Verified photos & active profiles',
      flatemateWins: true,
    },
    {
      feature: 'Time to Connect',
      traditional: '3 to 7 Days of scheduling delays',
      flatemate: 'Under 5 Minutes response time',
      flatemateWins: true,
    },
  ];

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-14 lg:py-20 lg:px-10">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Why Flatemate vs Traditional Brokers
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          Save thousands of rupees in brokerage fees and connect with genuine roommates in Ahmedabad.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs max-w-4xl mx-auto">
        <div className="grid grid-cols-12 bg-slate-100/80 p-4 sm:p-5 text-xs sm:text-sm font-bold text-slate-800 border-b border-slate-200">
          <div className="col-span-5 sm:col-span-6">Comparison</div>
          <div className="col-span-3 sm:col-span-3 text-slate-500">Brokers</div>
          <div className="col-span-4 sm:col-span-3 text-primary font-extrabold">Flatemate</div>
        </div>

        <div className="divide-y divide-slate-100 text-xs sm:text-sm">
          {comparisons.map((row, idx) => (
            <div key={idx} className="grid grid-cols-12 p-4 sm:p-5 items-center hover:bg-slate-50/50 transition-colors">
              <div className="col-span-5 sm:col-span-6 font-semibold text-slate-800">
                {row.feature}
              </div>
              <div className="col-span-3 sm:col-span-3 flex items-center gap-1.5 text-slate-500 text-xs sm:text-sm">
                <X className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="truncate">{row.traditional}</span>
              </div>
              <div className="col-span-4 sm:col-span-3 flex items-center gap-1.5 font-bold text-emerald-700 text-xs sm:text-sm">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{row.flatemate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
