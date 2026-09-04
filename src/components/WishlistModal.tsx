import React from 'react';
import { X, Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  currency?: 'BDT' | 'USD';
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveFromWishlist,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  const formatPrice = (amount: number) => {
    return `৳ ${amount.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden z-10">
        
        {/* Header */}
        <div className="bg-[#07172b] text-white p-6 rounded-t-3xl flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h2 className="text-xl font-bold font-['Outfit',sans-serif]">
              My Wishlist ({items.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">আপনার উইশলিস্ট খালি আছে</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                পছন্দের প্রোডাক্টের হার্ট (❤️) আইকনে ক্লিক করে পরবর্তীতে কেনার জন্য সংরক্ষণ করে রাখুন!
              </p>
            </div>
          ) : (
            items.map((prod) => (
              <div
                key={prod.id}
                className="flex items-center justify-between gap-4 p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-all"
              >
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-16 h-16 object-contain rounded-xl bg-white p-1 border border-slate-200"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{prod.name}</h4>
                  <p className="text-xs font-extrabold text-amber-600 mt-0.5">
                    {formatPrice(prod.price)}
                  </p>
                  <span className="text-[10px] text-slate-400">SKU: {prod.sku}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onAddToCart(prod);
                      onRemoveFromWishlist(prod.id);
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Cart</span>
                  </button>

                  <button
                    onClick={() => onRemoveFromWishlist(prod.id)}
                    className="text-slate-400 hover:text-rose-500 p-2 transition-colors cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
