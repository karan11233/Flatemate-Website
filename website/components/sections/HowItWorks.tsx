import React from 'react';
import { Search, MessageSquare, KeyRound } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Find & Filter',
      desc: 'Browse verified vacant apartments, flatmate replacements, or roommate seekers filtered by Ahmedabad neighborhood and budget.',
      icon: Search,
    },
    {
      num: '02',
      title: 'Connect Directly',
      desc: 'No middleman or broker gatekeeping. Send an inquiry or tap to start an instant WhatsApp conversation directly with resident hosts.',
      icon: MessageSquare,
    },
    {
      num: '03',
      title: 'Move In 0% Brokerage',
      desc: 'Visit the flat, meet your potential roommates, finalize the rental agreement, and save 1–2 months of rent in broker fees.',
      icon: KeyRound,
    },
  ];

  return (
    <section id="how-it-works" className="bg-secondary py-14 lg:py-20 border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-accent px-3 py-1 rounded-full">
            Simple 3-Step Process
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            How Flatemate Works
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Finding your shared flat or flatmate in Ahmedabad is fast, direct, and 100% free of agent commissions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-primary">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-200 font-heading">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 font-heading">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
