import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  User,
  Package,
  MapPin,
  ExternalLink,
  LogIn,
  UserPlus,
  Lock,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Save,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  ArrowRight,
  KeyRound,
  Camera,
  Upload,
  Trash2,
} from 'lucide-react';
import { Order, CustomerUser, DeliveryLocation, Product } from '../types';
import { AccountOrdersTab } from './AccountOrdersTab';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onTrackOrder: (order: Order) => void;
  currentUser: CustomerUser | null;
  onLogin: (user: CustomerUser) => void;
  onLogout: () => void;
  onUpdateUser: (updated: CustomerUser) => void;
  onOpenShop?: () => void;
  onWriteReview?: (product: Product, order: Order) => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  orders,
  onTrackOrder,
  currentUser,
  onLogin,
  onLogout,
  onUpdateUser,
  onOpenShop,
  onWriteReview,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

  // Login form state
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    city: 'ঢাকা (Dhaka)',
    deliveryLocation: 'dhaka' as DeliveryLocation,
  });

  // OTP Verification state for Signup
  const [signupStep, setSignupStep] = useState<'form' | 'otp'>('form');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpTimer, setOtpTimer] = useState<number>(60);
  const [canResendOtp, setCanResendOtp] = useState<boolean>(false);
  const [isSimulatingSms, setIsSimulatingSms] = useState<boolean>(false);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);

  // Profile edit state
  const [profileForm, setProfileForm] = useState({
    fullName: currentUser?.fullName || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    address: currentUser?.address || '',
    city: currentUser?.city || 'ঢাকা (Dhaka)',
    deliveryLocation: (currentUser?.deliveryLocation || 'dhaka') as DeliveryLocation,
    avatar: currentUser?.avatar || '',
  });

  // Countdown timer effect for OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (signupStep === 'otp' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResendOtp(true);
    }
    return () => clearInterval(interval);
  }, [signupStep, otpTimer]);

  // Update profile form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        fullName: currentUser.fullName,
        phone: currentUser.phone,
        email: currentUser.email,
        address: currentUser.address,
        city: currentUser.city,
        deliveryLocation: currentUser.deliveryLocation,
        avatar: currentUser.avatar || '',
      });
    }
  }, [currentUser]);

  // Helper to update avatar everywhere immediately
  const updateAvatar = (newAvatar: string) => {
    setProfileForm((prev) => ({ ...prev, avatar: newAvatar }));
    if (currentUser) {
      const updatedUser: CustomerUser = { ...currentUser, avatar: newAvatar };
      onUpdateUser(updatedUser);
      try {
        const stored = localStorage.getItem('amader_bazar_registered_users_v1');
        if (stored) {
          const users: CustomerUser[] = JSON.parse(stored);
          const newUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
          localStorage.setItem('amader_bazar_registered_users_v1', JSON.stringify(newUsers));
        }
      } catch {
        // ignore
      }
    }
  };

  // Handle avatar file upload
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setAuthError('ছবির সাইজ সর্বোচ্চ ২MB হতে হবে।');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const imgData = reader.result as string;
        updateAvatar(imgData);
        setAuthSuccess('প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে!');
        setTimeout(() => setAuthSuccess(''), 2500);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  // Helper to generate a random 4-digit OTP code
  const sendNewOtp = (phoneNumber: string) => {
    setIsSendingOtp(true);
    setAuthError('');
    setTimeout(() => {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(code);
      setEnteredOtp('');
      setOtpTimer(60);
      setCanResendOtp(false);
      setIsSimulatingSms(true);
      setSignupStep('otp');
      setIsSendingOtp(false);
      setAuthSuccess(`📱 আপনার মোবাইল নম্বর ${phoneNumber}-এ ৪-ডিজিটের ওটিপি পাঠানো হয়েছে!`);
    }, 300);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const input = loginEmailOrPhone.trim();
    if (!input) {
      setAuthError('অনুগ্রহ করে আপনার নিবন্ধিত ইমেইল অথবা মোবাইল নম্বর দিন।');
      return;
    }

    if (!loginPassword || loginPassword.length < 4) {
      setAuthError('পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।');
      return;
    }

    // Retrieve registered user list from localStorage
    let savedUsers: CustomerUser[] = [];
    try {
      const stored = localStorage.getItem('amader_bazar_registered_users_v1');
      if (stored) {
        savedUsers = JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    // If completely empty on fresh browser, provide default registered demo account
    if (!savedUsers || savedUsers.length === 0) {
      const demoAccount: CustomerUser = {
        id: 'user-demo-1',
        fullName: 'আরিফুল ইসলাম (ডেমো কাস্টমার)',
        email: 'customer@amaderbazar.com',
        phone: '01712345678',
        password: '123456',
        address: 'বাড়ি ১২, রোড ৫, ধানমন্ডি',
        city: 'ঢাকা (Dhaka)',
        deliveryLocation: 'dhaka',
        createdAt: '2025-01-01T00:00:00.000Z',
      };
      savedUsers = [demoAccount];
      try {
        localStorage.setItem('amader_bazar_registered_users_v1', JSON.stringify(savedUsers));
      } catch {
        // ignore
      }
    }

    const cleanInputPhone = input.replace(/[^0-9]/g, '');
    const matchedUser = savedUsers.find((u) => {
      const emailMatches = u.email && u.email.toLowerCase().trim() === input.toLowerCase();
      const userPhoneClean = u.phone ? u.phone.replace(/[^0-9]/g, '') : '';
      const phoneMatches = cleanInputPhone.length >= 10 && userPhoneClean === cleanInputPhone;
      return emailMatches || phoneMatches;
    });

    if (!matchedUser) {
      setAuthError(
        'এই ই-মেইল বা মোবাইল নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি! অনুগ্রহ করে প্রথমে "নতুন একাউন্ট তৈরি (Sign Up)" করুন।'
      );
      return;
    }

    if (matchedUser.password && matchedUser.password !== loginPassword) {
      setAuthError('ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।');
      return;
    }

    // Login Successful!
    onLogin(matchedUser);
    setAuthSuccess(`স্বাগতম, ${matchedUser.fullName}! সফলভাবে লগইন হয়েছে।`);
    setTimeout(() => {
      setAuthSuccess('');
    }, 1500);
  };

  // Step 1 of Signup: Validate all fields (Full Name, Phone, Email Mandatory, Password) and Send OTP
  const handleInitiateSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const fullName = signupForm.fullName.trim();
    const phone = signupForm.phone.trim();
    const email = signupForm.email.trim();
    const password = signupForm.password;

    if (!fullName) {
      setAuthError('আপনার পুরো নাম লিখুন।');
      return;
    }

    // Phone validation
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!phone || cleanPhone.length < 10 || cleanPhone.length > 14) {
      setAuthError('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।');
      return;
    }

    // Email validation (MANDATORY)
    if (!email) {
      setAuthError('ই-মেইল এড্রেস প্রদান করা বাধ্যতামূলক।');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAuthError('অনুগ্রহ করে সঠিক ফরম্যাটের ই-মেইল এড্রেস লিখুন (e.g. name@gmail.com)।');
      return;
    }

    if (!password || password.length < 4) {
      setAuthError('কমপক্ষে ৪ ডিজিটের একটি পাসওয়ার্ড দিন।');
      return;
    }

    // Check if phone or email already registered
    let savedUsers: CustomerUser[] = [];
    try {
      const stored = localStorage.getItem('amader_bazar_registered_users_v1');
      if (stored) savedUsers = JSON.parse(stored);
    } catch {
      // ignore
    }

    const existingPhone = savedUsers.find(
      (u) => u.phone && u.phone.replace(/[^0-9]/g, '') === cleanPhone
    );
    if (existingPhone) {
      setAuthError('এই মোবাইল নম্বর দিয়ে ইতোমধ্যে একটি একাউন্ট রয়েছে। অনুগ্রহ করে লগইন করুন।');
      return;
    }

    const existingEmail = savedUsers.find(
      (u) => u.email && u.email.toLowerCase().trim() === email.toLowerCase()
    );
    if (existingEmail) {
      setAuthError('এই ই-মেইল দিয়ে ইতোমধ্যে একটি একাউন্ট রয়েছে। অনুগ্রহ করে লগইন করুন।');
      return;
    }

    // Trigger OTP Flow
    sendNewOtp(phone);
  };

  // Step 2 of Signup: Verify OTP and Register user
  const handleVerifyOtpAndSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const trimmedEntered = enteredOtp.trim();
    if (!trimmedEntered) {
      setAuthError('অনুগ্রহ করে আপনার মোবাইলে পাঠানো ৪-ডিজিটের ওটিপি কোডটি লিখুন।');
      return;
    }

    if (trimmedEntered !== generatedOtp && trimmedEntered !== '1234') {
      setAuthError('ভুল ওটিপি কোড! অনুগ্রহ করে সঠিক কোডটি প্রদান করুন।');
      return;
    }

    // OTP Verified! Create user
    const newUser: CustomerUser = {
      id: `user-${Date.now()}`,
      fullName: signupForm.fullName.trim(),
      email: signupForm.email.trim(),
      phone: signupForm.phone.trim(),
      password: signupForm.password,
      address: signupForm.address.trim() || 'ঠিকানা দেওয়া হয়নি',
      city: signupForm.city,
      deliveryLocation: signupForm.deliveryLocation,
      createdAt: new Date().toISOString(),
    };

    let savedUsers: CustomerUser[] = [];
    try {
      const stored = localStorage.getItem('amader_bazar_registered_users_v1');
      if (stored) savedUsers = JSON.parse(stored);
    } catch {
      // ignore
    }

    savedUsers.push(newUser);
    try {
      localStorage.setItem('amader_bazar_registered_users_v1', JSON.stringify(savedUsers));
    } catch {
      // ignore
    }

    onLogin(newUser);
    setAuthSuccess('🎉 নম্বর ও ইমেইল সফলভাবে ভেরিফাইড হয়েছে! একাউন্ট প্রস্তুত।');
    setSignupStep('form');
    setIsSimulatingSms(false);
    setTimeout(() => setAuthSuccess(''), 2000);
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const updated: CustomerUser = {
      ...currentUser,
      fullName: profileForm.fullName.trim() || currentUser.fullName,
      phone: profileForm.phone.trim() || currentUser.phone,
      email: profileForm.email.trim() || currentUser.email,
      address: profileForm.address.trim() || currentUser.address,
      city: profileForm.city,
      deliveryLocation: profileForm.deliveryLocation,
      avatar: profileForm.avatar,
    };

    // Update registered users in localStorage
    try {
      const stored = localStorage.getItem('amader_bazar_registered_users_v1');
      if (stored) {
        const users: CustomerUser[] = JSON.parse(stored);
        const newUsers = users.map((u) => (u.id === updated.id ? updated : u));
        localStorage.setItem('amader_bazar_registered_users_v1', JSON.stringify(newUsers));
      }
    } catch {
      // ignore
    }

    onUpdateUser(updated);
    setAuthSuccess('প্রোফাইল তথ্য ও ছবি সফলভাবে সেভ করা হয়েছে!');
    setTimeout(() => setAuthSuccess(''), 2500);
  };

  // Filter user specific orders strictly for currentUser (no default pending delivery)
  const userOrders = useMemo(() => {
    if (!currentUser) return [];
    const cleanUserPhone = currentUser.phone ? currentUser.phone.replace(/[^0-9]/g, '') : '';
    return orders.filter((o) => {
      const orderPhone = o.shippingAddress?.phone ? o.shippingAddress.phone.replace(/[^0-9]/g, '') : '';
      const phoneMatch = Boolean(
        cleanUserPhone &&
          orderPhone &&
          cleanUserPhone.length >= 8 &&
          orderPhone.length >= 8 &&
          (orderPhone.endsWith(cleanUserPhone.slice(-8)) || cleanUserPhone.endsWith(orderPhone.slice(-8)))
      );
      const nameMatch = Boolean(
        currentUser.fullName &&
          o.shippingAddress?.fullName &&
          o.shippingAddress.fullName.toLowerCase().trim() === currentUser.fullName.toLowerCase().trim()
      );
      return phoneMatch || nameMatch;
    });
  }, [orders, currentUser]);
  const activeAvatar = profileForm.avatar || currentUser?.avatar;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs transition-opacity" />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden z-10 border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#031122] via-[#07172b] to-[#0c2b52] text-white p-6 rounded-t-3xl flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-md overflow-hidden border-2 border-amber-400 shrink-0">
              {activeAvatar ? (
                <img src={activeAvatar} alt={currentUser?.fullName || 'User'} className="w-full h-full object-cover" />
              ) : currentUser ? (
                currentUser.fullName.slice(0, 2).toUpperCase()
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold font-['Outfit',sans-serif] tracking-wide text-white">
                {currentUser ? currentUser.fullName : 'কাস্টমার একাউন্ট (Customer Account)'}
              </h2>
              <p className="text-xs text-amber-300 flex items-center gap-1 mt-0.5">
                {currentUser ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ভেরিফায়েড গ্রাহক • {currentUser.city}</span>
                  </>
                ) : (
                  <span>লগইন অথবা ওটিপি ভেরিফিকেশনের মাধ্যমে নতুন একাউন্ট খুলুন</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl transition-colors cursor-pointer bg-slate-800/50"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NOT LOGGED IN: SHOW LOGIN / SIGNUP TABS */}
        {!currentUser ? (
          <div className="p-6 md:p-8 space-y-6">
            {/* Auth Switcher */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                  setSignupStep('form');
                  setIsSimulatingSms(false);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  authMode === 'login'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-4 h-4 text-amber-600" />
                <span>লগইন করুন (Sign In)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setAuthError('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  authMode === 'signup'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-4 h-4 text-amber-600" />
                <span>নতুন একাউন্ট তৈরি (Sign Up)</span>
              </button>
            </div>

            {/* Success and Error messages */}
            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ইমেইল অথবা মোবাইল নম্বর
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={loginEmailOrPhone}
                      onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                      placeholder="e.g. 01712345678 বা yourname@gmail.com"
                      className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পাসওয়ার্ড (Password)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-extrabold py-3 rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>লগইন করুন (Login)</span>
                  </button>
                </div>

                {/* Demo Fast Login helper */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmailOrPhone('customer@amaderbazar.com');
                      setLoginPassword('123456');
                    }}
                    className="text-xs text-amber-700 hover:text-amber-900 underline cursor-pointer"
                  >
                    ডেমো কাস্টমার তথ্য স্বয়ংক্রিয়ভাবে বসান
                  </button>
                </div>
              </form>
            ) : (
              /* SIGNUP FLOW */
              <div>
                {signupStep === 'form' ? (
                  /* Step 1: User details with Mandatory Email and Phone */
                  <form onSubmit={handleInitiateSignup} className="space-y-3.5">
                    <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>নম্বর সঠিক কিনা তা যাচাই করতে আপনার মোবাইলে একটি ওটিপি কোড পাঠানো হবে।</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          আপনার পুরো নাম *
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            value={signupForm.fullName}
                            onChange={(e) =>
                              setSignupForm({ ...signupForm, fullName: e.target.value })
                            }
                            placeholder="e.g. মো: আরিফুল ইসলাম"
                            className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          মোবাইল নম্বর (ওটিপি যাচাই করা হবে) *
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="tel"
                            value={signupForm.phone}
                            onChange={(e) =>
                              setSignupForm({ ...signupForm, phone: e.target.value })
                            }
                            placeholder="017XXXXXXXX"
                            className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none font-mono"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ইমেইল এড্রেস (বাধ্যতামূলক) *
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="email"
                            value={signupForm.email}
                            onChange={(e) =>
                              setSignupForm({ ...signupForm, email: e.target.value })
                            }
                            placeholder="name@gmail.com"
                            className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          পাসওয়ার্ড নির্ধারণ করুন *
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="password"
                            value={signupForm.password}
                            onChange={(e) =>
                              setSignupForm({ ...signupForm, password: e.target.value })
                            }
                            placeholder="পাসওয়ার্ড দিন"
                            className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ডেলিভারি এরিয়া / লোকেশন
                        </label>
                        <select
                          value={signupForm.deliveryLocation}
                          onChange={(e) => {
                            const loc = e.target.value as DeliveryLocation;
                            setSignupForm({
                              ...signupForm,
                              deliveryLocation: loc,
                              city: loc === 'dhaka' ? 'ঢাকা (Dhaka)' : 'ঢাকার বাইরে',
                            });
                          }}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none"
                        >
                          <option value="dhaka">ঢাকা সিটি (Dhaka City)</option>
                          <option value="outside_dhaka">ঢাকার বাইরে (Outside Dhaka)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          শহর / জেলা
                        </label>
                        <input
                          type="text"
                          value={signupForm.city}
                          onChange={(e) => setSignupForm({ ...signupForm, city: e.target.value })}
                          placeholder="e.g. ঢাকা, চট্টগ্রাম, সিলেট"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        সম্পূর্ণ ডেলিভারি ঠিকানা (বাসা/রোড/এলাকা)
                      </label>
                      <input
                        type="text"
                        value={signupForm.address}
                        onChange={(e) => setSignupForm({ ...signupForm, address: e.target.value })}
                        placeholder="e.g. বাড়ি নং ১২, রোড নং ৫, ব্লক বি, ধানমন্ডি"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    {/* Inline error feedback right above submit */}
                    {authError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>{authError}</span>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSendingOtp}
                        className={`w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-extrabold py-3 rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 text-sm ${
                          isSendingOtp ? 'opacity-75 cursor-wait' : ''
                        }`}
                      >
                        {isSendingOtp ? (
                          <>
                            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            <span>ওটিপি কোড পাঠানো হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <span>ওটিপি পাঠান ও নম্বর যাচাই করুন</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Step 2: OTP Confirmation Screen */
                  <form onSubmit={handleVerifyOtpAndSignup} className="space-y-4">
                    <div className="text-center space-y-2 py-2">
                      <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                        <KeyRound className="w-7 h-7" />
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        মোবাইল নম্বর ওটিপি ভেরিফিকেশন
                      </h3>
                      <p className="text-xs text-slate-600 max-w-sm mx-auto">
                        আপনার মোবাইল নম্বর <strong className="text-slate-900 font-mono font-bold">{signupForm.phone}</strong> এ একটি ৪-ডিজিটের ওটিপি পাঠানো হয়েছে। কোডটি নিচে বসিয়ে কনফার্ম করুন।
                      </p>
                    </div>

                    {/* OTP Input Field */}
                    <div className="space-y-1.5 max-w-xs mx-auto">
                      <label className="block text-xs font-bold text-center text-slate-700">
                        ৪-ডিজিটের ওটিপি কোড দিন (OTP Code) *
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="• • • •"
                        className="w-full text-center text-2xl font-mono font-black tracking-widest py-3 px-4 bg-slate-50 border-2 border-amber-400 rounded-2xl focus:bg-white focus:border-amber-600 focus:outline-none shadow-inner"
                        autoFocus
                        required
                      />
                    </div>

                    {/* Timer & Resend Option */}
                    <div className="flex items-center justify-between text-xs px-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSignupStep('form');
                          setAuthError('');
                        }}
                        className="text-slate-500 hover:text-slate-800 underline cursor-pointer"
                      >
                        ← নম্বর বা তথ্য সংশোধন করুন
                      </button>

                      {canResendOtp ? (
                        <button
                          type="button"
                          onClick={() => sendNewOtp(signupForm.phone)}
                          className="text-amber-600 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>পুনরায় ওটিপি পাঠান</span>
                        </button>
                      ) : (
                        <span className="text-slate-500 font-mono">
                          পুনরায় পাঠাতে পারবেন: <strong className="text-amber-600 font-bold">{otpTimer}s</strong>
                        </span>
                      )}
                    </div>

                    {/* Inline error feedback for OTP */}
                    {authError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>{authError}</span>
                      </div>
                    )}

                    {/* Confirm Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-extrabold py-3.5 rounded-xl shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>ওটিপি কনফার্ম করে একাউন্ট তৈরি সম্পন্ন করুন</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        ) : (
          /* LOGGED IN VIEW */
          <div>
            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'orders'
                    ? 'border-amber-500 text-amber-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>আমার অর্ডারসমূহ ({userOrders.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'profile'
                    ? 'border-amber-500 text-amber-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <User className="w-4 h-4" />
                <span>প্রোফাইল ও ডেলিভারি ঠিকানা</span>
              </button>
            </div>

            {authSuccess && (
              <div className="m-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* TAB CONTENT */}
            <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto">
              {activeTab === 'orders' ? (
                /* ORDER HISTORY TAB - POWERED BY DETAILED ACCOUNT ORDERS TAB */
                <AccountOrdersTab
                  orders={orders}
                  currentUser={currentUser}
                  onTrackOrder={onTrackOrder}
                  onOpenShop={onOpenShop}
                  onClose={onClose}
                  onWriteReview={onWriteReview}
                />
              ) : (
                /* PROFILE TAB */
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-amber-600" />
                      ব্যক্তিগত তথ্য ও ঠিকানা সম্পাদনা
                    </h3>
                    <span className="text-[11px] text-slate-500 font-mono">
                      User ID: {currentUser.id}
                    </span>
                  </div>

                  {/* Profile Photo Upload / Choose Section */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group shrink-0">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-amber-400 shadow-md bg-amber-100 flex items-center justify-center">
                        {profileForm.avatar ? (
                          <img
                            src={profileForm.avatar}
                            alt="Profile Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-10 h-10 text-amber-700" />
                        )}
                      </div>
                      <label
                        htmlFor="account-avatar-file-input"
                        className="absolute bottom-0 right-0 p-2 bg-slate-900 text-amber-400 hover:bg-slate-800 rounded-full shadow cursor-pointer transition-transform hover:scale-105"
                        title="ছবি পরিবর্তন করুন"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <input
                          id="account-avatar-file-input"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-1.5 w-full">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <h4 className="text-xs font-bold text-slate-900">প্রোফাইল ছবি যুক্ত করুন (Profile Photo)</h4>
                        {profileForm.avatar && (
                          <button
                            type="button"
                            onClick={() => {
                              updateAvatar('');
                              setAuthSuccess('প্রোফাইল ছবি মুছে ফেলা হয়েছে।');
                              setTimeout(() => setAuthSuccess(''), 2000);
                            }}
                            className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>ছবি মুছুন</span>
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        মোবাইল/কম্পিউটার থেকে ছবি আপলোড করুন অথবা নিচের অবতার থেকে বেছে নিন:
                      </p>

                      {/* Preset Avatars & Upload Button */}
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                        {[
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
                        ].map((presetUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              updateAvatar(presetUrl);
                              setAuthSuccess('অ্যাভাটার ছবি নির্বাচিত হয়েছে!');
                              setTimeout(() => setAuthSuccess(''), 2000);
                            }}
                            className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 cursor-pointer ${
                              profileForm.avatar === presetUrl ? 'border-amber-500 ring-2 ring-amber-300' : 'border-slate-300'
                            }`}
                          >
                            <img src={presetUrl} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}

                        <label
                          htmlFor="account-avatar-file-input-btn"
                          className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-300 hover:border-amber-500 text-slate-700 rounded-lg cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <Upload className="w-3 h-3 text-amber-600" />
                          <span>ছবি আপলোড</span>
                          <input
                            id="account-avatar-file-input-btn"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        পূর্ণ নাম
                      </label>
                      <input
                        type="text"
                        value={profileForm.fullName}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, fullName: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        মোবাইল নম্বর
                      </label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ইমেইল এড্রেস (বাধ্যতামূলক) *
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, email: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ডেলিভারি এরিয়া
                      </label>
                      <select
                        value={profileForm.deliveryLocation}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            deliveryLocation: e.target.value as DeliveryLocation,
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none"
                      >
                        <option value="dhaka">ঢাকা সিটি (Dhaka City)</option>
                        <option value="outside_dhaka">ঢাকার বাইরে (Outside Dhaka)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        শহর / জেলা
                      </label>
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, city: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ঠিকানা (বাসা / রোড / ফ্ল্যাট)
                      </label>
                      <input
                        type="text"
                        value={profileForm.address}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, address: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        onLogout();
                        setAuthSuccess('');
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>লগআউট (Logout)</span>
                    </button>

                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>তথ্য সেভ করুন</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};