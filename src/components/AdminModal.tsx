import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Unlock,
  Plus,
  Edit,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Package,
  Settings,
  Image as ImageIcon,
  DollarSign,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Shield,
  Key,
  KeyRound,
  Download,
  FileCode,
  Tag,
  Mail,
  Sparkles,
  Truck,
  Percent,
  Camera,
  ImagePlus,
  Star,
} from 'lucide-react';
import { Product, StoreSettings, Order } from '../types';
import { sendTestEmail, EMAILJS_CONFIG } from '../services/emailService';
import { AdminOrdersManagement } from './AdminOrdersManagement';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  storeSettings: StoreSettings;
  onUpdateStoreSettings: (settings: StoreSettings) => void;
  onResetToDefault: () => void;
  orders: Order[];
  onUpdateOrder: (updatedOrder: Order) => void;
  onCancelOrder: (orderId: string, reason?: string) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  storeSettings,
  onUpdateStoreSettings,
  onResetToDefault,
  orders,
  onUpdateOrder,
  onCancelOrder,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const [activeTab, setActiveTab] = useState<'manage' | 'orders' | 'add' | 'security' | 'settings'>('manage');
  const [searchFilter, setSearchFilter] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Dedicated Admin PIN / Password Change State
  const [newAdminPin, setNewAdminPin] = useState(storeSettings.adminPin);
  const [confirmAdminPin, setConfirmAdminPin] = useState(storeSettings.adminPin);
  const [showPinSecret, setShowPinSecret] = useState(false);
  const [pinChangeError, setPinChangeError] = useState('');

  useEffect(() => {
    setNewAdminPin(storeSettings.adminPin);
    setConfirmAdminPin(storeSettings.adminPin);
  }, [storeSettings.adminPin]);

  // Whenever the admin modal is opened, always show the PIN Login page
  useEffect(() => {
    if (isOpen) {
      setIsAuthenticated(false);
      setEnteredPin('');
      setPinError(false);
      setActiveTab('manage');
    }
  }, [isOpen]);

  const handleSaveSecurityPin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPinChangeError('');
    if (!newAdminPin.trim()) {
      setPinChangeError('নতুন পিন খালি রাখা যাবে না।');
      return;
    }
    if (newAdminPin.trim().length < 3) {
      setPinChangeError('পিন ন্যূনতম ৩ ডিজিট হতে হবে।');
      return;
    }
    if (newAdminPin.trim() !== confirmAdminPin.trim()) {
      setPinChangeError('নতুন পিন এবং নিশ্চিতকরণ পিন একই হতে হবে।');
      return;
    }

    const updatedSettings: StoreSettings = {
      ...storeSettings,
      adminPin: newAdminPin.trim(),
    };
    onUpdateStoreSettings(updatedSettings);
    setTempSettings((prev) => ({ ...prev, adminPin: newAdminPin.trim() }));
    showNotification('✅ এডমিন কন্ট্রোল সেন্টারের সিকিউরিটি পিন সফলভাবে পরিবর্তন করা হয়েছে!');
  };

  const handleSendTestEmail = async () => {
    setIsSendingTestEmail(true);
    setTestEmailStatus(null);
    const result = await sendTestEmail();
    setIsSendingTestEmail(false);
    if (result.success) {
      setTestEmailStatus({
        type: 'success',
        message: `✅ টেস্ট ইমেইল সফলভাবে ${EMAILJS_CONFIG.ADMIN_EMAIL}-এ পাঠানো হয়েছে! আপনার ইনবক্স চেক করুন।`,
      });
    } else {
      setTestEmailStatus({
        type: 'error',
        message: `❌ ইমেইল পাঠাতে সমস্যা: ${result.error || 'Unknown error'}. আপনার EmailJS ড্যাশবোর্ডে টেমপ্লেট ও সার্ভিস চেক করুন।`,
      });
    }
  };

  // New Product Form State
  const initialNewProduct: Omit<Product, 'id'> = {
    name: '',
    category: 'electronics',
    categoryLabel: 'Electronics',
    price: 1500,
    originalPrice: 2000,
    rating: 5.0,
    reviewCount: 1,
    badge: 'NEW',
    badgeColor: 'teal',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    ],
    description: '',
    inStock: true,
    stockCount: 50,
    sku: `AB-${Math.floor(1000 + Math.random() * 9000)}`,
    features: ['১০০% অরিজিনাল ও প্রিমিয়াম কোয়ালিটি', 'ক্যাশ অন ডেলিভারি সুবিধা'],
    dropshipInfo: {
      origin: 'আন্তর্জাতিক সরবরাহকারী হাব (আমদানিকৃত)',
      estimatedDays: 'এটি একটি প্রি-অর্ডার প্রডাক্ট। বাহির থেকে ইমপোর্ট হয়ে আসতে ৭-১০ কার্যদিবস সময় লাগবে।',
      supplierRating: 4.9,
    },
  };

  const [newProduct, setNewProduct] = useState(initialNewProduct);
  const [newProductImageUrl, setNewProductImageUrl] = useState('');
  const [editProductImageUrl, setEditProductImageUrl] = useState('');
  const [newFeatureText, setNewFeatureText] = useState('');

  // Store Settings Form State
  const [tempSettings, setTempSettings] = useState<StoreSettings>(storeSettings);

  // Sync temp settings when storeSettings updates
  useEffect(() => {
    setTempSettings(storeSettings);
  }, [storeSettings]);

  if (!isOpen) return null;

  // Handle PIN authentication - Only accept the single configured admin PIN
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const configuredPin = (storeSettings.adminPin || '1234').trim();
    if (enteredPin.trim() === configuredPin) {
      setIsAuthenticated(true);
      setPinError(false);
      setEnteredPin('');
    } else {
      setPinError(true);
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Multiple Image Upload helpers (converts all selected files to base64 DataURLs)
  const handleMultipleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files) as File[];
    const readPromises = fileList.map((file: File) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then((newImages) => {
      if (isEditing && editingProduct) {
        const currentGallery = editingProduct.galleryImages && editingProduct.galleryImages.length > 0
          ? [...editingProduct.galleryImages]
          : (editingProduct.image ? [editingProduct.image] : []);
        const updated = [...currentGallery, ...newImages];
        setEditingProduct({
          ...editingProduct,
          image: updated[0] || '',
          galleryImages: updated,
        });
      } else {
        const currentGallery = newProduct.galleryImages && newProduct.galleryImages.length > 0
          ? [...newProduct.galleryImages]
          : (newProduct.image ? [newProduct.image] : []);
        const updated = [...currentGallery, ...newImages];
        setNewProduct({
          ...newProduct,
          image: updated[0] || '',
          galleryImages: updated,
        });
      }
      showNotification(`${newImages.length}টি ছবি সফলভাবে যুক্ত করা হয়েছে!`);
    });

    e.target.value = '';
  };

  // Helper to add image URL directly
  const handleAddImageUrl = (url: string, isEditing = false) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (isEditing && editingProduct) {
      const currentGallery = editingProduct.galleryImages && editingProduct.galleryImages.length > 0
        ? [...editingProduct.galleryImages]
        : (editingProduct.image ? [editingProduct.image] : []);
      const updated = [...currentGallery, trimmed];
      setEditingProduct({
        ...editingProduct,
        image: updated[0] || '',
        galleryImages: updated,
      });
      setEditProductImageUrl('');
    } else {
      const currentGallery = newProduct.galleryImages && newProduct.galleryImages.length > 0
        ? [...newProduct.galleryImages]
        : (newProduct.image ? [newProduct.image] : []);
      const updated = [...currentGallery, trimmed];
      setNewProduct({
        ...newProduct,
        image: updated[0] || '',
        galleryImages: updated,
      });
      setNewProductImageUrl('');
    }
    showNotification('ছবির লিংক যুক্ত করা হয়েছে!');
  };

  // Remove single image from product gallery
  const handleRemoveImage = (indexToRemove: number, isEditing = false) => {
    if (isEditing && editingProduct) {
      const currentGallery = editingProduct.galleryImages && editingProduct.galleryImages.length > 0
        ? [...editingProduct.galleryImages]
        : (editingProduct.image ? [editingProduct.image] : []);
      const updated = currentGallery.filter((_, i) => i !== indexToRemove);
      setEditingProduct({
        ...editingProduct,
        image: updated.length > 0 ? updated[0] : '',
        galleryImages: updated,
      });
    } else {
      const currentGallery = newProduct.galleryImages && newProduct.galleryImages.length > 0
        ? [...newProduct.galleryImages]
        : (newProduct.image ? [newProduct.image] : []);
      const updated = currentGallery.filter((_, i) => i !== indexToRemove);
      setNewProduct({
        ...newProduct,
        image: updated.length > 0 ? updated[0] : '',
        galleryImages: updated,
      });
    }
  };

  // Set an image as primary (moves it to index 0)
  const handleSetPrimaryImage = (indexToPrimary: number, isEditing = false) => {
    if (isEditing && editingProduct) {
      const currentGallery = editingProduct.galleryImages && editingProduct.galleryImages.length > 0
        ? [...editingProduct.galleryImages]
        : (editingProduct.image ? [editingProduct.image] : []);
      const selected = currentGallery[indexToPrimary];
      const remaining = currentGallery.filter((_, i) => i !== indexToPrimary);
      const reordered = [selected, ...remaining];
      setEditingProduct({
        ...editingProduct,
        image: selected,
        galleryImages: reordered,
      });
      showNotification('মূল কভার ছবি পরিবর্তন করা হয়েছে!');
    } else {
      const currentGallery = newProduct.galleryImages && newProduct.galleryImages.length > 0
        ? [...newProduct.galleryImages]
        : (newProduct.image ? [newProduct.image] : []);
      const selected = currentGallery[indexToPrimary];
      const remaining = currentGallery.filter((_, i) => i !== indexToPrimary);
      const reordered = [selected, ...remaining];
      setNewProduct({
        ...newProduct,
        image: selected,
        galleryImages: reordered,
      });
      showNotification('মূল কভার ছবি সেট করা হয়েছে!');
    }
  };

  // Clear all images
  const handleClearAllImages = (isEditing = false) => {
    if (isEditing && editingProduct) {
      setEditingProduct({
        ...editingProduct,
        image: '',
        galleryImages: [],
      });
    } else {
      setNewProduct({
        ...newProduct,
        image: '',
        galleryImages: [],
      });
    }
    showNotification('সকল ছবি মুছে ফেলা হয়েছে');
  };

  // Add Product Submit
  const handleAddNewProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim() || newProduct.price <= 0) {
      alert('অনুগ্রহ করে পণ্যের নাম ও সঠিক মূল্য প্রদান করুন');
      return;
    }

    const currentGallery = newProduct.galleryImages && newProduct.galleryImages.length > 0
      ? newProduct.galleryImages
      : (newProduct.image ? [newProduct.image] : []);

    if (currentGallery.length === 0) {
      alert('অনুগ্রহ করে পণ্যের অন্তত একটি ছবি যুক্ত করুন');
      return;
    }

    const primaryImage = newProduct.image || currentGallery[0];
    const finalGallery = currentGallery.includes(primaryImage)
      ? [primaryImage, ...currentGallery.filter((img) => img !== primaryImage)]
      : [primaryImage, ...currentGallery];

    const created: Product = {
      ...newProduct,
      image: primaryImage,
      galleryImages: finalGallery,
      id: `prod-${Date.now()}`,
      categoryLabel:
        newProduct.category === 'electronics'
          ? 'Electronics'
          : newProduct.category === 'fashion'
          ? "Women's Fashion"
          : newProduct.category === 'cosmetics'
          ? 'Cosmetics'
          : newProduct.category === 'home'
          ? 'Home Decor'
          : newProduct.category === 'others'
          ? 'অন্যান্য (Others)'
          : newProduct.category,
    };

    onAddProduct(created);
    setNewProduct(initialNewProduct);
    showNotification('নতুন প্রোডাক্ট সফলভাবে যুক্ত করা হয়েছে!');
    setActiveTab('manage');
  };

  // Edit Product Submit
  const handleSaveEditedProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const currentGallery = editingProduct.galleryImages && editingProduct.galleryImages.length > 0
      ? editingProduct.galleryImages
      : (editingProduct.image ? [editingProduct.image] : []);

    const primaryImage = editingProduct.image || (currentGallery.length > 0 ? currentGallery[0] : '');
    const finalGallery = primaryImage && !currentGallery.includes(primaryImage)
      ? [primaryImage, ...currentGallery]
      : currentGallery;

    onUpdateProduct({
      ...editingProduct,
      image: primaryImage,
      galleryImages: finalGallery,
    });
    setEditingProduct(null);
    showNotification('প্রোডাক্টের তথ্য সফলভাবে আপডেট করা হয়েছে!');
  };

  // Delete Product Handler
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে "${name}" প্রোডাক্টটি মুছে ফেলতে চান?`)) {
      onDeleteProduct(id);
      showNotification('প্রোডাক্টটি সফলভাবে মুছে ফেলা হয়েছে!');
    }
  };

  // Save Store Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStoreSettings(tempSettings);
    showNotification('স্টোর সেটিংস সফলভাবে আপডেট করা হয়েছে!');
  };

  // Export JSON Catalog
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `amader_bazar_catalog_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Sample preset images for quick selection
  const sampleImages = [
    { label: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80' },
    { label: 'Silk Scarf', url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&auto=format&fit=crop&q=80' },
    { label: 'Serum', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80' },
    { label: 'Ceramic Pot', url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&auto=format&fit=crop&q=80' },
    { label: 'Smartwatch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80' },
    { label: 'Summer Dress', url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80' },
    { label: 'Rose Mist', url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80' },
    { label: 'Desk Lamp', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80' },
  ];

  // Render multi-image gallery manager for new product or edit product
  const renderImageManager = (isEditing: boolean) => {
    const targetProduct = isEditing ? editingProduct : newProduct;
    if (!targetProduct) return null;

    const gallery: string[] =
      targetProduct.galleryImages && targetProduct.galleryImages.length > 0
        ? targetProduct.galleryImages
        : targetProduct.image
        ? [targetProduct.image]
        : [];

    const inputUrl = isEditing ? editProductImageUrl : newProductImageUrl;
    const setInputUrl = isEditing ? setEditProductImageUrl : setNewProductImageUrl;

    return (
      <div className="space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-amber-600" />
            <span>পণ্যের ছবি ও ফটো গ্যালারি (Product Images & Gallery) *</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/60">
              📷 {gallery.length}টি ছবি যুক্ত আছে
            </span>
            {gallery.length > 0 && (
              <button
                type="button"
                onClick={() => handleClearAllImages(isEditing)}
                className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer hover:underline"
              >
                <Trash2 className="w-3 h-3" />
                <span>সব মুছুন</span>
              </button>
            )}
          </div>
        </div>

        {/* Gallery Grid (Shows all added photos) */}
        {gallery.length > 0 ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {gallery.map((imgUrl, idx) => {
                const isPrimary = idx === 0;
                return (
                  <div
                    key={idx}
                    className={`relative group bg-white rounded-xl border overflow-hidden transition-all shadow-xs flex flex-col ${
                      isPrimary
                        ? 'border-amber-500 ring-2 ring-amber-400/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Image Preview */}
                    <div className="relative aspect-square w-full bg-slate-100/60 flex items-center justify-center p-2">
                      <img
                        src={imgUrl}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-contain mix-blend-multiply"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                        }}
                      />

                      {/* Primary Badge or Index Badge */}
                      {isPrimary ? (
                        <span className="absolute top-1.5 left-1.5 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-slate-950" />
                          মূল কভার ছবি
                        </span>
                      ) : (
                        <span className="absolute top-1.5 left-1.5 bg-slate-800/80 text-white font-bold text-[9px] px-1.5 py-0.5 rounded shadow-xs">
                          #{idx + 1}
                        </span>
                      )}

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx, isEditing)}
                        title="এই ছবিটি মুছে ফেলুন"
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-center">
                      {isPrimary ? (
                        <span className="text-[10.5px] text-amber-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          প্রধান ছবি
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx, isEditing)}
                          className="w-full py-1 text-[10.5px] font-bold text-amber-900 bg-amber-100/80 hover:bg-amber-200 rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Star className="w-3 h-3 text-amber-600" />
                          <span>মূল ছবি করুন</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add More Tile inside the grid */}
              <label className="flex flex-col items-center justify-center min-h-[120px] aspect-square rounded-xl border-2 border-dashed border-amber-300 hover:border-amber-500 bg-white hover:bg-amber-50/50 cursor-pointer transition-all text-center p-3 group">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <ImagePlus className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800">
                  + আরো ছবি যোগ করুন
                </span>
                <span className="text-[10px] text-slate-500">
                  (একাধিক নির্বাচন সম্ভব)
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleMultipleImageFileUpload(e, isEditing)}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        ) : (
          /* Empty State - Big Multi-upload Dropzone */
          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-amber-400 hover:border-amber-500 bg-white hover:bg-amber-50/50 rounded-2xl cursor-pointer transition-all text-center group shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <ImagePlus className="w-7 h-7" />
            </div>
            <span className="text-sm font-black text-slate-900">
              📸 একাধিক ছবি আপলোড করুন (মোবাইল / কম্পিউটার থেকে)
            </span>
            <span className="text-xs text-amber-800 font-semibold mt-1">
              একসাথে এক বা একাধিক ছবি সিলেক্ট করতে পারবেন
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5">
              ফাইল বেছে নিতে এখানে ক্লিক করুন (JPG, PNG, WebP)
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleMultipleImageFileUpload(e, isEditing)}
              className="hidden"
            />
          </label>
        )}

        {/* URL Input */}
        <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-600">
            অথবা সরাসরি ওয়েব ছবির লিংক (URL) যুক্ত করুন:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddImageUrl(inputUrl, isEditing);
                }
              }}
              placeholder="https://images.unsplash.com/photo-..."
              className="flex-1 text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:border-amber-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleAddImageUrl(inputUrl, isEditing)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shrink-0 cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>যোগ করুন</span>
            </button>
          </div>
        </div>

        {/* Preset Sample Images */}
        <div className="pt-2 border-t border-slate-200/80">
          <span className="text-[11px] text-slate-500 font-medium">
            অথবা নিচের নমুনা ছবি থেকে ক্লিক করে গ্যালারিতে যোগ করুন:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
            {sampleImages.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddImageUrl(s.url, isEditing)}
                className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50/50 text-left cursor-pointer transition-all"
              >
                <img
                  src={s.url}
                  alt={s.label}
                  className="w-8 h-8 object-cover rounded shrink-0"
                />
                <span className="text-[11px] font-medium text-slate-700 truncate">{s.label}</span>
                <Plus className="w-3 h-3 text-slate-400 ml-auto shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 md:p-6">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity" />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden z-10 border border-slate-200">
        
        {/* Header */}
        <div className="bg-[#07172b] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black font-['Outfit',sans-serif] tracking-wide">
                  অনার ও এডমিন কন্ট্রোল সেন্টার
                </h2>
                <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                শুধুমাত্র আপনি প্রোডাক্ট যুক্ত, মূল্য ও স্টোরের যাবতীয় তথ্য সম্পাদনা করতে পারবেন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('security');
                    setEditingProduct(null);
                  }}
                  className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/40 flex items-center gap-1.5 cursor-pointer transition-colors font-semibold"
                  title="এডমিন পাসওয়ার্ড বা সিকিউরিটি পিন পরিবর্তন করুন"
                >
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>পিন পরিবর্তন</span>
                </button>
                <button
                  onClick={() => setIsAuthenticated(false)}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                  title="লক করুন"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>লক করুন</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fadeIn shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Content Area */}
        {!isAuthenticated ? (
          /* Authentication Screen */
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto my-auto">
            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-inner">
              <KeyRound className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">
                এডমিন সিকিউরিটি পিন দিন
              </h3>
              <p className="text-xs text-slate-500">
                অনাকাঙ্ক্ষিত সম্পাদন রোধ করতে আপনার গোপন পিন প্রয়োজন।
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div>
                <input
                  type="password"
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="••••"
                  className={`w-full text-center tracking-[0.4em] font-mono text-2xl py-3 px-4 rounded-xl border ${
                    pinError ? 'border-rose-500 bg-rose-50' : 'border-slate-300 bg-slate-50'
                  } focus:outline-none focus:border-amber-500 focus:bg-white transition-all`}
                  autoFocus
                />
                {pinError && (
                  <p className="text-rose-600 text-xs font-semibold mt-1.5 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    ভুল পিন দিয়েছেন! আবার চেষ্টা করুন।
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>লগইন ও আনলক করুন</span>
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Tabs Navigation */}
            <div className="bg-slate-100 border-b border-slate-200 px-6 pt-3 flex gap-2 shrink-0 overflow-x-auto">
              <button
                onClick={() => {
                  setActiveTab('manage');
                  setEditingProduct(null);
                }}
                className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                  activeTab === 'manage'
                    ? 'bg-white text-slate-900 shadow-xs border-t-2 border-amber-500'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Package className="w-4 h-4 text-amber-500" />
                <span>প্রোডাক্ট ম্যানেজ ({products.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('orders');
                  setEditingProduct(null);
                }}
                className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-white text-slate-900 shadow-xs border-t-2 border-amber-500'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Truck className="w-4 h-4 text-sky-600" />
                <span>📦 পার্সেল ট্র্যাকিং ও অর্ডার ({orders.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('add');
                  setEditingProduct(null);
                }}
                className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                  activeTab === 'add'
                    ? 'bg-white text-slate-900 shadow-xs border-t-2 border-amber-500'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>➕ নতুন প্রোডাক্ট যুক্ত করুন</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('security');
                  setEditingProduct(null);
                }}
                className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                  activeTab === 'security'
                    ? 'bg-white text-slate-900 shadow-xs border-t-2 border-amber-500'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Key className="w-4 h-4 text-amber-600" />
                <span>🔑 পাসওয়ার্ড / পিন পরিবর্তন</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('settings');
                  setEditingProduct(null);
                }}
                className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-white text-slate-900 shadow-xs border-t-2 border-amber-500'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Settings className="w-4 h-4 text-blue-600" />
                <span>স্টোর সেটিংস ও ডেলিভারি</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
              
              {/* TAB 1: MANAGE & EDIT PRODUCTS */}
              {activeTab === 'manage' && !editingProduct && (
                <div className="space-y-4">
                  
                  {/* Top search and actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="প্রোডাক্ট খুঁজুন (নাম বা ক্যাটাগরি)..."
                      className="w-full sm:w-72 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                    />

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={handleExportJSON}
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 flex items-center gap-1.5 cursor-pointer"
                        title="JSON ব্যাকআপ ডাউনলোড"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-600" />
                        <span>ব্যাকআপ এক্সপোর্ট</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('add')}
                        className="px-3.5 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>নতুন যুক্ত করুন</span>
                      </button>
                    </div>
                  </div>

                  {/* Product Cards List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {products
                      .filter(
                        (p) =>
                          p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchFilter.toLowerCase())
                      )
                      .map((product) => (
                        <div
                          key={product.id}
                          className="bg-white rounded-xl border border-slate-200 p-3.5 flex gap-3.5 hover:shadow-md transition-shadow relative"
                        >
                          {/* Image */}
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-20 h-20 object-contain rounded-lg bg-slate-50 p-1 border border-slate-200 shrink-0"
                          />

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-bold text-slate-900 text-sm truncate">
                                {product.name}
                              </h4>
                              {product.badge && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                                  {product.badge}
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-500 capitalize mt-0.5">
                              {product.categoryLabel || product.category} • SKU: {product.sku}
                            </p>

                            <div className="flex items-baseline gap-2 mt-1.5">
                              <span className="font-black text-slate-900 text-base">
                                ৳ {product.price.toLocaleString()}
                              </span>
                              {product.originalPrice && (
                                <span className="text-xs text-slate-400 line-through">
                                  ৳ {product.originalPrice.toLocaleString()}
                                </span>
                              )}
                              <span
                                className={`text-[10px] font-bold ml-auto px-1.5 py-0.5 rounded ${
                                  product.inStock
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-rose-50 text-rose-700'
                                }`}
                              >
                                {product.inStock ? `স্টকে আছে (${product.stockCount})` : 'স্টক শেষ'}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-slate-100">
                              <button
                                onClick={() =>
                                  setEditingProduct({
                                    ...product,
                                    galleryImages:
                                      product.galleryImages && product.galleryImages.length > 0
                                        ? product.galleryImages
                                        : product.image
                                        ? [product.image]
                                        : [],
                                  })
                                }
                                className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Edit className="w-3 h-3" />
                                <span>সম্পাদনা (Edit)</span>
                              </button>

                              <button
                                onClick={() => handleDelete(product.id, product.name)}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>মুছে ফেলুন</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                </div>
              )}

              {/* EDIT SINGLE PRODUCT FORM */}
              {activeTab === 'manage' && editingProduct && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
                    <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                      <Edit className="w-4 h-4 text-amber-500" />
                      প্রোডাক্ট সম্পাদনা করুন: {editingProduct.name}
                    </h3>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                    >
                      ← ব্যাকে যান
                    </button>
                  </div>

                  <form onSubmit={handleSaveEditedProduct} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          পণ্যের নাম (Product Name)*
                        </label>
                        <input
                          type="text"
                          value={editingProduct.name}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, name: e.target.value })
                          }
                          className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:border-amber-500 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ক্যাটাগরি (Category)*
                        </label>
                        <select
                          value={editingProduct.category}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              category: e.target.value as any,
                              categoryLabel: e.target.options[e.target.selectedIndex].text,
                            })
                          }
                          className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:border-amber-500 focus:outline-none"
                        >
                          <option value="electronics">Electronics (ইলেকট্রনিক্স)</option>
                          <option value="fashion">Women's Fashion (পোশাক ও ফ্যাশন)</option>
                          <option value="cosmetics">Cosmetics (কসমেটিক্স ও স্কিনকেয়ার)</option>
                          <option value="home">Home Decor (গৃহস্থালি ও ডেকোর)</option>
                          <option value="others">অন্যান্য (Others)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          বিক্রয় মূল্য টাকায় (Price ৳)*
                        </label>
                        <input
                          type="number"
                          value={editingProduct.price}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              price: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full text-sm font-bold px-3 py-2 border border-slate-300 rounded-lg focus:border-amber-500 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          পূর্বের মূল্য টাকায় (Original Price ৳ - ঐচ্ছিক)
                        </label>
                        <input
                          type="number"
                          value={editingProduct.originalPrice || ''}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              originalPrice: parseFloat(e.target.value) || undefined,
                            })
                          }
                          placeholder="যেমন: 3000"
                          className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ব্যাজ (Badge)
                        </label>
                        <select
                          value={editingProduct.badge || ''}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, badge: e.target.value as any })
                          }
                          className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:border-amber-500 focus:outline-none"
                        >
                          <option value="">কোনো ব্যাজ নেই</option>
                          <option value="25% OFF">25% OFF</option>
                          <option value="BESTSELLER">BESTSELLER</option>
                          <option value="NEW">NEW</option>
                          <option value="TRENDING">TRENDING</option>
                          <option value="HOT DEAL">HOT DEAL</option>
                          <option value="LIMITED">LIMITED</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          স্টক পরিমাণ (Stock Quantity)
                        </label>
                        <input
                          type="number"
                          value={editingProduct.stockCount}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              stockCount: parseInt(e.target.value) || 0,
                              inStock: (parseInt(e.target.value) || 0) > 0,
                            })
                          }
                          className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-6">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingProduct.inStock}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                inStock: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                        <span className="text-xs font-bold text-slate-800">
                          {editingProduct.inStock ? 'পণ্যটি স্টকে এভেইলেবল আছে' : 'স্টক আউট'}
                        </span>
                      </div>
                    </div>

                    {/* Multiple Images & Gallery Manager */}
                    {renderImageManager(true)}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        পণ্যের সংক্ষিপ্ত বিবরণ (Description)
                      </label>
                      <textarea
                        rows={3}
                        value={editingProduct.description}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            description: e.target.value,
                          })
                        }
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        বাতিল করুন
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>আপডেট সেভ করুন</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: ADD NEW PRODUCT */}
              {activeTab === 'add' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <div className="pb-3 mb-4 border-b border-slate-200">
                    <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-emerald-600" />
                      নতুন প্রোডাক্ট যুক্ত করুন (Add New Product)
                    </h3>
                    <p className="text-xs text-slate-500">
                      তথ্য দিয়ে পাবলিশ বাটনে ক্লিক করলেই প্রোডাক্টটি আপনার সাইটে সরাসরি চলে আসবে।
                    </p>
                  </div>

                  <form onSubmit={handleAddNewProductSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          পণ্যের নাম (Product Name)*
                        </label>
                        <input
                          type="text"
                          value={newProduct.name}
                          onChange={(e) =>
                            setNewProduct({ ...newProduct, name: e.target.value })
                          }
                          placeholder="যেমন: Wireless Earbuds X1"
                          className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:border-amber-500 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ক্যাটাগরি (Category)*
                        </label>
                        <select
                          value={newProduct.category}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              category: e.target.value as any,
                              categoryLabel: e.target.options[e.target.selectedIndex].text,
                            })
                          }
                          className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:border-amber-500 focus:outline-none"
                        >
                          <option value="electronics">Electronics (ইলেকট্রনিক্স)</option>
                          <option value="fashion">Women's Fashion (পোশাক ও ফ্যাশন)</option>
                          <option value="cosmetics">Cosmetics (কসমেটিক্স ও স্কিনকেয়ার)</option>
                          <option value="home">Home Decor (গৃহস্থালি ও ডেকোর)</option>
                          <option value="others">অন্যান্য (Others)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          বিক্রয় মূল্য টাকায় (Price ৳)*
                        </label>
                        <input
                          type="number"
                          value={newProduct.price}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              price: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="যেমন: 2500"
                          className="w-full text-sm font-bold px-3 py-2 border border-slate-300 rounded-lg focus:border-amber-500 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          পূর্বের মূল্য টাকায় (Original Price ৳)
                        </label>
                        <input
                          type="number"
                          value={newProduct.originalPrice || ''}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              originalPrice: parseFloat(e.target.value) || undefined,
                            })
                          }
                          placeholder="যেমন: 3500 (ডিসকাউন্ট দেখাবে)"
                          className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ব্যাজ (Badge)
                        </label>
                        <select
                          value={newProduct.badge || ''}
                          onChange={(e) =>
                            setNewProduct({ ...newProduct, badge: e.target.value as any })
                          }
                          className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:border-amber-500 focus:outline-none"
                        >
                          <option value="NEW">NEW (নতুন)</option>
                          <option value="BESTSELLER">BESTSELLER (বেস্ট সেলার)</option>
                          <option value="25% OFF">25% OFF (ডিসকাউন্ট)</option>
                          <option value="TRENDING">TRENDING (জনপ্রিয়)</option>
                          <option value="HOT DEAL">HOT DEAL</option>
                          <option value="LIMITED">LIMITED STOCK</option>
                          <option value="">কোনো ব্যাজ নেই</option>
                        </select>
                      </div>
                    </div>

                    {/* Multiple Images & Gallery Manager */}
                    {renderImageManager(false)}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        পণ্যের বর্ণনা ও বিবরণ (Description)
                      </label>
                      <textarea
                        rows={3}
                        value={newProduct.description}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, description: e.target.value })
                        }
                        placeholder="পণ্যটির গুণাগুণ ও বিস্তারিত লিখুন..."
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <button
                        type="submit"
                        className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-sm font-extrabold shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                      >
                        <Plus className="w-4 h-4" />
                        <span>প্রোডাক্ট পাবলিশ করুন (Publish)</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: STORE SETTINGS & PIN */}
              {activeTab === 'settings' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-blue-600" />
                      স্টোর, ডেলিভারি ও ডিসকাউন্ট সেটিংস
                    </h3>
                    <p className="text-xs text-slate-500">
                      ডেলিভারি চার্জ, ফ্রি ডেলিভারি ও ডিসকাউন্ট থ্রেশহোল্ড, সাপোর্ট ইমেইল ও এডমিন পিন পরিবর্তন করুন
                    </p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-5">
                    {/* Store Name & Tagline */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          স্টোরের নাম (Store Name)
                        </label>
                        <input
                          type="text"
                          value={tempSettings.storeName}
                          onChange={(e) =>
                            setTempSettings({ ...tempSettings, storeName: e.target.value })
                          }
                          className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:border-amber-500 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          স্লোগান (Tagline)
                        </label>
                        <input
                          type="text"
                          value={tempSettings.tagline}
                          onChange={(e) =>
                            setTempSettings({ ...tempSettings, tagline: e.target.value })
                          }
                          className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Support Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-amber-600" />
                        <span>কাস্টমার সাপোর্ট ই-মেইল (Official Contact Email)</span>
                      </label>
                      <input
                        type="email"
                        value={tempSettings.contactEmail || ''}
                        onChange={(e) =>
                          setTempSettings({ ...tempSettings, contactEmail: e.target.value })
                        }
                        placeholder="amaderbazar.ab.ds@gmail.com"
                        className="w-full text-sm font-mono px-3 py-2 border border-slate-300 rounded-lg focus:border-amber-500 focus:outline-none"
                        required
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        ওয়েবসাইটের টপ বার, ফুটার ও অর্ডার যোগাযোগে এই ইমেইলটি প্রদর্শিত হবে।
                      </p>
                    </div>

                    {/* EmailJS Order Notification Service Card */}
                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                              <span>অটোমেটিক ই-মেইল অর্ডার নোটিফিকেশন</span>
                              <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                🟢 ACTIVE
                              </span>
                            </h4>
                            <p className="text-[11px] text-emerald-800">
                              গ্রাহক কোনো অর্ডার প্লেস করলেই সাথে সাথে সম্পূর্ণ বিবরণ আপনার ইমেইলে চলে যাবে।
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-white p-3 rounded-xl border border-emerald-100 font-mono text-slate-700">
                        <div>
                          <strong className="text-slate-900 font-sans">Recipient Email:</strong> {EMAILJS_CONFIG.ADMIN_EMAIL}
                        </div>
                        <div>
                          <strong className="text-slate-900 font-sans">Service ID:</strong> {EMAILJS_CONFIG.SERVICE_ID}
                        </div>
                        <div>
                          <strong className="text-slate-900 font-sans">Template ID:</strong> {EMAILJS_CONFIG.TEMPLATE_ID}
                        </div>
                        <div>
                          <strong className="text-slate-900 font-sans">Public Key:</strong> {EMAILJS_CONFIG.PUBLIC_KEY}
                        </div>
                      </div>

                      {testEmailStatus && (
                        <div
                          className={`p-3 rounded-xl text-xs font-medium border ${
                            testEmailStatus.type === 'success'
                              ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900'
                              : 'bg-rose-50 border-rose-200 text-rose-800'
                          }`}
                        >
                          {testEmailStatus.message}
                        </div>
                      )}

                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[11px] text-emerald-700">
                          কনফিগারেশন টেস্ট করতে ক্লিক করুন 👉
                        </span>
                        <button
                          type="button"
                          onClick={handleSendTestEmail}
                          disabled={isSendingTestEmail}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {isSendingTestEmail ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>টেস্ট ইমেইল পাঠানো হচ্ছে...</span>
                            </>
                          ) : (
                            <>
                              <Mail className="w-3.5 h-3.5" />
                              <span>টেস্ট ইমেইল পাঠান (Test Email)</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Announcement Notice */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        টপ অ্যানাউন্সমেন্ট বার নোটিশ (Announcement Bar Notice)
                      </label>
                      <input
                        type="text"
                        value={tempSettings.announcement}
                        onChange={(e) =>
                          setTempSettings({ ...tempSettings, announcement: e.target.value })
                        }
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    {/* EDITABLE DELIVERY & DISCOUNT RULES */}
                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                      <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-amber-600" />
                        ডেলিভারি চার্জ ও ডিসকাউন্ট অফার কন্ট্রোল (Delivery Rates & Offers)
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Inside Dhaka standard fee */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            ঢাকা সিটি স্ট্যান্ডার্ড চার্জ (৳ BDT)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-xs font-bold text-slate-500">৳</span>
                            <input
                              type="number"
                              min={0}
                              value={tempSettings.insideDhakaFee}
                              onChange={(e) =>
                                setTempSettings({
                                  ...tempSettings,
                                  insideDhakaFee: Number(e.target.value) || 0,
                                })
                              }
                              className="w-full pl-8 pr-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-lg bg-white focus:border-amber-500 focus:outline-none"
                              required
                            />
                          </div>
                        </div>

                        {/* Outside Dhaka standard fee */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            ঢাকার বাইরে স্ট্যান্ডার্ড চার্জ (৳ BDT)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-xs font-bold text-slate-500">৳</span>
                            <input
                              type="number"
                              min={0}
                              value={tempSettings.outsideDhakaFee}
                              onChange={(e) =>
                                setTempSettings({
                                  ...tempSettings,
                                  outsideDhakaFee: Number(e.target.value) || 0,
                                })
                              }
                              className="w-full pl-8 pr-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-lg bg-white focus:border-amber-500 focus:outline-none"
                              required
                            />
                          </div>
                        </div>

                        {/* Minimum Shopping Threshold */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            কত টাকার শপিং করলে অফার প্রযোজ্য হবে (Threshold ৳)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-xs font-bold text-slate-500">৳</span>
                            <input
                              type="number"
                              min={0}
                              step={100}
                              value={tempSettings.freeShippingThreshold}
                              onChange={(e) =>
                                setTempSettings({
                                  ...tempSettings,
                                  freeShippingThreshold: Number(e.target.value) || 0,
                                })
                              }
                              className="w-full pl-8 pr-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-lg bg-white focus:border-amber-500 focus:outline-none"
                              required
                            />
                          </div>
                          <span className="text-[11px] text-slate-500">
                            যেমন: ৳{tempSettings.freeShippingThreshold.toLocaleString()} এর বেশি অর্ডারে স্পেশাল অফার আনলক হবে
                          </span>
                        </div>

                        {/* Outside Dhaka discount % */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            ঢাকার বাইরে ডেলিভারি চার্জে কত % ছাড় হবে
                          </label>
                          <div className="relative">
                            <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={tempSettings.outsideDhakaDiscountPercent}
                              onChange={(e) =>
                                setTempSettings({
                                  ...tempSettings,
                                  outsideDhakaDiscountPercent: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                                })
                              }
                              className="w-full pr-8 pl-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-lg bg-white focus:border-amber-500 focus:outline-none"
                              required
                            />
                          </div>
                          <span className="text-[11px] text-slate-500">
                            যেমন: {tempSettings.outsideDhakaDiscountPercent}% ছাড় (কাস্টমার দিবে মাত্র ৳{Math.round(tempSettings.outsideDhakaFee - (tempSettings.outsideDhakaFee * tempSettings.outsideDhakaDiscountPercent) / 100)})
                          </span>
                        </div>
                      </div>

                      {/* Live Calculation Preview */}
                      <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200/80 space-y-1.5 text-xs text-amber-950">
                        <div className="font-bold flex items-center gap-1.5 text-amber-900">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>বর্তমান লাইভ ক্যালকুলেশন প্রিভিউ:</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11.5px]">
                          <div className="p-2 bg-white rounded-lg border border-amber-200">
                            <strong>ঢাকা সিটি:</strong> সাধারণ চার্জ ৳{tempSettings.insideDhakaFee} • ৳{tempSettings.freeShippingThreshold.toLocaleString()}+ অর্ডারে <strong>ফ্রি (৳০)</strong>
                          </div>
                          <div className="p-2 bg-white rounded-lg border border-amber-200">
                            <strong>ঢাকার বাইরে:</strong> সাধারণ চার্জ ৳{tempSettings.outsideDhakaFee} • ৳{tempSettings.freeShippingThreshold.toLocaleString()}+ অর্ডারে {tempSettings.outsideDhakaDiscountPercent}% ছাড় (<strong>মাত্র ৳{Math.round(tempSettings.outsideDhakaFee - (tempSettings.outsideDhakaFee * tempSettings.outsideDhakaDiscountPercent) / 100)}</strong>)
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Security PIN Change */}
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                      <label className="block text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        মাস্টার সিকিউরিটি পিন পরিবর্তন (Master Security PIN)
                      </label>
                      <input
                        type="text"
                        value={tempSettings.adminPin}
                        onChange={(e) =>
                          setTempSettings({ ...tempSettings, adminPin: e.target.value })
                        }
                        placeholder="e.g. 1234"
                        className="w-48 text-sm font-mono font-bold px-3 py-1.5 border border-amber-300 rounded-lg focus:border-amber-600 focus:outline-none bg-white"
                        required
                      />
                      <p className="text-[11px] text-amber-700">
                        লোগোতে ক্লিক করার পর শুধুমাত্র সঠিক পিন দিলে এই কন্ট্রোল সেন্টারটি খুলবে।
                      </p>
                    </div>

                    <div className="pt-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('আপনি কি ডিফল্ট ক্যাটালগ ও সেটিংসে ফিরে যেতে চান?')) {
                            onResetToDefault();
                            showNotification('স্টোর ডিফল্ট অবস্থায় রিসেট করা হয়েছে');
                          }
                        }}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>ডিফল্ট ক্যাটালগে রিসেট করুন</span>
                      </button>

                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                      >
                        <Save className="w-4 h-4" />
                        <span>সেটিংস সংরক্ষণ করুন</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB: SECURITY & PIN CHANGE */}
              {activeTab === 'security' && (
                <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                    <div className="p-3.5 bg-amber-500/10 text-amber-600 rounded-2xl border border-amber-500/20">
                      <KeyRound className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        এডমিন কন্ট্রোল সেন্টার পাসওয়ার্ড / পিন পরিবর্তন
                      </h3>
                      <p className="text-xs text-slate-500">
                        অনাকাঙ্ক্ষিত ব্যক্তি থেকে আপনার পণ্য, মূল্য ও স্টোর সেটিংস সুরক্ষিত রাখতে গোপন পিন পরিবর্তন করুন।
                      </p>
                    </div>
                  </div>

                  {/* Current PIN reminder */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">বর্তমান সক্রিয় পিন (Current PIN):</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm bg-white px-3 py-1 rounded-lg border border-slate-300 text-slate-900 tracking-widest">
                        {showPinSecret ? storeSettings.adminPin : '••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPinSecret(!showPinSecret)}
                        className="text-slate-500 hover:text-slate-800 p-1 cursor-pointer"
                        title={showPinSecret ? 'লুকান' : 'দেখান'}
                      >
                        {showPinSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSaveSecurityPin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        নতুন সিকিউরিটি পিন দিন (New PIN) *
                      </label>
                      <input
                        type={showPinSecret ? 'text' : 'password'}
                        value={newAdminPin}
                        onChange={(e) => {
                          setNewAdminPin(e.target.value);
                          setPinChangeError('');
                        }}
                        placeholder="e.g. 1234 বা গোপন কোড"
                        className="w-full text-sm font-mono tracking-widest px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:border-amber-500 focus:bg-white focus:outline-none"
                        required
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        ন্যূনতম ৩ ডিজিট বা অক্ষরের যেকোনো গোপন পিন কোড।
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        নতুন পিন পুনরায় দিন (Confirm New PIN) *
                      </label>
                      <input
                        type={showPinSecret ? 'text' : 'password'}
                        value={confirmAdminPin}
                        onChange={(e) => {
                          setConfirmAdminPin(e.target.value);
                          setPinChangeError('');
                        }}
                        placeholder="পুনরায় নতুন পিন দিন"
                        className="w-full text-sm font-mono tracking-widest px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:border-amber-500 focus:bg-white focus:outline-none"
                        required
                      />
                    </div>

                    {pinChangeError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{pinChangeError}</span>
                      </div>
                    )}

                    {/* Quick PIN Presets */}
                    <div className="pt-1">
                      <span className="text-[11px] text-slate-500 font-medium">সহজ টেস্ট পিন বেছে নিন:</span>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {['1234', '5678', '0000', '9999'].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => {
                              setNewAdminPin(p);
                              setConfirmAdminPin(p);
                              setPinChangeError('');
                            }}
                            className="px-2.5 py-1 text-xs font-mono bg-slate-100 hover:bg-amber-100 hover:text-amber-900 rounded-lg border border-slate-200 cursor-pointer transition-colors"
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setNewAdminPin(storeSettings.adminPin);
                          setConfirmAdminPin(storeSettings.adminPin);
                          setPinChangeError('');
                        }}
                        className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                      >
                        রিসেট করুন
                      </button>

                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow cursor-pointer flex items-center gap-2 transition-all hover:shadow-md"
                      >
                        <Save className="w-4 h-4" />
                        <span>নতুন পিন সংরক্ষণ করুন</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 4: ORDERS & PARCEL TRACKING MANAGEMENT */}
              {activeTab === 'orders' && (
                <AdminOrdersManagement
                  orders={orders}
                  onUpdateOrder={onUpdateOrder}
                  onCancelOrder={onCancelOrder}
                />
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
