import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';

export const Hero = ({ onExplore }) => {
  const containerRef = useRef(null);
  const phoneRef = useRef(null);
  const glareRef = useRef(null);

  useEffect(() => {
    // GSAP Entrance Timeline for texts and card
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });

      // Animate text content column
      tl.to('.hero-content', { opacity: 1, y: 0, duration: 0.1 })
        .fromTo('.hero-badge', { y: -25, opacity: 0 }, { y: 0, opacity: 1 }, 0.1)
        .fromTo('.hero-title', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.4 }, 0.2)
        .fromTo('.hero-desc', { y: 30, opacity: 0 }, { y: 0, opacity: 1 }, 0.4)
        .fromTo('.hero-btn', { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, ease: 'back.out(1.6)' }, 0.6);

      // Animate featured device visual container entrance (starting with an elegant tilted 3D profile)
      tl.fromTo('.hero-gsap-phone-container', 
        { scale: 0.6, opacity: 0, x: 150, rotationY: -45, rotationZ: -10 }, 
        { scale: 1, opacity: 1, x: 0, rotationY: -15, rotationZ: 0, duration: 1.8, ease: 'back.out(1.4)' }, 
        0.3
      );

      // Infinite floating / bobbing loop for the phone image inside the 3D card
      const floatTl = gsap.timeline({ repeat: -1, yoyo: true });
      floatTl.to('.hero-gsap-phone-img', {
        y: -15,
        rotationZ: -1.5,
        duration: 4.5,
        ease: 'sine.inOut'
      }).to('.hero-gsap-phone-img', {
        y: 5,
        rotationZ: 1.5,
        duration: 4.5,
        ease: 'sine.inOut'
      }, 0);
    }, containerRef);

    return () => ctx.revert(); // Clean up GSAP animations on unmount
  }, []);

  // Butter-smooth GSAP-driven 3D Mouse-Tilt Logic
  const handleMouseMove = (e) => {
    const card = phoneRef.current;
    const glare = glareRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // mouse x within card
    const y = e.clientY - rect.top;  // mouse y within card

    const width = rect.width;
    const height = rect.height;

    // Calculate rotation angles based on mouse position from center (max 22 degrees)
    const rotateY = ((x - width / 2) / (width / 2)) * 22;
    const rotateX = -((y - height / 2) / (height / 2)) * 22;

    // Animate tilt smoothly using GSAP
    gsap.to(card, {
      rotationX: rotateX,
      rotationY: rotateY,
      scale: 1.05,
      duration: 0.5,
      ease: 'power2.out',
      overwrite: 'auto'
    });

    // Animate glare light reflection position smoothly using GSAP
    if (glare) {
      const percentageX = (x / width) * 100;
      const percentageY = (y / height) * 100;
      gsap.to(glare, {
        opacity: 1,
        background: `radial-gradient(circle at ${percentageX}% ${percentageY}%, rgba(255, 255, 255, 0.12) 0%, transparent 80%)`,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    }
  };

  const handleMouseLeave = () => {
    const card = phoneRef.current;
    const glare = glareRef.current;
    if (!card) return;

    // Smoothly return card to default tilted 3D resting state (rotationY: -15)
    gsap.to(card, {
      rotationX: 0,
      rotationY: -15,
      scale: 1,
      duration: 0.8,
      ease: 'power3.out',
      overwrite: 'auto'
    });

    if (glare) {
      gsap.to(glare, {
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        overwrite: 'auto'
      });
    }
  };

  return (
    <div className="hero-container" ref={containerRef}>
      <section className="hero-banner" id="featured-hero">
        <div className="hero-content">
          <span className="hero-badge" id="hero-badge-title">Exclusive Titanium Future</span>
          <h1 className="hero-title" id="hero-heading">iPhone 17 Pro</h1>
          <p className="hero-desc" id="hero-subtext">
            Experience the pinnacle of smart engineering. Crafted in premium Dark Obsidian Titanium, featuring full 3D interactive manipulation. Hover over the device to inspect its flawless contours and ceramic matte glass back.
          </p>
          <button className="hero-btn" id="hero-cta-btn" onClick={onExplore}>
            Explore Store
            <ArrowRight width="18" height="18" strokeWidth={2.5} />
          </button>
        </div>
        
        <div className="hero-visual" style={{ perspective: '1000px' }}>
          <div 
            ref={phoneRef} 
            className="hero-gsap-phone-container"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="glare-effect-gsap" ref={glareRef} />
            <img 
              src="/images/iphone_17_pro_dark.png" 
              alt="iPhone 17 Pro Dark" 
              className="hero-gsap-phone-img" 
            />
          </div>
        </div>
      </section>
    </div>
  );
};
