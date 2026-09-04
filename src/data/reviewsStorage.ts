import { ProductReview, Order, CustomerUser } from '../types';

const STORAGE_KEY_REVIEWS = 'amader_bazar_product_reviews_v2';

const INITIAL_REVIEWS: ProductReview[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    orderId: 'AB-84920',
    customerName: 'তানভীর আহমেদ',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    customerPhone: '01712***890',
    rating: 5,
    comment: 'অসাধারণ কোয়ালিটি! নয়েজ ক্যান্সেলেশন দারুণ কাজ করে। ডেলিভারি মাত্র ১০ দিনে পেয়েছি। সম্পূর্ণ অরজিনাল প্রডাক্ট।',
    createdAt: '2026-08-25',
    verifiedPurchase: true,
  },
  {
    id: 'rev-2',
    productId: 'prod-1',
    orderId: 'AB-57312',
    customerName: 'সাদিয়া জাহান',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    customerPhone: '01923***412',
    rating: 4,
    comment: 'ব্যাটারি ব্যাকআপ খুব ভালো, সাউন্ড ক্লিয়ার। প্যাকেজিং একদম নিখুঁত ছিল। ধন্যবাদ সেলারকে।',
    createdAt: '2026-08-28',
    verifiedPurchase: true,
  },
  {
    id: 'rev-3',
    productId: 'prod-2',
    orderId: 'AB-63819',
    customerName: 'ফারহানা চৌধুরী',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    customerPhone: '01844***991',
    rating: 5,
    comment: 'কাপড়টা যেমন ছবিতে দেখেছি তেমনই সুন্দর ও আরামদায়ক। কালার একদম পারফেক্ট। খুব পছন্দ হয়েছে।',
    createdAt: '2026-08-29',
    verifiedPurchase: true,
  },
  {
    id: 'rev-4',
    productId: 'prod-3',
    orderId: 'AB-49201',
    customerName: 'মাহমুদুল হাসান',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    customerPhone: '01678***234',
    rating: 5,
    comment: 'স্কিন সিরামটা নিয়মিত ব্যবহারে ত্বক অনেক উজ্জ্বল হয়েছে। জেনুইন কোরিয়ান প্রোডাক্ট। সবাইকে রেকমেন্ড করব।',
    createdAt: '2026-08-30',
    verifiedPurchase: true,
  },
];

export function getStoredReviews(): ProductReview[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_REVIEWS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load reviews from storage:', e);
  }
  return INITIAL_REVIEWS;
}

export function saveReviews(reviews: ProductReview[]) {
  try {
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
  } catch (e) {
    console.error('Failed to save reviews to storage:', e);
  }
}

export function getReviewsForProduct(productId: string): ProductReview[] {
  const reviews = getStoredReviews();
  return reviews.filter((r) => r.productId === productId);
}

export function addOrUpdateReview(review: Omit<ProductReview, 'id' | 'createdAt' | 'verifiedPurchase'>): ProductReview {
  const reviews = getStoredReviews();
  const existingIndex = reviews.findIndex(
    (r) => r.productId === review.productId && (r.orderId === review.orderId || r.customerName === review.customerName)
  );

  const newReview: ProductReview = {
    ...review,
    id: `rev-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
    verifiedPurchase: true,
  };

  let updatedList: ProductReview[];
  if (existingIndex >= 0) {
    updatedList = [...reviews];
    updatedList[existingIndex] = {
      ...updatedList[existingIndex],
      ...newReview,
      id: updatedList[existingIndex].id,
      createdAt: updatedList[existingIndex].createdAt,
    };
  } else {
    updatedList = [newReview, ...reviews];
  }

  saveReviews(updatedList);
  return newReview;
}

/**
 * Strict Verification Rule:
 * "এমন নিয়ম করো যে কোনো গ্ৰাহক পন্য পাওয়ার পর শুধু মাত্র সেই পন্যের রিভিউ দিতে পারবে।"
 * Checks if the user is allowed to review a given product.
 * Returns { allowed: boolean, reason?: string, eligibleOrders: Order[], userReview?: ProductReview }
 */
export function checkReviewEligibility(
  user: CustomerUser | null,
  productId: string,
  orders: Order[]
): {
  allowed: boolean;
  reason: string;
  eligibleOrders: Order[];
  existingReview?: ProductReview;
} {
  const reviews = getStoredReviews();

  if (!user) {
    return {
      allowed: false,
      reason: 'রিভিউ দেওয়ার জন্য অনুগ্রহ করে একাউন্টে লগইন করুন।',
      eligibleOrders: [],
    };
  }

  // Find delivered orders belonging to this user
  const cleanUserPhone = user.phone ? user.phone.replace(/[^0-9]/g, '') : '';
  const userDeliveredOrders = orders.filter((order) => {
    if (order.status !== 'Delivered') return false;

    const orderPhone = order.shippingAddress?.phone ? order.shippingAddress.phone.replace(/[^0-9]/g, '') : '';
    const phoneMatch = Boolean(
      cleanUserPhone &&
        orderPhone &&
        (orderPhone.endsWith(cleanUserPhone.slice(-8)) || cleanUserPhone.endsWith(orderPhone.slice(-8)))
    );
    const nameMatch = Boolean(
      user.fullName &&
        order.shippingAddress?.fullName?.toLowerCase().trim() === user.fullName.toLowerCase().trim()
    );

    return phoneMatch || nameMatch;
  });

  // Check if any delivered order contains the product
  const eligibleOrders = userDeliveredOrders.filter((order) =>
    order.items.some((item) => item.product.id === productId)
  );

  if (eligibleOrders.length === 0) {
    // Check if the user has this product in an un-delivered order (Processing, In Transit, Shipped)
    const inProgressOrder = orders.find((order) => {
      if (order.status === 'Delivered') return false;
      const orderPhone = order.shippingAddress?.phone ? order.shippingAddress.phone.replace(/[^0-9]/g, '') : '';
      const phoneMatch = cleanUserPhone && orderPhone && orderPhone.endsWith(cleanUserPhone.slice(-8));
      return (
        (phoneMatch || order.shippingAddress?.fullName?.toLowerCase().trim() === user.fullName.toLowerCase().trim()) &&
        order.items.some((item) => item.product.id === productId)
      );
    });

    if (inProgressOrder) {
      return {
        allowed: false,
        reason: `আপনার অর্ডারটি (${inProgressOrder.orderId}) বর্তমানে "${inProgressOrder.status}" অবস্থায় রয়েছে। পণ্য হাতে পাওয়ার পর (ডেলিভারি সম্পন্ন হলে) রিভিউ দিতে পারবেন।`,
        eligibleOrders: [],
      };
    }

    return {
      allowed: false,
      reason: 'শুধুমাত্র যেসকল গ্রাহক পণ্যটি অর্ডার করে হাতে পেয়েছেন (ডেলিভারি সম্পন্ন হয়েছে), তারাই রিভিউ দিতে পারবেন।',
      eligibleOrders: [],
    };
  }

  // Find if user already reviewed
  const existingReview = reviews.find(
    (r) =>
      r.productId === productId &&
      eligibleOrders.some((o) => o.orderId === r.orderId || r.customerName === user.fullName)
  );

  return {
    allowed: true,
    reason: 'আপনি এই পণ্যের একজন ভেরিফায়েড ক্রেতা।',
    eligibleOrders,
    existingReview,
  };
}
