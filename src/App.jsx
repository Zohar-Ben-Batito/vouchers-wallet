import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  where 
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { 
  LogOut, 
  Plus, 
  Trash2, 
  Lock, 
  Mail, 
  Check, 
  Search,
  Wifi,
  WifiOff,
  Ticket, 
  Scissors, 
  CreditCard,
  Calendar,
  AlertTriangle,
  FileText,
  ChevronRight,
  Clock,
  Languages,
  Sun,
  Moon
} from 'lucide-react';

// Translation Dictionary
const t = {
  en: {
    appTitle: "מענקים ושוברים",
    activeItems: "Active Items",
    expiringSoon: "Expiring Soon",
    all: "All",
    vouchers: "Vouchers",
    coupons: "Coupons",
    memberships: "Clubs",
    searchPlaceholder: "Search name, code, value...",
    filterActive: "Active",
    filterUsed: "Used",
    filterAll: "All Statuses",
    noItems: "No items found. Tap the + to add one!",
    addTitle: "Add Wallet Item",
    editTitle: "Edit Wallet Item",
    nameLabel: "Name",
    namePlaceholder: "e.g. Amazon Gift Card, Nike Coupon...",
    typeLabel: "Type",
    valueLabel: "Value / Amount",
    valuePlaceholder: "e.g. 50, 20, Free Drink",
    currencyLabel: "Format / Currency",
    expiryLabel: "Expiration Date (Optional)",
    codeLabel: "Code / Coupon ID (Optional)",
    codePlaceholder: "e.g. Code, Link or Member Card ID",
    notesLabel: "Description / Notes (Optional)",
    notesPlaceholder: "Add location details, rules, or restrictions here...",
    cancel: "Cancel",
    save: "Save Item",
    detailsTitle: "Item Details",
    copyCode: "Copy Code",
    copied: "Copied! ✅",
    markUsed: "Mark as Used",
    markActive: "Mark Active",
    close: "Close",
    deleteConfirm: "Are you sure you want to delete this item?",
    deleteItem: "Delete Item",
    expired: "Expired",
    expiresToday: "Expires Today!",
    expiresTomorrow: "Expires Tomorrow",
    expiresInDays: "Expires in {days} days",
    expiresOn: "Expires: {date}",
    noExpiry: "No expiration date",
    syncedOnline: "Synced & Online",
    offlineMode: "Offline Mode (Local Save)",
    logout: "Log Out",
    initializing: "Initializing your pocket...",
    accessWallet: "Access your synced voucher wallet",
    createAccount: "Create your account to sync your vouchers",
    email: "Email",
    password: "Password",
    login: "Log In",
    signup: "Sign Up",
    alreadyAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    invalidEmailPass: "Invalid email or password.",
    emailInUse: "Email already in use.",
    weakPassword: "Password should be at least 6 characters.",
    fillAllFields: "Please fill in all fields.",
    signInWithGoogle: "Continue with Google",
    forgotPassword: "Forgot Password?",
    resetPassword: "Reset Password",
    resetPasswordSub: "Enter your email to receive a password reset link.",
    sendResetLink: "Send Reset Link",
    backToLogin: "Back to Log In",
    resetEmailSent: "Password reset email sent! Check your inbox.",
    resetError: "Failed to send reset email. Please try again."
  },
  he: {
    appTitle: "מענקים ושוברים",
    activeItems: "פריטים פעילים",
    expiringSoon: "פג תוקף בקרוב",
    all: "הכל",
    vouchers: "שוברים 🎫",
    coupons: "קופונים ✂️",
    memberships: "מועדונים 💳",
    searchPlaceholder: "חיפוש שם, קוד, ערך...",
    filterActive: "פעיל",
    filterUsed: "משומש",
    filterAll: "הכל",
    noItems: "לא נמצאו פריטים. לחץ על + כדי להוסיף!",
    addTitle: "הוספת פריט חדש",
    editTitle: "עריכת פריט",
    nameLabel: "שם הפריט",
    namePlaceholder: "לדוגמה: כרטיס מתנה אמזון, קופון נייקי...",
    typeLabel: "סוג",
    valueLabel: "ערך / סכום",
    valuePlaceholder: "לדוגמה: 50, 20, משקה חינם",
    currencyLabel: "מטבע / פורמט",
    expiryLabel: "תאריך תפוגה (אופציונלי)",
    codeLabel: "קוד / מזהה קופון (אופציונלי)",
    codePlaceholder: "קוד, קישור או מזהה כרטיס מועדון",
    notesLabel: "תיאור / הערות (אופציונלי)",
    notesPlaceholder: "הוסף מיקום, כללים או מגבלות...",
    cancel: "ביטול",
    save: "שמירה",
    detailsTitle: "פרטי הפריט",
    copyCode: "העתק קוד",
    copied: "הועתק! ✅",
    markUsed: "סמן כמשומש",
    markActive: "סמן כפעיל",
    close: "סגור",
    deleteConfirm: "האם אתה בטוח שברצונך למחוק פריט זה?",
    deleteItem: "מחק פריט",
    expired: "פג תוקף",
    expiresToday: "פג היום!",
    expiresTomorrow: "פג מחר",
    expiresInDays: "פג בעוד {days} ימים",
    expiresOn: "בתוקף עד: {date}",
    noExpiry: "ללא תאריך תפוגה",
    syncedOnline: "מסונכרן ומחובר",
    offlineMode: "מצב לא מקוון (שמירה מקומית)",
    logout: "התנתק",
    initializing: "מכין את הארנק שלך...",
    accessWallet: "גישה לארנק המסונכרן שלך",
    createAccount: "צור חשבון כדי לסנכרן את השוברים שלך",
    email: "אימייל",
    password: "סיסמה",
    login: "התחבר",
    signup: "הרשם",
    alreadyAccount: "כבר יש לך חשבון?",
    dontHaveAccount: "אין לך חשבון?",
    invalidEmailPass: "אימייל או סיסמה שגויים.",
    emailInUse: "האימייל כבר בשימוש.",
    weakPassword: "הסיסמה חייבת להיות לפחות 6 תווים.",
    fillAllFields: "אנא מלא את כל השדות.",
    signInWithGoogle: "המשך עם Google",
    forgotPassword: "שכחת סיסמה?",
    resetPassword: "איפוס סיסמה",
    resetPasswordSub: "הזן את כתובת האימייל שלך לקבלת קישור לאיפוס סיסמה.",
    sendResetLink: "שלח קישור לאיפוס",
    backToLogin: "חזרה להתחברות",
    resetEmailSent: "אימייל לאיפוס סיסמה נשלח! בדוק את תיבת הדואר הנכנס.",
    resetError: "שליחת אימייל לאיפוס נכשלה. אנא נסה שוב."
  }
};

function App() {
  // Theme state: default to dark
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // Localized state: default to Hebrew ('he')
  const [lang, setLang] = useState(localStorage.getItem('wallet_lang') || 'he');
  const text = t[lang];

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Auth State
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  // UI State
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'voucher', 'coupon', 'membership'
  const [statusFilter, setStatusFilter] = useState('active'); // 'active', 'used', 'all_status'
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Data list
  const [items, setItems] = useState([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add', 'edit'
  const [selectedItem, setSelectedItem] = useState(null);

  // Form State
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState('voucher'); // 'voucher', 'coupon', 'membership'
  const [itemValue, setItemValue] = useState(''); 
  const [itemCurrency, setItemCurrency] = useState('ILS'); // 'ILS', 'USD', 'EUR', 'PERCENT', 'CUSTOM'
  const [itemExpiryDate, setItemExpiryDate] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [itemNotes, setItemNotes] = useState('');

  // Details dialog state (for viewing code/details in full screen)
  const [activeDetailsItem, setActiveDetailsItem] = useState(null);
  const [detailsCodeType, setDetailsCodeType] = useState('qr'); // 'qr', 'barcode'
  const [copiedId, setCopiedId] = useState(null);

  // Toggle Language Handler
  const toggleLanguage = () => {
    const newLang = lang === 'he' ? 'en' : 'he';
    setLang(newLang);
    localStorage.setItem('wallet_lang', newLang);
  };

  // Monitor network connection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync Vouchers from Firestore
  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    const qItems = query(
      collection(db, 'vouchers'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(qItems, (snapshot) => {
      const itemsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(itemsList);
    }, (error) => {
      console.error("Firestore sync error: ", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Auth Operations
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!email || !password) {
      setAuthError(text.fillAllFields);
      return;
    }
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setAuthError(text.invalidEmailPass);
      } else if (err.code === 'auth/email-already-in-use') {
        setAuthError(text.emailInUse);
      } else if (err.code === 'auth/weak-password') {
        setAuthError(text.weakPassword);
      } else {
        setAuthError(err.message);
      }
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    const provider = new GoogleAuthProvider();
    try {
      // Use redirect on mobile/touch devices, popup on desktop
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (error) {
      console.error("Google Sign-In Error: ", error);
      if (error.code === 'auth/popup-blocked') {
        // Fallback to redirect if popup is blocked
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectError) {
          setAuthError(redirectError.message);
        }
      } else if (error.code === 'auth/operation-not-allowed') {
        setAuthError(lang === 'he' ? 'התחברות עם Google אינה מאופשרת בפרויקט Firebase.' : 'Google Sign-In is not enabled in Firebase Console.');
      } else if (error.code === 'auth/unauthorized-domain') {
        setAuthError(lang === 'he' ? 'דומיין זה אינו מאושר בהגדרות Firebase Auth. יש להוסיף אותו לרשימת הדומיינים המאושרים.' : 'This domain is not authorized in Firebase Auth settings. Please add it to the authorized domains list.');
      } else {
        setAuthError(error.message);
      }
    }
  };

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setResetSuccess('');
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess(text.resetEmailSent);
      setResetEmail('');
    } catch (error) {
      console.error("Password Reset Error: ", error);
      if (error.code === 'auth/user-not-found') {
        setAuthError(lang === 'he' ? 'לא נמצא משתמש עם כתובת אימייל זו.' : 'No user found with this email.');
      } else {
        setAuthError(error.message);
      }
    }
  };

  // Add/Edit Operations
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!itemName.trim() || !itemValue.trim()) return;

    const voucherData = {
      name: itemName,
      type: itemType,
      value: itemValue,
      currency: itemCurrency,
      expiryDate: itemExpiryDate,
      code: itemCode,
      notes: itemNotes,
      used: false,
      userId: user.uid,
      updatedAt: Date.now()
    };

    // Close modal and reset fields optimistically
    setItemName('');
    setItemType('voucher');
    setItemValue('');
    setItemCurrency('ILS');
    setItemExpiryDate('');
    setItemCode('');
    setItemNotes('');
    setIsModalOpen(false);

    try {
      if (modalType === 'add') {
        await addDoc(collection(db, 'vouchers'), voucherData);
      } else if (modalType === 'edit' && selectedItem) {
        const itemRef = doc(db, 'vouchers', selectedItem.id);
        await updateDoc(itemRef, {
          ...voucherData,
          used: selectedItem.used
        });
      }
    } catch (err) {
      console.error("Database save error: ", err);
      alert("Error saving item: " + err.message);
    }
  };

  const toggleItemUsed = async (item) => {
    try {
      const itemRef = doc(db, 'vouchers', item.id);
      await updateDoc(itemRef, {
        used: !item.used
      });
    } catch (err) {
      console.error("Error updating status: ", err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm(text.deleteConfirm)) return;
    try {
      await deleteDoc(doc(db, 'vouchers', itemId));
      if (activeDetailsItem?.id === itemId) {
        setActiveDetailsItem(null);
      }
    } catch (err) {
      console.error("Error deleting item: ", err);
    }
  };

  const openAddModal = () => {
    setModalType('add');
    setSelectedItem(null);
    setItemName('');
    setItemType(activeTab === 'all' ? 'voucher' : activeTab);
    setItemValue('');
    setItemCurrency('ILS');
    setItemExpiryDate('');
    setItemCode('');
    setItemNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (item, e) => {
    e.stopPropagation();
    setModalType('edit');
    setSelectedItem(item);
    setItemName(item.name);
    setItemType(item.type);
    setItemValue(item.value);
    setItemCurrency(item.currency || 'CUSTOM');
    setItemExpiryDate(item.expiryDate || '');
    setItemCode(item.code || '');
    setItemNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const copyToClipboard = (textToCopy, id) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper: Expiration calculations
  const getExpiryStatus = (expiryDateStr) => {
    if (!expiryDateStr) return { label: text.noExpiry, color: 'text-muted', urgency: 0 };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiry = new Date(expiryDateStr);
    expiry.setHours(0, 0, 0, 0);
    
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { label: text.expired, color: 'category-health', urgency: -1 };
    } else if (diffDays === 0) {
      return { label: text.expiresToday, color: 'category-health', urgency: 3 };
    } else if (diffDays === 1) {
      return { label: text.expiresTomorrow, color: 'category-study', urgency: 2 };
    } else if (diffDays <= 7) {
      return { label: text.expiresInDays.replace('{days}', diffDays), color: 'category-study', urgency: 1 };
    } else {
      const formattedDate = new Date(expiryDateStr).toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US');
      return { 
        label: text.expiresOn.replace('{date}', formattedDate), 
        color: 'category-personal', 
        urgency: 0 
      };
    }
  };

  // Helper: Currency / format value
  const formatValue = (value, currency) => {
    if (!currency || currency === 'CUSTOM') return value;
    if (currency === 'ILS') return `₪${value}`;
    if (currency === 'USD') return `$${value}`;
    if (currency === 'EUR') return `€${value}`;
    if (currency === 'PERCENT') return `${value}%`;
    return value;
  };

  // Stats Calculations
  const activeItems = items.filter(item => !item.used);
  
  const expiringSoonCount = activeItems.filter(item => {
    if (!item.expiryDate) return false;
    const status = getExpiryStatus(item.expiryDate);
    return status.urgency >= 1;
  }).length;

  // Filter & Search items
  const filteredItems = items.filter(item => {
    // Type Filter (tabs)
    if (activeTab !== 'all' && item.type !== activeTab) return false;

    // Status Filter
    if (statusFilter === 'active' && item.used) return false;
    if (statusFilter === 'used' && !item.used) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const formattedVal = formatValue(item.value, item.currency).toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.code || '').toLowerCase().includes(q) ||
        formattedVal.includes(q)
      );
    }
    return true;
  });

  // Sort items: Soonest expiring active items first, then others
  filteredItems.sort((a, b) => {
    if (a.used !== b.used) return a.used ? 1 : -1;
    
    if (a.expiryDate && b.expiryDate) {
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    }
    
    if (a.expiryDate) return -1;
    if (b.expiryDate) return 1;
    
    return b.updatedAt - a.updatedAt;
  });

  if (authLoading) {
    return (
      <div className="auth-container" dir={lang === 'he' ? 'rtl' : 'ltr'}>
        <div className="glass-panel auth-card fade-in" style={{ textAlign: 'center' }}>
          <div className="auth-logo">{text.appTitle}</div>
          <div className="auth-subtitle">{text.initializing}</div>
        </div>
      </div>
    );
  }

  if (!user) {
    if (isForgotPassword) {
      return (
        <div className="auth-container" dir={lang === 'he' ? 'rtl' : 'ltr'}>
          <div className="bg-glow-1"></div>
          <div className="bg-glow-2"></div>
          <div className="glass-panel auth-card fade-in">
            <div className="auth-header">
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '16px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }}
                  onClick={toggleTheme}
                  title={lang === 'he' ? (theme === 'light' ? 'מצב כהה' : 'מצב בהיר') : (theme === 'light' ? 'Dark Mode' : 'Light Mode')}
                >
                  {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
                  <span>{lang === 'he' ? (theme === 'light' ? 'כהה' : 'בהיר') : (theme === 'light' ? 'Dark' : 'Light')}</span>
                </button>

                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }}
                  onClick={toggleLanguage}
                >
                  <Languages size={14} />
                  <span>{lang === 'he' ? 'English' : 'עברית'}</span>
                </button>
              </div>

              <div className="auth-logo">{text.appTitle}</div>
              <div className="auth-subtitle">
                {text.resetPassword}
              </div>
            </div>

            {authError && <div className="error-message">{authError}</div>}
            {resetSuccess && <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginBottom: '12px' }}>{resetSuccess}</div>}

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'center' }}>
              {text.resetPasswordSub}
            </p>

            <form className="auth-form" onSubmit={handlePasswordResetSubmit}>
              <div className="form-group">
                <label className="form-label">{text.email}</label>
                <div className="input-with-icon-container">
                  <Mail size={16} />
                  <input 
                    type="email" 
                    className="input-with-icon"
                    placeholder="name@example.com" 
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                {text.sendResetLink}
              </button>
            </form>

            <div className="auth-footer">
              <span className="auth-link" onClick={() => { setIsForgotPassword(false); setAuthError(''); setResetSuccess(''); }}>
                {text.backToLogin}
              </span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="auth-container" dir={lang === 'he' ? 'rtl' : 'ltr'}>
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
        <div className="glass-panel auth-card fade-in">
          <div className="auth-header">
            {/* Language & Theme Switcher in Auth */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '16px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }}
                onClick={toggleTheme}
                title={lang === 'he' ? (theme === 'light' ? 'מצב כהה' : 'מצב בהיר') : (theme === 'light' ? 'Dark Mode' : 'Light Mode')}
              >
                {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
                <span>{lang === 'he' ? (theme === 'light' ? 'כהה' : 'בהיר') : (theme === 'light' ? 'Dark' : 'Light')}</span>
              </button>

              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }}
                onClick={toggleLanguage}
              >
                <Languages size={14} />
                <span>{lang === 'he' ? 'English' : 'עברית'}</span>
              </button>
            </div>

            <div className="auth-logo">{text.appTitle}</div>
            <div className="auth-subtitle">
              {isSignUp ? text.createAccount : text.accessWallet}
            </div>
          </div>
          
          {authError && <div className="error-message">{authError}</div>}
          
          <form className="auth-form" onSubmit={handleAuth}>
            <div className="form-group">
              <label className="form-label">{text.email}</label>
              <div className="input-with-icon-container">
                <Mail size={16} />
                <input 
                  type="email" 
                  className="input-with-icon"
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{text.password}</label>
              <div className="input-with-icon-container">
                <Lock size={16} />
                <input 
                  type="password" 
                  className="input-with-icon"
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {!isSignUp && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                  <span 
                    className="auth-link" 
                    style={{ fontSize: '12px' }} 
                    onClick={() => { setIsForgotPassword(true); setAuthError(''); }}
                  >
                    {text.forgotPassword}
                  </span>
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
              {isSignUp ? text.signup : text.login}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0', color: 'var(--text-muted)', fontSize: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--panel-border)' }}></div>
            <span style={{ padding: '0 10px' }}>{lang === 'he' ? 'או' : 'OR'}</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--panel-border)' }}></div>
          </div>

          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '12px 16px', background: 'var(--btn-secondary-bg)', border: '1px solid var(--panel-border)', borderRadius: 'var(--radius-sm)', fontWeight: '600' }}
            onClick={handleGoogleSignIn}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>{text.signInWithGoogle}</span>
          </button>
          
          <div className="auth-footer" style={{ marginTop: '20px' }}>
            {isSignUp ? text.alreadyAccount : text.dontHaveAccount}{' '}
            <span className="auth-link" onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }}>
              {isSignUp ? text.login : text.signup}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>
      
      {/* Header */}
      <header className="app-header fade-in">
        <div className="app-title-group">
          <h1 className="logo-text">{text.appTitle}</h1>
          <div className="sync-status">
            {isOnline ? (
              <>
                <span className="sync-indicator sync-online"></span>
                <span>{text.syncedOnline}</span>
              </>
            ) : (
              <>
                <span className="sync-indicator sync-offline"></span>
                <span>{text.offlineMode}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            type="button"
            className="btn btn-secondary" 
            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--panel-border)' }}
            onClick={toggleTheme}
            title={lang === 'he' ? (theme === 'light' ? 'מצב כהה' : 'מצב בהיר') : (theme === 'light' ? 'Dark Mode' : 'Light Mode')}
          >
            {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
            <span>{lang === 'he' ? (theme === 'light' ? 'כהה' : 'בהיר') : (theme === 'light' ? 'Dark' : 'Light')}</span>
          </button>

          <button 
            type="button"
            className="btn btn-secondary" 
            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--panel-border)' }}
            onClick={toggleLanguage}
            title={lang === 'he' ? 'שנה שפה' : 'Change Language'}
          >
            <Languages size={13} />
            <span>{lang === 'he' ? 'English' : 'עברית'}</span>
          </button>
          
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{user.email.split('@')[0]}</span>
          <button className="btn-icon" onClick={handleLogout} title={text.logout}>
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Quick Stats */}
      <section className="stats-card-row fade-in">
        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
            <Ticket size={18} />
          </div>
          <div className="stat-details">
            <span className="stat-num">{activeItems.length}</span>
            <span className="stat-lbl">{text.activeItems}</span>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
            <AlertTriangle size={18} />
          </div>
          <div className="stat-details">
            <span className="stat-num">{expiringSoonCount}</span>
            <span className="stat-lbl">{text.expiringSoon}</span>
          </div>
        </div>
      </section>

      {/* Tabs Menu */}
      <nav className="nav-tabs fade-in">
        <button 
          className={`nav-tab ${activeTab === 'all' ? 'nav-tab-active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <span>{text.all}</span>
        </button>
        <button 
          className={`nav-tab ${activeTab === 'voucher' ? 'nav-tab-active' : ''}`}
          onClick={() => setActiveTab('voucher')}
        >
          <Ticket size={14} />
          <span>{lang === 'he' ? 'שוברים' : text.vouchers}</span>
        </button>
        <button 
          className={`nav-tab ${activeTab === 'coupon' ? 'nav-tab-active' : ''}`}
          onClick={() => setActiveTab('coupon')}
        >
          <Scissors size={14} />
          <span>{lang === 'he' ? 'קופונים' : text.coupons}</span>
        </button>
        <button 
          className={`nav-tab ${activeTab === 'membership' ? 'nav-tab-active' : ''}`}
          onClick={() => setActiveTab('membership')}
        >
          <CreditCard size={14} />
          <span>{lang === 'he' ? 'מועדונים' : text.memberships}</span>
        </button>
      </nav>

      {/* Filters and Search */}
      <div className="fade-in" style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <div className="input-with-icon-container" style={{ flex: 1 }}>
          <Search size={16} />
          <input 
            type="text" 
            className="input-with-icon" 
            placeholder={text.searchPlaceholder} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: '110px', padding: '6px 12px', fontSize: '13px', borderRadius: '8px' }}
        >
          <option value="active">{text.filterActive}</option>
          <option value="used">{text.filterUsed}</option>
          <option value="all_status">{text.filterAll}</option>
        </select>
      </div>

      {/* Items List */}
      <main style={{ flex: 1, paddingBottom: '80px' }} className="fade-in">
        <div className="task-list">
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
              <Ticket size={36} style={{ opacity: 0.3, marginBottom: '10px' }} />
              <p>{text.noItems}</p>
            </div>
          ) : (
            filteredItems.map(item => {
              const expiry = getExpiryStatus(item.expiryDate);
              return (
                <div 
                  key={item.id} 
                  className={`glass-panel task-item ${item.used ? 'task-completed' : ''}`}
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px 16px' }}
                  onClick={() => {
                    setActiveDetailsItem(item);
                    setDetailsCodeType('qr'); // reset toggle
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                    {/* Checkbox for Used status */}
                    <label 
                      className={`task-checkbox-container ${item.used ? 'task-checkbox-checked' : ''}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input 
                        type="checkbox" 
                        className="task-checkbox" 
                        checked={item.used} 
                        onChange={() => toggleItemUsed(item)}
                      />
                      <span className="task-checkmark"></span>
                    </label>

                    {/* Left Icon based on Type */}
                    <div 
                      className="stat-icon-wrapper" 
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '8px',
                        background: 
                          item.type === 'voucher' ? 'rgba(99, 102, 241, 0.15)' :
                          item.type === 'coupon' ? 'rgba(16, 185, 129, 0.15)' : 
                          'rgba(245, 158, 11, 0.15)',
                        color: 
                          item.type === 'voucher' ? 'var(--primary)' :
                          item.type === 'coupon' ? 'var(--secondary)' : 
                          '#fbbf24'
                      }}
                    >
                      {item.type === 'voucher' && <Ticket size={16} />}
                      {item.type === 'coupon' && <Scissors size={16} />}
                      {item.type === 'membership' && <CreditCard size={16} />}
                    </div>

                    {/* Name and Expiry details */}
                    <div className="task-details">
                      <span className="task-title" style={{ fontSize: '15px', fontWeight: '600' }}>{item.name}</span>
                      <div className="task-meta">
                        <span className={`task-category ${expiry.color}`} style={{ textTransform: 'none', fontWeight: '500' }}>
                          {expiry.label}
                        </span>
                      </div>
                    </div>

                    {/* Value Badge */}
                    <div style={{ textAlign: lang === 'he' ? 'left' : 'right', display: 'flex', flexDirection: 'column', gap: '2px', paddingRight: lang === 'he' ? '0' : '4px', paddingLeft: lang === 'he' ? '4px' : '0' }}>
                      <span style={{ 
                        fontSize: '16px', 
                        fontWeight: '700', 
                        color: item.used ? 'var(--text-muted)' : 'var(--text-primary)' 
                      }}>
                        {formatValue(item.value, item.currency)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                      <button className="btn-icon" onClick={(e) => openEditModal(item, e)} style={{ border: 'none', background: 'transparent', width: '32px', height: '32px' }}>
                        <FileText size={13} style={{ color: 'var(--text-secondary)' }} />
                      </button>
                      <button className="btn-icon" onClick={() => handleDeleteItem(item.id)} style={{ border: 'none', background: 'transparent', width: '32px', height: '32px' }}>
                        <Trash2 size={13} style={{ color: 'var(--text-muted)' }} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Floating Add Action Button */}
      <button className="fab-btn" onClick={openAddModal} title={text.addTitle}>
        <Plus size={24} />
      </button>

      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalType === 'add' ? text.addTitle : text.editTitle}</h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'transparent', fontSize: '20px' }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="modal-form">
              <div className="form-group">
                <label className="form-label">{text.nameLabel}</label>
                <input 
                  type="text" 
                  placeholder={text.namePlaceholder} 
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{text.typeLabel}</label>
                  <select value={itemType} onChange={(e) => setItemType(e.target.value)}>
                    <option value="voucher">🎫 {lang === 'he' ? 'שובר' : 'Voucher'}</option>
                    <option value="coupon">✂️ {lang === 'he' ? 'קופון' : 'Coupon'}</option>
                    <option value="membership">💳 {lang === 'he' ? 'מועדון חבר' : 'Membership'}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{text.currencyLabel}</label>
                  <select value={itemCurrency} onChange={(e) => setItemCurrency(e.target.value)}>
                    <option value="ILS">₪ (Shekel)</option>
                    <option value="USD">$ (Dollar)</option>
                    <option value="EUR">€ (Euro)</option>
                    <option value="PERCENT">% (Percent)</option>
                    <option value="CUSTOM">{lang === 'he' ? 'חופשי / טקסט' : 'Text / None'}</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{text.valueLabel}</label>
                <input 
                  type="text" 
                  placeholder={text.valuePlaceholder} 
                  value={itemValue}
                  onChange={(e) => setItemValue(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{text.expiryLabel}</label>
                <input 
                  type="date" 
                  value={itemExpiryDate} 
                  onChange={(e) => setItemExpiryDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{text.codeLabel}</label>
                <input 
                  type="text" 
                  placeholder={text.codePlaceholder} 
                  value={itemCode}
                  onChange={(e) => setItemCode(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{text.notesLabel}</label>
                <textarea 
                  placeholder={text.notesPlaceholder} 
                  rows={3}
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>{text.cancel}</button>
                <button type="submit" className="btn btn-primary">{text.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL DRAWER */}
      {activeDetailsItem && (
        <div className="modal-overlay" onClick={() => setActiveDetailsItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {activeDetailsItem.type === 'voucher' && <Ticket size={20} />}
                {activeDetailsItem.type === 'coupon' && <Scissors size={20} />}
                {activeDetailsItem.type === 'membership' && <CreditCard size={20} />}
                <span>{text.detailsTitle}</span>
              </h3>
              <button className="btn-icon" onClick={() => setActiveDetailsItem(null)} style={{ border: 'none', background: 'transparent', fontSize: '20px' }}>
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '10px' }}>
              <div style={{ textAlign: 'center', padding: '12px 0', borderBottom: '1px solid var(--panel-border)' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700' }}>{activeDetailsItem.name}</h2>
                <div style={{ 
                  fontSize: '32px', 
                  fontWeight: '800', 
                  color: 'var(--primary)', 
                  marginTop: '8px',
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {formatValue(activeDetailsItem.value, activeDetailsItem.currency)}
                </div>
              </div>

              {activeDetailsItem.code && (
                <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {lang === 'he' ? 'קוד / מזהה' : 'Code / Card ID'}
                  </span>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '0.05em', color: 'white' }}>
                    {activeDetailsItem.code}
                  </span>
                  
                  {/* QR/Barcode Toggle tabs */}
                  <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '2px', borderRadius: '8px', margin: '6px 0' }}>
                    <button 
                      type="button"
                      onClick={() => setDetailsCodeType('qr')}
                      style={{ 
                        background: detailsCodeType === 'qr' ? 'rgba(255,255,255,0.1)' : 'transparent',
                        border: 'none', color: 'white', padding: '4px 12px', fontSize: '11px', borderRadius: '6px', cursor: 'pointer', outline: 'none'
                      }}
                    >
                      QR Code
                    </button>
                    <button 
                      type="button"
                      onClick={() => setDetailsCodeType('barcode')}
                      style={{ 
                        background: detailsCodeType === 'barcode' ? 'rgba(255,255,255,0.1)' : 'transparent',
                        border: 'none', color: 'white', padding: '4px 12px', fontSize: '11px', borderRadius: '6px', cursor: 'pointer', outline: 'none'
                      }}
                    >
                      Barcode
                    </button>
                  </div>

                  {/* Render QR or Barcode */}
                  {detailsCodeType === 'qr' ? (
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(activeDetailsItem.code)}`} 
                      alt="QR Code" 
                      style={{ width: '130px', height: '130px', display: 'block', margin: '5px auto', borderRadius: '8px', border: '4px solid white' }} 
                    />
                  ) : (
                    <img 
                      src={`https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(activeDetailsItem.code)}&code=Code128&translate-esc=true`} 
                      alt="Barcode" 
                      style={{ width: '100%', maxWidth: '240px', height: 'auto', display: 'block', margin: '5px auto', borderRadius: '4px', background: 'white', padding: '8px' }} 
                    />
                  )}

                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '6px 16px', fontSize: '13px', marginTop: '8px' }}
                    onClick={() => copyToClipboard(activeDetailsItem.code, activeDetailsItem.id)}
                  >
                    {copiedId === activeDetailsItem.id ? text.copied : text.copyCode}
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{lang === 'he' ? 'סוג' : 'Type'}</span>
                  <span style={{ fontWeight: '600' }}>
                    {activeDetailsItem.type === 'voucher' ? (lang === 'he' ? 'שובר' : 'Voucher') : 
                     activeDetailsItem.type === 'coupon' ? (lang === 'he' ? 'קופון' : 'Coupon') : 
                     (lang === 'he' ? 'מועדון חבר' : 'Membership')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{lang === 'he' ? 'סטטוס' : 'Status'}</span>
                  <span style={{ fontWeight: '600', color: activeDetailsItem.used ? 'var(--text-muted)' : 'var(--secondary)' }}>
                    {activeDetailsItem.used ? (lang === 'he' ? 'משומש' : 'Used') : (lang === 'he' ? 'פעיל / זמין' : 'Active')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{lang === 'he' ? 'תפוגה' : 'Expiration'}</span>
                  <span style={{ fontWeight: '600' }}>
                    {activeDetailsItem.expiryDate ? new Date(activeDetailsItem.expiryDate).toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US') : text.noExpiry}
                  </span>
                </div>
              </div>

              {activeDetailsItem.notes && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{lang === 'he' ? 'הערות והגבלות:' : 'Notes:'}</span>
                  <div className="glass-panel" style={{ padding: '12px', fontSize: '13px', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.02)', maxHeight: '120px', overflowY: 'auto' }}>
                    {activeDetailsItem.notes}
                  </div>
                </div>
              )}

              <div className="modal-actions" style={{ marginTop: '12px' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => toggleItemUsed(activeDetailsItem).then(() => setActiveDetailsItem(prev => ({...prev, used: !prev.used})))}
                >
                  {activeDetailsItem.used ? text.markActive : text.markUsed}
                </button>
                <button className="btn btn-primary" onClick={() => setActiveDetailsItem(null)}>{text.close}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
