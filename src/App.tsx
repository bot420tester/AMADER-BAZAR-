import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { TrustBar } from './components/TrustBar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ProductQuickView } from './components/ProductQuickView';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { WishlistModal } from './components/WishlistModal';
import { AccountModal } from './components/AccountModal';
import { AdminModal } from './components/AdminModal';
import { ReviewModal } from './components/ReviewModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { PRODUCTS as INITIAL_PRODUCTS, DEFAULT_STORE_SETTINGS, MOCK_ORDERS } from './data/mockData';
import { Product, CartItem, Order, StoreSettings, CustomerUser } from './types';
import { Flame, Sparkles, Filter, SlidersHorizontal, Truck, Zap } from 'lucide-react';
import { testConnection } from './services/firebase';
import {
  initFirestoreSync,
  saveProductToFirestore,
  deleteProductFromFirestore,
  saveOrderToFirestore,
  updateOrderInFirestore,
  saveStoreSettingsToFirestore,
} from './services/firestoreService';

const STORAGE_KEY_PRODUCTS = 'amader_bazar_products_v3';
const STORAGE_KEY_SETTINGS = 'amader_bazar_settings_v3';
const STORAGE_KEY_CURRENT_USER = 'amader_bazar_current_user_v1';
const STORAGE_KEY_ORDERS = 'amader_bazar_orders_v2';
const STORAGE_KEY_CART = 'amader_bazar_cart_v1';
const STORAGE_KEY_WISHLIST = 'amader_bazar_wishlist_v1';

export default function App() {
  // Load products with persistence
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: Product) => ({
            ...p,
            dropshipInfo: {
              ...p.dropshipInfo,
              origin: p.dropshipInfo?.origin || 'আন্তর্জাতিক সরবরাহকারী হাব (আমদানিকৃত)',
              estimatedDays: 'এটি একটি প্রি-অর্ডার প্রডাক্ট। বাহির থেকে ইমপোর্ট হয়ে আসতে ৭-১০ কার্যদিবস সময় লাগবে।',
              supplierRating: p.dropshipInfo?.supplierRating || 4.9,
            },
          }));
        }
      }
    } catch (e) {
      console.error('Failed to load saved products:', e);
    }
    return INITIAL_PRODUCTS;
  });

  // Load store settings with persistence
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved settings:', e);
    }
    return DEFAULT_STORE_SETTINGS;
  });

  // Customer Authentication state
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load current customer session:', e);
    }
    return null;
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products:', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(storeSettings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [storeSettings]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
      }
    } catch (e) {
      console.error('Failed to save current user:', e);
    }
  }, [currentUser]);

  // State management
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');

  // Cart state with persistence (defaults to empty)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CART);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load saved cart:', e);
    }
    return [];
  });

  // Wishlist state with persistence (defaults to empty)
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WISHLIST);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load saved wishlist:', e);
    }
    return [];
  });

  // Save cart to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cart]);

  // Save wishlist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WISHLIST, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist:', e);
    }
  }, [wishlist]);

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved orders:', e);
    }
    return MOCK_ORDERS;
  });

  // Save orders to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders:', e);
    }
  }, [orders]);

  // Real-time Cloud Database Synchronization across all devices
  useEffect(() => {
    testConnection();

    const unsubscribe = initFirestoreSync({
      initialLocalProducts: products,
      onProducts: (remoteProducts) => {
        if (remoteProducts && remoteProducts.length > 0) {
          setProducts(remoteProducts);
        }
      },
      onOrders: (remoteOrders) => {
        if (remoteOrders && remoteOrders.length > 0) {
          setOrders(remoteOrders);
        }
      },
      onSettings: (remoteSettings) => {
        if (remoteSettings && remoteSettings.storeName) {
          setStoreSettings(remoteSettings);
        }
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Modals & Panels
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [selectedTrackOrder, setSelectedTrackOrder] = useState<Order | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState<Product | null>(null);
  const [reviewOrderId, setReviewOrderId] = useState<string | undefined>(undefined);

  const handleOpenReview = (product: Product, order?: Order) => {
    setReviewProduct(product);
    setReviewOrderId(order?.orderId);
    setIsReviewModalOpen(true);
  };

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'cart' | 'wishlist' | 'info', title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Product CRUD (Admin Only)
  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    saveProductToFirestore(newProduct).catch((err) => {
      console.error('Failed to sync new product to Firestore:', err);
    });
    addToast('info', 'প্রোডাক্ট যুক্ত হয়েছে', `"${newProduct.name}" ক্লাউড ডাটাবেজে যুক্ত হয়েছে এবং সব ডিভাইসে লাইভ হয়েছে।`);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === updated.id ? { ...item, product: updated } : item
      )
    );
    saveProductToFirestore(updated).catch((err) => {
      console.error('Failed to sync updated product to Firestore:', err);
    });
    addToast('info', 'প্রোডাক্ট আপডেট হয়েছে', `"${updated.name}" এর তথ্য সফলভাবে ক্লাউডে সংরক্ষিত হয়েছে।`);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    setWishlist((prev) => prev.filter((id) => id !== productId));
    deleteProductFromFirestore(productId).catch((err) => {
      console.error('Failed to delete product from Firestore:', err);
    });
    addToast('info', 'প্রোডাক্ট মুছে ফেলা হয়েছে', 'আইটেমটি ক্লাউড ক্যাটালগ থেকে বাদ দেওয়া হয়েছে।');
  };

  const handleUpdateStoreSettings = (newSettings: StoreSettings) => {
    setStoreSettings(newSettings);
    saveStoreSettingsToFirestore(newSettings).catch((err) => {
      console.error('Failed to sync store settings to Firestore:', err);
    });
    addToast('info', 'সেটিংস আপডেট হয়েছে', 'স্টোরের নতুন তথ্য ক্লাউডে সংরক্ষণ করা হয়েছে।');
  };

  const handleResetToDefault = () => {
    setProducts(INITIAL_PRODUCTS);
    setStoreSettings(DEFAULT_STORE_SETTINGS);
    localStorage.removeItem(STORAGE_KEY_PRODUCTS);
    localStorage.removeItem(STORAGE_KEY_SETTINGS);
    // Also re-seed to Firestore
    for (const p of INITIAL_PRODUCTS) {
      saveProductToFirestore(p).catch((err) => console.error(err));
    }
    saveStoreSettingsToFirestore(DEFAULT_STORE_SETTINGS).catch((err) => console.error(err));
    addToast('info', 'রিসেট সফল', 'স্টোর ডিফল্ট অবস্থায় রিসেট হয়েছে।');
  };

  // User auth handlers
  const handleLogin = (user: CustomerUser) => {
    setCurrentUser(user);
    addToast('info', 'লগইন সফল!', `স্বাগতম, ${user.fullName}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    addToast('info', 'লগআউট সম্পন্ন', 'আপনি সফলভাবে লগআউট করেছেন।');
  };

  const handleUpdateUser = (updated: CustomerUser) => {
    setCurrentUser(updated);
    addToast('info', 'প্রোফাইল আপডেট', 'আপনার প্রোফাইলের তথ্য আপডেট করা হয়েছে।');
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1, variant?: Record<string, string>) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity, selectedVariant: variant || item.selectedVariant }
            : item
        );
      }
      return [...prev, { product, quantity, selectedVariant: variant }];
    });
    addToast('cart', 'কার্টে যুক্ত হয়েছে', `"${product.name}" (${quantity}x) কার্টে যোগ করা হয়েছে।`);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    addToast('info', 'কার্ট থেকে রিমুভড', 'আইটেমটি কার্ট থেকে সরানো হয়েছে।');
  };

  // Wishlist operations
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      if (prev.includes(product.id)) {
        addToast('info', 'উইশলিস্ট থেকে সরানো হয়েছে', `${product.name} উইশলিস্ট থেকে বাদ দেওয়া হলো।`);
        return prev.filter((id) => id !== product.id);
      } else {
        addToast('wishlist', 'উইশলিস্টে যুক্ত হয়েছে', `${product.name} উইশলিস্টে সেভ করা হলো।`);
        return [...prev, product.id];
      }
    });
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    saveOrderToFirestore(newOrder).catch((err) => {
      console.error('Failed to sync new order to Firestore:', err);
    });
    addToast('info', 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!', `অর্ডার #${newOrder.orderId} কনফার্ম হয়েছে।`);
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders((prev) =>
      prev.map((order) => (order.orderId === updatedOrder.orderId ? updatedOrder : order))
    );
    updateOrderInFirestore(updatedOrder).catch((err) => {
      console.error('Failed to sync updated order to Firestore:', err);
    });
    addToast('info', 'অর্ডার আপডেট', `অর্ডার #${updatedOrder.orderId} এর ট্র্যাকিং সফলভাবে আপডেট হয়েছে।`);
  };

  const handleCancelOrder = (orderId: string, reason?: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.orderId === orderId) {
          const cancelTimelineItem = {
            title: 'অর্ডার বাতিল করা হয়েছে (Cancelled)',
            description: reason || 'অ্যাডমিন কর্তৃক অর্ডারটি বাতিল করা হয়েছে।',
            time: new Date().toLocaleDateString('bn-BD', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            completed: true,
            current: true,
          };
          const cancelledOrder = {
            ...order,
            status: 'Cancelled' as const,
            cancelReason: reason,
            timeline: [...order.timeline.map((s) => ({ ...s, current: false })), cancelTimelineItem],
          };
          updateOrderInFirestore(cancelledOrder).catch((err) => {
            console.error('Failed to sync cancelled order to Firestore:', err);
          });
          return cancelledOrder;
        }
        return order;
      })
    );
    addToast('info', 'অর্ডার বাতিল', `অর্ডার #${orderId} বাতিল করা হয়েছে।`);
  };

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all'
          ? true
          : selectedCategory === 'offers'
          ? Boolean(product.badge === '25% OFF' || product.originalPrice)
          : selectedCategory === 'new'
          ? Boolean(product.badge === 'NEW')
          : product.category === selectedCategory;

      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [products, selectedCategory, searchQuery, sortBy]);

  // Featured Top 4 Products
  const featuredScreenshotProducts = products.slice(0, 4);
  const cartTotalItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7fb] text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 1. Header with Logo, Search, Customer Account, Wishlist & Cart (Logo opens Control Center) */}
      <Header
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={cartTotalItems}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        storeSettings={storeSettings}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        
        {/* 2. Hero Banner */}
        {selectedCategory === 'all' && !searchQuery && (
          <HeroBanner
            onShopNow={() => {
              const el = document.getElementById('featured-products-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            onExploreDeals={() => setSelectedCategory('offers')}
            storeSettings={storeSettings}
          />
        )}

        {/* 3. Products Section */}
        <section id="featured-products-section" className="py-8 px-4 lg:px-8 max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {selectedCategory === 'all' && !searchQuery
                  ? 'Featured Products'
                  : `পণ্য তালিকা (${filteredProducts.length})`}
              </h2>
              <p className="text-xs md:text-sm text-slate-500 mt-1">
                {selectedCategory === 'all' && !searchQuery
                  ? 'প্রিমিয়াম কোয়ালিটি ও সেরা ডিল'
                  : `Showing results for ${selectedCategory.toUpperCase()}`}
              </p>
            </div>

            {/* Sort & Controls */}
            <div className="flex items-center gap-3 self-start md:self-auto text-xs">
              <span className="text-slate-500 font-semibold flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                সর্ট করুন:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-amber-500 shadow-2xs cursor-pointer"
              >
                <option value="featured">জনপ্রিয় ডিল (Featured)</option>
                <option value="rating">টপ রেটেড (Top Rated)</option>
                <option value="price-low">দাম: কম থেকে বেশি</option>
                <option value="price-high">দাম: বেশি থেকে কম</option>
              </select>
            </div>
          </div>

          {/* If viewing default home page without search filter, display featured grid & trending hot sellers */}
          {selectedCategory === 'all' && !searchQuery ? (
            <div className="space-y-12">
              
              {/* Featured Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                {featuredScreenshotProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    onAddToCart={handleAddToCart}
                    onQuickView={setQuickViewProduct}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={wishlist.includes(product.id)}
                  />
                ))}
              </div>

              {/* Extended Top Deals Grid */}
              {products.length > 4 && (
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                        <Flame className="w-4 h-4 fill-amber-500 text-amber-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">
                        Trending Hot Sellers
                      </h3>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      Verified Express Delivery
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                    {products.slice(4).map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        index={index + 4}
                        onAddToCart={handleAddToCart}
                        onQuickView={setQuickViewProduct}
                        onToggleWishlist={handleToggleWishlist}
                        isWishlisted={wishlist.includes(product.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* Filtered/Searched Results */
            filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    onAddToCart={handleAddToCart}
                    onQuickView={setQuickViewProduct}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={wishlist.includes(product.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm max-w-md mx-auto my-8">
                <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">কোনো প্রোডাক্ট পাওয়া যায়নি</h3>
                <p className="text-xs text-slate-500 mt-1">
                  অন্য কোনো নাম লিখে সার্চ করুন অথবা ফিল্টার রিসেট করুন।
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="mt-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-full text-xs shadow cursor-pointer"
                >
                  সব প্রোডাক্ট দেখুন
                </button>
              </div>
            )
          )}
        </section>

        {/* Express Delivery Info Banner (Dynamically Connected) */}
        <section className="mt-6 px-4 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-[#07172b] to-[#0f294a] rounded-3xl p-6 md:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-amber-400 font-bold text-xs uppercase tracking-widest flex items-center justify-center md:justify-start gap-1.5">
                <Zap className="w-4 h-4 fill-amber-400" />
                এক্সপ্রেস হোম ডেলিভারি পলিসি
              </span>
              <h3 className="text-xl md:text-2xl font-black font-['Outfit',sans-serif]">
                সরাসরি ফ্যাক্টরি রেট ও ক্যাশ অন ডেলিভারি
              </h3>
              <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
                ডেলিভারি চার্জ: ঢাকায় <strong>৳{storeSettings.insideDhakaFee}</strong> এবং ঢাকার বাইরে <strong>৳{storeSettings.outsideDhakaFee}</strong> (<strong>ডেলিভারি চার্জ অগ্ৰীম দিতে হবে</strong>)।<br />
                <span className="text-amber-300 font-semibold">প্রি-অর্ডার পলিসি:</span> এটি একটি প্রি-অর্ডার প্রডাক্ট। বাহির থেকে ইমপোর্ট হয়ে আসতে ৭-১০ কার্যদিবস সময় লাগবে।
              </p>
            </div>

            <button
              onClick={() => setIsTrackOrderOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-full text-sm shrink-0 shadow-md cursor-pointer flex items-center gap-2 transition-all hover:scale-105"
            >
              <Truck className="w-4 h-4" />
              <span>পার্সেল ট্র্যাক করুন</span>
            </button>
          </div>
        </section>

      </main>

      {/* Trust Bar (Free Shipping • Secure Payment • 30-Day Returns • 24/7 Support) */}
      <TrustBar />

      {/* Customer-facing Footer with Store Info & Email - Only Logo opens Admin */}
      <Footer
        storeSettings={storeSettings}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      {/* Modals & Slide-out Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        storeSettings={storeSettings}
      />

      {isCheckoutOpen && (
        <CheckoutModal
          key={`checkout-modal-${orders.length}`}
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={cart}
          onOrderSuccess={handleOrderSuccess}
          storeSettings={storeSettings}
          currentUser={currentUser}
          onTrackOrder={(order) => {
            setIsCheckoutOpen(false);
            setSelectedTrackOrder(order);
            setIsTrackOrderOpen(true);
          }}
        />
      )}

      <ProductQuickView
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={Boolean(quickViewProduct && wishlist.includes(quickViewProduct.id))}
        currentUser={currentUser}
        orders={orders}
        onWriteReview={handleOpenReview}
        storeSettings={storeSettings}
      />

      <OrderTrackingModal
        isOpen={isTrackOrderOpen}
        onClose={() => {
          setIsTrackOrderOpen(false);
          setSelectedTrackOrder(null);
        }}
        orders={orders}
        selectedOrder={selectedTrackOrder}
      />

      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        items={products.filter((p) => wishlist.includes(p.id))}
        onRemoveFromWishlist={(id) => setWishlist((prev) => prev.filter((i) => i !== id))}
        onAddToCart={handleAddToCart}
      />

      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onUpdateUser={handleUpdateUser}
        orders={orders}
        onTrackOrder={(order) => {
          setSelectedTrackOrder(order);
          setIsTrackOrderOpen(true);
        }}
        onOpenShop={() => {
          const el = document.getElementById('products-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onWriteReview={handleOpenReview}
      />

      {/* Verified Customer Product Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setReviewProduct(null);
          setReviewOrderId(undefined);
        }}
        product={reviewProduct}
        orderId={reviewOrderId}
        currentUser={currentUser}
        onReviewSubmitted={(newReview) => {
          addToast('info', 'রিভিউ জমা হয়েছে ⭐', `"${reviewProduct?.name}" সম্পর্কে আপনার মূল্যবান মতামত প্রকাশ করা হয়েছে।`);
        }}
      />

      {/* Admin Management Modal with PIN Protection - Accessed via Logo */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        storeSettings={storeSettings}
        onUpdateStoreSettings={handleUpdateStoreSettings}
        onResetToDefault={handleResetToDefault}
        orders={orders}
        onUpdateOrder={handleUpdateOrder}
        onCancelOrder={handleCancelOrder}
      />

      <ToastContainer toasts={toasts} onDismiss={removeToast} />

    </div>
  );
}
