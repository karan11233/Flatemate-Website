import React from 'react';
import { Star } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const reviews = [
    {
      name: 'Aarav Patel',
      role: 'IT Engineer • Satellite',
      text: 'Found my current flatmate in Satellite within 24 hours of posting. Zero brokerage paid, and we connected directly on WhatsApp without annoying agent calls.',
      rating: 5,
    },
    {
      name: 'Nisha Desai',
      role: 'Design Student • Navrangpura',
      text: 'Moving to Ahmedabad for college was stressful until I used Flatemate. Saved over ₹18,000 in broker commission and found a wonderful, peaceful flat in Navrangpura.',
      rating: 5,
    },
    {
      name: 'Kabir Joshi',
      role: 'Healthcare Professional • SG Highway',
      text: 'Needed an urgent replacement when my roommate moved to Mumbai. Posted our 3BHK room on Flatemate and had 4 genuine WhatsApp inquiries on the same afternoon.',
      rating: 5,
    },
  ];

  return (
    <section className="bg-secondary py-14 lg:py-20 border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-accent px-3 py-1 rounded-full">
            Community Stories
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Loved by Ahmedabad Flatmates
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Real experiences from students and professionals who found their home without broker fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 mb-3 text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <span className="block text-sm font-bold text-slate-900 font-heading">
                  {rev.name}
                </span>
                <span className="text-xs text-slate-500">{rev.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
