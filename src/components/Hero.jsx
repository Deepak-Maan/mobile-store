import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { createRipple } from '../utils/ripple';

/* ─── Floating Particle Field (canvas) ─── */
const ParticleField = () => {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let id;
    let pts = [];
    const mouse = { x: -999, y: -999 };

    const resize = () => {
      canvas.width  = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
      init();
    };

    const init = () => {
      pts = [];
      const n = Math.floor((canvas.width * canvas.height) / 14000);
      for (let i = 0; i < Math.max(20, n); i++) {
        pts.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 1.6 + 0.6,
          a: Math.random() * 0.4 + 0.1,
          c: Math.random() > 0.5 ? '#818cf8' : '#f472b6',
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) {
          const f = (100 - d) / 100;
          p.x -= (dx / d) * f * 1.8;
          p.y -= (dy / d) * f * 1.8;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = p.a;
        ctx.fill();
      });
      // draw connectors
      ctx.globalAlpha = 1;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 90) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = '#818cf8';
            ctx.globalAlpha = (1 - d / 90) * 0.12;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      id = requestAnimationFrame(draw);
    };

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => { mouse.x = -999; mouse.y = -999; };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove);
    canvas.parentElement?.addEventListener('mouseleave', onLeave);
    draw();

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 1,
      }}
    />
  );
};

/* ─── 3D Phone Mockup ─── */
const PhoneMockup = ({ rotX, rotY }) => (
  <motion.div
    style={{
      width: '220px',
      height: '440px',
      rotateX: rotX,
      rotateY: rotY,
      transformStyle: 'preserve-3d',
      position: 'relative',
    }}
  >
    {/* Body */}
    <div style={{
      position: 'absolute', inset: 0,
      borderRadius: '36px',
      background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      border: '1.5px solid rgba(255,255,255,0.18)',
      boxShadow: '0 40px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.12)',
      overflow: 'hidden',
    }}>
      {/* Screen glow */}
      <div style={{
        position: 'absolute', inset: '8px',
        borderRadius: '28px',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Notch */}
        <div style={{
          width: '60px', height: '6px', background: '#000',
          borderRadius: '3px', marginTop: '10px',
        }} />
        {/* Screen content */}
        <div style={{
          flex: 1, width: '100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '1rem', boxSizing: 'border-box',
          gap: '0.6rem',
        }}>
          {/* App icon grid mock */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px', width: '100%' }}>
            {['#6366f1','#ec4899','#10b981','#f59e0b','#3b82f6','#a855f7','#ef4444','#06b6d4'].map((c, i) => (
              <div key={i} style={{
                aspectRatio: '1', borderRadius: '8px',
                background: `${c}cc`,
                boxShadow: `0 2px 8px ${c}55`,
              }} />
            ))}
          </div>
          {/* Wallpaper aurora */}
          <div style={{
            width: '100%', height: '80px', borderRadius: '12px',
            background: 'linear-gradient(90deg,#6366f1,#ec4899,#f59e0b)',
            opacity: 0.35, filter: 'blur(8px)',
          }} />
          {/* Bottom bar */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '0.5rem' }}>
            {['#6366f1','#fff','#ec4899'].map((c, i) => (
              <div key={i} style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: `${c}22`, border: `1.5px solid ${c}66`,
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Camera island */}
      <div style={{
        position: 'absolute', top: '14px', right: '14px',
        width: '28px', height: '44px', borderRadius: '10px',
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '5px',
      }}>
        {[0,1,2].map((i) => (
          <div key={i} style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: '#0a0a12',
            border: `1.5px solid rgba(255,255,255,${0.15 + i * 0.05})`,
            boxShadow: `0 0 4px rgba(129,140,248,0.3)`,
          }} />
        ))}
      </div>

      {/* Side reflection sheen */}
      <div style={{
        position: 'absolute', top: 0, left: '-10%',
        width: '30%', height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
        transform: 'skewX(-8deg)',
        pointerEvents: 'none',
      }} />
    </div>

    {/* 3D Side depth */}
    <div style={{
      position: 'absolute', inset: 0,
      borderRadius: '36px',
      transform: 'translateZ(-8px)',
      background: 'rgba(0,0,0,0.9)',
      filter: 'blur(8px)',
      zIndex: -1,
    }} />

    {/* Floor shadow */}
    <div style={{
      position: 'absolute',
      bottom: '-30px', left: '50%', transform: 'translateX(-50%)',
      width: '160px', height: '30px',
      background: 'rgba(99,102,241,0.18)',
      filter: 'blur(20px)',
      borderRadius: '50%',
      zIndex: -2,
    }} />
  </motion.div>
);

/* ─── Animated Stat Badge ─── */
const Badge = ({ label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.85 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    style={{
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${color}30`,
      borderRadius: '14px',
      padding: '0.6rem 1rem',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'flex-start',
    }}
  >
    <span style={{ fontSize: '1.15rem', fontWeight: 900, color, letterSpacing: '-0.5px' }}>{value}</span>
    <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.1rem' }}>{label}</span>
  </motion.div>
);

/* ─── Main Hero ─── */
import { WebGLDisplacementSlider } from './WebGLDisplacementSlider';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HERO_SLIDES = [
  {
    name: "iPhone 15 Pro",
    brand: "Apple",
    color: "#6366f1",
    description: "Experience the premium titanium chassis design, featuring the desktop-class A17 Pro chip and customizable Action button.",
    image: "/images/iphone_15_pro.png",
    specs: { badge1: "A17 Pro", label1: "3nm CPU", badge2: "48MP", label2: "Pro Lens", badge3: "Titanium", label3: "Case" }
  },
  {
    name: "Galaxy S24 Ultra",
    brand: "Samsung",
    color: "#ec4899",
    description: "Unleash whole new levels of mobile AI creativity, productivity, and detail precision with the built-in S-Pen and 200MP sensor.",
    image: "/images/galaxy_s24_ultra.png",
    specs: { badge1: "Snapdragon 8G3", label1: "AI Core", badge2: "200MP", label2: "Quad Cam", badge3: "5000mAh", label3: "Battery" }
  },
  {
    name: "Pixel 8 Pro",
    brand: "Google",
    color: "#eab308",
    description: "Google Tensor G3 power enables cutting-edge photo editing features like Magic Eraser and Best Take with natural studio skin tones.",
    image: "/images/pixel_8_pro.png",
    specs: { badge1: "Tensor G3", label1: "Google AI", badge2: "48MP", label2: "Telephoto", badge3: "7 Years", label3: "Updates" }
  },
  {
    name: "OnePlus 12",
    brand: "OnePlus",
    color: "#10b981",
    description: "Boasts a blistering 100W SUPERVOOC charging speed, 4th Gen Hasselblad optics, and a stunning 2K 4500-nit ProXDR display.",
    image: "/images/oneplus_12.png",
    specs: { badge1: "100W", label1: "SuperVOOC", badge2: "Hasselblad", label2: "Color", badge3: "16GB RAM", label3: "Standard" }
  },
  {
    name: "Xiaomi 14 Ultra",
    brand: "Xiaomi",
    color: "#a855f7",
    description: "Unprecedented Leica Summilux lens system featuring a 1-inch sensor size and dynamic stepless variable aperture mechanism.",
    image: "/images/xiaomi_14_ultra.png",
    specs: { badge1: "Leica Optic", label1: "1\" Sensor", badge2: "120W", label2: "HyperCharge", badge3: "W2 Ceramic", label3: "Glass" }
  }
];

/* ─── Main Hero ─── */
export const Hero = ({ onExplore }) => {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Scroll parallax
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const bgY       = useTransform(scrollYProgress, [0, 1], ['0%',   '30%']);
  const textY     = useTransform(scrollYProgress, [0, 1], ['0px',  '80px']);
  const textOp    = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const phoneY    = useTransform(scrollYProgress, [0, 1], ['0px',  '-60px']);
  const phoneScale= useTransform(scrollYProgress, [0, 0.6], [1, 0.88]);
  const badgesY   = useTransform(scrollYProgress, [0, 1], ['0px',  '40px']);

  // Mobile check
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const c = () => setIsMobile(window.innerWidth < 768);
    c(); window.addEventListener('resize', c);
    return () => window.removeEventListener('resize', c);
  }, []);

  // Slide navigation
  const handlePrev = (e) => {
    createRipple(e);
    setActiveIndex(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNext = (e) => {
    createRipple(e);
    setActiveIndex(prev => (prev + 1) % HERO_SLIDES.length);
  };

  // Autoplay slides
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const activeSlide = HERO_SLIDES[activeIndex];

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        minHeight: '100svh',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, #1e1060 0%, #090914 55%, #07070a 100%)',
        display: 'flex', alignItems: 'center',
      }}
    >
      {/* Particles */}
      <ParticleField />

      {/* Parallax background gradient orbs */}
      <motion.div
        style={{ y: bgY, position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      >
        <div style={{
          position: 'absolute', top: '-15%', left: '-10%',
          width: '55vw', height: '55vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }} />
        <div style={{
          position: 'absolute', top: '10%', right: '-8%',
          width: '45vw', height: '45vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '0%', left: '30%',
          width: '40vw', height: '25vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
      </motion.div>

      {/* Subtle grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '5rem 1.25rem 4rem' : '0 2.5rem',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: isMobile ? '2.5rem' : '2rem',
        boxSizing: 'border-box',
        minHeight: '100svh',
      }}>

        {/* ── Left: Text block ── */}
        <motion.div
          style={{ y: textY, opacity: textOp, flex: 1 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Badge pill */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.35)',
              borderRadius: '30px',
              padding: '0.35rem 1rem',
              marginBottom: isMobile ? '1.25rem' : '1.5rem',
            }}
          >
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: activeSlide.color,
              boxShadow: `0 0 6px ${activeSlide.color}`,
              flexShrink: 0,
            }} />
            <span style={{
              fontSize: '0.7rem', fontWeight: 700,
              color: '#a5b4fc', letterSpacing: '1.5px',
              textTransform: 'uppercase',
            }}>
              {activeSlide.brand} · Flagship Performance
            </span>
          </motion.div>

          {/* Headline */}
          <div style={{ overflow: 'hidden', marginBottom: isMobile ? '1rem' : '1.25rem' }}>
            <AnimatePresence mode="wait">
              <motion.h1
                key={activeIndex}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: isMobile
                    ? 'clamp(2.2rem, 11vw, 3rem)'
                    : 'clamp(3rem, 5.5vw, 4.8rem)',
                  fontWeight: 900,
                  lineHeight: 1.0,
                  letterSpacing: isMobile ? '-1.5px' : '-2.5px',
                  color: '#fff',
                  margin: 0,
                }}
              >
                {activeSlide.name.split(' ')[0]}
                <br />
                <span style={{
                  background: `linear-gradient(135deg, ${activeSlide.color} 0%, #c084fc 60%, #f472b6 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block',
                }}>
                  {activeSlide.name.split(' ').slice(1).join(' ')}
                </span>
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* Subtext */}
          <div style={{ minHeight: isMobile ? '70px' : '90px' }}>
            <AnimatePresence mode="wait">
              <motion.p
                key={activeIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                style={{
                  fontSize: isMobile ? '0.88rem' : '1.02rem',
                  color: 'rgba(255,255,255,0.5)',
                  lineHeight: 1.6,
                  maxWidth: '460px',
                  margin: 0,
                  marginBottom: isMobile ? '1.8rem' : '2.2rem',
                }}
              >
                {activeSlide.description}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
          >
            <button
              onClick={(e) => {
                createRipple(e);
                onExplore();
              }}
              style={{
                padding: isMobile ? '0.85rem 1.75rem' : '0.9rem 2rem',
                borderRadius: '50px',
                border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                color: '#fff',
                fontSize: isMobile ? '0.9rem' : '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 28px rgba(99,102,241,0.45)',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                letterSpacing: '0.3px',
                minHeight: '48px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 14px 36px rgba(99,102,241,0.55)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(99,102,241,0.45)';
              }}
            >
              Explore Store
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={(e) => {
                createRipple(e);
                onExplore(); // Also explore on click
              }}
              style={{
                padding: isMobile ? '0.85rem 1.6rem' : '0.9rem 1.75rem',
                borderRadius: '50px',
                border: '1px solid rgba(255,255,255,0.14)',
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.8)',
                fontSize: isMobile ? '0.9rem' : '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                minHeight: '48px',
                letterSpacing: '0.3px',
                transition: 'background 0.2s, border-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background    = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor   = 'rgba(255,255,255,0.26)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background    = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor   = 'rgba(255,255,255,0.14)';
              }}
            >
              View Deals
            </button>
          </motion.div>

          {/* Stat badges */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              style={{ y: badgesY, marginTop: isMobile ? '2rem' : '2.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}
            >
              <Badge label={activeSlide.specs.label1} value={activeSlide.specs.badge1} color={activeSlide.color} delay={0.1} />
              <Badge label={activeSlide.specs.label2} value={activeSlide.specs.badge2} color="#f472b6" delay={0.2} />
              <Badge label={activeSlide.specs.label3} value={activeSlide.specs.badge3} color="#fbbf24" delay={0.3} />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* ── Right: WebGL Displacement Phone Slider ── */}
        <motion.div
          style={{ y: phoneY, scale: phoneScale, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {/* Prev Arrow */}
            {!isMobile && (
              <button
                onClick={handlePrev}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  width: '42px', height: '42px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#fff', zIndex: 10,
                  transition: 'background 0.2s, transform 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'scale(1.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {/* WebGL Canvas */}
            <WebGLDisplacementSlider activeIndex={activeIndex} slides={HERO_SLIDES} isMobile={isMobile} />

            {/* Next Arrow */}
            {!isMobile && (
              <button
                onClick={handleNext}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  width: '42px', height: '42px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#fff', zIndex: 10,
                  transition: 'background 0.2s, transform 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'scale(1.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>

          {/* Dots Indicator */}
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { createRipple(e); setActiveIndex(idx); }}
                style={{
                  width: activeIndex === idx ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '99px',
                  background: activeIndex === idx ? activeSlide.color : 'rgba(255,255,255,0.18)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: activeIndex === idx ? `0 0 6px ${activeSlide.color}` : 'none'
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: isMobile ? '1.5rem' : '2rem',
          left: '50%', transform: 'translateX(-50%)',
          zIndex: 20,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
          color: 'rgba(255,255,255,0.22)',
          cursor: 'pointer',
        }}
        onClick={onExplore}
      >
        <span style={{ fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>
          Scroll
        </span>
        <div style={{
          width: '22px', height: '35px', borderRadius: '12px',
          border: '1.5px solid rgba(255,255,255,0.18)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: '5px',
        }}>
          <motion.div
            animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            style={{
              width: '4px', height: '4px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.5)',
            }}
          />
        </div>
      </motion.div>

      {/* Bottom fade-out into next section */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '120px',
        background: 'linear-gradient(to bottom, transparent, #07070a)',
        zIndex: 8, pointerEvents: 'none',
      }} />
    </div>
  );
};
