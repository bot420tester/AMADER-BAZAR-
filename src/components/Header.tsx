import React from 'react';
import { Search, User, Heart, ShoppingBag, Truck, Zap, X, ShieldCheck } from 'lucide-react';
import { StoreSettings, CustomerUser } from '../types';
import { AmaderBazarLogo } from './AmaderBazarLogo';

interface HeaderProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAccount: () => void;
  onOpenTrackOrder: () => void;
  onOpenAdmin: () => void;
  storeSettings: StoreSettings;
  currentUser?: CustomerUser | null;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenAccount,
  onOpenTrackOrder,
  onOpenAdmin,
  storeSettings,
  currentUser,
}) => {
  const navCategories = [
    { id: 'electronics', label: 'Electronics' },
    { id: 'fashion', label: "Women's Clothing" },
    { id: 'cosmetics', label: 'Cosmetics' },
    { id: 'home', label: 'Home Decor' },
    { id: 'others', label: 'অন্যান্য (Others)' },
    { id: 'offers', label: 'Offers' },
    { id: 'new', label: 'New Arrivals' },
  ];

  // Secret triple-tap / 3-click on logo to open Admin Control Center Login
  const logoClickCountRef = React.useRef(0);
  const logoLastClickTimeRef = React.useRef(0);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const now = Date.now();
    // If more than 1200ms elapsed since previous click, restart counter
    if (now - logoLastClickTimeRef.current > 1200) {
      logoClickCountRef.current = 1;
    } else {
      logoClickCountRef.current += 1;
    }
    logoLastClickTimeRef.current = now;

    // When clicked 3 times in quick succession: open Admin Control Center
    if (logoClickCountRef.current >= 3) {
      logoClickCountRef.current = 0;
      onOpenAdmin();
    } else {
      // Normal single/double click: navigate home & reset filters
      onSelectCategory('all');
      onSearchChange('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full shadow-lg">
      {/* 0. Top Delivery Offer & Announcement Strip */}
      <div className="bg-[#040d1a] text-amber-300 text-[11px] sm:text-xs py-1.5 px-4 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
            <Truck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-semibold text-slate-200">
              {storeSettings.announcement}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-amber-400/90 font-medium">
            <button
              onClick={onOpenTrackOrder}
              className="hover:text-amber-300 transition-colors cursor-pointer hidden sm:flex items-center gap-1"
            >
              <span>পার্সেল ট্র্যাকিং</span>
            </button>
            <span className="hidden sm:inline text-slate-700">•</span>
            <a
              href={`mailto:${storeSettings.contactEmail || 'amaderbazar.ab.ds@gmail.com'}`}
              className="text-slate-300 hover:text-amber-300 transition-colors flex items-center gap-1 font-sans"
            >
              <span>ই-মেইল: {storeSettings.contactEmail || 'amaderbazar.ab.ds@gmail.com'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 1. Main Brand & Search Bar (Deep Midnight Navy) */}
      <div className="bg-[#07172b] border-b border-slate-800/80 px-4 lg:px-8 py-3 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
          
          {/* Logo Section with Official Business Vector Logo - Triple Click Opens Admin Login */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <button
              id="logo-brand-btn"
              onClick={handleLogoClick}
              className="flex items-center gap-2.5 sm:gap-3 text-left group focus:outline-none cursor-pointer select-none"
              title={storeSettings.storeName}
            >
              {/* Official Business Logo Icon */}
              <div className="relative group-hover:scale-105 transition-transform duration-200">
                <AmaderBazarLogo size={46} />
              </div>

              {/* Logo Text */}
              <div className="flex flex-col">
                <span className="font-['Outfit',sans-serif] font-black text-xl md:text-2xl text-amber-400 tracking-wider leading-none drop-shadow-sm uppercase">
                  {storeSettings.storeName}
                </span>
                <span className="text-[10px] md:text-[11px] font-semibold text-slate-300 italic tracking-wider mt-0.5">
                  {storeSettings.tagline}
                </span>
              </div>
            </button>

            {/* Mobile Header Right Icons */}
            <div className="flex items-center gap-2.5 md:hidden">
              <button
                id="mobile-account-btn"
                onClick={onOpenAccount}
                className="relative p-2 text-slate-200 hover:text-amber-400 cursor-pointer"
                title="Account"
              >
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.fullName}
                    className="w-6 h-6 rounded-full object-cover border-2 border-amber-400"
                  />
                ) : (
                  <User className="w-5 h-5" />
                )}
                {currentUser && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full border border-slate-950" />
                )}
              </button>

              <button
                id="mobile-wishlist-btn"
                onClick={onOpenWishlist}
                className="relative p-2 text-slate-200 hover:text-amber-400 cursor-pointer"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 bg-rose-500 text-white font-bold text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button
                id="mobile-cart-btn"
                onClick={onOpenCart}
                className="relative p-2 text-slate-200 hover:text-amber-400 cursor-pointer"
                title="Cart"
              >
                <ShoppingBag className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-bold text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full md:flex-1 max-w-2xl relative">
            <div className="relative flex items-center">
              <input
                id="search-input-field"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="প্রোডাক্ট বা ক্যাটাগরি খুঁজুন (Search items, cosmetics, gadgets...)"
                className="w-full bg-[#10233b]/90 text-slate-100 text-sm placeholder-slate-400 rounded-full pl-5 pr-14 py-2.5 border border-slate-700/80 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-14 text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                id="search-submit-btn"
                className="absolute right-1 bg-amber-500 hover:bg-amber-400 text-slate-950 p-2 rounded-full transition-all flex items-center justify-center cursor-pointer shadow"
                title="Search"
              >
                <Search className="w-4 h-4 font-bold" />
              </button>
            </div>
          </div>

          {/* Action Icons (Account, Wishlist, Cart) */}
          <div className="hidden md:flex items-center gap-6 text-slate-200">
            {/* Currency Pill */}
            <div className="text-xs font-bold px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <span>৳ BDT</span>
            </div>

            {/* Customer Account Button */}
            <button
              id="account-header-btn"
              onClick={onOpenAccount}
              className="flex flex-col items-center gap-0.5 group hover:text-amber-400 transition-colors cursor-pointer relative"
              title={currentUser ? currentUser.fullName : 'Account / Login'}
            >
              <div className="relative">
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.fullName}
                    className="w-6 h-6 rounded-full object-cover border-2 border-amber-400 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
                {currentUser && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border border-slate-900 rounded-full" />
                )}
              </div>
              <span className="text-xs font-medium tracking-wide max-w-[85px] truncate">
                {currentUser ? currentUser.fullName.split(' ')[0] : 'Account'}
              </span>
            </button>

            {/* Wishlist */}
            <button
              id="wishlist-header-btn"
              onClick={onOpenWishlist}
              className="flex flex-col items-center gap-0.5 group hover:text-amber-400 transition-colors relative cursor-pointer"
              title="Wishlist"
            >
              <div className="relative">
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white font-bold text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium tracking-wide">Wishlist</span>
            </button>

            {/* Cart */}
            <button
              id="cart-header-btn"
              onClick={onOpenCart}
              className="flex flex-col items-center gap-0.5 group hover:text-amber-400 transition-colors relative cursor-pointer"
              title="Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-amber-500 text-slate-950 font-extrabold text-[11px] rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium tracking-wide">Cart</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Secondary Navigation Bar */}
      <div className="bg-[#051120] text-slate-300 px-4 lg:px-8 border-b border-slate-800/60 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <nav className="flex items-center gap-1 md:gap-8 min-w-max py-2.5 text-sm font-medium">
            <button
              id="nav-all-btn"
              onClick={() => onSelectCategory('all')}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'text-white font-bold border-b-2 border-amber-400'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              সকল প্রোডাক্ট (All Items)
            </button>

            {navCategories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`nav-cat-${cat.id}`}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`relative px-3 py-1 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'text-white font-bold'
                      : 'text-slate-300 hover:text-amber-300'
                  }`}
                >
                  {cat.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick utility delivery badges on right */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-slate-400">
            <button
              id="track-order-nav-btn"
              onClick={onOpenTrackOrder}
              className="flex items-center gap-1.5 hover:text-amber-300 transition-colors cursor-pointer bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50"
            >
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>অর্ডার ট্র্যাক করুন</span>
            </button>
            <div className="flex items-center gap-1 text-amber-400 font-semibold">
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
              <span>ফাস্ট এক্সপ্রেস ডেলিভারি</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
