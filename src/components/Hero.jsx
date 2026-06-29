import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';
import { AuroraVisual } from './AuroraVisual';

export const Hero = ({ onExplore }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });

      // Animate text column components
      tl.to('.hero-content', { opacity: 1, y: 0, duration: 0.1 })
        .fromTo('.hero-desc', { y: 25, opacity: 0 }, { y: 0, opacity: 1 }, 0.3)
        .fromTo('.hero-btn', { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, ease: 'back.out(1.5)' }, 0.5);

      // Smooth entrance for the Aurora Visual
      tl.fromTo('.aurora-visual-wrap',
        { scale: 0.7, opacity: 0, y: 40 },
        { scale: 1, opacity: 1, y: 0, duration: 1.8, ease: 'power3.out' },
        0.2
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="hero-container" ref={containerRef}>
      <section className="hero-banner" id="featured-hero">
        <div className="hero-content">
          <div className="reveal-wrapper" style={{ marginBottom: '0.75rem' }}>
            <span className="hero-badge reveal-text-mask" id="hero-badge-title" style={{ animationDelay: '0.1s' }}>
              Exclusive Titanium Future
            </span>
          </div>
          
          <div className="reveal-wrapper" style={{ display: 'block', marginBottom: '1.5rem' }}>
            <h1 className="hero-title reveal-text-mask" id="hero-heading" style={{ animationDelay: '0.25s' }}>
              Next-Gen
              <br />
              Smartphones
            </h1>
          </div>

          <p className="hero-desc" id="hero-subtext">
            Discover the world's finest flagship smartphones — powered by cutting-edge chips, pro-grade cameras, and all-day batteries. Explore our curated collection and find your perfect device.
          </p>
          
          <button className="hero-btn" id="hero-cta-btn" onClick={onExplore}>
            Explore Store
            <ArrowRight width="18" height="18" strokeWidth={2.5} />
          </button>
        </div>
        
        <div className="hero-visual" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AuroraVisual />
        </div>
      </section>
    </div>
  );
};
