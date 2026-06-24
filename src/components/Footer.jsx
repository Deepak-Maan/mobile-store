import React from 'react';
import { Smartphone, Mail, Phone, MapPin, Clock, MessageCircle, Camera, Globe, Share2, ExternalLink } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Footer = ({ onOpenCart, onOpenAuth }) => {
  const { switchView, currentUser, logoutUser } = useStore();

  const handleLinkClick = (e, view) => {
    e.preventDefault();
    switchView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFaqClick = (e) => {
    e.preventDefault();
    const faqSection = document.getElementById('faq-section');
    if (faqSection) {
      faqSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="professional-footer">
      <div className="footer-grid">
        {/* Column 1: Brand Info */}
        <div className="footer-col brand-col">
          <a href="#" className="footer-logo" onClick={(e) => handleLinkClick(e, 'storefront')}>
            <div className="brand-icon">
              <Smartphone width="16" height="16" style={{ color: '#fff' }} />
            </div>
            <span>AURA</span>
          </a>
          <p className="footer-desc">
            Experience the titanium era of mobile technology. Curating the world's most advanced, high-fidelity smartphones with elite AI capabilities, premium materials, and professional-grade optical cameras.
          </p>
          <div className="social-links">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" title="Twitter">
              <MessageCircle width="18" height="18" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" title="Instagram">
              <Camera width="18" height="18" />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" title="GitHub">
              <Globe width="18" height="18" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" title="LinkedIn">
              <Share2 width="18" height="18" />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-col">
          <h4 className="footer-col-title">Store Navigation</h4>
          <ul className="footer-links">
            <li><a href="#" onClick={(e) => handleLinkClick(e, 'storefront')}>Browse Shop</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onOpenCart(); }}>Shopping Cart</a></li>
            {currentUser ? (
              <>
                <li style={{ color: 'var(--text-muted)', fontSize: '0.88rem', padding: '0.2rem 0' }}>Signed in as {currentUser.firstName}</li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); logoutUser(); }}>Log Out Account</a></li>
              </>
            ) : (
              <li><a href="#" onClick={(e) => { e.preventDefault(); onOpenAuth(); }}>Shopper Sign In</a></li>
            )}
            <li>
              <a href="#" onClick={(e) => handleLinkClick(e, 'admin')} className="admin-link">
                Admin Control Portal <ExternalLink width="12" height="12" style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Customer Support */}
        <div className="footer-col">
          <h4 className="footer-col-title">Customer Care</h4>
          <ul className="footer-links">
            <li><a href="#" onClick={handleFaqClick}>Frequently Asked Questions</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Complimentary Shipping</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>1-Year Hardware Warranty</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>30-Day Hassle-Free Returns</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Secure Payments & Privacy</a></li>
          </ul>
        </div>

        {/* Column 4: Contact Info */}
        <div className="footer-col contact-col">
          <h4 className="footer-col-title">Get in Touch</h4>
          <ul className="contact-details">
            <li>
              <MapPin width="16" height="16" />
              <span>1 Infinite Loop, Cupertino, CA 95014</span>
            </li>
            <li>
              <Mail width="16" height="16" />
              <a href="mailto:support@aura.com">support@aura.com</a>
            </li>
            <li>
              <Phone width="16" height="16" />
              <span>+1 (800) 555-AURA</span>
            </li>
            <li>
              <Clock width="16" height="16" />
              <span>Mon - Fri: 9:00 AM - 6:00 PM PST</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p className="copyright">
            &copy; {new Date().getFullYear()} AURA Inc. Engineered with state-of-the-art aesthetics and absolute performance. All rights reserved.
          </p>
          <div className="legal-links">
            <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
