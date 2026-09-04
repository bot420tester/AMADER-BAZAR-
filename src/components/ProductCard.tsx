import React from 'react';
import { Star, Eye, Heart, ShoppingBag, Truck } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  currency?: 'BDT' | 'USD';
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onQuickView,
  onToggleWishlist,
  isWishlisted,
  index = 0,
}) => {
  const formatPrice = (price: number) => {
    return `৳ ${price.toLocaleString()}`;
  };

  // Badge styling matching the screenshot
  const renderBadge = () => {
    if (!product.badge) return null;

    let badgeClasses = 'bg-amber-500 text-white';
    if (product.badge === 'BESTSELLER' || product.badge === 'NEW') {
      badgeClasses = 'bg-[#0f4c5c] text-white';
    } else if (product.badge === '25% OFF') {
      badgeClasses = 'bg-[#f59e0b] text-slate-950 font-black';
    } else if (product.badge === 'TRENDING') {
      badgeClasses = 'bg-[#e67e22] text-white font-bold';
    }

    return (
      <span
        className={`text-[11px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full shadow-sm ${badgeClasses}`}
      >
        {product.badge}
      </span>
    );
  };

  // Render star ratings
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.4;
    return (
      <div className="flex items-center gap-0.5 text-amber-500">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />;
          } else if (i === fullStars && hasHalf) {
            return (
              <div key={i} className="relative">
                <Star className="w-3.5 h-3.5 text-slate-300" />
                <div className="absolute inset-0 overflow-hidden w-1/2">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>
              </div>
            );
          }
          return <Star key={i} className="w-3.5 h-3.5 text-slate-300" />;
        })}
      </div>
    );
  };

  return (
    <motion.div
      id={`product-card-${product.id}`}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: 0.5,
        delay: (index % 4) * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Top Bar inside Card: Badges and Wishlist Button */}
      <div className="flex items-center justify-between w-full mb-2 z-10">
        <div>{renderBadge()}</div>
        
        {/* Wishlist toggle button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          aria-label="Toggle Wishlist"
          className={`p-1.5 rounded-full transition-colors cursor-pointer ${
            isWishlisted
              ? 'text-rose-500 bg-rose-50'
              : 'text-slate-400 hover:text-rose-500 hover:bg-slate-50'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Product Image Area with Quick View overlay */}
      <div
        onClick={() => onQuickView(product)}
        className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-2 cursor-pointer group/img"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain mix-blend-multiply group-hover/img:scale-108 transition-transform duration-500"
          loading="lazy"
        />

        {/* Quick View Floating Pill */}
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white/95 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 backdrop-blur-xs hover:scale-105 transition-transform">
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </span>
        </div>
      </div>

      {/* Content Area matching screenshot */}
      <div className="pt-4 flex flex-col items-center text-center">
        
        {/* Title matching screenshot */}
        <h4
          onClick={() => onQuickView(product)}
          className="font-bold text-slate-900 text-base sm:text-lg hover:text-amber-600 transition-colors line-clamp-1 cursor-pointer w-full"
          title={product.name}
        >
          {product.name}
        </h4>

        {/* Rating and Price Row matching Screenshot */}
        <div className="flex items-center justify-center gap-2 mt-1.5 text-xs sm:text-sm font-semibold text-slate-700">
          <span>{product.rating}</span>
          {renderStars(product.rating)}
          <span className="text-slate-500">
            {product.id === 'prod-1' ? `(${product.reviewCount})` : formatPrice(product.price)}
          </span>
        </div>

        {/* Extra price information for prod-1 and standard pricing */}
        {product.id === 'prod-1' && (
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-extrabold text-slate-900 text-sm sm:text-base">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        )}

        {product.id !== 'prod-1' && product.originalPrice && (
          <div className="text-[11px] text-slate-400 line-through mt-0.5">
            MSRP: {formatPrice(product.originalPrice)}
          </div>
        )}

        {/* Pre-order Delivery Time & Advance Delivery Charge Notice */}
        <div className="mt-3 w-full bg-amber-50/80 border border-amber-200/90 rounded-xl p-2.5 text-left space-y-1.5">
          <div className="flex items-start gap-1.5 text-[11px] text-slate-800 leading-snug">
            <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span className="font-medium text-slate-800">
              {product.dropshipInfo?.estimatedDays &&
              !product.dropshipInfo.estimatedDays.includes('১০-১২') &&
              !product.dropshipInfo.estimatedDays.includes('৩-৫') &&
              !product.dropshipInfo.estimatedDays.includes('3-5') &&
              !product.dropshipInfo.estimatedDays.includes('চায়না')
                ? product.dropshipInfo.estimatedDays
                : 'এটি একটি প্রি-অর্ডার প্রডাক্ট। বাহির থেকে ইমপোর্ট হয়ে আসতে ৭-১০ কার্যদিবস সময় লাগবে।'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10.5px] text-amber-900 font-bold border-t border-amber-200/60 pt-1">
            <span className="text-amber-800">ডেলিভারি চার্জ অগ্ৰীম দিতে হবে</span>
            <span className="text-slate-500 font-normal">ঢাকা ৳১০০ • বাইরে ৳১৫০</span>
          </div>
        </div>
      </div>

      {/* "Add to Cart" Button matching Screenshot: Solid Warm Orange Rounded Button */}
      <div className="pt-4 mt-auto">
        <button
          id={`add-to-cart-${product.id}`}
          onClick={() => onAddToCart(product)}
          className="w-full bg-[#f59e0b] hover:bg-[#d97706] active:bg-[#b45309] text-slate-950 font-bold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Add to Cart</span>
        </button>
      </div>
    </motion.div>
  );
};
