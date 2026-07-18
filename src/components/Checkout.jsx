import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { User, CreditCard, Check, LogIn } from 'lucide-react';
import { formatINR } from '../utils/currency';

export const Checkout = ({ onOpenAuth }) => {
  const { cart, products, processOrder, currentUser, addToast } = useStore();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    paymentMethod: 'card',
    utrNumber: ''
  });

  const [coupon, setCoupon] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState({ code: '', percentage: 0, amount: 0 });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentHandshakeStep, setPaymentHandshakeStep] = useState(0);
  const [biometricStep, setBiometricStep] = useState('idle'); // 'idle', 'scanning', 'success', 'done'

  const startBiometricScan = () => {
    setBiometricStep('scanning');
    
    // Simulate laser scanning sweep
    setTimeout(() => {
      setBiometricStep('success');
      
      // Complete scan and transition to database creation
      setTimeout(() => {
        setBiometricStep('done');
        setPaymentHandshakeStep(1);

        setTimeout(() => {
          setPaymentHandshakeStep(2);
        }, 850);

        setTimeout(() => {
          setPaymentHandshakeStep(3);
        }, 1700);

        setTimeout(() => {
          setPaymentHandshakeStep(4);
        }, 2550);

        setTimeout(async () => {
          const success = await processOrder(form, appliedDiscount.code);
          if (!success) {
            setIsProcessingPayment(false);
            setPaymentHandshakeStep(0);
            setBiometricStep('idle');
          }
        }, 3200);
      }, 1000);
    }, 2200);
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = coupon.trim().toUpperCase();
    if (code === 'AURA10') {
      const amt = subtotal * 0.1;
      setAppliedDiscount({ code: 'AURA10', percentage: 10, amount: amt });
      addToast('Promo Code AURA10 applied! 10% discount subtracted.', 'success');
    } else if (code === 'AURA20') {
      const amt = subtotal * 0.2;
      setAppliedDiscount({ code: 'AURA20', percentage: 20, amount: amt });
      addToast('Promo Code AURA20 applied! 20% discount subtracted.', 'success');
    } else if (code === 'WELCOME50') {
      const amt = subtotal * 0.5;
      setAppliedDiscount({ code: 'WELCOME50', percentage: 50, amount: amt });
      addToast('Promo Code WELCOME50 applied! 50% discount subtracted.', 'success');
    } else {
      addToast('Invalid promo coupon code.', 'error');
    }
    setCoupon('');
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscount({ code: '', percentage: 0, amount: 0 });
    addToast('Promo coupon code removed.', 'warning');
  };

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (currentUser) {
      setForm((prev) => ({
        ...prev,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email
      }));
    } else {
      // Clear personal fields if they log out on this page
      setForm((prev) => ({
        ...prev,
        firstName: '',
        lastName: '',
        email: ''
      }));
    }
  }, [currentUser]);

  const subtotal = cart.reduce((acc, item) => {
    const phone = products.find((p) => p.id === item.productId);
    if (!phone) return acc;
    let price = phone.price;
    if (phone.brand !== 'Aura Accessories') {
      if (item.storage === '256GB') price += 8000;
      else if (item.storage === '512GB') price += 16000;
      else if (item.storage === '1TB') price += 24000;
    }
    return acc + price * item.quantity;
  }, 0);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    // Map the id of input (e.g. checkout-first-name) to form property name (e.g. firstName)
    const propName = id.replace('checkout-', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    setForm((prev) => ({ ...prev, [propName]: value }));
  };

  const triggerUpiApp = (_appName) => {
    const totalInINR = subtotal;
    const upiUrl = `upi://pay?pa=princejaat07@fam&pn=MobileStore&am=${totalInINR}&cu=INR&tn=Order%20Payment`;
    
    // Simple user agent check to see if we are on a mobile device
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
    
    if (!isMobile) {
      addToast("UPI app links are only supported on mobile devices. Please scan the QR code using your phone's camera or UPI app instead.", "warning");
      return;
    }
    
    window.location.href = upiUrl;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    setBiometricStep('idle');
    setPaymentHandshakeStep(0);
    // Start scanning auto trigger
    setTimeout(() => {
      startBiometricScan();
    }, 400);
  };

  if (!currentUser) {
    return (
      <section id="checkout-view" className="view-section active">
        <div className="checkout-container" style={{ textAlign: 'center', padding: '5rem 0', maxWidth: '480px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: '#fff' }}>Login Required for Purchase</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
            You must be logged in to access secure checkout lanes, track shipment status, and store purchase invoices.
          </p>
          <button 
            type="button" 
            className="btn" 
            onClick={onOpenAuth}
            style={{ 
              padding: '0.8rem 2rem', fontWeight: '700', borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              border: 'none', color: '#fff', cursor: 'pointer'
            }}
          >
            Sign In / Sign Up
          </button>
        </div>
      </section>
    );
  }

  if (cart.length === 0) {
    return (
      <section id="checkout-view" className="view-section active">
        <div className="checkout-container" style={{ textAlign: 'center', padding: '5rem 0' }}>
          <h3>Your cart is empty</h3>
          <p>Go back to the shop to select smartphones before checking out.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="checkout-view" className="view-section active">
      <div className="checkout-container">
        {/* Guest Suggestion Banner */}
        {!currentUser && (
          <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <strong style={{ color: '#fff', fontSize: '0.95rem' }}>Checking out as a Guest</strong>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                Create an account or sign in to save your address details and monitor purchase receipts.
              </p>
            </div>
            <button 
              type="button" 
              className="nav-btn admin-toggle" 
              onClick={onOpenAuth}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              <LogIn width="14" height="14" style={{ marginRight: '0.3rem' }} />
              Sign In / Sign Up
            </button>
          </div>
        )}

        <div className="checkout-grid">
          {/* Left Form */}
          <div className="checkout-card">
            <h3>
              <User width="22" height="22" style={{ marginRight: '0.2rem' }} />
              Shipping Details
            </h3>
            <form className="checkout-form" id="shipping-checkout-form" onSubmit={handleSubmit}>
              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="checkout-first-name">First Name</label>
                  <input
                    type="text"
                    id="checkout-first-name"
                    value={form.firstName}
                    onChange={handleInputChange}
                    required
                    placeholder="John"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="checkout-last-name">Last Name</label>
                  <input
                    type="text"
                    id="checkout-last-name"
                    value={form.lastName}
                    onChange={handleInputChange}
                    required
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="checkout-email">Email Address</label>
                  <input
                    type="email"
                    id="checkout-email"
                    value={form.email}
                    onChange={handleInputChange}
                    required
                    placeholder="john.doe@example.com"
                    disabled={!!currentUser} // Lock email if logged in
                    style={{ opacity: currentUser ? 0.65 : 1, cursor: currentUser ? 'not-allowed' : 'text' }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="checkout-phone">Phone Number</label>
                  <input
                    type="tel"
                    id="checkout-phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="checkout-address">Delivery Address</label>
                <input
                  type="text"
                  id="checkout-address"
                  value={form.address}
                  onChange={handleInputChange}
                  required
                  placeholder="123 tech boulevard, Suite 4B"
                />
              </div>
              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="checkout-city">City</label>
                  <input
                    type="text"
                    id="checkout-city"
                    value={form.city}
                    onChange={handleInputChange}
                    required
                    placeholder="San Francisco"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="checkout-zip">Zip Code</label>
                  <input
                    type="text"
                    id="checkout-zip"
                    value={form.zip}
                    onChange={handleInputChange}
                    required
                    placeholder="94103"
                  />
                </div>
              </div>

              <h3 className="mt-6 border-t border-[var(--border-color)] pt-6 mb-5">
                <CreditCard className="inline-block mr-1" width="22" height="22" />
                Select Payment Method
              </h3>

              <div className="payment-methods-grid">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, paymentMethod: 'card' }))}
                  style={{
                    background: form.paymentMethod === 'card' ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'rgba(255, 255, 255, 0.02)',
                    boxShadow: form.paymentMethod === 'card' ? '0 4px 15px rgba(99, 102, 241, 0.3)' : 'none',
                  }}
                  className={`payment-method-btn ${form.paymentMethod === 'card' ? 'active' : 'inactive'}`}
                >
                  Credit / Debit Card
                </button>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, paymentMethod: 'upi' }))}
                  style={{
                    background: form.paymentMethod === 'upi' ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'rgba(255, 255, 255, 0.02)',
                    boxShadow: form.paymentMethod === 'upi' ? '0 4px 15px rgba(99, 102, 241, 0.3)' : 'none',
                  }}
                  className={`payment-method-btn ${form.paymentMethod === 'upi' ? 'active' : 'inactive'}`}
                >
                  UPI Mobile Payment
                </button>
              </div>

              {form.paymentMethod === 'card' && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <div className="form-group">
                    <label htmlFor="checkout-card-number">Card Number</label>
                    <input
                      type="text"
                      id="checkout-card-number"
                      value={form.cardNumber}
                      onChange={handleInputChange}
                      required={form.paymentMethod === 'card'}
                      placeholder="4111 2222 3333 4444"
                      pattern="[0-9\s]{13,19}"
                    />
                  </div>
                  <div className="form-group-row">
                    <div className="form-group">
                      <label htmlFor="checkout-card-expiry">Expiry Date</label>
                      <input
                        type="text"
                        id="checkout-card-expiry"
                        value={form.cardExpiry}
                        onChange={handleInputChange}
                        required={form.paymentMethod === 'card'}
                        placeholder="MM/YY"
                        pattern="(0[1-9]|1[0-2])\/[0-9]{2}"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="checkout-card-cvc">CVC</label>
                      <input
                        type="text"
                        id="checkout-card-cvc"
                        value={form.cardCvc}
                        onChange={handleInputChange}
                        required={form.paymentMethod === 'card'}
                        placeholder="123"
                        pattern="[0-9]{3,4}"
                      />
                    </div>
                  </div>
                </div>
              )}

              {form.paymentMethod === 'upi' && (
                <div className="upi-payment-panel">
                  
                  {/* QR Code Container (Central visual for Desktop & Mobile users) */}
                  <div className="upi-qr-container">
                    <span className="upi-qr-title">Scan QR Code to Pay via UPI</span>
                    
                    <div style={{ 
                      background: '#15151e', 
                      padding: '10px', 
                      borderRadius: '12px', 
                      border: '2px dashed rgba(99, 102, 241, 0.35)', 
                      display: 'inline-block',
                      boxShadow: '0 0 20px rgba(99, 102, 241, 0.1)'
                    }}>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=6366f1&bgcolor=15151e&data=${encodeURIComponent(`upi://pay?pa=princejaat07@fam&pn=MobileStore&am=${Math.round(subtotal)}&cu=INR&tn=Order%20Payment`)}`}
                        alt="UPI Payment QR Code"
                        className="upi-qr-image"
                      />
                    </div>
                    
                    <p className="upi-qr-desc">
                      Scan using **PhonePe, Google Pay, or Paytm** to automatically load the merchant and transfer details.
                    </p>
                  </div>

                  <div className="upi-detail-row">
                    <span className="upi-detail-label">UPI ID:</span>
                    <strong className="upi-id-value">
                      princejaat07@fam
                    </strong>
                  </div>
                  
                  <div className="upi-detail-row bordered">
                    <span className="upi-detail-label">Amount in INR (₹):</span>
                    <strong className="upi-amount-value">
                      ₹{Math.round(subtotal).toLocaleString('en-IN')}
                    </strong>
                  </div>
                  
                  <p className="upi-apps-note">
                    Or, if on a mobile device, tap an app to pay directly:
                  </p>
                  
                  <div className="upi-apps-grid">
                    <button
                      type="button"
                      onClick={() => triggerUpiApp('PhonePe')}
                      style={{
                        height: '38px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #5f259f, #7f39d8)',
                        boxShadow: '0 4px 10px rgba(95, 37, 159, 0.2)',
                        transition: 'transform 0.2s ease'
                      }}
                      className="upi-app-btn"
                    >
                      PhonePe
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerUpiApp('GooglePay')}
                      style={{
                        height: '38px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #1a73e8, #4285f4)',
                        boxShadow: '0 4px 10px rgba(26, 115, 232, 0.2)',
                        transition: 'transform 0.2s ease'
                      }}
                      className="upi-app-btn"
                    >
                      GPay
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerUpiApp('Paytm')}
                      style={{
                        height: '38px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #00b9f5, #008cc8)',
                        boxShadow: '0 4px 10px rgba(0, 185, 245, 0.2)',
                        transition: 'transform 0.2s ease'
                      }}
                      className="upi-app-btn"
                    >
                      Paytm
                    </button>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="checkout-utr-number" className="text-white font-semibold">Confirm Payment via UTR Number</label>
                    <input
                      type="text"
                      id="checkout-utr-number"
                      value={form.utrNumber}
                      onChange={handleInputChange}
                      required={form.paymentMethod === 'upi'}
                      placeholder="Enter 12-Digit UPI UTR Number"
                      pattern="[0-9]{12}"
                      maxLength={12}
                      className="upi-utr-input"
                    />
                    <span className="upi-utr-help">
                      To complete, enter the 12-digit transaction ID / UTR number from your payment app.
                    </span>
                  </div>
                </div>
              )}

              <button type="submit" className="order-now-btn" id="submit-order-btn">
                <Check width="18" height="18" strokeWidth={2.5} />
                Complete Safe Purchase
              </button>
            </form>
          </div>

          {/* Right Summary */}
          <div className="checkout-card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
            <h3>Order Summary</h3>
            <div className="checkout-summary-list" id="checkout-summary-items-list" style={{ marginBottom: '1.5rem' }}>
              {cart.map((item) => {
                const phone = products.find((p) => p.id === item.productId);
                if (!phone) return null;
                
                let price = phone.price;
                if (phone.brand !== 'Aura Accessories') {
                  if (item.storage === '256GB') price += 8000;
                  else if (item.storage === '512GB') price += 16000;
                  else if (item.storage === '1TB') price += 24000;
                }
                const itemTotal = price * item.quantity;
                
                return (
                  <div 
                    className="checkout-summary-item" 
                    key={`${item.productId}-${item.storage || '128GB'}-${item.color || 'Obsidian Black'}`} 
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span>{phone.name} <strong>x{item.quantity}</strong></span>
                      <span>{formatINR(itemTotal)}</span>
                    </div>
                    {phone.brand !== 'Aura Accessories' && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {item.storage || '128GB'} • {item.color || 'Obsidian Black'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="checkout-summary-item">
              <span>Subtotal</span>
              <span id="checkout-subtotal">{formatINR(subtotal)}</span>
            </div>
            <div className="checkout-summary-item">
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            {appliedDiscount.amount > 0 && (
              <div className="checkout-summary-item" style={{ color: 'var(--accent-green)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Discount ({appliedDiscount.code} - {appliedDiscount.percentage}%)</span>
                <span>-{formatINR(appliedDiscount.amount)}</span>
              </div>
            )}
            <div className="checkout-summary-item total-row">
              <span>Total to pay</span>
              <span id="checkout-total">{formatINR(subtotal - appliedDiscount.amount)}</span>
            </div>

            {/* Promo Code Input */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {appliedDiscount.code ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.6rem 0.8rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-green)', letterSpacing: '0.04em' }}>COUPON APPLIED</span>
                    <span style={{ fontSize: '0.82rem', color: '#fff', fontWeight: '600' }}>{appliedDiscount.code} (-{appliedDiscount.percentage}%)</span>
                  </div>
                  <button type="button" onClick={handleRemoveCoupon} style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '700' }}>
                    Remove
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. AURA10)"
                    value={coupon}
                    className="admin-input"
                    onChange={(e) => setCoupon(e.target.value)}
                    style={{ flex: 1, padding: '0.5rem 0.85rem', height: '38px', fontSize: '0.85rem' }}
                  />
                  <button type="button" onClick={handleApplyCoupon} style={{ padding: '0 1rem', height: '38px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600' }}>
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Simulated Payment Handshake Modal Overlay */}
      {isProcessingPayment && (
        <div className="payment-handshake-overlay" style={{
          position: 'fixed', inset: 0, background: 'rgba(5, 5, 8, 0.95)',
          backdropFilter: 'blur(20px)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem',
        }}>
          {biometricStep !== 'done' ? (
            <div className="payment-handshake-box" style={{
              background: '#0e0e13', border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: '24px', padding: '2.5rem 2rem', maxWidth: '440px', width: '100%',
              textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(99, 102, 241, 0.1)',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Scan grid animation in background */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'radial-gradient(circle, rgba(99, 102, 241, 0.04) 1px, transparent 1px)',
                backgroundSize: '20px 20px', zIndex: 0, pointerEvents: 'none'
              }} />

              {/* Title & Status */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <span style={{
                  color: biometricStep === 'success' ? '#10b981' : '#6366f1',
                  fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: '2px', display: 'block', marginBottom: '0.5rem'
                }}>
                  {biometricStep === 'idle' && 'Biometric Verification Required'}
                  {biometricStep === 'scanning' && 'Scanning Biometric Signature'}
                  {biometricStep === 'success' && 'Biometric Verified Successfully'}
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 950, color: '#fff', margin: '0 0 1.5rem', letterSpacing: '-0.5px' }}>
                  {biometricStep === 'success' ? 'Identity Authorized' : 'Secure Order Authorization'}
                </h3>
              </div>

              {/* Fingerprint Scanner Interactive Icon */}
              <div style={{
                position: 'relative', width: '120px', height: '120px', margin: '0 auto 2rem',
                borderRadius: '50%', background: 'rgba(255,255,255,0.02)',
                border: biometricStep === 'success' ? '2.5px solid #10b981' : '2px dashed rgba(99,102,241,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: biometricStep === 'success'
                  ? '0 0 35px rgba(16, 185, 129, 0.25)'
                  : (biometricStep === 'scanning' ? '0 0 30px rgba(99,102,241,0.2)' : 'none'),
                transition: 'all 0.4s ease', zIndex: 1,
              }}>
                {/* Glowing Laser Scan Bar */}
                {biometricStep === 'scanning' && (
                  <div style={{
                    position: 'absolute', left: '10%', right: '10%', height: '3px',
                    background: 'linear-gradient(90deg, transparent, #6366f1, #a78bfa, #6366f1, transparent)',
                    boxShadow: '0 0 10px #6366f1, 0 0 20px #a78bfa',
                    borderRadius: '2px', zIndex: 2,
                    animation: 'biometricSweep 1.1s ease-in-out infinite alternate',
                  }} />
                )}

                {/* Fingerprint Vector SVG */}
                <svg viewBox="0 0 24 24" width="60" height="60" fill="none" stroke={biometricStep === 'success' ? '#10b981' : '#6366f1'} strokeWidth="1.5" strokeLinecap="round" style={{ transition: 'stroke 0.4s ease' }}>
                  <path d="M12 2a10 10 0 0 0-10 10" />
                  <path d="M12 6a6 6 0 0 0-6 6" />
                  <path d="M12 10a2 2 0 0 0-2 2" />
                  <path d="M12 14c2.2 0 4-1.8 4-4s-1.8-4-4-4" />
                  <path d="M12 18c4.4 0 8-3.6 8-8s-3.6-8-8-8" />
                  <path d="M12 22c6.6 0 12-5.4 12-12S18.6-2 12-2" />
                  <path d="M12 10v4" />
                  {biometricStep === 'success' && <path d="M9 12l2 2 4-4" stroke="#10b981" strokeWidth="2" />}
                </svg>
              </div>

              {/* Status Details */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
                  {biometricStep === 'idle' && 'Initializing hardware authenticator...'}
                  {biometricStep === 'scanning' && 'Verifying unique device owner fingerprint credentials against secure enclaves...'}
                  {biometricStep === 'success' && 'Encryption signature matched. Transferring to transactional banking networks...'}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: biometricStep === 'success' ? '#10b981' : '#6366f1',
                    animation: biometricStep === 'scanning' ? 'pulse 0.8s infinite alternate' : 'none'
                  }} />
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}>
                    SECURE ENCLAVE 256-AES
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="payment-handshake-box">
              <div className="payment-handshake-spinner"></div>
              <h3>Securing Safe Checkout</h3>
              <p className="payment-handshake-subtitle">Please do not refresh the page or close your browser</p>
              
              <div className="payment-handshake-steps-list">
                <div className={`handshake-step-item ${paymentHandshakeStep >= 1 ? 'active' : ''} ${paymentHandshakeStep > 1 ? 'completed' : ''}`}>
                  <div className="step-check">{paymentHandshakeStep > 1 ? '✓' : '1'}</div>
                  <span>Opening secure transaction tunnel…</span>
                </div>
                <div className={`handshake-step-item ${paymentHandshakeStep >= 2 ? 'active' : ''} ${paymentHandshakeStep > 2 ? 'completed' : ''}`}>
                  <div className="step-check">{paymentHandshakeStep > 2 ? '✓' : '2'}</div>
                  <span>Authenticating with payment gateway…</span>
                </div>
                <div className={`handshake-step-item ${paymentHandshakeStep >= 3 ? 'active' : ''} ${paymentHandshakeStep > 3 ? 'completed' : ''}`}>
                  <div className="step-check">{paymentHandshakeStep > 3 ? '✓' : '3'}</div>
                  <span>Verifying stock reservations…</span>
                </div>
                <div className={`handshake-step-item ${paymentHandshakeStep >= 4 ? 'active' : ''}`}>
                  <div className="step-check">{paymentHandshakeStep >= 4 ? '✓' : '4'}</div>
                  <span>Creating order receipt invoice…</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
