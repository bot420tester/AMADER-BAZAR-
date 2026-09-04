import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, ShieldCheck } from 'lucide-react';
import { CartItem, StoreSettings } from '../types';
import { DEFAULT_STORE_SETTINGS } from '../data/mockData';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  currency?: 'BDT' | 'USD';
  storeSettings?: StoreSettings;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  storeSettings,
}) => {
  if (!isOpen) return null;

  const currentSettings = storeSettings || DEFAULT_STORE_SETTINGS;
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="bg-[#07172b] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-lg font-['Outfit',sans-serif]">
                আপনার শপিং কার্ট ({items.reduce((acc, item) => acc + item.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery Policy & Pre-Order Notice (No 5000+ offer) */}
          <div className="bg-amber-50 border-b border-amber-200/80 px-6 py-3 space-y-1.5">
            <div className="flex items-start gap-2 text-xs text-amber-950 font-bold">
              <Truck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>ডেলিভারি চার্জ: ঢাকায় ৳{currentSettings.insideDhakaFee}, ঢাকার বাইরে ৳{currentSettings.outsideDhakaFee}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-amber-900 font-extrabold bg-amber-200/80 px-2 py-0.5 rounded w-fit">
              <span>⚠️ ডেলিভারি চার্জ অগ্ৰীম দিতে হবে</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-tight">
              এটি একটি প্রি-অর্ডার প্রডাক্ট। বাহির থেকে ইমপোর্ট হয়ে আসতে ৭-১০ কার্যদিবস সময় লাগবে।
            </p>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">আপনার কার্ট খালি</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  পছন্দের প্রোডাক্ট কার্টে যোগ করে অর্ডার করুন এখনই!
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-full text-sm shadow cursor-pointer"
                >
                  কেনাকাটা শুরু করুন
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3.5 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-18 h-18 object-contain rounded-lg bg-white p-1 border border-slate-200"
                  />

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                          {item.product.name}
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          SKU: {item.product.sku}
                        </span>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                        title="কার্ট থেকে মুছুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-extrabold text-slate-900 text-sm">
                          ৳ {(item.product.price * item.quantity).toLocaleString()}
                        </span>
                        {item.quantity > 1 && (
                          <div className="text-[10px] text-slate-400">
                            ৳ {item.product.price.toLocaleString()} প্রতিটি
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50 p-6 space-y-4">
              {/* Subtotal Calculation */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>পণ্যের মূল্য (Subtotal)</span>
                  <span className="font-semibold text-slate-900">৳ {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>ডেলিভারি চার্জ</span>
                  <span className="font-semibold text-slate-900">
                    চেকআউটে এলাকা নির্বাচন করুন
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-black text-slate-950 pt-2 border-t border-slate-200">
                  <span>সর্বমোট পণ্য মূল্য</span>
                  <span className="text-amber-600 text-lg">৳ {subtotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                id="cart-checkout-proceed-btn"
                onClick={onProceedToCheckout}
                className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-extrabold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-base"
              >
                <span>অর্ডার সম্পন্ন করতে এগিয়ে যান</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>নিরাপদ চেকআউট ও ক্যাশ অন ডেলিভারি</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
