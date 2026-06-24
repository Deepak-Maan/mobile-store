import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { User, CreditCard, Check, LogIn } from 'lucide-react';

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
    return acc + (phone ? phone.price * item.quantity : 0);
  }, 0);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    // Map the id of input (e.g. checkout-first-name) to form property name (e.g. firstName)
    const propName = id.replace('checkout-', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    setForm((prev) => ({ ...prev, [propName]: value }));
  };

  const triggerUpiApp = (appName) => {
    const totalInINR = Math.round(subtotal * 85);
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
    processOrder(form);
  };

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
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=6366f1&bgcolor=15151e&data=${encodeURIComponent(`upi://pay?pa=princejaat07@fam&pn=MobileStore&am=${Math.round(subtotal * 85)}&cu=INR&tn=Order%20Payment`)}`}
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
                      ₹{Math.round(subtotal * 85).toLocaleString()}
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
                const itemTotal = phone.price * item.quantity;
                return (
                  <div className="checkout-summary-item" key={item.productId} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <span>{phone.name} <strong>x{item.quantity}</strong></span>
                    <span>${itemTotal.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
            <div className="checkout-summary-item">
              <span>Subtotal</span>
              <span id="checkout-subtotal">${subtotal.toLocaleString()}</span>
            </div>
            <div className="checkout-summary-item">
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            <div className="checkout-summary-item total-row">
              <span>Total to pay</span>
              <span id="checkout-total">${subtotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
