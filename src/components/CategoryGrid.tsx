import React from 'react';
import { Smartphone, Shirt, Sparkles, Palmtree, LayoutGrid, ArrowRight } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';

interface CategoryGridProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  // Render custom icons matching the visual style in the reference image
  const renderCategoryIcon = (id: string) => {
    switch (id) {
      case 'electronics':
        return (
          <div className="relative w-16 h-16 rounded-full bg-[#e1f5fe] text-[#0288d1] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            <Smartphone className="w-8 h-8 stroke-[1.75]" />
            <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[9px] font-bold">
              ⚡
            </div>
          </div>
        );
      case 'fashion':
        return (
          <div className="relative w-16 h-16 rounded-full bg-[#e0f7fa] text-[#00838f] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            <Shirt className="w-8 h-8 stroke-[1.75]" />
            <div className="absolute top-1 right-2 w-2.5 h-2.5 rounded-full bg-amber-400" />
          </div>
        );
      case 'cosmetics':
        return (
          <div className="relative w-16 h-16 rounded-full bg-[#e8f5e9] text-[#2e7d32] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            <Sparkles className="w-8 h-8 stroke-[1.75]" />
            <div className="absolute bottom-1 right-2 w-3 h-3 rounded-full bg-emerald-500" />
          </div>
        );
      case 'home':
        return (
          <div className="relative w-16 h-16 rounded-full bg-[#e0f2f1] text-[#00695c] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            <Palmtree className="w-8 h-8 stroke-[1.75]" />
          </div>
        );
      case 'others':
        return (
          <div className="relative w-16 h-16 rounded-full bg-[#f3e8ff] text-[#7e22ce] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            <LayoutGrid className="w-8 h-8 stroke-[1.75]" />
            <div className="absolute top-1 right-2 w-2.5 h-2.5 rounded-full bg-purple-500" />
          </div>
        );
      default:
        return <Sparkles className="w-8 h-8 text-amber-500" />;
    }
  };

  return (
    <section className="py-8 px-4 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Shop by Category
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Browse top trending categories with guaranteed quality & express delivery
          </p>
        </div>

        {selectedCategory !== 'all' && (
          <button
            onClick={() => onSelectCategory('all')}
            className="text-xs md:text-sm font-semibold text-amber-600 hover:text-amber-700 underline cursor-pointer"
          >
            Clear Filter (Show All)
          </button>
        )}
      </div>

      {/* 4 Cards Grid matching Image */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              id={`category-card-${cat.id}`}
              onClick={() => onSelectCategory(isSelected ? 'all' : cat.id)}
              className={`relative bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 group border cursor-pointer ${
                isSelected
                  ? 'border-amber-500 ring-2 ring-amber-400/30 shadow-xl scale-[1.02]'
                  : 'border-slate-200/90 hover:border-slate-300 hover:shadow-lg hover:-translate-y-1'
              }`}
            >
              {/* Subtle top decorative dashed/dotted border line as seen in mockup */}
              <div className="absolute top-2 inset-x-8 h-[1px] bg-slate-100" />
              
              {/* Icon with soft circular backdrop */}
              <div className="mb-4 mt-1">
                {renderCategoryIcon(cat.id)}
              </div>

              {/* Category Title matching Screenshot */}
              <h3 className="font-bold text-slate-900 text-base md:text-lg group-hover:text-amber-600 transition-colors">
                {cat.name}
              </h3>

              {/* Category Subtitle matching Screenshot */}
              <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
                {cat.subtitle}
              </p>

              {/* Active check pill */}
              {isSelected && (
                <span className="mt-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                  Active Filter
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
