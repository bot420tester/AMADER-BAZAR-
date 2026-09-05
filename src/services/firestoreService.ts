import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, Order, StoreSettings } from '../types';
import { PRODUCTS, DEFAULT_STORE_SETTINGS, MOCK_ORDERS } from '../data/mockData';

// Helper to sanitize data so Firestore doesn't error on `undefined` fields
function sanitizeForFirestore<T extends Record<string, any>>(data: T): any {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Initializes real-time synchronization with Firebase Firestore
 * Allows products, orders, and store settings to be immediately reflected on ALL devices.
 */
export function initFirestoreSync({
  onProducts,
  onOrders,
  onSettings,
  initialLocalProducts,
}: {
  onProducts: (products: Product[]) => void;
  onOrders: (orders: Order[]) => void;
  onSettings: (settings: StoreSettings) => void;
  initialLocalProducts?: Product[];
}): () => void {
  // 1. Synchronize Products in real-time
  const productsColRef = collection(db, 'products');
  let hasSeededProducts = false;

  const unsubProducts = onSnapshot(
    productsColRef,
    async (snapshot) => {
      if (snapshot.empty && !hasSeededProducts) {
        hasSeededProducts = true;
        console.log('No products found in Firestore. Seeding catalog...');
        const toSeed = (initialLocalProducts && initialLocalProducts.length > 0)
          ? initialLocalProducts
          : PRODUCTS;

        // Seed products into Firestore so all devices see them
        for (const prod of toSeed) {
          try {
            await setDoc(doc(db, 'products', prod.id), sanitizeForFirestore(prod));
          } catch (e) {
            console.error(`Failed to seed product ${prod.id}:`, e);
          }
        }
        return;
      }

      const products: Product[] = [];
      snapshot.forEach((docSnap) => {
        products.push(docSnap.data() as Product);
      });

      if (products.length > 0) {
        onProducts(products);
      }
    },
    (err) => {
      console.warn('Firestore products listener error:', err.message);
    }
  );

  // 2. Synchronize Orders in real-time
  const ordersColRef = collection(db, 'orders');
  let hasSeededOrders = false;

  const unsubOrders = onSnapshot(
    ordersColRef,
    async (snapshot) => {
      if (snapshot.empty && !hasSeededOrders) {
        hasSeededOrders = true;
        // Optionally seed demo orders once
        for (const ord of MOCK_ORDERS) {
          try {
            await setDoc(doc(db, 'orders', ord.orderId), sanitizeForFirestore(ord));
          } catch (e) {
            console.error(`Failed to seed order ${ord.orderId}:`, e);
          }
        }
        return;
      }

      const orders: Order[] = [];
      snapshot.forEach((docSnap) => {
        orders.push(docSnap.data() as Order);
      });

      // Sort newest orders first
      orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onOrders(orders);
    },
    (err) => {
      console.warn('Firestore orders listener error:', err.message);
    }
  );

  // 3. Synchronize Store Settings in real-time
  const settingsDocRef = doc(db, 'settings', 'store_settings');
  const unsubSettings = onSnapshot(
    settingsDocRef,
    async (docSnap) => {
      if (!docSnap.exists()) {
        try {
          await setDoc(settingsDocRef, sanitizeForFirestore(DEFAULT_STORE_SETTINGS));
        } catch (e) {
          console.error('Failed to seed store settings:', e);
        }
        return;
      }
      onSettings(docSnap.data() as StoreSettings);
    },
    (err) => {
      console.warn('Firestore settings listener error:', err.message);
    }
  );

  // Return combined unsubscribe function
  return () => {
    unsubProducts();
    unsubOrders();
    unsubSettings();
  };
}

/**
 * Save / Update a product in Firestore cloud database
 */
export async function saveProductToFirestore(product: Product): Promise<void> {
  try {
    await setDoc(doc(db, 'products', product.id), sanitizeForFirestore(product));
    console.log(`Product ${product.id} synced to Firestore.`);
  } catch (err) {
    console.error(`Error saving product ${product.id} to Firestore:`, err);
    throw err;
  }
}

/**
 * Delete a product from Firestore cloud database
 */
export async function deleteProductFromFirestore(productId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'products', productId));
    console.log(`Product ${productId} deleted from Firestore.`);
  } catch (err) {
    console.error(`Error deleting product ${productId} from Firestore:`, err);
    throw err;
  }
}

/**
 * Save a new customer order to Firestore cloud database
 */
export async function saveOrderToFirestore(order: Order): Promise<void> {
  try {
    await setDoc(doc(db, 'orders', order.orderId), sanitizeForFirestore(order));
    console.log(`Order #${order.orderId} saved to Firestore.`);
  } catch (err) {
    console.error(`Error saving order #${order.orderId} to Firestore:`, err);
    throw err;
  }
}

/**
 * Update an order in Firestore cloud database
 */
export async function updateOrderInFirestore(order: Order): Promise<void> {
  try {
    await setDoc(doc(db, 'orders', order.orderId), sanitizeForFirestore(order));
    console.log(`Order #${order.orderId} updated in Firestore.`);
  } catch (err) {
    console.error(`Error updating order #${order.orderId} in Firestore:`, err);
    throw err;
  }
}

/**
 * Save Store Settings to Firestore cloud database
 */
export async function saveStoreSettingsToFirestore(settings: StoreSettings): Promise<void> {
  try {
    await setDoc(doc(db, 'settings', 'store_settings'), sanitizeForFirestore(settings));
    console.log('Store settings synced to Firestore.');
  } catch (err) {
    console.error('Error saving store settings to Firestore:', err);
    throw err;
  }
}
