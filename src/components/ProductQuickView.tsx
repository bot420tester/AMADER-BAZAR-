import React, { useState, useMemo } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Heart,
  RotateCcw,
  Check,
  Sparkles,
  MessageSquare,
  Lock,
  CheckCircle2,
  User,
} from 'lucide-react';
import { Product, CustomerUser, Order, StoreSettings } from '../types';
import { checkReviewEligibility, getReviewsForProduct } from '../data/reviewsStorage';

interface ProductQuickViewProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, variant?: Record<string, string>) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  currency?: 'BDT' | 'USD';
  currentUser?: CustomerUser | null;
  orders?: Order[];
  onWriteReview?: (product: Product, order?: Order) => void;
  storeSettings?: StoreSettings;
}

export const ProductQuickView: React.FC<ProductQuickViewProps> = ({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  currentUser = null,
  orders = [],
  onWriteReview,
  storeSettings,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product?.image || '');
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product?.variants?.forEach((v) => {
      if (v.options.length > 0) initial[v.type] = v.options[0];
    });
    return initial;
  });

  // Fetch verified reviews for this product
  const reviews = useMemo(() => {
    return product ? getReviewsForProduct(product.id) : [];
  }, [product?.id]);

  const averageRating = useMemo(() => {
    if (!product) return 5;
    if (reviews.length === 0) return product.rating || 5;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews, product?.rating]);

  // Check review eligibility for current user
  const eligibility = useMemo(() => {
    return product ? checkReviewEligibility(currentUser, product.id, orders) : { eligible: false, message: '' };
  }, [currentUser, product?.id, orders]);

  const formatPrice = (amount: number) => {
    return `৳ ${amount.toLocaleString()}`;
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden z-10">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left: Images */}
          <div className="bg-slate-50 p-6 flex flex-col items-center justify-center border-r border-slate-100">
            <div className="relative w-full aspect-square max-w-xs flex items-center justify-center">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply transition-all duration-300"
              />
              {product.badge && (
                <span className="absolute top-2 left-2 bg-amber-500 text-slate-950 font-extrabold text-xs px-2.5 py-1 rounded-full shadow">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.galleryImages && product.galleryImages.length > 1 && (
              <div className="flex gap-2 mt-4">
                {product.galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-14 rounded-lg bg-white p-1 border overflow-hidden transition-all ${
                      selectedImage === img
                        ? 'border-amber-500 ring-2 ring-amber-400/40'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info & Actions */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-4">
            
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="uppercase tracking-wider font-semibold text-amber-700">
                  {product.categoryLabel}
                </span>
                <span>SKU: {product.sku}</span>
              </div>

              <h2 className="text-xl md:text-2xl font-black text-slate-900 font-['Outfit',sans-serif]">
                {product.name}
              </h2>

              {/* Rating & Tab Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-1 border-t border-b border-slate-100 py-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-amber-600 transition-colors cursor-pointer"
                >
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.floor(Number(averageRating)) ? 'fill-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-slate-900">{averageRating}</span>
                  <span className="text-amber-600 underline">({reviews.length} রিভিউ)</span>
                </button>

                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('details')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      activeTab === 'details'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    বিবরণ
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('reviews')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      activeTab === 'reviews'
                        ? 'bg-white text-amber-700 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>রিভিউ</span>
                    <span className="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.2 rounded-full">
                      {reviews.length}
                    </span>
                  </button>
                </div>
              </div>

              {activeTab === 'details' ? (
                <>
                  {/* Price */}
                  <div className="flex items-baseline gap-3 mt-3">
                    <span className="text-2xl font-black text-amber-600">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-slate-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                    {product.originalPrice && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Save {(((product.originalPrice - product.price) / product.originalPrice) * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Variant Picker */}
                  {product.variants?.map((v) => (
                    <div key={v.type} className="mt-3">
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        {v.type}: <span className="font-normal text-slate-600">{selectedVariants[v.type]}</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {v.options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setSelectedVariants({ ...selectedVariants, [v.type]: opt })}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                              selectedVariants[v.type] === opt
                                ? 'border-amber-500 bg-amber-50 text-slate-900 font-bold'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Pre-order Delivery Time & Advance Delivery Charge Notice */}
                  <div className="mt-4 bg-amber-50/90 border border-amber-300 rounded-xl p-3.5 text-xs space-y-2.5 shadow-xs">
                    <div className="flex items-start gap-2.5 font-bold text-slate-900 leading-snug">
                      <Truck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-[13px] text-amber-950 font-semibold leading-relaxed">
                        {product.dropshipInfo?.estimatedDays &&
                        !product.dropshipInfo.estimatedDays.includes('১০-১২') &&
                        !product.dropshipInfo.estimatedDays.includes('৩-৫') &&
                        !product.dropshipInfo.estimatedDays.includes('3-5') &&
                        !product.dropshipInfo.estimatedDays.includes('চায়না')
                          ? product.dropshipInfo.estimatedDays
                          : 'এটি একটি প্রি-অর্ডার প্রডাক্ট। বাহির থেকে ইমপোর্ট হয়ে আসতে ৭-১০ কার্যদিবস সময় লাগবে।'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-200/80 text-[11px] text-amber-950 font-bold">
                      <span className="bg-amber-200/90 text-amber-950 px-2 py-0.5 rounded-md flex items-center gap-1">
                        ⚠️ ডেলিভারি চার্জ অগ্ৰীম দিতে হবে
                      </span>
                      <span className="text-slate-700 font-semibold bg-white/80 px-2 py-0.5 rounded border border-amber-200/60">
                        ঢাকা ৳{storeSettings?.insideDhakaFee ?? 100} • ঢাকার বাইরে ৳{storeSettings?.outsideDhakaFee ?? 150}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                /* REVIEWS TAB WITH STRICT ELIGIBILITY ENFORCEMENT */
                <div className="space-y-3 pt-2">
                  {/* Eligibility Banner */}
                  {eligibility.allowed ? (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>আপনি এই পণ্যটি ডেলিভারি পেয়েছেন! আপনার মূল্যবান অভিজ্ঞতা জানান:</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onWriteReview?.(product, eligibility.eligibleOrders[0]);
                          onClose();
                        }}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Star className="w-3.5 h-3.5 fill-white" />
                        <span>রিভিউ লিখুন / রেটিং দিন</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-950">
                        <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>রিভিউ দেওয়ার নিয়মাবলী</span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        {eligibility.reason}
                      </p>
                      <p className="text-[10px] text-amber-700 font-medium">
                        🛡️ আমাদের শপে ক্রেতাদের আস্থা রক্ষায় শুধুমাত্র পণ্যটি হাতে পাওয়ার পর (ডেলিভারি সম্পন্ন হলে) রিভিউ দেওয়ার সুযোগ রয়েছে।
                      </p>
                    </div>
                  )}

                  {/* Customer Reviews List */}
                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-2">
                    {reviews.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        এখনো কোনো রিভিউ জমা পড়েনি। পণ্যটি ক্রয় করে ডেলিভারি পাওয়ার পর প্রথম রিভিউ দিন!
                      </div>
                    ) : (
                      reviews.map((rev) => (
                        <div key={rev.id} className="pt-2 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {rev.customerAvatar ? (
                                <img
                                  src={rev.customerAvatar}
                                  alt={rev.customerName}
                                  className="w-6 h-6 rounded-full object-cover border border-slate-200"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                  {rev.customerName.charAt(0)}
                                </div>
                              )}
                              <span className="font-bold text-slate-900">{rev.customerName}</span>
                              <span className="inline-flex items-center gap-0.5 text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                ভেরিফায়েড ক্রেতা
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">{rev.createdAt}</span>
                          </div>

                          <div className="flex items-center gap-1 text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < rev.rating ? 'fill-amber-400' : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>

                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {rev.comment}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity & CTA Buttons */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-sm font-bold text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={() => {
                    onAddToCart(product, quantity, selectedVariants);
                    onClose();
                  }}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart • {formatPrice(product.price * quantity)}</span>
                </button>

                {/* Wishlist toggle */}
                <button
                  onClick={() => onToggleWishlist(product)}
                  className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                    isWishlisted
                      ? 'border-rose-300 bg-rose-50 text-rose-600'
                      : 'border-slate-200 text-slate-400 hover:text-rose-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
