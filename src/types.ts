export type DeliveryLocation = 'dhaka' | 'outside_dhaka';

export interface Product {
  id: string;
  name: string;
  category: 'electronics' | 'fashion' | 'cosmetics' | 'home' | string;
  categoryLabel: string;
  price: number; // In BDT (৳)
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  badge?: '25% OFF' | 'BESTSELLER' | 'NEW' | 'TRENDING' | 'HOT DEAL' | 'LIMITED' | string;
  badgeColor?: 'orange' | 'teal' | 'amber';
  image: string;
  galleryImages?: string[];
  description: string;
  inStock: boolean;
  stockCount: number;
  sku: string;
  variants?: {
    type: string;
    options: string[];
  }[];
  features?: string[];
  dropshipInfo: {
    origin: string;
    estimatedDays: string;
    supplierRating: number;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: Record<string, string>;
}

export interface Category {
  id: 'all' | 'electronics' | 'fashion' | 'cosmetics' | 'home' | 'offers' | 'new';
  name: string;
  subtitle: string;
  iconName: string;
  count: number;
}

export interface CustomerUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  deliveryLocation: DeliveryLocation;
  password?: string;
  createdAt: string;
  avatar?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  announcement: string;
  adminPin: string;
  insideDhakaFee: number;
  outsideDhakaFee: number;
  freeShippingThreshold: number;
  outsideDhakaDiscountPercent: number;
  contactEmail: string;
  defaultDeliveryDays?: string;
}

export interface Order {
  orderId: string;
  trackingId: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  deliveryLocation: DeliveryLocation;
  deliveryFee: number;
  discount: number;
  total: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    zipCode?: string;
    deliveryLocation: DeliveryLocation;
  };
  paymentMethod: 'cod' | 'card' | 'bkash' | 'nagad' | 'paypal';
  status: 'Processing' | 'Shipped' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  timeline: {
    title: string;
    description: string;
    time: string;
    completed: boolean;
    current?: boolean;
  }[];
  cancelReason?: string;
  customerNote?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  orderId?: string;
  customerName: string;
  customerAvatar?: string;
  customerPhone?: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
}

