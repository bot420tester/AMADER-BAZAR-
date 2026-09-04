import React from 'react';
import { Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';

export const TrustBar: React.FC = () => {
  return (
    <div className="bg-[#07172b] text-slate-200 border-t border-slate-800/80 py-4 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-16 text-xs sm:text-sm font-medium tracking-wide">
        
        {/* Pre-Order Delivery */}
        <div className="flex items-center gap-2 hover:text-amber-400 transition-colors">
          <Truck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>প্রি-অর্ডার ডেলিভারি (৭-১০ কার্যদিবস)</span>
        </div>

        <span className="hidden sm:inline text-slate-700">•</span>

        {/* Advance Delivery Charge */}
        <div className="flex items-center gap-2 hover:text-amber-400 transition-colors">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>ডেলিভারি চার্জ অগ্ৰীম</span>
        </div>

        <span className="hidden sm:inline text-slate-700">•</span>

        {/* 30-Day Returns */}
        <div className="flex items-center gap-2 hover:text-amber-400 transition-colors">
          <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
          <span>30-Day Returns</span>
        </div>

        <span className="hidden sm:inline text-slate-700">•</span>

        {/* 24/7 Support */}
        <div className="flex items-center gap-2 hover:text-amber-400 transition-colors">
          <Headphones className="w-4 h-4 text-amber-400 shrink-0" />
          <span>24/7 Support</span>
        </div>

      </div>
    </div>
  );
};
