import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── animated sub-components ───────────────────────────────────────── */
const DeliveryIcon = () => (
  <svg viewBox="0 0 120 60" width="110" height="55" style={{ overflow: 'visible', flexShrink: 0 }}>
    <rect x="0" y="44" width="120" height="4" rx="2" fill="rgba(255,255,255,0.08)" />
    <g className="truck-anim-icon">
      <rect x="10" y="20" width="55" height="28" rx="5" fill="rgba(99,102,241,0.25)" stroke="rgba(99,102,241,0.7)" strokeWidth="1.5" />
      <rect x="65" y="28" width="25" height="20" rx="3" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.5)" strokeWidth="1.5" />
      <circle cx="28" cy="48" r="6" fill="rgba(20,20,35,1)" stroke="rgba(99,102,241,0.8)" strokeWidth="2" />
      <circle cx="28" cy="48" r="2" fill="rgba(99,102,241,0.8)" />
      <circle cx="75" cy="48" r="6" fill="rgba(20,20,35,1)" stroke="rgba(99,102,241,0.8)" strokeWidth="2" />
      <circle cx="75" cy="48" r="2" fill="rgba(99,102,241,0.8)" />
      <line x1="0" y1="30" x2="14" y2="30" stroke="rgba(99,102,241,0.4)" strokeWidth="2" strokeDasharray="4 4" />
      <line x1="0" y1="36" x2="10" y2="36" stroke="rgba(236,72,153,0.3)" strokeWidth="1.5" strokeDasharray="3 5" />
    </g>
    <style>{`
      .truck-anim-icon { animation: truckMove 3s ease-in-out infinite; transform-origin: 50px 35px; }
      @keyframes truckMove { 0%,100%{transform:translateX(0)} 50%{transform:translateX(8px)} }
    `}</style>
  </svg>
);

const ShieldRings = () => (
  <div className="relative flex items-center justify-center" style={{ width: 70, height: 80 }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        position: 'absolute', inset: i * (-13), borderRadius: '50%',
        border: `1px solid rgba(236,72,153,${0.5 - i * 0.15})`,
        animation: `pulse-ring-feat 2.4s ease-out ${i * 0.6}s infinite`,
      }} />
    ))}
    <span style={{ fontSize: '2rem', position: 'relative', zIndex: 1 }}>🛡️</span>
    <style>{`
      @keyframes pulse-ring-feat {
        0%{transform:scale(1);opacity:0.8}
        100%{transform:scale(1.5);opacity:0}
      }
      @keyframes greenBlink { 0%,100%{opacity:1}50%{opacity:0.3} }
    `}</style>
  </div>
);

/* ─── card hover handlers ────────────────────────────────────────────── */
const onEnter = e => {
  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)';
  e.currentTarget.style.transform = 'translateY(-6px)';
  e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.6)';
};
const onLeave = e => {
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
  e.currentTarget.style.transform = 'translateY(0)';
  e.currentTarget.style.boxShadow = 'none';
};

const cardBase = {
  background: 'rgba(15,15,25,0.65)',
  border: '1px solid rgba(255,255,255,0.08)',
  backdropFilter: 'blur(18px)',
  borderRadius: 24,
  padding: '1.75rem',
  position: 'relative',
  overflow: 'hidden',
  transition: 'border-color 0.35s ease, transform 0.35s ease, box-shadow 0.35s ease',
  cursor: 'default',
};

/* ─── main component ────────────────────────────────────────────────── */
export const FeaturesSection = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    // Make sure cards are visible by default (fallback if ScrollTrigger doesn't fire)
    const cards = sectionRef.current?.querySelectorAll('.bento-card');
    const heading = sectionRef.current?.querySelector('.features-heading');

    const ctx = gsap.context(() => {
      if (cards?.length) {
        gsap.fromTo(cards,
          { opacity: 0, y: 60, scale: 0.93 },
          {
            opacity: 1, y: 0, scale: 1, duration: 0.85, ease: 'power3.out', stagger: 0.12,
            scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
          }
        );
      }
      if (heading) {
        gsap.fromTo(heading,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 90%', once: true },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features-section"
      className="features-container"
    >
      <div>
        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span
            style={{
              display: 'inline-block', padding: '6px 18px', borderRadius: 30,
              background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
              color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 600,
              letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem',
            }}>
            Why AURA
          </span>
          <h2 className="features-heading" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.9rem, 4vw, 3rem)',
            fontWeight: 800, lineHeight: 1.15, marginBottom: '1rem',
            background: 'linear-gradient(135deg,#fff 0%,rgba(255,255,255,0.55) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Premium Experience.<br />Every Step.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 480, margin: '0 auto' }}>
            From unboxing to after-sales, we obsess over every detail so you never have to worry.
          </p>
        </div>

        {/* ── Bento Grid ── */}
        <div className="features-grid-layout">

          {/* Card 1 – Express Delivery (wide on desktop) */}
          <div
            className="bento-card bento-card-wide-lg"
            onMouseEnter={onEnter} onMouseLeave={onLeave}
            style={{
              ...cardBase,
              background: 'linear-gradient(135deg,rgba(99,102,241,0.15) 0%,rgba(15,15,25,0.7) 60%)',
            }}
          >
            <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: 'rgba(99,102,241,0.12)', filter: 'blur(50px)' }} />

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <span className="text-4xl block mb-3">🚀</span>
                <h3 className="text-xl font-bold mb-2 text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  Express Delivery
                </h3>
                <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                  Free next-day shipping on all orders over ₹42,500. Real-time tracking from our warehouse to your door.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {['Free Shipping', 'Next-Day', 'Live Tracking'].map(t => (
                    <span key={t} className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{ background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--primary)' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="hidden sm:block mt-2 flex-shrink-0">
                <DeliveryIcon />
              </div>
            </div>
          </div>

          {/* Card 2 – Secure Payments */}
          <div
            className="bento-card"
            onMouseEnter={onEnter} onMouseLeave={onLeave}
            style={{
              ...cardBase, minHeight: 200,
              background: 'linear-gradient(135deg,rgba(236,72,153,0.13) 0%,rgba(15,15,25,0.7) 60%)',
            }}
          >
            <div className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full pointer-events-none"
              style={{ background: 'rgba(236,72,153,0.1)', filter: 'blur(40px)' }} />
            <ShieldRings />
            <h3 className="text-lg font-bold mt-4 mb-2 text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Secure Payments
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              256-bit SSL encryption.<br />Your data is never stored.
            </p>
          </div>

          {/* Card 3 – Authenticity */}
          <div
            className="bento-card"
            onMouseEnter={onEnter} onMouseLeave={onLeave}
            style={{
              ...cardBase,
              background: 'linear-gradient(135deg,rgba(20,200,130,0.12) 0%,rgba(15,15,25,0.7) 70%)',
            }}
          >
            <div className="absolute -top-5 -right-5 w-28 h-28 rounded-full pointer-events-none"
              style={{ background: 'rgba(20,200,130,0.12)', filter: 'blur(35px)' }} />
            <span className="text-3xl block mb-3">✅</span>
            <h3 className="text-lg font-bold mb-2 text-white" style={{ fontFamily: 'var(--font-display)' }}>
              100% Authentic
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Every device is factory-sealed with full manufacturer warranty. Zero refurb, zero compromise.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: '#14c887', boxShadow: '0 0 8px #14c887', animation: 'greenBlink 1.5s ease-in-out infinite' }} />
              <span className="text-xs font-semibold" style={{ color: '#14c887' }}>Verified Stock</span>
            </div>
          </div>

          {/* Card 4 – Rating */}
          <div
            className="bento-card"
            onMouseEnter={onEnter} onMouseLeave={onLeave}
            style={{
              ...cardBase,
              background: 'linear-gradient(135deg,rgba(245,158,11,0.12) 0%,rgba(15,15,25,0.7) 70%)',
            }}
          >
            <span className="text-3xl block mb-3">⭐</span>
            <h3 className="text-lg font-bold mb-2 text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Top-Rated Store
            </h3>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} style={{
                  color: '#f59e0b', fontSize: '1.1rem',
                  animation: `starPop 0.4s ease-out ${0.5 + i * 0.1}s both`,
                }}>★</span>
              ))}
            </div>
            <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              4.9 / 5 from over 12,000 verified reviews.
            </p>
            <style>{`@keyframes starPop { from{transform:scale(0) rotate(-20deg);opacity:0} to{transform:scale(1) rotate(0);opacity:1} }`}</style>
          </div>

          {/* Card 5 – Support */}
          <div
            className="bento-card bento-card-wide"
            onMouseEnter={onEnter} onMouseLeave={onLeave}
            style={{
              ...cardBase,
              background: 'linear-gradient(135deg,rgba(139,92,246,0.14) 0%,rgba(15,15,25,0.7) 70%)',
            }}
          >
            <div className="absolute -bottom-5 -left-5 w-32 h-32 rounded-full pointer-events-none"
              style={{ background: 'rgba(139,92,246,0.12)', filter: 'blur(38px)' }} />
            <span className="text-3xl block mb-3">💬</span>
            <h3 className="text-lg font-bold mb-2 text-white" style={{ fontFamily: 'var(--font-display)' }}>
              24/7 Expert Support
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Chat, call or email — our team responds in under 2 minutes, any time.
            </p>
            <div className="inline-flex items-center gap-2 mt-3 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)' }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: '#a78bfa', animation: 'greenBlink 1.5s ease-in-out infinite' }} />
              <span className="text-xs font-semibold" style={{ color: '#a78bfa' }}>Team Online Now</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
