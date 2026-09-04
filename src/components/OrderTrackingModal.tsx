import React, { useState, useEffect } from 'react';
import { X, Search, Truck, CheckCircle2, Clock, MapPin, PackageCheck, AlertCircle } from 'lucide-react';
import { Order } from '../types';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  selectedOrder?: Order | null;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  orders,
  selectedOrder,
}) => {
  const [searchCode, setSearchCode] = useState('');
  const [activeOrder, setActiveOrder] = useState<Order | null>(() => selectedOrder || orders[0] || null);

  useEffect(() => {
    if (selectedOrder) {
      setActiveOrder(selectedOrder);
      setSearchCode(selectedOrder.trackingId || selectedOrder.orderId);
    } else if (orders.length > 0 && !activeOrder) {
      setActiveOrder(orders[0]);
    }
  }, [selectedOrder, isOpen, orders]);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchCode.trim().toUpperCase();
    const found = orders.find(
      (o) => o.orderId.toUpperCase() === query || o.trackingId.toUpperCase() === query
    );
    if (found) {
      setActiveOrder(found);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden z-10">
        
        {/* Header */}
        <div className="bg-[#07172b] text-white p-6 rounded-t-3xl flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-['Outfit',sans-serif]">
                পার্সেল ট্র্যাকার (Parcel Tracker)
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Real-time delivery milestone tracking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input for tracking */}
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Enter Tracking # (e.g. TRK-9842718BD) or Order #"
                className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-white border border-slate-300 rounded-xl focus:border-amber-500 focus:outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs md:text-sm cursor-pointer transition-colors shadow-sm"
            >
              Track
            </button>
          </form>

          {/* Quick Select Buttons from recent orders */}
          {orders.length > 0 && (
            <div className="flex items-center gap-2 mt-3 text-xs overflow-x-auto pb-1">
              <span className="text-slate-500 text-[11px] font-semibold whitespace-nowrap">
                Recent Orders:
              </span>
              {orders.map((o) => (
                <button
                  key={o.orderId}
                  onClick={() => setActiveOrder(o)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors cursor-pointer whitespace-nowrap ${
                    activeOrder?.orderId === o.orderId
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-amber-400'
                  }`}
                >
                  #{o.orderId} ({o.status})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Order Details & Visual Timeline */}
        {activeOrder ? (
          <div className="p-6 md:p-8 space-y-6">
            
            {/* Status Summary Banner */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <div>
                <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider">
                  Current Status
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  {activeOrder.status}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider">
                  Tracking Code
                </span>
                <p className="font-mono font-bold text-amber-700 text-sm">
                  {activeOrder.trackingId}
                </p>
              </div>
            </div>

            {/* Timeline Milestones */}
            <div className="space-y-6 relative pl-6 border-l-2 border-slate-200 ml-3">
              {activeOrder.timeline.map((step, idx) => (
                <div key={idx} className="relative">
                  
                  {/* Indicator Dot */}
                  <div
                    className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-white ${
                      step.completed
                        ? 'bg-emerald-500 ring-4 ring-emerald-100'
                        : step.current
                        ? 'bg-amber-500 ring-4 ring-amber-100 animate-bounce'
                        : 'bg-slate-300 ring-4 ring-slate-100'
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">
                        {step.title}
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {step.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Destination info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">
                  Delivery Destination: {activeOrder.shippingAddress.fullName}
                </span>
                <p className="text-slate-500">
                  {activeOrder.shippingAddress.address}, {activeOrder.shippingAddress.city}
                </p>
              </div>
            </div>

          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">
            <AlertCircle className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <p className="font-semibold text-sm">No order found with that tracking number.</p>
          </div>
        )}

      </div>
    </div>
  );
};
