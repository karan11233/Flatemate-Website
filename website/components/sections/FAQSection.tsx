import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Is Flatemate really 100% free with zero brokerage?',
      a: 'Yes, Flatemate is completely free for both flat seekers and listers. We do not charge registration fees, listing fees, or any broker commission on rental deals.',
    },
    {
      q: 'How do I contact a host or flatmate in Ahmedabad?',
      a: 'Every listing includes a direct "Chat WhatsApp" button and an "Interested" form. Tapping WhatsApp opens a direct chat with the resident host, pre-filled with the listing details.',
    },
    {
      q: 'Can I post if I am looking for a flat, not offering one?',
      a: 'Absolutely! Switch to the "Seeker Post" tab in the listing form. You can specify your target move-in date, budget, preferred Ahmedabad localities, and lifestyle traits so hosts can discover and message you directly.',
    },
    {
      q: 'How do I mark my listing as rented or manage my inquiries?',
      a: 'Click "My Listings" in the top navigation bar. Enter the mobile number you used to post your listing to access your portal, view inbound tenant leads, and toggle status between Active and Rented in one click.',
    },
  ];

  return (
    <section className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-14 lg:py-20 lg:px-10">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Frequently Asked Questions
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          Everything you need to know about finding flats and roommates in Ahmedabad.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm sm:text-base font-bold text-slate-900 hover:text-primary transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-primary' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
