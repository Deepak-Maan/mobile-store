import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { Cpu, Sun, Camera, ShieldCheck } from 'lucide-react';
import { formatINR } from '../utils/currency';

export const ParallaxShowcase = () => {
  const containerRef = useRef(null);
  const { products } = useStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // --- Scroll animations logic ---
  // Background moves slowly
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '-15%']);
  const bgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.15, 1.05]);

  // Large typography sliding in opposite directions
  const textLeftX = useTransform(scrollYProgress, [0.1, 0.9], isMobile ? [-80, 50] : [-300, 150]);
  const textRightX = useTransform(scrollYProgress, [0.1, 0.9], isMobile ? [80, -50] : [300, -150]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  // Phone Mockups floating at different speeds and rotations
  const phoneLeftY = useTransform(scrollYProgress, [0, 1], isMobile ? [120, -60] : [200, -120]);
  const phoneLeftRotate = useTransform(scrollYProgress, [0, 1], [15, -12]);
  
  const phoneRightY = useTransform(scrollYProgress, [0, 1], isMobile ? [180, -120] : [320, -220]);
  const phoneRightRotate = useTransform(scrollYProgress, [0, 1], [-22, 10]);

  // Floating spec cards
  const spec1Y = useTransform(scrollYProgress, [0.1, 0.9], [220, -180]);
  const spec2Y = useTransform(scrollYProgress, [0.15, 0.85], [350, -150]);
  const spec3Y = useTransform(scrollYProgress, [0.2, 0.95], [280, -260]);

  // Find premium devices to show
  const premiumPhones = products.filter(p => p.brand !== 'Aura Accessories').slice(0, 2);
  const leftPhone = premiumPhones[0] || { name: 'Aura Pro Max', price: 129900, brand: 'Aura' };
  const rightPhone = premiumPhones[1] || { name: 'Aura Ultra', price: 139900, brand: 'Aura' };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        height: isMobile ? '130vh' : '170vh',
        background: '#09090d',
        overflow: 'hidden',
      }}
    >
      {/* Sticky viewports */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Layer 1: Ambient Background Grid & Glows */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            y: bgY,
            scale: bgScale,
            backgroundImage: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
            zIndex: 1,
          }}
        >
          {/* Radial Glowing Blobs */}
          <div
            style={{
              position: 'absolute',
              top: '20%',
              left: '20%',
              width: '45vw',
              height: '45vw',
              background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(0,0,0,0) 70%)',
              filter: 'blur(60px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '20%',
              right: '15%',
              width: '40vw',
              height: '40vw',
              background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, rgba(0,0,0,0) 70%)',
              filter: 'blur(65px)',
            }}
          />
        </motion.div>

        {/* Layer 2: Oversized Background Typography */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: isMobile ? '2.5rem' : '4rem',
            pointerEvents: 'none',
            zIndex: 2,
            overflow: 'hidden',
          }}
        >
          <motion.h2
            style={{
              x: textLeftX,
              opacity: textOpacity,
              fontSize: isMobile ? 'clamp(3rem, 12vw, 5rem)' : 'clamp(6rem, 10vw, 11rem)',
              fontWeight: 900,
              fontFamily: 'var(--font-display)',
              color: 'rgba(255, 255, 255, 0.02)',
              WebkitTextStroke: '1px rgba(255, 255, 255, 0.07)',
              whiteSpace: 'nowrap',
              lineHeight: 0.9,
              textAlign: 'left',
            }}
          >
            NEXT GEN POWER
          </motion.h2>

          <motion.h2
            style={{
              x: textRightX,
              opacity: textOpacity,
              fontSize: isMobile ? 'clamp(3rem, 12vw, 5rem)' : 'clamp(6rem, 10vw, 11rem)',
              fontWeight: 900,
              fontFamily: 'var(--font-display)',
              color: 'rgba(255, 255, 255, 0.02)',
              WebkitTextStroke: '1.5px var(--primary-glow)',
              whiteSpace: 'nowrap',
              lineHeight: 0.9,
              textAlign: 'right',
            }}
          >
            AURA TITANIUM
          </motion.h2>
        </div>

        {/* Layer 3: Dynamic Devices Floating in 3D Space */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '1200px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              padding: '0 2rem',
            }}
          >
            {/* Left Phone Mockup */}
            <motion.div
              style={{
                y: phoneLeftY,
                rotate: phoneLeftRotate,
                width: isMobile ? '150px' : '230px',
                height: isMobile ? '300px' : '460px',
                perspective: '1000px',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #1e1b4b, #03001e)',
                  border: '3px solid rgba(99, 102, 241, 0.4)',
                  borderRadius: '32px',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.6), inset 0 2px 8px rgba(255,255,255,0.1)',
                  padding: '0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Screen Wallpaper glow */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at 30% 30%, rgba(99,102,241,0.2) 0%, transparent 60%)',
                    zIndex: 0,
                  }}
                />
                
                {/* Speaker Notch */}
                <div style={{ width: '45px', height: '4px', background: '#000', borderRadius: '3px', margin: '0 auto', zIndex: 2 }} />

                {/* Display Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1, textAlign: 'center', marginTop: '1rem' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    {leftPhone.brand}
                  </span>
                  <h3 style={{ fontSize: isMobile ? '0.9rem' : '1.2rem', fontWeight: 800, color: '#fff', margin: '0.2rem 0' }}>
                    {leftPhone.name}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                    {formatINR(leftPhone.price)}
                  </span>
                </div>

                {/* Dynamic Home bar */}
                <div style={{ width: '60px', height: '3.5px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', margin: '0 auto', zIndex: 2 }} />
              </div>
            </motion.div>

            {/* Right Phone Mockup */}
            <motion.div
              style={{
                y: phoneRightY,
                rotate: phoneRightRotate,
                width: isMobile ? '150px' : '230px',
                height: isMobile ? '300px' : '460px',
                perspective: '1000px',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #31102f, #0f172a)',
                  border: '3px solid rgba(236, 72, 153, 0.35)',
                  borderRadius: '32px',
                  boxShadow: '0 35px 70px rgba(0,0,0,0.65), inset 0 2px 8px rgba(255,255,255,0.1)',
                  padding: '0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at 70% 70%, rgba(236,72,153,0.15) 0%, transparent 60%)',
                    zIndex: 0,
                  }}
                />
                
                <div style={{ width: '45px', height: '4px', background: '#000', borderRadius: '3px', margin: '0 auto', zIndex: 2 }} />

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1, textAlign: 'center', marginTop: '1rem' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--secondary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    {rightPhone.brand}
                  </span>
                  <h3 style={{ fontSize: isMobile ? '0.9rem' : '1.2rem', fontWeight: 800, color: '#fff', margin: '0.2rem 0' }}>
                    {rightPhone.name}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                    {formatINR(rightPhone.price)}
                  </span>
                </div>

                <div style={{ width: '60px', height: '3.5px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', margin: '0 auto', zIndex: 2 }} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Layer 4: Glassmorphic Specs drifting past the hardware */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 4,
          }}
        >
          {/* Spec Card 1 (Top Left area) */}
          <motion.div
            style={{
              position: 'absolute',
              top: '25%',
              left: isMobile ? '5%' : '15%',
              y: spec1Y,
              background: 'rgba(15, 15, 25, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(16px)',
              borderRadius: '20px',
              padding: isMobile ? '0.8rem 1rem' : '1.2rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{
              background: 'rgba(99, 102, 241, 0.15)',
              padding: '0.5rem',
              borderRadius: '10px',
              display: 'flex',
            }}>
              <Cpu size={24} color="#818cf8" />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: isMobile ? '0.8rem' : '1rem', color: '#fff', fontWeight: 800 }}>
                3nm Desktop Class
              </h4>
              <p style={{ margin: '0.1rem 0 0', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
                Maximum computing efficiency
              </p>
            </div>
          </motion.div>

          {/* Spec Card 2 (Center Bottom area) */}
          <motion.div
            style={{
              position: 'absolute',
              bottom: '22%',
              left: '50%',
              translateX: '-50%',
              y: spec2Y,
              background: 'rgba(15, 15, 25, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(16px)',
              borderRadius: '20px',
              padding: isMobile ? '0.8rem 1rem' : '1.2rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{
              background: 'rgba(236, 72, 153, 0.15)',
              padding: '0.5rem',
              borderRadius: '10px',
              display: 'flex',
            }}>
              <Sun size={24} color="#f472b6" />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: isMobile ? '0.8rem' : '1rem', color: '#fff', fontWeight: 800 }}>
                2400 nits Outdoor Peak
              </h4>
              <p style={{ margin: '0.1rem 0 0', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
                Ultra-bright OLED matrix display
              </p>
            </div>
          </motion.div>

          {/* Spec Card 3 (Top Right area) */}
          <motion.div
            style={{
              position: 'absolute',
              top: '30%',
              right: isMobile ? '5%' : '15%',
              y: spec3Y,
              background: 'rgba(15, 15, 25, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(16px)',
              borderRadius: '20px',
              padding: isMobile ? '0.8rem 1rem' : '1.2rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{
              background: 'rgba(52, 211, 153, 0.15)',
              padding: '0.5rem',
              borderRadius: '10px',
              display: 'flex',
            }}>
              <Camera size={24} color="#34d399" />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: isMobile ? '0.8rem' : '1rem', color: '#fff', fontWeight: 800 }}>
                200MP Triple Vision
              </h4>
              <p style={{ margin: '0.1rem 0 0', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
                Cinema standard photo shooting
              </p>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};
