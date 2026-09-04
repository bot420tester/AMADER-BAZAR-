import emailjs from '@emailjs/browser';
import { Order } from '../types';

// EmailJS Configuration provided by user
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'Amader_Bazar',
  TEMPLATE_ID: 'template_cp3rd6d',
  PUBLIC_KEY: 'caxYZg6Qg1ypbvjKg',
  ADMIN_EMAIL: 'amaderbazar.ab.ds@gmail.com',
};

/**
 * Formats ordered items into a clear readable list for the email
 */
function formatOrderedItems(items: Order['items']): string {
  return items
    .map((item, index) => {
      const itemTotal = item.product.price * item.quantity;
      const variantDetails = item.selectedVariant
        ? Object.entries(item.selectedVariant)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ')
        : '';
      const variantStr = variantDetails ? ` (${variantDetails})` : '';
      return `${index + 1}. ${item.product.name}${variantStr} x ${item.quantity}টি = ৳${itemTotal.toLocaleString()}`;
    })
    .join('\n');
}

/**
 * Sends order notification email to admin email via EmailJS
 */
export async function sendOrderNotificationEmail(order: Order): Promise<{ success: boolean; error?: string }> {
  try {
    const formattedItems = formatOrderedItems(order.items);
    const locationName =
      order.deliveryLocation === 'dhaka'
        ? 'ঢাকা সিটি (Dhaka City)'
        : 'ঢাকার বাইরে (Outside Dhaka)';

    const paymentLabel =
      order.paymentMethod === 'cod'
        ? 'ক্যাশ অন ডেলিভারি (Cash on Delivery)'
        : order.paymentMethod.toUpperCase();

    // Template parameters supporting various EmailJS template placeholder names
    const templateParams: Record<string, string | number> = {
      to_email: EMAILJS_CONFIG.ADMIN_EMAIL,
      email: EMAILJS_CONFIG.ADMIN_EMAIL,
      reply_to: order.shippingAddress.phone || EMAILJS_CONFIG.ADMIN_EMAIL,
      to_name: 'Amader Bazar Admin',
      from_name: order.shippingAddress.fullName,
      
      // Order Identifiers
      order_id: order.orderId,
      tracking_id: order.trackingId,
      date: order.date,
      order_date: order.date,
      
      // Customer Details
      customer_name: order.shippingAddress.fullName,
      customer_phone: order.shippingAddress.phone,
      customer_address: `${order.shippingAddress.address}, ${order.shippingAddress.city}${order.shippingAddress.zipCode ? ` (${order.shippingAddress.zipCode})` : ''}`,
      delivery_address: `${order.shippingAddress.address}, ${order.shippingAddress.city}`,
      city: order.shippingAddress.city,
      delivery_location: locationName,
      
      // Products & Cost Summary
      items_summary: formattedItems,
      orders_list: formattedItems,
      order_items: formattedItems,
      subtotal: `৳${order.subtotal.toLocaleString()}`,
      delivery_charge: `৳${order.deliveryFee.toLocaleString()}`,
      delivery_fee: `৳${order.deliveryFee.toLocaleString()}`,
      discount: order.discount ? `৳${order.discount.toLocaleString()}` : '৳০',
      total_price: `৳${order.total.toLocaleString()}`,
      total_amount: `৳${order.total.toLocaleString()}`,
      total: `৳${order.total.toLocaleString()}`,
      payment_method: paymentLabel,
      
      // Complete message summary
      message: `নতুন অর্ডার প্রাপ্তি!\n\nঅর্ডার আইডি: #${order.orderId}\nট্র্যাকিং আইডি: ${order.trackingId}\nতারিখ: ${order.date}\n\nগ্রাহক: ${order.shippingAddress.fullName}\nমোবাইল: ${order.shippingAddress.phone}\nঠিকানা: ${order.shippingAddress.address}, ${order.shippingAddress.city}\nলোকেশন: ${locationName}\n\nপ্রোডাক্ট তালিকা:\n${formattedItems}\n\nসাবটোটাল: ৳${order.subtotal.toLocaleString()}\nডেলিভারি চার্জ: ৳${order.deliveryFee.toLocaleString()}\nমোট প্রদেয় বিল: ৳${order.total.toLocaleString()}\nপেমেন্ট মেথড: ${paymentLabel}`,
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    console.log('✅ EmailJS Order Notification Sent Successfully:', response.status, response.text);
    return { success: true };
  } catch (error: any) {
    console.error('❌ EmailJS Notification Error:', error);
    return {
      success: false,
      error: error?.text || error?.message || 'Failed to send notification email',
    };
  }
}

/**
 * Sends a quick test notification email to verify EmailJS setup
 */
export async function sendTestEmail(): Promise<{ success: boolean; error?: string }> {
  try {
    const templateParams = {
      to_email: EMAILJS_CONFIG.ADMIN_EMAIL,
      email: EMAILJS_CONFIG.ADMIN_EMAIL,
      to_name: 'Amader Bazar Admin',
      from_name: 'Amader Bazar System Test',
      order_id: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      tracking_id: `TRK-TEST-BD`,
      date: new Date().toLocaleDateString('bn-BD'),
      customer_name: 'টেস্ট কাস্টমার (Test System)',
      customer_phone: '01712-345678',
      customer_address: 'ধানমন্ডি, ঢাকা',
      delivery_address: 'ধানমন্ডি, ঢাকা',
      city: 'ঢাকা',
      delivery_location: 'ঢাকা সিটি',
      items_summary: '1. Wireless Headphones Pro - 1টি x ৳2,450',
      orders_list: '1. Wireless Headphones Pro - 1টি x ৳2,450',
      order_items: '1. Wireless Headphones Pro - 1টি x ৳2,450',
      subtotal: '৳২,৪৫০',
      delivery_charge: '৳১০০',
      delivery_fee: '৳১০০',
      discount: '৳০',
      total_price: '৳২,৫৫০',
      total_amount: '৳২,৫৫০',
      total: '৳২,৫৫০',
      payment_method: 'ক্যাশ অন ডেলিভারি (Cash on Delivery)',
      message: 'অভিনন্দন! আপনার Amader Bazar এর EmailJS অর্ডার নোটিফিকেশন সিস্টেম সফলভাবে কনফিগার হয়েছে। এখন থেকে গ্রাহক কোনো অর্ডার করলে তার বিস্তারিত বিবরণ সরাসরি এই ইমেইলে চলে আসবে।',
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    console.log('✅ Test Email Sent:', response.status, response.text);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Test Email Error:', error);
    return {
      success: false,
      error: error?.text || error?.message || 'Failed to send test email',
    };
  }
}
