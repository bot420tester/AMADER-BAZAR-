import React, { useState, useEffect } from 'react';
import { Star, X, CheckCircle2, ShieldCheck, Sparkles, MessageSquare } from 'lucide-react';
import { ProductReview, CustomerUser } from '../types';
import { addOrUpdateReview } from '../data/reviewsStorage';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
  } | null;
  orderId?: string;
  currentUser: CustomerUser | null;
  initialReview?: ProductReview | null;
  onReviewSubmitted: (review: ProductReview) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  product,
  orderId,
  currentUser,
  initialReview,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialReview) {
      setRating(initialReview.rating);
      setComment(initialReview.comment);
      setName(initialReview.customerName);
    } else {
      setRating(5);
      setComment('');
      setName(currentUser?.fullName || '');
    }
    setIsSuccess(false);
    setError('');
  }, [initialReview, currentUser, isOpen]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('অনুগ্রহ করে পণ্যের কোয়ালিটি বা আপনার অভিজ্ঞতার বিবরণ লিখুন।');
      return;
    }
    if (!name.trim()) {
      setError('অনুগ্রহ করে আপনার নাম প্রদান করুন।');
      return;
    }

    const saved = addOrUpdateReview({
      productId: product.id,
      orderId: orderId || 'AB-VERIFIED',
      customerName: name.trim(),
      customerAvatar: currentUser?.avatar || '',
      customerPhone: currentUser?.phone || '',
      rating,
      comment: comment.trim(),
    });

    setIsSuccess(true);
    onReviewSubmitted(saved);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const getRatingLabel = (r: number) => {
    switch (r) {
      case 5:
        return 'অসাধারণ! সম্পূর্ণ সন্তুষ্ট (Excellent)';
      case 4:
        return 'খুব ভালো কোয়ালিটি (Very Good)';
      case 3:
        return 'মোটামুটি ভালো (Average)';
      case 2:
        return 'প্রত্যাশার চেয়ে কিছুটা কম (Below Average)';
      case 1:
        return 'একেবারেই ভালো নয় (Poor)';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#031122] via-[#07172b] to-[#0c2b52] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">পণ্য রিভিউ দিন (Write Review)</h3>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ভেরিফায়েড ক্রেতা • ডেলিভারি সম্পন্ন</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product summary snippet */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
          <img
            src={product.image}
            alt={product.name}
            className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 truncate">{product.name}</h4>
            <div className="text-[11px] text-amber-600 font-bold mt-0.5">৳{product.price.toLocaleString()}</div>
            {orderId && (
              <span className="inline-block text-[10px] text-slate-500 font-mono mt-0.5">
                অর্ডার নং: {orderId}
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {isSuccess ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900">ধন্যবাদ! আপনার রিভিউ জমা হয়েছে</h4>
              <p className="text-xs text-slate-500">
                আপনার মূল্যবান মতামত অন্যান্য ক্রেতাদের সঠিক পণ্য বেছে নিতে সাহায্য করবে।
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {error}
                </div>
              )}

              {/* Star Rating selector */}
              <div className="text-center py-2 space-y-1 bg-amber-50/50 rounded-2xl border border-amber-100 p-3">
                <label className="block text-xs font-bold text-slate-800">
                  আপনার রেটিং নির্বাচন করুন:
                </label>
                <div className="flex items-center justify-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            active
                              ? 'fill-amber-400 text-amber-500 drop-shadow-xs'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="text-xs font-bold text-amber-800 h-4">
                  {getRatingLabel(hoverRating || rating)}
                </div>
              </div>

              {/* Reviewer Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  আপনার নাম (Reviewer Name)*
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="আপনার নাম"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                    <span>আপনার মূল্যবান মতামত লিখুন (Your Review)*</span>
                  </span>
                  <span className="text-[10px] text-slate-400">ন্যূনতম ১০ অক্ষর</span>
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="পণ্যটির আসল কোয়ালিটি কেমন ছিল? সাইজ ও রঙের মিল আছে কিনা? ডেলিভারি অভিজ্ঞতা কেমন ছিল?..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:border-amber-500 focus:outline-none resize-none leading-relaxed"
                  required
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Star className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{initialReview ? 'রিভিউ আপডেট করুন' : 'রিভিউ পাবলিশ করুন'}</span>
                </button>
              </div>
            </>
          )}
        </form>

      </div>
    </div>
  );
};
