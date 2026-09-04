import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Flame, Tag, Truck } from 'lucide-react';
import { StoreSettings } from '../types';

interface HeroBannerProps {
  onShopNow: () => void;
  onExploreDeals: () => void;
  storeSettings?: StoreSettings;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onShopNow, onExploreDeals, storeSettings }) => {
  const insideFee = storeSettings?.insideDhakaFee ?? 100;
  const outsideFee = storeSettings?.outsideDhakaFee ?? 150;

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#031122] via-[#081f3b] to-[#0c2b52] text-white py-10 md:py-16 px-4 lg:px-8 border-b border-slate-800 shadow-2xl">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* Left Content Column */}
        <div className="lg:col-span-6 flex flex-col items-start space-y-5">
          
          {/* Top special delivery pill */}
          <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs px-3.5 py-1.5 rounded-full font-bold shadow-sm">
            <Truck className="w-4 h-4 text-amber-400" />
            <span>ঢাকায় ডেলিভারি ৳{insideFee} | ঢাকার বাইরে ৳{outsideFee} • ডেলিভারি চার্জ অগ্ৰীম দিতে হবে</span>
          </div>

          {/* Main Title matching Screenshot */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-['Outfit',sans-serif] font-black tracking-tight text-white leading-[1.1]">
            Best Deals. <br className="hidden sm:inline" />
            Smart Shopping.
          </h1>

          {/* Subtitle */}
          <p className="text-amber-300 font-medium text-base sm:text-lg md:text-xl tracking-normal">
            সেরা মূল্যে বিশ্বমানের গ্যাজেট ও লাইফস্টাইল পণ্য — ক্যাশ অন ডেলিভারি সুবিধা
          </p>

          {/* CTA Button matching Screenshot: Solid Warm Orange Pill "Shop Now →" */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              id="hero-shop-now-btn"
              onClick={onShopNow}
              className="inline-flex items-center gap-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-3.5 rounded-full shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all text-base md:text-lg cursor-pointer"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-5 h-5 font-bold" />
            </button>

            <button
              onClick={onExploreDeals}
              className="inline-flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white font-semibold px-6 py-3 rounded-full border border-slate-700 text-sm cursor-pointer transition-all"
            >
              <Flame className="w-4 h-4 text-amber-400" />
              <span>ধামাকা অফার দেখুন</span>
            </button>
          </div>

          {/* Deal Badges Pill matching Screenshot: "Limited Time Deals • New Arrivals Daily" */}
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#08182b]/80 border border-slate-700/80 text-xs sm:text-sm font-medium text-slate-200 shadow-sm backdrop-blur-sm">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                Limited Time Deals
              </span>
              <span className="text-slate-500">•</span>
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                New Arrivals Daily
              </span>
            </div>
          </div>
        </div>

        {/* Right 3D Visual Composition matching Screenshot (Headphones, Cosmetics in Gold Rack, Succulent Ceramic Pot) */}
        <div className="lg:col-span-6 relative flex justify-center items-center">
          <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl bg-gradient-to-b from-slate-800/20 to-slate-900/60 p-4 border border-slate-700/40 shadow-2xl backdrop-blur-xs flex items-center justify-center overflow-hidden">
            
            {/* Ambient reflective floor plane */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#020b17] to-transparent" />
            
            {/* Visual Composition Image Stack */}
            <div className="relative w-full h-full flex items-center justify-center">
              
              {/* 1. Headphones Component */}
              <div className="absolute left-2 sm:left-4 bottom-6 sm:bottom-8 z-20 transition-transform duration-500 hover:scale-105">
                <div className="relative w-36 sm:w-44 h-36 sm:h-44 rounded-2xl bg-slate-900/40 p-2 shadow-2xl backdrop-blur-sm border border-amber-500/20">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80"
                    alt="Gold Edition Headphones"
                    className="w-full h-full object-contain filter drop-shadow-xl"
                  />
                  <div className="absolute -top-2 -left-2 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                    ৳ ২,৪৫০
                  </div>
                </div>
              </div>

              {/* 2. Cosmetics Bottle in Stand Component */}
              <div className="absolute z-30 -translate-y-2 sm:-translate-y-4 right-20 sm:right-28 transition-transform duration-500 hover:scale-105">
                <div className="relative w-32 sm:w-36 h-44 sm:h-52 rounded-2xl bg-slate-900/50 p-2.5 shadow-2xl border border-teal-500/30 backdrop-blur-sm flex flex-col items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80"
                    alt="Luxury Cosmetic Serum"
                    className="w-full h-full object-contain filter drop-shadow-2xl"
                  />
                  <div className="absolute -top-2 bg-teal-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                    ৳ ৯৫০
                  </div>
                </div>
              </div>

              {/* 3. Ceramic Succulent Planter Pot Component */}
              <div className="absolute right-2 sm:right-4 bottom-4 sm:bottom-6 z-20 transition-transform duration-500 hover:scale-105">
                <div className="relative w-28 sm:w-36 h-28 sm:h-36 rounded-2xl bg-slate-900/40 p-2 shadow-2xl backdrop-blur-sm border border-slate-700/60">
                  <img
                    src="https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&auto=format&fit=crop&q=80"
                    alt="Ceramic Minimalist Pot"
                    className="w-full h-full object-contain filter drop-shadow-lg"
                  />
                  <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                    ৳ ৬৫০
                  </div>
                </div>
              </div>

              {/* Floating Verified Trust Tag */}
              <div className="absolute top-4 right-4 bg-[#0a1f38]/90 border border-amber-400/40 text-amber-300 text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-md">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Verified Direct-to-Door</span>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
