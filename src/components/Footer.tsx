import React from 'react';
import { Truck, ShieldCheck, Mail } from 'lucide-react';
import { AmaderBazarLogo } from './AmaderBazarLogo';
import { StoreSettings } from '../types';

interface FooterProps {
  storeSettings: StoreSettings;
  onOpenTrackOrder: () => void;
  onOpenAdmin: () => void;
  onSelectCategory: (cat: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  storeSettings,
  onOpenTrackOrder,
  onOpenAdmin,
  onSelectCategory,
}) => {
  // Secret triple-tap / 3-click on logo to open Admin Control Center Login
  const logoClickCountRef = React.useRef(0);
  const logoLastClickTimeRef = React.useRef(0);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (now - logoLastClickTimeRef.current > 1200) {
      logoClickCountRef.current = 1;
    } else {
      logoClickCountRef.current += 1;
    }
    logoLastClickTimeRef.current = now;

    if (logoClickCountRef.current >= 3) {
      logoClickCountRef.current = 0;
      onOpenAdmin();
    } else {
      onSelectCategory('all');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#040d1a] text-slate-300 border-t border-slate-800/80 pt-12 pb-8 px-4 lg:px-8 mt-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800/70">
          
          {/* Col 1: Brand & Bio - Secret triple-click on logo opens Admin */}
          <div className="space-y-4">
            <button
              onClick={handleLogoClick}
              className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none select-none"
              title={storeSettings.storeName}
            >
              <div className="group-hover:scale-105 transition-transform">
                <AmaderBazarLogo size={46} />
              </div>
              <div className="flex flex-col">
                <span className="font-['Outfit',sans-serif] font-black text-xl text-amber-400 tracking-wider uppercase">
                  {storeSettings.storeName}
                </span>
                <span className="text-[11px] font-semibold text-slate-300 italic tracking-wider">
                  {storeSettings.tagline}
                </span>
              </div>
            </button>
            <p className="text-xs text-slate-400 leading-relaxed">
              বাংলাদেশের অন্যতম শীর্ষ ও নির্ভরযোগ্য অনলাইন শপিং প্ল্যাটফর্ম। প্রিমিয়াম কোয়ালিটির লাইফস্টাইল, ফ্যাশন, গ্যাজেট ও হোম অ্যাপ্লায়েন্স সরাসরি আপনার দোরগোড়ায়।
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>১০০% অথেনটিক প্রোডাক্ট ও ক্যাশ অন ডেলিভারি</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit',sans-serif] border-l-2 border-amber-500 pl-2">
              জনপ্রিয় ক্যাটাগরি
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onSelectCategory('electronics')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  ইলেকট্রনিক্স ও গ্যাজেটস (Electronics)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('fashion')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  মহিলাদের পোশাক ও ফ্যাশন (Women's Clothing)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('cosmetics')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  কসমেটিকস ও বিউটি কেয়ার (Cosmetics)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('home')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  হোম ডেকর ও লিভিং (Home Decor)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('all')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-amber-400 font-medium"
                >
                  সকল প্রোডাক্ট ব্রাউজ করুন →
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Shipping Policy */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit',sans-serif] border-l-2 border-amber-500 pl-2">
              কাস্টমার সাপোর্ট ও ডেলিভারি
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p className="flex items-center gap-1.5 text-slate-300">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>ঢাকায় হোম ডেলিভারি: <strong>৳{storeSettings.insideDhakaFee}</strong></span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-300">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>ঢাকার বাইরে ডেলিভারি: <strong>৳{storeSettings.outsideDhakaFee}</strong></span>
              </p>
              <div className="text-[11px] text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 leading-relaxed space-y-1">
                <p className="font-bold text-amber-400">
                  ⚠️ ডেলিভারি চার্জ অগ্ৰীম দিতে হবে
                </p>
                <p className="text-slate-300 text-[10.5px]">
                  এটি একটি প্রি-অর্ডার প্রডাক্ট। বাহির থেকে ইমপোর্ট হয়ে আসতে ৭-১০ কার্যদিবস সময় লাগবে।
                </p>
              </div>
              <button
                onClick={onOpenTrackOrder}
                className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2 flex items-center gap-1 cursor-pointer pt-1"
              >
                <span>লাইভ পার্সেল ট্র্যাকিং করুন →</span>
              </button>
            </div>
          </div>

          {/* Col 4: Contact Information (Only Email) */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit',sans-serif] border-l-2 border-amber-500 pl-2">
              অফিশিয়াল যোগাযোগ
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>কাস্টমার সাপোর্ট ই-মেইল</span>
                </div>
                <a
                  href={`mailto:${storeSettings.contactEmail || 'amaderbazar.ab.ds@gmail.com'}`}
                  className="text-slate-100 hover:text-amber-300 font-mono text-xs font-semibold block break-all transition-colors underline decoration-amber-500/40"
                >
                  {storeSettings.contactEmail || 'amaderbazar.ab.ds@gmail.com'}
                </a>
                <p className="text-[10.5px] text-slate-400">
                  যেকোনো প্রশ্ন, অর্ডার জিজ্ঞাসা বা সহায়তার জন্য আমাদের সরাসরি ইমেইল করুন। আমরা দ্রুত উত্তর দেব।
                </p>
              </div>

              {/* Payment Methods Badges */}
              <div className="pt-1">
                <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">
                  পেমেন্ট মেথড:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 bg-slate-800 text-[10px] font-bold text-pink-400 rounded border border-slate-700">
                    bKash
                  </span>
                  <span className="px-2 py-0.5 bg-slate-800 text-[10px] font-bold text-orange-400 rounded border border-slate-700">
                    Nagad
                  </span>
                  <span className="px-2 py-0.5 bg-slate-800 text-[10px] font-bold text-purple-400 rounded border border-slate-700">
                    Rocket
                  </span>
                  <span className="px-2 py-0.5 bg-slate-800 text-[10px] font-bold text-emerald-400 rounded border border-slate-700">
                    Cash On Delivery
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Strip - Completely clean with no admin mentions */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>
            © {new Date().getFullYear()} <strong className="text-slate-400">{storeSettings.storeName}</strong>. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">শর্তাবলী ও নিয়মাবলী (Terms & Conditions)</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">গোপনীয়তা নীতি (Privacy Policy)</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
