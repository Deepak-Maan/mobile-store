import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Shield, Cpu, Smartphone } from 'lucide-react';

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

  // Smooth scroll progress using spring physics
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 24,
    restDelta: 0.001
  });

  // --- Parallax values tuned per device ---
  const phoneScale = useTransform(
    smoothProgress,
    [0, 0.4, 0.75],
    isMobile ? [0.75, 1.0, 1.15] : [0.6, 1.1, 1.4]
  );
  const phoneRotateX = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    isMobile ? [15, 0, -12] : [30, 0, -25]
  );
  const phoneRotateY = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    isMobile ? [-20, 0, 20] : [-45, 0, 45]
  );
  const textScale = useTransform(
    smoothProgress,
    [0, 0.4, 0.8],
    isMobile ? [0.9, 1.0, 1.3] : [0.8, 1, 1.8]
  );
  const textOpacity = useTransform(
    smoothProgress,
    [0, 0.25, 0.5, 0.75],
    [0.05, 1, 1, 0]
  );
  const starSpeed = useTransform(smoothProgress, [0, 1], [0.4, 4]);

  // --- Dynamic floating spec cards transitions ---
  const card1X = useTransform(smoothProgress, [0, 0.5, 1], isMobile ? [-45, -80, -100] : [-100, -180, -250]);
  const card1Y = useTransform(smoothProgress, [0, 0.5, 1], isMobile ? [-120, -100, -80] : [-130, -110, -90]);
  const card1Z = useTransform(smoothProgress, [0, 0.5, 1], isMobile ? [10, 40, 60] : [20, 80, 120]);
  const card1Opacity = useTransform(smoothProgress, [0, 0.25, 0.7, 0.95], [0, 1, 1, 0]);

  const card2X = useTransform(smoothProgress, [0, 0.5, 1], isMobile ? [50, 85, 110] : [120, 200, 260]);
  const card2Y = useTransform(smoothProgress, [0, 0.5, 1], isMobile ? [10, 20, 30] : [10, 30, 50]);
  const card2Z = useTransform(smoothProgress, [0, 0.5, 1], isMobile ? [10, 30, 50] : [20, 60, 100]);
  const card2Opacity = useTransform(smoothProgress, [0, 0.25, 0.7, 0.95], [0, 1, 1, 0]);

  const card3X = useTransform(smoothProgress, [0, 0.5, 1], isMobile ? [-40, -75, -95] : [-120, -190, -240]);
  const card3Y = useTransform(smoothProgress, [0, 0.5, 1], isMobile ? [110, 130, 150] : [90, 130, 170]);
  const card3Z = useTransform(smoothProgress, [0, 0.5, 1], isMobile ? [15, 45, 65] : [30, 90, 130]);
  const card3Opacity = useTransform(smoothProgress, [0, 0.25, 0.7, 0.95], [0, 1, 1, 0]);

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
      const count = Math.floor((canvas.width * canvas.height) / (window.innerWidth < 768 ? 9000 : 6000));
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width - canvas.width / 2,
          y: Math.random() * canvas.height - canvas.height / 2,
          z: Math.random() * canvas.width,
          size: Math.random() * 1.6 + 0.4,
          color: Math.random() > 0.4 ? '#818cf8' : '#c084fc',
          phase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.015 + Math.random() * 0.035
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
        s.phase += s.twinkleSpeed;
        if (s.z <= 0) {
          s.z = canvas.width;
          s.x = Math.random() * canvas.width - cx;
          s.y = Math.random() * canvas.height - cy;
        }
        const px = (s.x / s.z) * cx + cx;
        const py = (s.y / s.z) * cy + cy;
        const pSize = (1 - s.z / canvas.width) * s.size * 3.2;
        const twinkle = Math.sin(s.phase) * 0.4 + 0.6; // twinkle effect

        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.1, pSize), 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = (1 - s.z / canvas.width) * twinkle;
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

  const deviceW = isMobile ? 180 : 270;
  const deviceH = isMobile ? 360 : 540;

  return (
    <div
      ref={sectionRef}
      style={{
        position: 'relative',
        height: isMobile ? '130vh' : '150vh',
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
          position: 'absolute', top: '15%', left: '5%',
          width: isMobile ? '70vw' : '50vw',
          height: isMobile ? '70vw' : '50vw',
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(60px)', zIndex: 2, pointerEvents: 'none',
          animation: 'uhr-blob-pulsate 10s ease-in-out infinite alternate',
        }}
      />
      <div
        style={{
          position: 'absolute', bottom: '10%', right: '2%',
          width: isMobile ? '65vw' : '45vw',
          height: isMobile ? '65vw' : '45vw',
          background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(70px)', zIndex: 2, pointerEvents: 'none',
          animation: 'uhr-blob-pulsate 14s ease-in-out infinite alternate-reverse',
        }}
      />

      {/* Text Layer */}
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
          top: isMobile ? '8%' : undefined,
        }}
      >
        <span
          style={{
            textTransform: 'uppercase',
            letterSpacing: isMobile ? '4px' : '7px',
            fontSize: isMobile ? '0.7rem' : '0.92rem',
            fontWeight: 800,
            background: 'linear-gradient(90deg, #818cf8, #f472b6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'block',
            marginBottom: '0.85rem',
          }}
        >
          Aura Premium Disruption
        </span>
        <h2
          style={{
            fontSize: isMobile ? 'clamp(2rem, 9vw, 3.2rem)' : 'clamp(2.8rem, 6.2vw, 6.2rem)',
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: isMobile ? '-1px' : '-2.5px',
            textShadow: '0 20px 50px rgba(0,0,0,0.6)',
          }}
        >
          THE UNIVERSE<br />OF AURA
        </h2>
      </motion.div>

      {/* 3D Phone Mockup Container */}
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
          marginTop: isMobile ? '12vh' : 0,
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
          {/* Inner screen container */}
          <div style={{
            position: 'absolute', inset: '4px',
            borderRadius: '34px',
            background: 'radial-gradient(circle at center, #1e1b4b 0%, #0a0a0f 100%)',
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            {/* Glowing nebula inside screen */}
            <div style={{
              position: 'absolute', top: '10%', left: '-20%', width: '140%', height: '80%',
              background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(236,72,153,0.05) 50%, rgba(0,0,0,0) 80%)',
              filter: 'blur(35px)',
              animation: 'uhr-spin 20s linear infinite',
            }} />

            {/* Status bar */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 18px 4px', fontSize: '9px', color: 'rgba(255,255,255,0.85)',
              fontWeight: '700', zIndex: 10, fontFamily: 'sans-serif'
            }}>
              <span>10:09</span>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1.5px', alignItems: 'flex-end', height: '8px' }}>
                  <div style={{ width: '2px', height: '3px', background: '#fff' }} />
                  <div style={{ width: '2px', height: '5px', background: '#fff' }} />
                  <div style={{ width: '2px', height: '7px', background: '#fff' }} />
                  <div style={{ width: '2px', height: '9px', background: '#fff' }} />
                </div>
                <div style={{ width: '16px', height: '9px', border: '1px solid #fff', borderRadius: '2px', padding: '1px', display: 'flex' }}>
                  <div style={{ flex: 1, background: '#10b981', borderRadius: '1px' }} />
                </div>
              </div>
            </div>

            {/* Dynamic screen content */}
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'space-between', padding: '1rem 0.85rem 1.1rem', zIndex: 10,
              position: 'relative'
            }}>
              {/* Dynamic Island Notch */}
              <div style={{
                position: 'absolute', top: '2px', left: '50%', transform: 'translateX(-50%)',
                width: '74px', height: '18px', background: '#000', borderRadius: '15px',
                border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center',
                justifyContent: 'flex-end', paddingRight: '8px'
              }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#111' }} />
              </div>

              {/* Glowing logo / Phone name */}
              <div style={{ textAlign: 'center', marginTop: '1.2rem' }}>
                <div style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '4px', color: '#a5b4fc', textTransform: 'uppercase' }}>Aura</div>
                <div style={{ fontSize: isMobile ? '15px' : '19px', fontWeight: '900', color: '#fff', letterSpacing: '1px', textShadow: '0 0 10px rgba(99,102,241,0.5)' }}>15 Pro Max</div>
              </div>

              {/* Neon Graphic Orb */}
              <div style={{
                position: 'relative', width: isMobile ? '80px' : '110px', height: isMobile ? '80px' : '110px', display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{
                  position: 'absolute', width: '100%', height: '100%', borderRadius: '50%',
                  border: '1px dashed rgba(129,140,248,0.4)', animation: 'uhr-spin 8s linear infinite'
                }} />
                <div style={{
                  position: 'absolute', width: '80%', height: '80%', borderRadius: '50%',
                  border: '1px dashed rgba(236,72,153,0.3)', animation: 'uhr-spin-reverse 6s linear infinite'
                }} />
                <div style={{
                  width: isMobile ? '38px' : '52px', height: isMobile ? '38px' : '52px', borderRadius: '50%',
                  background: 'radial-gradient(circle at 30% 30%, #a78bfa, #4f46e5)',
                  boxShadow: '0 0 25px rgba(99,102,241,0.8), inset -4px -4px 10px rgba(0,0,0,0.5)'
                }} />
              </div>

              {/* Bottom Glassmorphic Card Widget */}
              <div style={{
                width: '100%', background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px',
                padding: '0.65rem 0.85rem', backdropFilter: 'blur(10px)', textAlign: 'center',
                boxShadow: '0 10px 25px rgba(0,0,0,0.4)'
              }}>
                <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.5)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Titanium Series</div>
                <div style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '800', color: '#fff', margin: '1px 0 4px' }}>₹1,34,900</div>
                <div style={{
                  width: '100%', padding: '0.45rem', borderRadius: '10px',
                  background: 'linear-gradient(90deg, #6366f1, #ec4899)',
                  fontSize: '9px', fontWeight: '800', color: '#fff',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.35)', textAlign: 'center'
                }}>
                  Exclusive Pre-Order
                </div>
              </div>
            </div>
          </div>
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

        {/* ─── Floating specification cards in 3D perspective ─── */}
        
        {/* Card 1: Display Info */}
        <motion.div
          style={{
            position: 'absolute',
            left: '0px',
            top: '0px',
            x: card1X,
            y: card1Y,
            z: card1Z,
            opacity: card1Opacity,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: isMobile ? '0.5rem 0.75rem' : '0.8rem 1.1rem',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            width: isMobile ? '125px' : '185px',
            transformStyle: 'preserve-3d',
          }}
        >
          <div style={{
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '8px',
            width: isMobile ? '26px' : '36px',
            height: isMobile ? '26px' : '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Smartphone size={isMobile ? 14 : 18} color="#a5b4fc" />
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '8px' : '10px', color: '#a5b4fc', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Display</div>
            <div style={{ fontSize: isMobile ? '10px' : '13px', color: '#fff', fontWeight: '700' }}>120Hz ProMotion</div>
          </div>
        </motion.div>

        {/* Card 2: Processor Info */}
        <motion.div
          style={{
            position: 'absolute',
            left: '0px',
            top: '0px',
            x: card2X,
            y: card2Y,
            z: card2Z,
            opacity: card2Opacity,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: isMobile ? '0.5rem 0.75rem' : '0.8rem 1.1rem',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            width: isMobile ? '120px' : '180px',
            transformStyle: 'preserve-3d',
          }}
        >
          <div style={{
            background: 'rgba(236, 72, 153, 0.15)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            borderRadius: '8px',
            width: isMobile ? '26px' : '36px',
            height: isMobile ? '26px' : '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Cpu size={isMobile ? 14 : 18} color="#f472b6" />
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '8px' : '10px', color: '#f472b6', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Chipset</div>
            <div style={{ fontSize: isMobile ? '10px' : '13px', color: '#fff', fontWeight: '700' }}>A18 Cybernetic</div>
          </div>
        </motion.div>

        {/* Card 3: Construction Info */}
        <motion.div
          style={{
            position: 'absolute',
            left: '0px',
            top: '0px',
            x: card3X,
            y: card3Y,
            z: card3Z,
            opacity: card3Opacity,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: isMobile ? '0.5rem 0.75rem' : '0.8rem 1.1rem',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            width: isMobile ? '125px' : '185px',
            transformStyle: 'preserve-3d',
          }}
        >
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            width: isMobile ? '26px' : '36px',
            height: isMobile ? '26px' : '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Shield size={isMobile ? 14 : 18} color="#34d399" />
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '8px' : '10px', color: '#34d399', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Body</div>
            <div style={{ fontSize: isMobile ? '10px' : '13px', color: '#fff', fontWeight: '700' }}>Titanium Alloy</div>
          </div>
        </motion.div>
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
        @keyframes uhr-spin-reverse {
          from { transform: rotate(360deg); }
          to   { transform: rotate(0deg); }
        }
        @keyframes uhr-blob-pulsate {
          from { transform: scale(0.95); opacity: 0.8; }
          to   { transform: scale(1.05); opacity: 1.0; }
        }
      `}} />
    </div>
  );
};
