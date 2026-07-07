import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
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
  DollarSign,
  Clipboard,
  FileText,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';

function App() {
  // Auth State
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

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
  const [itemValue, setItemValue] = useState(''); // E.g., "$50", "20% Off", "Gold Tier"
  const [itemExpiryDate, setItemExpiryDate] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [itemNotes, setItemNotes] = useState('');

  // Details dialog state (for viewing code/details in full screen)
  const [activeDetailsItem, setActiveDetailsItem] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

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
      setAuthError('Please fill in all fields.');
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
        setAuthError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setAuthError('Email already in use.');
      } else if (err.code === 'auth/weak-password') {
        setAuthError('Password should be at least 6 characters.');
      } else {
        setAuthError(err.message);
      }
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  // Add Item Operation
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!itemName.trim() || !itemValue.trim()) return;

    const voucherData = {
      name: itemName,
      type: itemType,
      value: itemValue,
      expiryDate: itemExpiryDate,
      code: itemCode,
      notes: itemNotes,
      used: false,
      userId: user.uid,
      updatedAt: Date.now()
    };

    // Close modal optimistically
    setItemName('');
    setItemType('voucher');
    setItemValue('');
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
          used: selectedItem.used // preserve used state
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
    if (!window.confirm("Are you sure you want to delete this item?")) return;
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
    setItemExpiryDate('');
    setItemCode('');
    setItemNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (item, e) => {
    e.stopPropagation(); // prevent opening details
    setModalType('edit');
    setSelectedItem(item);
    setItemName(item.name);
    setItemType(item.type);
    setItemValue(item.value);
    setItemExpiryDate(item.expiryDate || '');
    setItemCode(item.code || '');
    setItemNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper: Expiration calculations
  const getExpiryStatus = (expiryDateStr) => {
    if (!expiryDateStr) return { label: 'No expiration date', color: 'text-muted', urgency: 0 };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiry = new Date(expiryDateStr);
    expiry.setHours(0, 0, 0, 0);
    
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { label: 'Expired', color: 'category-health', urgency: -1 }; // Red
    } else if (diffDays === 0) {
      return { label: 'Expires Today!', color: 'category-health', urgency: 3 }; // Glowing red/amber
    } else if (diffDays === 1) {
      return { label: 'Expires Tomorrow', color: 'category-study', urgency: 2 }; // Amber
    } else if (diffDays <= 7) {
      return { label: `Expires in ${diffDays} days`, color: 'category-study', urgency: 1 }; // Yellow
    } else {
      return { label: `Expires: ${new Date(expiryDateStr).toLocaleDateString()}`, color: 'category-personal', urgency: 0 }; // Green/Blue
    }
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
      return (
        item.name.toLowerCase().includes(q) ||
        (item.code || '').toLowerCase().includes(q) ||
        (item.value || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sort items: Soonest expiring active items first, then others
  filteredItems.sort((a, b) => {
    // Used items always go to the bottom
    if (a.used !== b.used) return a.used ? 1 : -1;
    
    // Sort by expiry date if available
    if (a.expiryDate && b.expiryDate) {
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    }
    
    // Items with expiry dates show before items without
    if (a.expiryDate) return -1;
    if (b.expiryDate) return 1;
    
    // Fallback: Newest first
    return b.updatedAt - a.updatedAt;
  });

  if (authLoading) {
    return (
      <div className="auth-container">
        <div className="glass-panel auth-card fade-in" style={{ textAlign: 'center' }}>
          <div className="auth-logo">מענקים ושוברים</div>
          <div className="auth-subtitle">Initializing your pocket...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-container">
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
        <div className="glass-panel auth-card fade-in">
          <div className="auth-header">
            <div className="auth-logo">מענקים ושוברים</div>
            <div className="auth-subtitle">
              {isSignUp ? 'Create your account to sync your vouchers' : 'Access your synced voucher wallet'}
            </div>
          </div>
          
          {authError && <div className="error-message">{authError}</div>}
          
          <form className="auth-form" onSubmit={handleAuth}>
            <div className="form-group">
              <label className="form-label">Email</label>
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
              <label className="form-label">Password</label>
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
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
              {isSignUp ? 'Sign Up' : 'Log In'}
            </button>
          </form>
          
          <div className="auth-footer">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <span className="auth-link" onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }}>
              {isSignUp ? 'Log In' : 'Sign Up'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>
      
      {/* Header */}
      <header className="app-header fade-in">
        <div className="app-title-group">
          <h1 className="logo-text">מענקים ושוברים</h1>
          <div className="sync-status">
            {isOnline ? (
              <>
                <span className="sync-indicator sync-online"></span>
                <span>Synced & Online</span>
              </>
            ) : (
              <>
                <span className="sync-indicator sync-offline"></span>
                <span>Offline Mode (Local Save)</span>
              </>
            )}
          </div>
        </div>
        
        <div className="user-profile">
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{user.email.split('@')[0]}</span>
          <button className="btn-icon" onClick={handleLogout} title="Log Out">
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
            <span className="stat-lbl">Active Items</span>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
            <AlertTriangle size={18} />
          </div>
          <div className="stat-details">
            <span className="stat-num">{expiringSoonCount}</span>
            <span className="stat-lbl">Expiring Soon</span>
          </div>
        </div>
      </section>

      {/* Tabs Menu */}
      <nav className="nav-tabs fade-in">
        <button 
          className={`nav-tab ${activeTab === 'all' ? 'nav-tab-active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <span>All</span>
        </button>
        <button 
          className={`nav-tab ${activeTab === 'voucher' ? 'nav-tab-active' : ''}`}
          onClick={() => setActiveTab('voucher')}
        >
          <Ticket size={14} />
          <span>Vouchers</span>
        </button>
        <button 
          className={`nav-tab ${activeTab === 'coupon' ? 'nav-tab-active' : ''}`}
          onClick={() => setActiveTab('coupon')}
        >
          <Scissors size={14} />
          <span>Coupons</span>
        </button>
        <button 
          className={`nav-tab ${activeTab === 'membership' ? 'nav-tab-active' : ''}`}
          onClick={() => setActiveTab('membership')}
        >
          <CreditCard size={14} />
          <span>Clubs</span>
        </button>
      </nav>

      {/* Filters and Search */}
      <div className="fade-in" style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <div className="input-with-icon-container" style={{ flex: 1 }}>
          <Search size={16} />
          <input 
            type="text" 
            className="input-with-icon" 
            placeholder="Search name, code, value..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: '110px', padding: '6px 12px', fontSize: '13px', borderRadius: '8px' }}
        >
          <option value="active">Active</option>
          <option value="used">Used</option>
          <option value="all_status">All</option>
        </select>
      </div>

      {/* Items List */}
      <main style={{ flex: 1, paddingBottom: '80px' }} className="fade-in">
        <div className="task-list">
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
              <Ticket size={36} style={{ opacity: 0.3, marginBottom: '10px' }} />
              <p>No items found. Tap the + to add one!</p>
            </div>
          ) : (
            filteredItems.map(item => {
              const expiry = getExpiryStatus(item.expiryDate);
              return (
                <div 
                  key={item.id} 
                  className={`glass-panel task-item ${item.used ? 'task-completed' : ''}`}
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px 16px' }}
                  onClick={() => setActiveDetailsItem(item)}
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
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ 
                        fontSize: '16px', 
                        fontWeight: '700', 
                        color: item.used ? 'var(--text-muted)' : 'var(--text-primary)' 
                      }}>
                        {item.value}
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
      <button className="fab-btn" onClick={openAddModal} title="Add New Item">
        <Plus size={24} />
      </button>

      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalType === 'add' ? 'Add Wallet Item' : 'Edit Wallet Item'}</h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'transparent', fontSize: '20px' }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="modal-form">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Amazon Gift Card, Nike Coupon..." 
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select value={itemType} onChange={(e) => setItemType(e.target.value)}>
                    <option value="voucher">Voucher 🎫</option>
                    <option value="coupon">Coupon ✂️</option>
                    <option value="membership">Membership 💳</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Value / Amount</label>
                  <input 
                    type="text" 
                    placeholder="e.g. $50, 20% Off, Free Drink" 
                    value={itemValue}
                    onChange={(e) => setItemValue(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Expiration Date (Optional)</label>
                <input 
                  type="date" 
                  value={itemExpiryDate} 
                  onChange={(e) => setItemExpiryDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Code / Coupon ID (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Code, Link or Member Card ID" 
                  value={itemCode}
                  onChange={(e) => setItemCode(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description / Notes (Optional)</label>
                <textarea 
                  placeholder="Add location details, rules, or restrictions here..." 
                  rows={3}
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Item</button>
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
                <span>Item details</span>
              </h3>
              <button className="btn-icon" onClick={() => setActiveDetailsItem(null)} style={{ border: 'none', background: 'transparent', fontSize: '20px' }}>
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '10px' }}>
              <div style={{ textAlign: 'center', padding: '16px 0', borderBottom: '1px solid var(--panel-border)' }}>
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
                  {activeDetailsItem.value}
                </div>
              </div>

              {activeDetailsItem.code && (
                <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Code / ID</span>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '0.05em', color: 'white' }}>{activeDetailsItem.code}</span>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '6px 16px', fontSize: '13px', marginTop: '4px' }}
                    onClick={() => copyToClipboard(activeDetailsItem.code, activeDetailsItem.id)}
                  >
                    {copiedId === activeDetailsItem.id ? 'Copied! ✅' : 'Copy Code'}
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Type</span>
                  <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{activeDetailsItem.type}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                  <span style={{ fontWeight: '600', color: activeDetailsItem.used ? 'var(--text-muted)' : 'var(--secondary)' }}>
                    {activeDetailsItem.used ? 'Used' : 'Active / Available'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Expiration</span>
                  <span style={{ fontWeight: '600' }}>
                    {activeDetailsItem.expiryDate ? new Date(activeDetailsItem.expiryDate).toLocaleDateString() : 'No expiration date'}
                  </span>
                </div>
              </div>

              {activeDetailsItem.notes && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Notes & Restrictions:</span>
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
                  {activeDetailsItem.used ? 'Mark Active' : 'Mark as Used'}
                </button>
                <button className="btn btn-primary" onClick={() => setActiveDetailsItem(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
