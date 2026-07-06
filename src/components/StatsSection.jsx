import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── animated counter hook ──────────────────────────────────────────── */
const useCounter = (target, duration = 2200) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          setCount(Math.round(eased * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return [count, ref];
};

/* ─── testimonials ───────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    name: 'Arjun Sharma', location: 'Mumbai, India', rating: 5, avatar: '👨‍💻',
    text: 'Got my iPhone 15 Pro next morning — still sealed, perfect condition. AURA is the only place I buy phones now.',
    product: 'iPhone 15 Pro',
  },
  {
    name: 'Priya Nair', location: 'Bangalore, India', rating: 5, avatar: '👩‍🎨',
    text: 'The Galaxy S24 Ultra photos are unreal. Ordered Sunday, delivered Monday. Support team answered instantly!',
    product: 'Galaxy S24 Ultra',
  },
  {
    name: 'Rahul Mehta', location: 'Delhi, India', rating: 5, avatar: '👨‍🔬',
    text: 'Pixel 8 Pro at an incredible price. The UPI checkout was smooth and I got real-time tracking updates.',
    product: 'Pixel 8 Pro',
  },
  {
    name: 'Sneha Kapoor', location: 'Pune, India', rating: 5, avatar: '👩‍💼',
    text: 'Bought the Xiaomi 14 Ultra for my studio. Leica camera quality is jaw-dropping. Verified genuine product!',
    product: 'Xiaomi 14 Ultra',
  },
];

/* ─── stat card ───────────────────────────────────────────────────────── */
const StatCard = ({ icon, suffix = '+', target, label, color }) => {
  const [count, ref] = useCounter(target);
  return (
    <div
      ref={ref}
      className="stat-card flex-1 min-w-0"
      style={{
        background: 'rgba(15,15,25,0.65)',
        border: `1px solid ${color}33`,
        backdropFilter: 'blur(16px)',
        borderRadius: 20,
        padding: '1.5rem 1rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = `0 20px 40px ${color}22`;
        e.currentTarget.style.borderColor = `${color}66`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = `${color}33`;
      }}
    >
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: color, filter: 'blur(40px)', opacity: 0.15 }} />
      <div className="text-4xl mb-2">{icon}</div>
      <div className="font-extrabold leading-none" style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(1.8rem,4vw,2.8rem)',
        background: `linear-gradient(135deg,#fff 30%,${color})`,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm mt-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</div>
    </div>
  );
};

/* ─── main component ──────────────────────────────────────────────────── */
export const StatsSection = () => {
  const sectionRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveIdx(i => (i + 1) % TESTIMONIALS.length), 3800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const heading      = section.querySelector('.stats-heading');
    const statCards    = section.querySelectorAll('.stat-card');
    const statsRow     = section.querySelector('.stats-row');
    const testimonials = section.querySelector('.testimonial-section');

    const ctx = gsap.context(() => {
      if (heading) {
        gsap.fromTo(heading,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: section, start: 'top 82%', once: true } }
        );
      }
      if (statCards.length && statsRow) {
        gsap.fromTo(statCards,
          { opacity: 0, y: 60, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: 'power3.out', stagger: 0.12,
            scrollTrigger: { trigger: statsRow, start: 'top 85%', once: true } }
        );
      }
      if (testimonials) {
        gsap.fromTo(testimonials,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: testimonials, start: 'top 88%', once: true } }
        );
      }
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="stats-section"
      className="stats-container relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 30%,rgba(99,102,241,0.08) 0%,transparent 70%)' }} />

      {/* Wave divider */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden" style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full" style={{ height: 60 }}>
          <path d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,20 1440,30 L1440,0 L0,0 Z" fill="rgba(99,102,241,0.06)" />
          <path d="M0,20 C300,50 600,5 900,25 C1100,38 1300,15 1440,20 L1440,0 L0,0 Z" fill="rgba(236,72,153,0.04)" />
        </svg>
      </div>

      <div className="relative">

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.25)', color: 'var(--secondary)' }}>
            By The Numbers
          </span>
          <h2 className="stats-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight"
            style={{
              fontFamily: 'var(--font-display)',
              background: 'linear-gradient(135deg,#fff 0%,rgba(255,255,255,0.5) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
            Trusted By Thousands.<br />Backed By Data.
          </h2>
        </div>

        {/* ── Stat Cards ── */}
        <div className="stats-row stats-grid-layout" style={{ marginBottom: '4.5rem' }}>
          <StatCard icon="📦" target={12000} suffix="+" label="Orders Shipped"    color="#6366f1" />
          <StatCard icon="⭐" target={49}    suffix="/5"  label="Avg. Rating (×10)"  color="#f59e0b" />
          <StatCard icon="🌍" target={52}    suffix="+"  label="Countries Served"  color="#14c887" />
          <StatCard icon="🏆" target={5}     suffix=""   label="Premium Brands"    color="#ec4899" />
        </div>

        {/* ── Testimonials ── */}
        <div className="testimonial-section">
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '2.5rem',
            background: 'linear-gradient(135deg,#fff,rgba(255,255,255,0.6))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            What Our Customers Say
          </h3>

          <div className="testimonials-grid-layout">
            {TESTIMONIALS.map((t, i) => {
              const isActive = i === activeIdx;
              return (
                <div
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`cursor-pointer testimonial-card ${isActive ? 'active-card' : ''}`}
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg,rgba(99,102,241,0.20) 0%,rgba(15,15,25,0.75) 80%)'
                      : 'rgba(15,15,25,0.55)',
                    border: `1px solid ${isActive ? 'rgba(99,102,241,0.45)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 20,
                    padding: '1.5rem 1.25rem',
                    backdropFilter: 'blur(14px)',
                    transform: isActive ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
                    boxShadow: isActive ? '0 16px 40px rgba(99,102,241,0.25)' : 'none',
                    transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
                    position: 'relative', overflow: 'hidden',
                  }}
                >
                  {isActive && (
                    <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none"
                      style={{ background: 'rgba(99,102,241,0.18)', filter: 'blur(35px)' }} />
                  )}
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(t.rating)].map((_, j) => (
                      <span key={j} style={{ color: '#f59e0b', fontSize: '0.85rem' }}>★</span>
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-sm leading-relaxed mb-4 italic"
                    style={{ color: isActive ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)', transition: 'color 0.4s' }}>
                    "{t.text}"
                  </p>
                  {/* Author row */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                      style={{
                        background: isActive ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)',
                        border: `1px solid ${isActive ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`,
                        transition: 'all 0.4s',
                      }}>
                      {t.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-white truncate">{t.name}</div>
                      <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{t.location}</div>
                    </div>
                  </div>
                  {/* Product badge */}
                  <div className="mt-3 inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--primary)' }}>
                    {t.product}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dot indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '2.5rem' }}>
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className="rounded-full border-none cursor-pointer p-0 transition-all duration-400"
                style={{
                  width: i === activeIdx ? 24 : 8, height: 8,
                  background: i === activeIdx ? 'var(--primary)' : 'rgba(255,255,255,0.2)',
                  boxShadow: i === activeIdx ? '0 0 10px var(--primary-glow)' : 'none',
                }}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
