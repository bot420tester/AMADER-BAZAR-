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
import { PRODUCTS, DEFAULT_STORE_SETTINGS } from '../data/mockData';
import { compressBase64Image, sanitizeProductGallery } from '../utils/imageCompressor';

// Helper to sanitize data so Firestore doesn't error on `undefined` fields
function sanitizeForFirestore<T extends Record<string, any>>(data: T): any {
  return JSON.parse(JSON.stringify(data));
}

// Helper to sort products so newly added timestamped items stay at the top
export function sortProducts(productList: Product[]): Product[] {
  return [...productList].sort((a, b) => {
    const timeA = a.id.startsWith('prod-') ? Number(a.id.replace('prod-', '')) : 0;
    const timeB = b.id.startsWith('prod-') ? Number(b.id.replace('prod-', '')) : 0;

    // Both are timestamps (e.g. prod-1788610826212)
    if (timeA > 1_000_000_000 && timeB > 1_000_000_000) {
      return timeB - timeA; // newest first
    }
    // A is newly added timestamp product, B is catalog product
    if (timeA > 1_000_000_000) return -1;
    // B is newly added timestamp product, A is catalog product
    if (timeB > 1_000_000_000) return 1;

    // Default numeric sort for catalog products (prod-1, prod-2, etc.)
    return timeA - timeB;
  });
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
        // Sort products cleanly so new creations are prominent at top
        const sorted = sortProducts(products);
        onProducts(sorted);
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
        onOrders([]);
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
 * Save / Update a product in Firestore cloud database with automatic image compression
 * and size guard to never exceed Firestore's 1MB limit.
 */
export async function saveProductToFirestore(product: Product): Promise<void> {
  try {
    // 1. Sanitize gallery and primary image
    const { image: cleanImage, galleryImages: cleanGallery } = sanitizeProductGallery(
      product.image,
      product.galleryImages
    );

    // 2. Automatically compress large base64 images if needed
    let optimizedImage = cleanImage;
    if (optimizedImage && optimizedImage.startsWith('data:image/') && optimizedImage.length > 80_000) {
      optimizedImage = await compressBase64Image(optimizedImage, { maxWidth: 900, maxHeight: 900, quality: 0.75 });
    }

    let optimizedGallery: string[] = [];
    if (cleanGallery && cleanGallery.length > 0) {
      optimizedGallery = await Promise.all(
        cleanGallery.map(async (img) => {
          if (img && img.startsWith('data:image/') && img.length > 80_000) {
            return await compressBase64Image(img, { maxWidth: 900, maxHeight: 900, quality: 0.75 });
          }
          return img;
        })
      );
    }

    const preparedProduct: Product = {
      ...product,
      image: optimizedImage,
      galleryImages: optimizedGallery.length > 0 ? optimizedGallery : (optimizedImage ? [optimizedImage] : []),
    };

    const payload = sanitizeForFirestore(preparedProduct);
    const jsonLength = JSON.stringify(payload).length;

    // Strict guard: Firestore maximum document size is 1,048,576 bytes
    if (jsonLength > 850_000) {
      console.warn(`Product ${product.id} payload is large (${jsonLength} bytes). Optimizing gallery to ensure safe Firestore write.`);
      preparedProduct.galleryImages = [optimizedImage];
      const trimmedPayload = sanitizeForFirestore(preparedProduct);
      await setDoc(doc(db, 'products', product.id), trimmedPayload);
    } else {
      await setDoc(doc(db, 'products', product.id), payload);
    }

    console.log(`Product ${product.id} successfully synced to Firestore (${jsonLength} bytes).`);
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
 * Delete an order from Firestore cloud database
 */
export async function deleteOrderFromFirestore(orderId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'orders', orderId));
    console.log(`Order #${orderId} deleted from Firestore.`);
  } catch (err) {
    console.error(`Error deleting order #${orderId} from Firestore:`, err);
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
