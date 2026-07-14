import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const UniverseHeroReveal = () => {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // --- Parallax values tuned per device ---
  // Mobile: shallower rotations, smaller scale range — no jitter on short scrolls
  const phoneScale = useTransform(
    scrollYProgress,
    [0, 0.4, 0.75],
    isMobile ? [0.75, 1.0, 1.15] : [0.6, 1.1, 1.4]
  );
  const phoneRotateX = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    isMobile ? [15, 0, -12] : [30, 0, -25]
  );
  const phoneRotateY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    isMobile ? [-20, 0, 20] : [-45, 0, 45]
  );
  const textScale = useTransform(
    scrollYProgress,
    [0, 0.4, 0.8],
    isMobile ? [0.9, 1.0, 1.3] : [0.8, 1, 1.8]
  );
  const textOpacity = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75],
    [0.05, 1, 1, 0]
  );
  const starSpeed = useTransform(scrollYProgress, [0, 1], [0.4, 4]);

  // --- Canvas Starfield ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let stars = [];

    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      // Fewer stars on mobile for perf
      const count = Math.floor((canvas.width * canvas.height) / (window.innerWidth < 768 ? 10000 : 7000));
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width - canvas.width / 2,
          y: Math.random() * canvas.height - canvas.height / 2,
          z: Math.random() * canvas.width,
          size: Math.random() * 1.5 + 0.4,
          color: Math.random() > 0.4 ? '#818cf8' : '#c084fc',
        });
      }
    };

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 10, 14, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const speed = starSpeed.get();
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      stars.forEach((s) => {
        s.z -= speed;
        if (s.z <= 0) {
          s.z = canvas.width;
          s.x = Math.random() * canvas.width - cx;
          s.y = Math.random() * canvas.height - cy;
        }
        const px = (s.x / s.z) * cx + cx;
        const py = (s.y / s.z) * cy + cy;
        const pSize = (1 - s.z / canvas.width) * s.size * 3;
        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.1, pSize), 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = 1 - s.z / canvas.width;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      });
      animId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [starSpeed]);

  // Device sizes: smaller on mobile
  const deviceW = isMobile ? 180 : 270;
  const deviceH = isMobile ? 360 : 540;

  return (
    <div
      ref={sectionRef}
      style={{
        position: 'relative',
        height: isMobile ? '120vh' : '140vh',
        background: '#0a0a0e',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1200px',
      }}
    >
      {/* Starfield Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Nebula Glow Blobs */}
      <div
        style={{
          position: 'absolute', top: '20%', left: '10%',
          width: isMobile ? '60vw' : '45vw',
          height: isMobile ? '60vw' : '45vw',
          background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(50px)', zIndex: 2, pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute', bottom: '15%', right: '5%',
          width: isMobile ? '55vw' : '40vw',
          height: isMobile ? '55vw' : '40vw',
          background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(60px)', zIndex: 2, pointerEvents: 'none',
        }}
      />

      {/* Text Layer — sits above device on mobile, center on desktop */}
      <motion.div
        style={{
          position: 'absolute',
          zIndex: 3,
          textAlign: 'center',
          scale: textScale,
          opacity: textOpacity,
          color: '#ffffff',
          pointerEvents: 'none',
          width: '90%',
          maxWidth: '900px',
          // Shift text up on mobile so it doesn't overlap device
          top: isMobile ? '10%' : undefined,
        }}
      >
        <span
          style={{
            textTransform: 'uppercase',
            letterSpacing: isMobile ? '4px' : '6px',
            fontSize: isMobile ? '0.7rem' : '0.9rem',
            fontWeight: 800,
            background: 'linear-gradient(90deg, #818cf8, #f472b6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'block',
            marginBottom: '0.75rem',
          }}
        >
          Aura Premium Disruption
        </span>
        <h2
          style={{
            fontSize: isMobile ? 'clamp(2rem, 10vw, 3.2rem)' : 'clamp(2.8rem, 6vw, 6rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: isMobile ? '-1px' : '-2px',
            textShadow: '0 20px 50px rgba(0,0,0,0.6)',
          }}
        >
          THE UNIVERSE<br />OF AURA
        </h2>
      </motion.div>

      {/* 3D Phone Mockup — centered, scaled for mobile */}
      <motion.div
        style={{
          position: 'relative',
          zIndex: 4,
          scale: phoneScale,
          rotateX: phoneRotateX,
          rotateY: phoneRotateY,
          width: `${deviceW}px`,
          height: `${deviceH}px`,
          transformStyle: 'preserve-3d',
          pointerEvents: 'none',
          marginTop: isMobile ? '10vh' : 0, // push device down a bit on mobile
        }}
      >
        {/* Outer Metal Band */}
        <div
          style={{
            position: 'absolute', width: '100%', height: '100%',
            borderRadius: '38px',
            border: '4px solid rgba(255, 255, 255, 0.42)',
            boxShadow: '0 30px 100px rgba(99, 102, 241, 0.3), inset 0 0 20px rgba(255,255,255,0.08)',
            background: 'linear-gradient(135deg, rgba(17,18,23,0.97), rgba(10,10,14,0.99))',
            overflow: 'hidden',
          }}
        >
          {/* Ambient Screen Glow */}
          <div
            style={{
              position: 'absolute', width: '150%', height: '150%',
              top: '-25%', left: '-25%',
              background: 'radial-gradient(circle at center, rgba(129,140,248,0.22) 0%, rgba(236,72,153,0.05) 50%, rgba(0,0,0,0) 80%)',
              filter: 'blur(30px)',
              animation: 'uhr-spin 12s linear infinite',
            }}
          />
          {/* Laser Ring SVG */}
          <svg
            viewBox="0 0 200 400"
            style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, opacity: 0.6 }}
          >
            <defs>
              <linearGradient id="uhrLaserGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            <rect x="15" y="15" width="170" height="370" rx="30" fill="none"
              stroke="url(#uhrLaserGrad)" strokeWidth="1.5" strokeDasharray="280 30" />
            <circle cx="100" cy="32" r="4" fill="#000" />
            <rect x="82" y="10" width="36" height="6" rx="3" fill="#000" />
          </svg>
        </div>

        {/* 3D Depth Shadow */}
        <div
          style={{
            position: 'absolute', width: '100%', height: '100%',
            borderRadius: '38px',
            transform: 'translateZ(-18px)',
            background: 'rgba(0, 0, 0, 0.85)',
            filter: 'blur(14px)', zIndex: -1,
          }}
        />
      </motion.div>

      {/* Scroll hint arrow (mobile only) */}
      {isMobile && (
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            bottom: '5%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            color: 'rgba(255,255,255,0.35)',
            fontSize: '0.7rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <span>Scroll</span>
          <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
            <path d="M1 1L8 9L15 1" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes uhr-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};
