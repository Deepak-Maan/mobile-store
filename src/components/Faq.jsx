import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const Faq = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqItems = [
    {
      question: "What devices does AURA sell?",
      answer: "We specialize in flagship, high-performance smartphones including the Apple iPhone 15 Pro, Samsung Galaxy S24 Ultra, Google Pixel 8 Pro, OnePlus 12, and Xiaomi 14 Ultra. All our devices are brand new, factory unlocked, and come with a full manufacturer warranty."
    },
    {
      question: "Do you offer free shipping and returns?",
      answer: "Yes, we offer complimentary express shipping on all orders over $500. Standard shipping takes 2-4 business days. We also provide a 30-day hassle-free return policy with pre-paid return shipping labels."
    },
    {
      question: "How does the warranty work?",
      answer: "Every smartphone purchased from AURA includes a 1-year comprehensive hardware warranty. You can also purchase AURA Care+ during checkout to extend your coverage to 2 years and include accidental damage protection."
    },
    {
      question: "Are payments secure?",
      answer: "Absolutely. All transactions are encrypted using state-of-the-art 256-bit SSL encryption. We accept all major credit cards, Apple Pay, Google Pay, and secure bank transfers. Your financial data is never stored on our servers."
    },
    {
      question: "How do I access the administrator portal?",
      answer: "Authorized administrators can access the portal by navigating to /#/admin (or clicking the link in the footer). The default development credentials are 'admin' for the username and 'admin123' for the password. Once logged in, administrators can manage device inventory, upload high-fidelity photos, view customer orders, and manage shopper profiles."
    }
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq-container" id="faq-section">
      <div className="faq-header">
        <div className="faq-badge">
          <HelpCircle width="14" height="14" style={{ color: 'var(--primary)' }} />
          <span>Support Center</span>
        </div>
        <h2 className="faq-title">Frequently Asked Questions</h2>
        <p className="faq-subtitle">
          Have questions about shipping, warranties, secure payments, or the administrator portal? Find quick answers below.
        </p>
      </div>

      <div className="faq-list">
        {faqItems.map((item, index) => {
          const isOpen = activeIndex === index;
          return (
            <div 
              key={index} 
              className={`faq-item ${isOpen ? 'active' : ''}`}
              onClick={() => toggleAccordion(index)}
            >
              <button className="faq-question">
                <span>{item.question}</span>
                <ChevronDown 
                  width="18" 
                  height="18" 
                  className={`faq-chevron ${isOpen ? 'rotated' : ''}`} 
                />
              </button>
              
              <div className={`faq-answer-wrapper ${isOpen ? 'open' : ''}`}>
                <div className="faq-answer-content">
                  <p>{item.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
