import React, { useState, useMemo } from 'react';
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ShoppingBag,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  Tag,
  Calendar,
  Search,
  Hash,
  Navigation,
  Printer,
  X,
  RotateCcw,
  Sparkles,
  XCircle,
  Star,
  Lock,
  FileText,
} from 'lucide-react';
import { Order, CustomerUser, Product } from '../types';

interface AccountOrdersTabProps {
  orders: Order[];
  currentUser: CustomerUser | null;
  onTrackOrder: (order: Order) => void;
  onOpenShop?: () => void;
  onClose: () => void;
  onWriteReview?: (product: Product, order: Order) => void;
}

export const AccountOrdersTab: React.FC<AccountOrdersTabProps> = ({
  orders,
  currentUser,
  onTrackOrder,
  onOpenShop,
  onClose,
  onWriteReview,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [scopeFilter, setScopeFilter] = useState<'matched' | 'all'>('matched');

  // Copy code with feedback
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Match orders for the current user by phone or name
  const { matchedOrders, userOrders } = useMemo(() => {
    if (!currentUser) {
      return { matchedOrders: orders, userOrders: orders };
    }

    const cleanUserPhone = currentUser.phone ? currentUser.phone.replace(/[^0-9]/g, '') : '';
    const matched = orders.filter((o) => {
      const orderPhone = o.shippingAddress?.phone ? o.shippingAddress.phone.replace(/[^0-9]/g, '') : '';
      const phoneMatch = Boolean(
        cleanUserPhone &&
          orderPhone &&
          (orderPhone.endsWith(cleanUserPhone.slice(-8)) || cleanUserPhone.endsWith(orderPhone.slice(-8)))
      );
      const nameMatch = Boolean(
        currentUser.fullName &&
          o.shippingAddress?.fullName?.toLowerCase().trim() === currentUser.fullName.toLowerCase().trim()
      );
      return phoneMatch || nameMatch;
    });

    const activeList = scopeFilter === 'matched' && matched.length > 0 ? matched : orders;
    return { matchedOrders: matched, userOrders: activeList };
  }, [orders, currentUser, scopeFilter]);

  // Filter orders by search query and status
  const filteredOrders = useMemo(() => {
    return userOrders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        order.orderId.toLowerCase().includes(q) ||
        order.trackingId.toLowerCase().includes(q) ||
        order.items.some((item) => item.product.name.toLowerCase().includes(q)) ||
        order.shippingAddress.fullName.toLowerCase().includes(q) ||
        order.shippingAddress.city.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [userOrders, statusFilter, searchQuery]);

  // Analytics / KPI calculation
  const stats = useMemo(() => {
    const totalOrders = userOrders.length;
    const delivered = userOrders.filter((o) => o.status === 'Delivered').length;
    const inProgress = userOrders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
    const totalSpent = userOrders.filter((o) => o.status !== 'Cancelled').reduce((sum, o) => sum + o.total, 0);

    return { totalOrders, delivered, inProgress, totalSpent };
  }, [userOrders]);

  // Helper for Status UI Badge
  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Cancelled':
        return {
          label: 'অর্ডার বাতিল (Cancelled)',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          icon: <XCircle className="w-3.5 h-3.5" />,
          step: -1,
        };
      case 'Delivered':
        return {
          label: 'ডেলিভারি সম্পন্ন (Delivered)',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          step: 3,
        };
      case 'Out for Delivery':
        return {
          label: 'ডেলিভারির পথে (Out for Delivery)',
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          dot: 'bg-purple-500',
          icon: <MapPin className="w-3.5 h-3.5" />,
          step: 2.5,
        };
      case 'In Transit':
        return {
          label: 'ট্রানজিটে রয়েছে (In Transit)',
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          dot: 'bg-sky-500',
          icon: <Truck className="w-3.5 h-3.5" />,
          step: 2,
        };
      case 'Shipped':
        return {
          label: 'কুরিয়ারে পাঠানো হয়েছে (Shipped)',
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          dot: 'bg-indigo-500',
          icon: <Package className="w-3.5 h-3.5" />,
          step: 1,
        };
      case 'Processing':
      default:
        return {
          label: 'অর্ডার প্রসেসিং হচ্ছে (Processing)',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          icon: <Clock className="w-3.5 h-3.5" />,
          step: 0,
        };
    }
  };

  // Helper for Payment Method Badge
  const getPaymentBadge = (method: Order['paymentMethod']) => {
    switch (method) {
      case 'cod':
        return {
          label: 'ক্যাশ অন ডেলিভারি (COD)',
          icon: <Banknote className="w-3 h-3 text-emerald-600" />,
        };
      case 'bkash':
        return {
          label: 'বিকাশ পেমেন্ট (bKash)',
          icon: <Smartphone className="w-3 h-3 text-pink-600" />,
        };
      case 'nagad':
        return {
          label: 'নগদ পেমেন্ট (Nagad)',
          icon: <Smartphone className="w-3 h-3 text-orange-600" />,
        };
      case 'card':
        return {
          label: 'কার্ড পেমেন্ট (Card)',
          icon: <CreditCard className="w-3 h-3 text-blue-600" />,
        };
      default:
        return {
          label: method.toUpperCase(),
          icon: <CreditCard className="w-3 h-3 text-slate-600" />,
        };
    }
  };

  return (
    <div className="space-y-5">
      {/* Scope toggle banner if user has specific matched orders vs all orders */}
      {currentUser && matchedOrders.length > 0 && matchedOrders.length < orders.length && (
        <div className="flex items-center justify-between p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs">
          <span className="text-slate-700 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>আপনার প্রোফাইলের সাথে সরাসরি ম্যাচ করা অর্ডার ({matchedOrders.length} টি)</span>
          </span>
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-amber-200 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setScopeFilter('matched')}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                scopeFilter === 'matched' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              আমার অর্ডার ({matchedOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setScopeFilter('all')}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                scopeFilter === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              সবগুলো ({orders.length})
            </button>
          </div>
        </div>
      )}

      {/* KPI Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold mb-1">
            <span>মোট অর্ডার</span>
            <Package className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-lg font-black text-slate-900 font-mono">{stats.totalOrders} টি</div>
        </div>

        <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-2xl">
          <div className="flex items-center justify-between text-amber-900 text-[11px] font-semibold mb-1">
            <span>চলমান পার্সেল</span>
            <Truck className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-lg font-black text-amber-900 font-mono">{stats.inProgress} টি</div>
        </div>

        <div className="p-3 bg-emerald-50/60 border border-emerald-200/70 rounded-2xl">
          <div className="flex items-center justify-between text-emerald-900 text-[11px] font-semibold mb-1">
            <span>ডেলিভারি সম্পন্ন</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-lg font-black text-emerald-900 font-mono">{stats.delivered} টি</div>
        </div>

        <div className="p-3 bg-blue-50/60 border border-blue-200/70 rounded-2xl">
          <div className="flex items-center justify-between text-blue-900 text-[11px] font-semibold mb-1">
            <span>মোট ব্যয়</span>
            <Tag className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-lg font-black text-blue-950 font-mono">৳{stats.totalSpent.toLocaleString()}</div>
        </div>
      </div>

      {/* Search and Filter Row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="অর্ডার আইডি (#AB-...), ট্র্যাকিং আইডি বা পণ্যের নাম..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'সবগুলো' },
            { id: 'Processing', label: 'প্রসেসিং' },
            { id: 'Shipped', label: 'শিপড' },
            { id: 'In Transit', label: 'ট্রানজিট' },
            { id: 'Delivered', label: 'ডেলিভারড' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer text-[11px] ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-amber-400 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
          <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-500">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-700">কোনো অর্ডার পাওয়া যায়নি</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {searchQuery || statusFilter !== 'all'
              ? 'আপনার অনুসন্ধান ফিল্টারের সাথে কোনো অর্ডার মেলেনি। ফিল্টার রিসেট করে চেষ্টা করুন।'
              : 'আপনি এখনও কোনো অর্ডার প্লেস করেননি। আমাদের সেরা কালেকশন থেকে আপনার পছন্দের প্রোডাক্ট বেছে নিন।'}
          </p>
          {searchQuery || statusFilter !== 'all' ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="mt-1 text-xs font-bold text-amber-600 hover:underline cursor-pointer flex items-center gap-1 mx-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>ফিল্টার রিসেট করুন</span>
            </button>
          ) : (
            onOpenShop && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenShop();
                }}
                className="mt-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs shadow cursor-pointer transition-transform active:scale-95"
              >
                শপিং শুরু করুন
              </button>
            )
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusBadge(order.status);
            const paymentInfo = getPaymentBadge(order.paymentMethod);
            const isExpanded = expandedOrderId === order.orderId;
            const latestTimeline = order.timeline?.find((t) => t.current) || order.timeline?.[order.timeline.length - 1];

            return (
              <div
                key={order.orderId}
                className="rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs overflow-hidden"
              >
                {/* Top Order Header */}
                <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1 font-mono font-black text-xs text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                        <Hash className="w-3 h-3 text-amber-600" />
                        <span>{order.orderId}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(order.orderId, `order-${order.orderId}`)}
                          className="ml-1 text-slate-400 hover:text-slate-800 cursor-pointer"
                          title="অর্ডার আইডি কপি করুন"
                        >
                          {copiedCode === `order-${order.orderId}` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      {order.trackingId && (
                        <div className="flex items-center gap-1 font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                          <Navigation className="w-2.5 h-2.5 text-blue-600" />
                          <span>{order.trackingId}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(order.trackingId, `track-${order.trackingId}`)}
                            className="ml-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                            title="ট্র্যাকিং আইডি কপি করুন"
                          >
                            {copiedCode === `track-${order.trackingId}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-2.5 h-2.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>অর্ডারের তারিখ: {order.date}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        {paymentInfo.icon}
                        <span>{paymentInfo.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-extrabold px-3 py-1 rounded-full border flex items-center gap-1.5 shadow-2xs ${statusInfo.bg}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${statusInfo.dot} animate-pulse`} />
                      {statusInfo.icon}
                      <span>{statusInfo.label}</span>
                    </span>
                  </div>
                </div>

                {/* Progress Mini Stepper or Cancelled Alert */}
                {order.status === 'Cancelled' ? (
                  <div className="px-4 py-3 bg-rose-50 border-b border-rose-100 flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-rose-900">
                        অর্ডারটি বাতিল করা হয়েছে (Order Cancelled)
                      </div>
                      <p className="text-[11px] text-rose-700 leading-relaxed">
                        {order.cancelReason
                          ? `বাতিলের কারণ: ${order.cancelReason}`
                          : 'অর্ডারটি অ্যাডমিন কর্তৃক বাতিল করা হয়েছে। কোনো জিজ্ঞাসা থাকলে কাস্টমার সাপোর্টে যোগাযোগ করুন।'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-3 bg-white border-b border-slate-100">
                    <div className="relative flex items-center justify-between max-w-md mx-auto">
                      {/* Connecting Bar */}
                      <div className="absolute top-3 left-4 right-4 h-1 bg-slate-100 rounded-full z-0">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{
                            width:
                              statusInfo.step === 3
                                ? '100%'
                                : statusInfo.step === 2.5
                                ? '80%'
                                : statusInfo.step === 2
                                ? '60%'
                                : statusInfo.step === 1
                                ? '35%'
                                : '15%',
                          }}
                        />
                      </div>

                      {/* Step Nodes */}
                      {[
                        { idx: 0, title: 'অর্ডার প্লেসড', icon: Clock },
                        { idx: 1, title: 'প্যাকিং সম্পন্ন', icon: Package },
                        { idx: 2, title: 'ট্রানজিট', icon: Truck },
                        { idx: 3, title: 'ডেলিভারি', icon: CheckCircle2 },
                      ].map((step) => {
                        const isCompleted = statusInfo.step >= step.idx;
                        const isCurrent = Math.floor(statusInfo.step) === step.idx;
                        const StepIcon = step.icon;

                        return (
                          <div key={step.idx} className="relative z-10 flex flex-col items-center">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                                isCompleted
                                  ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-xs'
                                  : 'bg-white border-slate-300 text-slate-400'
                              }`}
                            >
                              <StepIcon className="w-3 h-3" />
                            </div>
                            <span
                              className={`text-[10px] mt-1 font-semibold whitespace-nowrap ${
                                isCurrent ? 'text-amber-700 font-bold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                              }`}
                            >
                              {step.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Latest Milestone Note */}
                    {latestTimeline && (
                      <div className="mt-2.5 text-[11px] bg-amber-50/70 border border-amber-100 text-amber-950 px-3 py-1.5 rounded-xl flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 truncate">
                          <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="font-bold shrink-0">বর্তমান আপডেট:</span>
                          <span className="truncate">{latestTimeline.title} - {latestTimeline.description}</span>
                        </div>
                        <span className="text-[10px] font-mono text-amber-800 shrink-0">{latestTimeline.time}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Items Purchased Section */}
                <div className="p-4 space-y-3">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                      <span>অর্ডারকৃত পণ্যসমূহ ({order.items.reduce((sum, i) => sum + i.quantity, 0)} টি আইটেম)</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      লোকেশন: {order.deliveryLocation === 'dhaka' ? 'ঢাকা সিটি' : 'ঢাকার বাইরে'}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50/40">
                    {order.items.map((item, idx) => {
                      const itemTotal = item.product.price * item.quantity;
                      const hasVariants = item.selectedVariant && Object.keys(item.selectedVariant).length > 0;

                      return (
                        <div key={idx} className="p-3 flex items-start gap-3 hover:bg-white transition-colors">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-14 h-14 object-contain rounded-xl border border-slate-200 bg-white p-1 shrink-0 shadow-2xs"
                          />

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <h5 className="text-xs font-bold text-slate-900 leading-snug truncate">
                                {item.product.name}
                              </h5>
                              <span className="text-xs font-mono font-extrabold text-slate-900 shrink-0">
                                ৳{itemTotal.toLocaleString()}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                              <span className="text-slate-500 font-mono">
                                ৳{item.product.price.toLocaleString()} × {item.quantity} টি
                              </span>

                              {item.product.sku && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-slate-400 text-[10px] font-mono">
                                    SKU: {item.product.sku}
                                  </span>
                                </>
                              )}

                              {item.product.categoryLabel && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span className="bg-slate-200/80 text-slate-700 text-[10px] font-semibold px-1.5 py-0.2 rounded">
                                    {item.product.categoryLabel}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Selected Variants */}
                            {hasVariants && (
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {Object.entries(item.selectedVariant!).map(([vKey, vVal]) => (
                                  <span
                                    key={vKey}
                                    className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-200"
                                  >
                                    {vKey}: {vVal}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Dropshipping / Estimated Delivery */}
                            {item.product.dropshipInfo && (
                              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Truck className="w-3 h-3 text-slate-400" />
                                <span>আনুমানিক ডেলিভারি সময়: {item.product.dropshipInfo.estimatedDays}</span>
                              </div>
                            )}

                            {/* Product Review Action - Only Allowed if Order is Delivered */}
                            <div className="pt-2 border-t border-slate-100 mt-2">
                              {order.status === 'Delivered' ? (
                                <button
                                  type="button"
                                  onClick={() => onWriteReview?.(item.product, order)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                                >
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                  <span>⭐ পণ্যটি পেয়েছেন? রিভিউ লিখুন</span>
                                </button>
                              ) : (
                                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-md border border-slate-100">
                                  <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>পণ্যটি হাতে পাওয়ার পর (ডেলিভারি সম্পন্ন হলে) রিভিউ দিতে পারবেন</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Expanded Details Section: Shipping Address, Pricing Breakdown & Complete Timeline */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {/* Shipping Address Box */}
                      <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                          <MapPin className="w-3.5 h-3.5 text-amber-600" />
                          <span>ডেলিভারি ঠিকানা ও প্রাপক</span>
                        </div>
                        <div className="text-slate-700 leading-relaxed text-[11px] space-y-0.5">
                          <p>
                            <strong>প্রাপক:</strong> {order.shippingAddress.fullName}
                          </p>
                          <p>
                            <strong>মোবাইল:</strong> {order.shippingAddress.phone}
                          </p>
                          <p>
                            <strong>ঠিকানা:</strong> {order.shippingAddress.address}
                          </p>
                          <p>
                            <strong>শহর/এলাকা:</strong> {order.shippingAddress.city}{' '}
                            {order.shippingAddress.zipCode ? `(${order.shippingAddress.zipCode})` : ''}
                          </p>
                          <p className="text-amber-800 font-semibold pt-0.5">
                            লোকেশন জোন: {order.deliveryLocation === 'dhaka' ? 'ঢাকা সিটি (৮০-১০০ টাকা)' : 'ঢাকার বাইরে (১৩০-১৫০ টাকা)'}
                          </p>
                          {order.customerNote && (
                            <div className="mt-2 p-2 bg-amber-50/80 rounded-lg border border-amber-200 text-amber-950 text-[11px] flex items-start gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <strong>কাস্টমার নোট:</strong> {order.customerNote}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Financials Breakdown Box */}
                      <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                          <Tag className="w-3.5 h-3.5 text-amber-600" />
                          <span>বিলিং ও মূল্য বিবরণ</span>
                        </div>
                        <div className="text-[11px] space-y-1 text-slate-600">
                          <div className="flex justify-between">
                            <span>পণ্যের সাবটোটাল:</span>
                            <span className="font-mono font-semibold text-slate-800">৳{order.subtotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>ডেলিভারি ফি:</span>
                            <span className="font-mono font-semibold text-slate-800">৳{order.deliveryFee.toLocaleString()}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between text-emerald-700 font-semibold">
                              <span>ডিসকাউন্ট:</span>
                              <span className="font-mono">-৳{order.discount.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-1 border-t border-slate-100 text-xs font-black text-slate-900">
                            <span>সর্বমোট প্রদেয় বিল:</span>
                            <span className="font-mono text-amber-600">৳{order.total.toLocaleString()}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 pt-0.5">
                            পেমেন্ট মেথড: {paymentInfo.label}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Complete Timeline Checkpoints */}
                    {order.timeline && order.timeline.length > 0 && (
                      <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 pb-1 border-b border-slate-100 text-xs">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>সম্পূর্ণ ট্র্যাকিং ও ডেলিভারি মাইলস্টোন</span>
                        </div>
                        <div className="space-y-2.5 pt-1">
                          {order.timeline.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-2.5 text-[11px]">
                              <div
                                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[9px] ${
                                  step.completed
                                    ? 'bg-emerald-500 text-white'
                                    : step.current
                                    ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                                    : 'bg-slate-200 text-slate-400'
                                }`}
                              >
                                {step.completed ? '✓' : sIdx + 1}
                              </div>
                              <div className="flex-1">
                                <div className="font-bold text-slate-800 flex items-center justify-between">
                                  <span>{step.title}</span>
                                  <span className="font-mono text-[10px] text-slate-400 font-normal">{step.time}</span>
                                </div>
                                <p className="text-slate-500 text-[10.5px] leading-tight">{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Bar: Bill & Actions */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-slate-500 text-[11px] block">মোট বিল:</span>
                      <span className="text-base font-black text-slate-900 font-mono">
                        ৳{order.total.toLocaleString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.orderId)}
                      className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                    >
                      <span>{isExpanded ? 'সংক্ষিপ্ত করুন' : 'বিস্তারিত বিবরণ'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Invoice View Action */}
                    <button
                      type="button"
                      onClick={() => setInvoiceOrder(order)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      title="অর্ডারের ইনভয়েস / ক্যাশ মেমো দেখুন"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>রশিদ / ইনভয়েস</span>
                    </button>

                    {/* Live Tracking Action */}
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onTrackOrder(order);
                      }}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>লাইভ ট্র্যাক</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Modal Preview */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-60 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 font-['Outfit',sans-serif] text-base flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-amber-600" />
                  <span>Amader Bazar Official Invoice</span>
                </h3>
                <p className="text-[11px] text-slate-500">অনলাইন অর্ডার ক্যাশ মেমো ও রসিদ</p>
              </div>
              <button
                type="button"
                onClick={() => setInvoiceOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-3 bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block">অর্ডার আইডি:</span>
                  <strong className="font-mono text-slate-900">#{invoiceOrder.orderId}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">ট্র্যাকিং আইডি:</span>
                  <strong className="font-mono text-slate-900">{invoiceOrder.trackingId}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">তারিখ:</span>
                  <span className="text-slate-800">{invoiceOrder.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">পেমেন্ট মেথড:</span>
                  <span className="font-semibold text-slate-800">{invoiceOrder.paymentMethod.toUpperCase()}</span>
                </div>
              </div>

              <div className="border-t border-slate-200/80 pt-2 text-[11px] space-y-0.5">
                <span className="text-slate-400 block">ডেলিভারি প্রাপক ও ঠিকানা:</span>
                <div className="text-slate-800 font-medium">
                  {invoiceOrder.shippingAddress.fullName} • {invoiceOrder.shippingAddress.phone}
                </div>
                <div className="text-slate-600">
                  {invoiceOrder.shippingAddress.address}, {invoiceOrder.shippingAddress.city}
                </div>
              </div>
            </div>

            {/* Items Table in Invoice */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-700 grid grid-cols-12 text-[11px]">
                <span className="col-span-7">পণ্য বিবরণ</span>
                <span className="col-span-2 text-center">পরিমাণ</span>
                <span className="col-span-3 text-right">মূল্য</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {invoiceOrder.items.map((item, idx) => (
                  <div key={idx} className="px-3 py-2 grid grid-cols-12 text-[11px] items-center">
                    <div className="col-span-7 pr-2">
                      <div className="font-semibold text-slate-800 truncate">{item.product.name}</div>
                      {item.selectedVariant && (
                        <div className="text-[10px] text-slate-500">
                          {Object.entries(item.selectedVariant)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="col-span-2 text-center text-slate-600 font-mono">
                      {item.quantity}
                    </div>
                    <div className="col-span-3 text-right font-mono font-semibold text-slate-800">
                      ৳{(item.product.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 px-3 py-2 border-t border-slate-200 text-[11px] space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>সাবটোটাল:</span>
                  <span className="font-mono">৳{invoiceOrder.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>ডেলিভারি চার্জ:</span>
                  <span className="font-mono">৳{invoiceOrder.deliveryFee.toLocaleString()}</span>
                </div>
                {invoiceOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>ডিসকাউন্ট:</span>
                    <span className="font-mono">-৳{invoiceOrder.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-black text-slate-900 pt-1 border-t border-slate-200">
                  <span>সর্বমোট বিল:</span>
                  <span className="font-mono text-amber-600">৳{invoiceOrder.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট করুন (Print)</span>
              </button>
              <button
                type="button"
                onClick={() => setInvoiceOrder(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
