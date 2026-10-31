import React from 'react';
import { Home, Users, Search, ArrowRight } from 'lucide-react';
import { ListingCategory } from '../../types';

interface CategoryCardsProps {
  onSelectCategory: (category: ListingCategory | 'all') => void;
}

export const CategoryCards: React.FC<CategoryCardsProps> = ({ onSelectCategory }) => {
  const categories = [
    {
      id: 'fresh' as ListingCategory,
      title: 'Vacant Flats & Rooms',
      desc: 'Browse entire 1BHK, 2BHK, 3BHK flats or vacant private rooms available for rent directly from owners or primary tenants.',
      tag: 'Full Properties',
      icon: Home,
      iconBg: 'bg-indigo-50 text-primary border-indigo-100',
    },
    {
      id: 'replacement' as ListingCategory,
      title: 'Flatmate Replacements',
      desc: 'Occupants looking for a flatmate replacement to share an existing furnished flat and split rent without agency fees.',
      tag: 'Roommate Openings',
      icon: Users,
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      id: 'seeker' as ListingCategory,
      title: 'Roommate Seekers',
      desc: 'Verified working professionals and students in Ahmedabad actively looking for flats or compatible flatmates.',
      tag: 'People Seeking Flats',
      icon: Search,
      iconBg: 'bg-amber-50 text-amber-700 border-amber-100',
    },
  ];

  return (
    <section id="discover" className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-12 lg:px-10">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Browse by What You Need
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          Choose a category to quickly filter available spaces and seekers in Ahmedabad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                const el = document.getElementById('spaces');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md hover:border-primary/40 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${cat.iconBg}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-full">
                    {cat.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors font-heading">
                  {cat.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {cat.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-primary">
                <span>View Ahmedabad Feed</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
