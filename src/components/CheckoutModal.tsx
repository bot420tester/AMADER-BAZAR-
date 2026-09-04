import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Truck, CreditCard, Banknote, Smartphone, ArrowRight, Tag, ShieldCheck, FileText, ShoppingBag, Eye } from 'lucide-react';
import { CartItem, Order, DeliveryLocation, StoreSettings, CustomerUser } from '../types';
import { DEFAULT_STORE_SETTINGS } from '../data/mockData';
import { sendOrderNotificationEmail } from '../services/emailService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderSuccess: (newOrder: Order) => void;
  currency?: 'BDT' | 'USD';
  storeSettings?: StoreSettings;
  currentUser?: CustomerUser | null;
  onTrackOrder?: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderSuccess,
  storeSettings,
  currentUser,
  onTrackOrder,
}) => {
  const currentSettings = storeSettings || DEFAULT_STORE_SETTINGS;

  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || 'মো: রফিকুল ইসলাম',
    phone: currentUser?.phone || '01712-345678',
    email: currentUser?.email || 'customer@example.com',
    address: currentUser?.address || 'বাড়ি নং ৪২, রোড নং ১১, ধানমন্ডি',
    city: currentUser?.city || 'ঢাকা (Dhaka)',
    zipCode: '1209',
    notes: '',
  });

  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation>(
    currentUser?.deliveryLocation || 'dhaka'
  );
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'card' | 'nagad'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Whenever modal opens or closes, reset completedOrder so subsequent orders can be placed
  useEffect(() => {
    if (!isOpen) {
      setCompletedOrder(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setCompletedOrder(null);
    setIsSubmitting(false);
    onClose();
  };

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: currentUser.fullName || prev.fullName,
        phone: currentUser.phone || prev.phone,
        email: currentUser.email || prev.email,
        address: currentUser.address || prev.address,
        city: currentUser.city || prev.city,
      }));
      if (currentUser.deliveryLocation) {
        setDeliveryLocation(currentUser.deliveryLocation);
      }
    }
  }, [currentUser]);

  if (!isOpen) return null;

  // Subtotal in BDT
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Delivery charge calculation based on store settings (No 5000+ offer)
  const deliveryFee =
    deliveryLocation === 'dhaka'
      ? currentSettings.insideDhakaFee
      : currentSettings.outsideDhakaFee;
  const discount = 0;
  const total = subtotal + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const orderId = `AB-${Math.floor(10000 + Math.random() * 90000)}`;
      const trackingId = `TRK-${Math.floor(1000000 + Math.random() * 9000000)}BD`;

      const newOrder: Order = {
        orderId,
        trackingId,
        date: new Date().toISOString().split('T')[0],
        items: [...items],
        subtotal,
        deliveryLocation,
        deliveryFee,
        discount,
        total,
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          deliveryLocation,
        },
        paymentMethod,
        status: 'Processing',
        customerNote: formData.notes?.trim() || undefined,
        timeline: [
          {
            title: 'অর্ডার কনফার্মড (Order Confirmed)',
            description: 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে এবং প্রসেসিং শুরু হয়েছে।',
            time: 'এখনই',
            completed: true,
            current: true,
          },
          {
            title: 'প্যাকিং ও কোয়ালিটি চেক (QC Inspection)',
            description: 'পণ্যটি নিখুঁতভাবে কোয়ালিটি চেক করে প্রিমিয়াম প্যাকেজিং করা হচ্ছে।',
            time: 'আগামীকাল',
            completed: false,
          },
          {
            title: 'কুরিয়ারে হস্তান্তর (Dispatched to Courier)',
            description: 'দ্রুত ডেলিভারির জন্য এক্সপ্রেস কুরিয়ারে বুকিং সম্পন্ন।',
            time: '২য় দিন',
            completed: false,
          },
          {
            title: 'ডেলিভারি সম্পন্ন (Doorstep Delivery)',
            description: 'কাস্টমারের ঠিকানায় ক্যাশ অন ডেলিভারিতে হস্তান্তর।',
            time: '৩য়-৪র্থ দিন',
            completed: false,
          },
        ],
      };

      setCompletedOrder(newOrder);
      setIsSubmitting(false);
      onOrderSuccess(newOrder);

      // Send Email notification to admin via EmailJS
      sendOrderNotificationEmail(newOrder);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs transition-opacity"
      />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden z-10 border border-slate-200">
        
        {/* Header */}
        <div className="bg-[#07172b] text-white p-6 rounded-t-3xl flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold font-['Outfit',sans-serif]">
              {completedOrder ? 'অর্ডার সফল হয়েছে! 🎉' : 'নিরাপদ চেকআউট (Secure Checkout)'}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {completedOrder
                ? 'আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে'
                : 'আপনার তথ্য প্রদান করে অর্ডার কনফার্ম করুন'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ORDER SUCCESS SCREEN */}
        {completedOrder ? (
          <div className="p-6 sm:p-8 text-center space-y-5 max-h-[80vh] overflow-y-auto">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">
                ধন্যবাদ! আপনার অর্ডারটি নিশ্চিত করা হয়েছে
              </h3>
              <p className="text-sm text-slate-600">
                অর্ডার আইডি: <span className="font-mono font-bold text-slate-900">{completedOrder.orderId}</span>
              </p>
              <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 inline-block font-mono font-bold">
                পার্সেল ট্র্যাকিং কোড: {completedOrder.trackingId}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2.5 text-slate-700">
              <div className="flex justify-between font-semibold">
                <span>গ্রাহকের নাম:</span>
                <span>{completedOrder.shippingAddress.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span>মোবাইল নম্বর:</span>
                <span>{completedOrder.shippingAddress.phone}</span>
              </div>
              <div className="flex justify-between">
                <span>ঠিকানা:</span>
                <span>{completedOrder.shippingAddress.address}, {completedOrder.shippingAddress.city}</span>
              </div>
              <div className="flex justify-between">
                <span>পেমেন্ট মেথড:</span>
                <span className="uppercase font-bold text-slate-900">{completedOrder.paymentMethod}</span>
              </div>

              {/* Items in this completed order */}
              {completedOrder.items && completedOrder.items.length > 0 && (
                <div className="pt-2 border-t border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-900 block text-[11.5px]">অর্ডারকৃত পণ্যসমূহ:</span>
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                    {completedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-1.5 bg-white rounded-lg border border-slate-200/80">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-8 h-8 object-contain rounded bg-slate-50 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 text-[11px] truncate">{item.product.name}</p>
                          <p className="text-slate-500 text-[10px]">{item.quantity}টি × ৳{item.product.price.toLocaleString()}</p>
                        </div>
                        <span className="font-bold text-slate-900 text-[11px] shrink-0">৳{(item.quantity * item.product.price).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {completedOrder.customerNote && (
                <div className="flex flex-col gap-0.5 p-2 bg-amber-50/90 rounded-lg border border-amber-200 text-slate-800">
                  <span className="font-bold text-amber-900 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-amber-600" />
                    <span>বিশেষ নির্দেশনা (Customer Note):</span>
                  </span>
                  <span className="italic text-slate-600 pl-4">{completedOrder.customerNote}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-950">
                <span>মোট বিল (ক্যাশ অন ডেলিভারি):</span>
                <span className="text-amber-600">৳ {completedOrder.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl shadow cursor-pointer transition-all text-sm flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>আরও কেনাকাটা করুন / নতুন অর্ডার</span>
              </button>
              {onTrackOrder && (
                <button
                  type="button"
                  onClick={() => {
                    const orderToTrack = completedOrder;
                    handleClose();
                    onTrackOrder(orderToTrack);
                  }}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-4 h-4 text-slate-600" />
                  <span>অর্ডার ট্র্যাক করুন</span>
                </button>
              )}
            </div>
          </div>
        ) : items.length === 0 ? (
          /* Empty Cart State */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">আপনার কার্ট বর্তমানে খালি আছে</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                নতুন অর্ডার করার জন্য অনুগ্রহ করে আপনার পছন্দের পণ্যটি প্রথমে কার্টে যুক্ত করুন।
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow cursor-pointer"
            >
              কেনাকাটা শুরু করুন
            </button>
          </div>
        ) : (
          /* CHECKOUT FORM */
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            
            {/* Step 1: Delivery Location & Area Selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">
                  1
                </span>
                ডেলিভারি লোকেশন বেছে নিন (ডেলিভারি চার্জ ক্যালকুলেশন)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Dhaka Option */}
                <div
                  onClick={() => setDeliveryLocation('dhaka')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    deliveryLocation === 'dhaka'
                      ? 'border-amber-500 bg-amber-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">ঢাকা সিটি (Dhaka)</span>
                    <input
                      type="radio"
                      checked={deliveryLocation === 'dhaka'}
                      onChange={() => setDeliveryLocation('dhaka')}
                      className="accent-amber-500 w-4 h-4"
                    />
                  </div>
                  <div className="mt-2 text-xs text-slate-600 space-y-1">
                    <p className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-amber-600" />
                      <span>হোম ডেলিভারি চার্জ: <strong>৳{currentSettings.insideDhakaFee}</strong></span>
                    </p>
                    <span className="text-amber-800 font-bold text-[11px] block bg-amber-100/80 px-2 py-0.5 rounded w-fit">
                      ⚠️ ডেলিভারি চার্জ অগ্ৰীম দিতে হবে
                    </span>
                  </div>
                </div>

                {/* Outside Dhaka Option */}
                <div
                  onClick={() => setDeliveryLocation('outside_dhaka')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    deliveryLocation === 'outside_dhaka'
                      ? 'border-amber-500 bg-amber-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">ঢাকার বাইরে (Outside Dhaka)</span>
                    <input
                      type="radio"
                      checked={deliveryLocation === 'outside_dhaka'}
                      onChange={() => setDeliveryLocation('outside_dhaka')}
                      className="accent-amber-500 w-4 h-4"
                    />
                  </div>
                  <div className="mt-2 text-xs text-slate-600 space-y-1">
                    <p className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-amber-600" />
                      <span>কুরিয়ার ডেলিভারি চার্জ: <strong>৳{currentSettings.outsideDhakaFee}</strong></span>
                    </p>
                    <span className="text-amber-800 font-bold text-[11px] block bg-amber-100/80 px-2 py-0.5 rounded w-fit">
                      ⚠️ ডেলিভারি চার্জ অগ্ৰীম দিতে হবে
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Details */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">
                  2
                </span>
                ডেলিভারি ঠিকানা ও যোগাযোগের তথ্য
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    আপনার পূর্ণ নাম *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. মো: রফিকুল ইসলাম"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    মোবাইল নম্বর (সক্রিয় নম্বর দিন) *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    সম্পূর্ণ ডেলিভারি ঠিকানা (বাসা নং, রোড নং, এলাকা) *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. বাড়ি নং ৪২, রোড নং ১১, ব্লক ডি, ধানমন্ডি"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    শহর / জেলা *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. ঢাকা / চট্টগ্রাম / সিলেট"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ইমেইল (অর্ডার রসিদের জন্য)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@gmail.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Optional Order Note */}
                <div className="sm:col-span-2 pt-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-600" />
                      <span>অর্ডার নোট বা বিশেষ নির্দেশনা (Add Note)</span>
                    </label>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                      ঐচ্ছিক (Optional)
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="যেমন: ডেলিভারির পূর্বে কল করবেন, নির্দিষ্ট সময়ে ডেলিভারি দিন, অথবা গেটের সিকিউরিটির কাছে রাখবেন..."
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:border-amber-500 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">
                  3
                </span>
                পেমেন্ট মেথড বেছে নিন
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {/* Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-400 text-slate-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-amber-600" />
                  <span className="text-center">ক্যাশ অন ডেলিভারি</span>
                </button>

                {/* bKash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'bkash'
                      ? 'border-pink-500 bg-pink-50/50 ring-2 ring-pink-400 text-pink-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-pink-600" />
                  <span>বিকাশ (bKash)</span>
                </button>

                {/* Nagad */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'nagad'
                      ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-400 text-orange-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-orange-600" />
                  <span>নগদ (Nagad)</span>
                </button>

                {/* Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-400 text-blue-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span>কার্ড / ভিসা</span>
                </button>
              </div>
            </div>

            {/* Order Summary & Submit Button */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
              <div className="flex justify-between text-xs text-slate-600">
                <span>পণ্যের মোট মূল্য ({items.reduce((acc, i) => acc + i.quantity, 0)} টি আইটেম)</span>
                <span className="font-semibold text-slate-900">৳ {subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <Truck className="w-3.5 h-3.5 text-amber-600" />
                  <span>
                    ডেলিভারি চার্জ ({deliveryLocation === 'dhaka' ? 'ঢাকা সিটি' : 'ঢাকার বাইরে'})
                  </span>
                </span>
                <span className="font-bold text-slate-900">
                  ৳ {deliveryFee}
                </span>
              </div>

              {/* Advance Delivery Charge & Pre-Order Policy Alert */}
              <div className="text-[11.5px] text-amber-950 bg-amber-50 p-3 rounded-xl border border-amber-200/90 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <span>⚠️ ডেলিভারি চার্জ অগ্ৰীম দিতে হবে</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed font-normal">
                  এটি একটি প্রি-অর্ডার প্রডাক্ট। বাহির থেকে ইমপোর্ট হয়ে আসতে ৭-১০ কার্যদিবস সময় লাগবে।
                </p>
              </div>

              <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-slate-200">
                <span>সর্বমোট প্রদেয় বিল</span>
                <span className="text-amber-600 text-lg">৳ {total.toLocaleString()}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-extrabold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-base"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>অর্ডার কনফার্ম হচ্ছে...</span>
                  </div>
                ) : (
                  <>
                    <span>অর্ডার কনফার্ম করুন (৳ {total.toLocaleString()})</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
