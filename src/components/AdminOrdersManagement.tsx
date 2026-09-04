import React, { useState } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Search,
  MapPin,
  Calendar,
  Save,
  Phone,
  User,
  Check,
  RefreshCw,
  PlusCircle,
  Filter,
  Eye,
  FileText,
  Trash2,
} from 'lucide-react';
import { Order } from '../types';

interface AdminOrdersManagementProps {
  orders: Order[];
  onUpdateOrder: (updatedOrder: Order) => void;
  onCancelOrder: (orderId: string, reason?: string) => void;
}

export const AdminOrdersManagement: React.FC<AdminOrdersManagementProps> = ({
  orders,
  onUpdateOrder,
  onCancelOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orders[0]?.orderId || null);

  // Milestone edit state for currently selected order
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');
  const [newMilestoneTime, setNewMilestoneTime] = useState('');

  // Cancellation modal state
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState('');

  // Editable tracking number
  const [editingTrackingId, setEditingTrackingId] = useState<string>('');
  const [isEditingTracking, setIsEditingTracking] = useState(false);

  // Notification message
  const [flashMessage, setFlashMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showFlash = (text: string, type: 'success' | 'error' = 'success') => {
    setFlashMessage({ text, type });
    setTimeout(() => setFlashMessage(null), 3500);
  };

  const selectedOrder = orders.find((o) => o.orderId === selectedOrderId) || orders[0] || null;

  // Filtered orders list
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.trackingId && order.trackingId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.shippingAddress.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shippingAddress.phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle direct status change
  const handleStatusChange = (newStatus: Order['status']) => {
    if (!selectedOrder) return;

    // Check if status is cancelled
    if (newStatus === 'Cancelled') {
      setOrderToCancel(selectedOrder);
      return;
    }

    const nowFormatted = new Date().toLocaleDateString('bn-BD', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const statusTitleMap: Record<Order['status'], string> = {
      Processing: 'অর্ডার প্রসেসিং হচ্ছে (Processing)',
      Shipped: 'আন্তর্জাতিক হাব থেকে শিপড (Shipped)',
      'In Transit': 'ট্রানজিট ও কাস্টমসে রয়েছে (In Transit)',
      'Out for Delivery': 'ডেলিভারির জন্য বের হয়েছে (Out for Delivery)',
      Delivered: 'সফলভাবে ডেলিভারি সম্পন্ন (Delivered)',
      Cancelled: 'অর্ডার বাতিল (Cancelled)',
    };

    const statusDescMap: Record<Order['status'], string> = {
      Processing: 'অর্ডারটি অ্যাডমিন প্যানেল থেকে কনফার্ম করা হয়েছে এবং প্রসেসিং চলছে।',
      Shipped: 'আন্তর্জাতিক গুদাম থেকে পণ্য প্যাকেজিং সম্পন্ন করে আন্তর্জাতিক ফ্লাইটে প্রেরণ করা হয়েছে।',
      'In Transit': 'পার্সেলটি বাংলাদেশ কাস্টমস ও সেন্ট্রাল সর্টিং হাবে ট্রানজিটে রয়েছে।',
      'Out for Delivery': 'ডেলিভারি রাইডার কাস্টমারের ঠিকানায় পার্সেল নিয়ে রওনা হয়েছে।',
      Delivered: 'কাস্টমার সফলভাবে পার্সেল গ্রহণ করেছেন ও মূল্য পরিশোধ হয়েছে।',
      Cancelled: 'অর্ডারটি বাতিল করা হয়েছে।',
    };

    // Update timeline
    const updatedTimeline = selectedOrder.timeline.map((step) => ({
      ...step,
      current: false,
    }));

    updatedTimeline.push({
      title: statusTitleMap[newStatus],
      description: statusDescMap[newStatus],
      time: nowFormatted,
      completed: true,
      current: true,
    });

    const updated: Order = {
      ...selectedOrder,
      status: newStatus,
      timeline: updatedTimeline,
    };

    onUpdateOrder(updated);
    showFlash(`অর্ডার #${selectedOrder.orderId} এর স্ট্যাটাস "${statusTitleMap[newStatus]}" এ আপডেট হয়েছে!`);
  };

  // Add custom timeline milestone
  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !newMilestoneTitle.trim()) return;

    const timeStr = newMilestoneTime.trim() || new Date().toLocaleDateString('bn-BD', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const updatedTimeline = selectedOrder.timeline.map((step) => ({
      ...step,
      current: false,
    }));

    updatedTimeline.push({
      title: newMilestoneTitle.trim(),
      description: newMilestoneDesc.trim() || 'অ্যাডমিন কর্তৃক ট্র্যাকিং লোকেশন আপডেট।',
      time: timeStr,
      completed: true,
      current: true,
    });

    const updated: Order = {
      ...selectedOrder,
      timeline: updatedTimeline,
    };

    onUpdateOrder(updated);
    setNewMilestoneTitle('');
    setNewMilestoneDesc('');
    setNewMilestoneTime('');
    showFlash('নতুন ট্র্যাকিং মাইলফলক সফলভাবে যোগ করা হয়েছে!');
  };

  // Save new tracking ID
  const handleSaveTrackingId = () => {
    if (!selectedOrder) return;
    const cleanId = editingTrackingId.trim().toUpperCase();
    if (!cleanId) return;

    const updated: Order = {
      ...selectedOrder,
      trackingId: cleanId,
    };

    onUpdateOrder(updated);
    setIsEditingTracking(false);
    showFlash(`ট্র্যাকিং আইডি ${cleanId} এ আপডেট করা হয়েছে!`);
  };

  // Confirm cancel order
  const handleConfirmCancel = () => {
    if (!orderToCancel) return;

    const reason = cancelReasonInput.trim() || 'অ্যাডমিন কর্তৃক অর্ডার বাতিল করা হয়েছে';
    onCancelOrder(orderToCancel.orderId, reason);
    setOrderToCancel(null);
    setCancelReasonInput('');
    showFlash(`অর্ডার #${orderToCancel.orderId} বাতিল (Cancelled) করা হয়েছে।`, 'error');
  };

  // Reactivate a cancelled order
  const handleReactivateOrder = (order: Order) => {
    const updatedTimeline = [
      ...order.timeline,
      {
        title: 'অর্ডার পুনরায় সক্রিয় করা হয়েছে (Reactivated)',
        description: 'অ্যাডমিন প্যানেল থেকে অর্ডারটি পুনরায় চালু করা হলো।',
        time: new Date().toLocaleDateString('bn-BD', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        completed: true,
        current: true,
      },
    ];

    const updated: Order = {
      ...order,
      status: 'Processing',
      cancelReason: undefined,
      timeline: updatedTimeline,
    };

    onUpdateOrder(updated);
    showFlash(`অর্ডার #${order.orderId} পুনরায় সক্রিয় করা হয়েছে!`);
  };

  return (
    <div className="space-y-4">
      {/* Flash notification banner */}
      {flashMessage && (
        <div
          className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between shadow-sm transition-all ${
            flashMessage.type === 'error'
              ? 'bg-rose-100 border border-rose-300 text-rose-800'
              : 'bg-emerald-100 border border-emerald-300 text-emerald-800'
          }`}
        >
          <span>{flashMessage.text}</span>
          <button
            type="button"
            onClick={() => setFlashMessage(null)}
            className="text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner Notice */}
      <div className="bg-slate-900 text-amber-400 p-3.5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
            🔒
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>অ্যাডমিন কন্ট্রোল: পার্সেল ট্র্যাকিং ও অর্ডার ব্যবস্থাপনা</span>
              <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md font-extrabold uppercase">
                Admin Only
              </span>
            </h4>
            <p className="text-[11px] text-slate-300">
              শুধুমাত্র অ্যাডমিন হিসেবে আপনি পার্সেলের প্রতিটি ধাপ ও লোকেশন আপডেট করতে পারেন এবং প্রয়োজনে অর্ডার বাতিল করতে পারেন।
            </p>
          </div>
        </div>
        <div className="text-xs bg-slate-800 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 whitespace-nowrap font-mono">
          মোট অর্ডার: <strong className="text-amber-400">{orders.length}</strong> টি
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="অর্ডার আইডি (#AB-...), ট্র্যাকিং কোড, কাস্টমার নাম বা মোবাইল নম্বর..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'সবগুলো' },
            { id: 'Processing', label: 'প্রসেসিং' },
            { id: 'Shipped', label: 'শিপড' },
            { id: 'In Transit', label: 'ট্রানজিট' },
            { id: 'Out for Delivery', label: 'ডেলিভারি চলছে' },
            { id: 'Delivered', label: 'ডেলিভারড' },
            { id: 'Cancelled', label: 'বাতিলকৃত' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer text-[11px] ${
                statusFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Grid: Orders List on Left, Selected Order Management on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Orders List */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              কোন অর্ডার খুঁজে পাওয়া যায়নি।
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isSelected = selectedOrder?.orderId === order.orderId;
              const isCancelled = order.status === 'Cancelled';

              return (
                <div
                  key={order.orderId}
                  onClick={() => {
                    setSelectedOrderId(order.orderId);
                    setEditingTrackingId(order.trackingId || '');
                    setIsEditingTracking(false);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-300 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-black text-slate-900 text-xs flex items-center gap-1">
                      <span>#{order.orderId}</span>
                      {order.trackingId && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-normal">
                          {order.trackingId}
                        </span>
                      )}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        isCancelled
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : order.status === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : order.status === 'In Transit'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 text-[11px]">
                    <div className="flex items-center gap-1 font-medium text-slate-900 truncate max-w-[160px]">
                      <User className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{order.shippingAddress.fullName}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">৳{order.total.toLocaleString()}</span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5 text-slate-400" />
                      <span>{order.shippingAddress.phone}</span>
                    </span>
                    <span>{order.items.length} টি আইটেম • {order.date}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Order Controls */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-5 max-h-[580px] overflow-y-auto shadow-xs">
          {selectedOrder ? (
            <>
              {/* Selected Order Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-950 font-mono">
                      অর্ডার #{selectedOrder.orderId}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase border ${
                        selectedOrder.status === 'Cancelled'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : selectedOrder.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}
                    >
                      {selectedOrder.status === 'Cancelled' ? '❌ বাতিলকৃত (Cancelled)' : selectedOrder.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    অর্ডার তারিখ: {selectedOrder.date} • পেমেন্ট: {selectedOrder.paymentMethod.toUpperCase()} • ডেলিভারি চার্জ: ৳{selectedOrder.deliveryFee}
                  </p>
                </div>

                {/* Cancel or Reactivate Action */}
                <div>
                  {selectedOrder.status === 'Cancelled' ? (
                    <button
                      type="button"
                      onClick={() => handleReactivateOrder(selectedOrder)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>অর্ডার পুনরায় চালু করুন</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setOrderToCancel(selectedOrder)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="অর্ডারটি সম্পূর্ণ বাতিল করুন"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>অর্ডার বাতিল করুন</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Customer Shipping Address Preview */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    <span>{selectedOrder.shippingAddress.fullName}</span>
                  </span>
                  <span className="text-slate-600 font-mono flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{selectedOrder.shippingAddress.phone}</span>
                  </span>
                </div>
                <div className="text-slate-600 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}
                    {selectedOrder.shippingAddress.zipCode ? ` (${selectedOrder.shippingAddress.zipCode})` : ''}
                  </span>
                </div>
                {selectedOrder.customerNote && (
                  <div className="mt-2 pt-2 border-t border-slate-200 text-amber-900 bg-amber-50/80 p-2 rounded-lg border border-amber-200/60">
                    <div className="font-bold flex items-center gap-1 text-[11px] text-amber-800">
                      <FileText className="w-3 h-3 text-amber-600" />
                      <span>গ্রাহকের বিশেষ ডেলিভারি নোট:</span>
                    </div>
                    <p className="italic text-slate-700 text-[11px] mt-0.5 pl-4">"{selectedOrder.customerNote}"</p>
                  </div>
                )}
              </div>

              {/* Tracking ID Edit Bar */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-amber-950">
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span>কুরিয়ার ট্র্যাকিং কোড:</span>
                  {!isEditingTracking ? (
                    <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-amber-300 text-slate-900">
                      {selectedOrder.trackingId || 'N/A'}
                    </span>
                  ) : (
                    <input
                      type="text"
                      value={editingTrackingId}
                      onChange={(e) => setEditingTrackingId(e.target.value)}
                      className="px-2 py-0.5 text-xs bg-white border border-amber-400 rounded font-mono font-bold focus:outline-none"
                    />
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {!isEditingTracking ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTrackingId(selectedOrder.trackingId);
                        setIsEditingTracking(true);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg cursor-pointer"
                    >
                      কোড পরিবর্তন করুন
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleSaveTrackingId}
                        className="px-2.5 py-1 text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg cursor-pointer"
                      >
                        সেভ
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingTracking(false)}
                        className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        বাতিল
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* ACTION 1: Quick Status Changer */}
              {selectedOrder.status !== 'Cancelled' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    পার্সেল স্ট্যাটাস পরিবর্তন করুন (Quick Status Change):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                    {[
                      { id: 'Processing', label: '১. প্রসেসিং' },
                      { id: 'Shipped', label: '২. শিপড' },
                      { id: 'In Transit', label: '৩. ট্রানজিট' },
                      { id: 'Out for Delivery', label: '৪. ডেলিভারি' },
                      { id: 'Delivered', label: '৫. সম্পন্ন' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleStatusChange(st.id as Order['status'])}
                        className={`px-2 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all text-center ${
                          selectedOrder.status === st.id
                            ? 'bg-slate-900 text-amber-400 shadow-sm border border-slate-900'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ACTION 2: Add New Location / Custom Milestone */}
              {selectedOrder.status !== 'Cancelled' && (
                <form onSubmit={handleAddMilestone} className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <PlusCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>কাস্টম ট্র্যাকিং আপডেট বা নতুন লোকেশন যোগ করুন:</span>
                    </span>
                    <span className="text-[11px] text-slate-500">গ্রাহক এটি সরাসরি দেখতে পাবেন</span>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    <span className="text-slate-500 font-semibold self-center">কুইক প্রিসেট:</span>
                    {[
                      'আন্তর্জাতিক গুদাম থেকে রওয়ানা হয়েছে',
                      'বাংলাদেশ কাস্টমস ক্লিয়ারেন্স সম্পন্ন',
                      'ঢাকা সেন্ট্রাল হাবে পৌঁছেছে',
                      'ডেলিভারি রাইডারের কাছে হস্তান্তর করা হয়েছে',
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setNewMilestoneTitle(preset);
                          setNewMilestoneDesc(`${preset} • নিরাপদ ট্রানজিটে রয়েছে`);
                        }}
                        className="px-2 py-0.5 bg-white border border-slate-300 rounded-md text-slate-700 hover:border-amber-400 cursor-pointer"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                        মাইলফলক শিরোনাম *
                      </label>
                      <input
                        type="text"
                        value={newMilestoneTitle}
                        onChange={(e) => setNewMilestoneTitle(e.target.value)}
                        placeholder="e.g. হযরত শাহজালাল বিমানবন্দর কাস্টমস সম্পন্ন"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:border-amber-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                        তারিখ ও সময় (ঐচ্ছিক)
                      </label>
                      <input
                        type="text"
                        value={newMilestoneTime}
                        onChange={(e) => setNewMilestoneTime(e.target.value)}
                        placeholder="e.g. আজ, সকাল ১০:৩০ / Sept 03, 11:00 AM"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      বিস্তারিত বিবরণ / লোকেশন নোট
                    </label>
                    <input
                      type="text"
                      value={newMilestoneDesc}
                      onChange={(e) => setNewMilestoneDesc(e.target.value)}
                      placeholder="e.g. কাস্টমস ডিউটি পাস হয়েছে, পার্সেলটি ঢাকা সর্টিং সেন্টারে স্থানান্তর করা হচ্ছে।"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>ট্র্যাকিংয়ে যুক্ত করুন</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Current Tracking Timeline View */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>বর্তমান ট্র্যাকিং টাইমলাইন ({selectedOrder.timeline.length} টি ইভেন্ট):</span>
                </h4>

                <div className="space-y-3 relative pl-5 border-l-2 border-slate-200 ml-2 py-1 text-xs">
                  {selectedOrder.timeline.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div
                        className={`absolute -left-[27px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white ${
                          step.completed ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      >
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{step.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{step.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cancel Reason Warning (If Cancelled) */}
              {selectedOrder.status === 'Cancelled' && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs space-y-1 text-rose-800">
                  <div className="font-bold flex items-center gap-1.5 text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>এই অর্ডারটি বাতিল করা হয়েছে (Cancelled)</span>
                  </div>
                  {selectedOrder.cancelReason && (
                    <p className="text-[11px] text-rose-700">
                      <strong>বাতিলের কারণ:</strong> {selectedOrder.cancelReason}
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              বাম পাশ থেকে যেকোনো একটি অর্ডার বেছে নিন।
            </div>
          )}
        </div>
      </div>

      {/* CONFIRM CANCELLATION MODAL */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/70">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-rose-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  অর্ডার বাতিল নিশ্চিত করুন
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  অর্ডার আইডি: #{orderToCancel.orderId}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              আপনি কি নিশ্চিত যে আপনি গ্রাহক <strong>{orderToCancel.shippingAddress.fullName}</strong> এর মোট <strong>৳{orderToCancel.total.toLocaleString()}</strong> টাকার অর্ডারটি বাতিল করতে চান?
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                বাতিল করার কারণ লিখুন:
              </label>
              <textarea
                value={cancelReasonInput}
                onChange={(e) => setCancelReasonInput(e.target.value)}
                placeholder="e.g. কাস্টমার ফোন রিসিভ করেননি / পণ্য স্টকে অনুপলব্ধ / ভুল ঠিকানা..."
                rows={3}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setOrderToCancel(null);
                  setCancelReasonInput('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                ফিরে যান
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer shadow-sm"
              >
                হ্যাঁ, অর্ডার বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
