import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const DeviceExploder = () => {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Mobile: lighter explosion offsets so layers don't fly off screen
  const layer1Y = useTransform(
    scrollYProgress,
    [0.1, 0.65],
    isMobile ? [0, -110] : [0, -160]
  );
  const layer2Y = useTransform(
    scrollYProgress,
    [0.1, 0.65],
    isMobile ? [0, -50] : [0, -70]
  );
  const layer3Y = useTransform(
    scrollYProgress,
    [0.1, 0.65],
    isMobile ? [0, 30] : [0, 40]
  );
  const layer4Y = useTransform(
    scrollYProgress,
    [0.1, 0.65],
    isMobile ? [0, 90] : [0, 130]
  );

  // Reduce perspective tilt on mobile
  const rotX = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    isMobile ? [25, 12, 0] : [40, 20, 0]
  );
  const rotZ = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    isMobile ? [-8, -3, 0] : [-15, -5, 0]
  );
  const sectionScale = useTransform(
    scrollYProgress,
    [0, 0.5],
    isMobile ? [0.85, 1] : [0.8, 1]
  );

  // Scale device layers for mobile
  const layerScale = isMobile ? 0.68 : 1;
  const devW = (w) => Math.round(w * layerScale);
  const devH = (h) => Math.round(h * layerScale);

  const layers = [
    {
      w: 240, h: 480, y: layer1Y, zIndex: 10, radius: '32px',
      border: '2px solid rgba(255,255,255,0.38)',
      bg: 'linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.01))',
      extra: 'blur(3px)',
      shadow: '0 15px 35px rgba(0,0,0,0.35)',
      label: 'ULTRA GLASS',
      sublabel: 'REINFORCED OLED',
      sublabelColor: '#818cf8',
    },
    {
      w: 220, h: 440, y: layer2Y, zIndex: 8, radius: '28px',
      border: '2px solid rgba(129,140,248,0.32)',
      bg: 'rgba(10, 15, 30, 0.92)',
      shadow: '0 15px 35px rgba(99,102,241,0.18)',
      chip: true,
    },
    {
      w: 210, h: 430, y: layer3Y, zIndex: 6, radius: '24px',
      border: '1.5px solid rgba(255,255,255,0.09)',
      bg: 'linear-gradient(180deg, #1c1917, #0c0a09)',
      shadow: '0 10px 25px rgba(0,0,0,0.55)',
      battery: true,
    },
    {
      w: 230, h: 470, y: layer4Y, zIndex: 4, radius: '30px',
      border: '3px solid #4b5563',
      bg: 'linear-gradient(135deg, #1f2937, #111827)',
      shadow: '0 25px 60px rgba(0,0,0,0.75)',
      camera: true,
    },
  ];

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        minHeight: isMobile ? '130vh' : '145vh',
        background: 'linear-gradient(to bottom, #0a0a0e, #111116)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '5rem 1.25rem' : '6rem 2rem',
        overflow: 'hidden',
        perspective: '1500px',
      }}
    >
      {/* Dot grid */}
      <div
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%', height: '90%',
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.05) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          zIndex: 1, pointerEvents: 'none',
        }}
      />

      {/* ── Responsive Grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          alignItems: 'center',
          width: '100%',
          maxWidth: '1200px',
          zIndex: 2,
          gap: isMobile ? '3rem' : '4rem',
        }}
      >
        {/* Exploding Device Visual */}
        <motion.div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: isMobile ? '420px' : '650px',
            transformStyle: 'preserve-3d',
            rotateX: rotX,
            rotateZ: rotZ,
            scale: sectionScale,
            position: 'relative',
            order: isMobile ? 1 : 0,
          }}
        >
          {layers.map((l, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                width: `${devW(l.w)}px`,
                height: `${devH(l.h)}px`,
                y: l.y,
                transformStyle: 'preserve-3d',
                zIndex: l.zIndex,
                borderRadius: l.radius,
                border: l.border,
                background: l.bg,
                backdropFilter: l.extra,
                WebkitBackdropFilter: l.extra,
                boxShadow: l.shadow,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '1.25rem',
                boxSizing: 'border-box',
                gap: '0.75rem',
              }}
            >
              {/* Glass label */}
              {l.label && (
                <div style={{
                  position: 'absolute', top: '1.1rem', left: '1.1rem', right: '1.1rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.5)' }}>
                    {l.label}
                  </span>
                  <div style={{ width: '36px', height: '5px', background: '#000', borderRadius: '3px' }} />
                </div>
              )}
              {l.sublabel && (
                <div style={{
                  position: 'absolute', bottom: '1.1rem', left: '1.1rem', right: '1.1rem',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '16px', padding: '0.5rem', background: 'rgba(0,0,0,0.4)', textAlign: 'center',
                }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 'bold', color: l.sublabelColor }}>
                    {l.sublabel}
                  </span>
                </div>
              )}

              {/* Chip layer */}
              {l.chip && (
                <>
                  <div style={{
                    width: isMobile ? '60px' : '78px', height: isMobile ? '60px' : '78px',
                    background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                    border: '2px solid #818cf8',
                    borderRadius: '14px',
                    boxShadow: '0 0 22px rgba(129,140,248,0.45)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                  }}>
                    <span style={{ fontSize: isMobile ? '0.7rem' : '0.85rem', fontWeight: '900', color: '#fff', letterSpacing: '1px' }}>AURA</span>
                    <span style={{ fontSize: '0.45rem', position: 'absolute', bottom: '7px', color: '#818cf8', fontWeight: 'bold' }}>NEURAL X2</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
                    {['16GB LPDDR5X', '5G CONTROLLER'].map((t) => (
                      <div key={t} style={{
                        fontSize: '0.5rem', background: 'rgba(255,255,255,0.06)',
                        padding: '0.2rem 0.45rem', borderRadius: '4px', color: 'rgba(255,255,255,0.6)',
                      }}>{t}</div>
                    ))}
                  </div>
                </>
              )}

              {/* Battery layer */}
              {l.battery && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', alignSelf: 'flex-start', paddingTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      width: '11px', height: '22px', border: '1.5px solid #22c55e',
                      borderRadius: '3px', display: 'flex', alignItems: 'flex-end', padding: '1px',
                    }}>
                      <div style={{ width: '100%', height: '78%', background: '#22c55e', borderRadius: '1px' }} />
                    </div>
                    <span style={{ fontSize: isMobile ? '0.8rem' : '0.88rem', fontWeight: 'bold', color: '#fff' }}>5000 mAh</span>
                  </div>
                  <p style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.45, margin: 0, maxWidth: '150px' }}>
                    High-density anode battery. 80W rapid charging. Reverse wireless transfer.
                  </p>
                </div>
              )}

              {/* Camera array layer */}
              {l.camera && (
                <div style={{
                  position: 'absolute', top: '1.25rem', left: '1.25rem',
                  width: isMobile ? '54px' : '68px', height: isMobile ? '54px' : '68px',
                  background: '#0f172a', borderRadius: '14px',
                  border: '1.5px solid rgba(255,255,255,0.07)',
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  padding: '5px', gap: '5px', boxSizing: 'border-box',
                }}>
                  {[0, 1, 2, 3].map((k) => (
                    <div key={k} style={{
                      borderRadius: '50%',
                      background: k === 3 ? '#334155' : '#000',
                      border: k !== 3 ? '2px solid #334155' : 'none',
                    }} />
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Technical Explanation */}
        <div
          style={{
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '1.5rem' : '2rem',
            order: isMobile ? 0 : 1,
            textAlign: isMobile ? 'center' : 'left',
          }}
        >
          <div>
            <span style={{
              background: 'linear-gradient(90deg, #818cf8, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '0.82rem', fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '3px',
              display: 'block', marginBottom: '0.6rem',
            }}>
              Modular Architecture
            </span>
            <h2 style={{
              fontSize: isMobile ? 'clamp(1.7rem, 8vw, 2.4rem)' : 'clamp(2rem, 3.5vw, 3rem)',
              fontWeight: 900, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: '0.85rem',
            }}>
              disassembled to<br />perfection.
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.5)', fontSize: isMobile ? '0.85rem' : '0.95rem',
              lineHeight: 1.6, maxWidth: isMobile ? '100%' : '420px',
              margin: isMobile ? '0 auto' : 0,
            }}>
              Scroll to explore the premium layer layout of Aura smartphones. From outer titanium shielding to the deep neural co-processor.
            </p>
          </div>

          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {[
              { num: '01', col: '#818cf8', title: 'Super Glass Shell', desc: 'Ceramic shielding with nano-crystals resisting impacts up to 5× better.' },
              { num: '02', col: '#a78bfa', title: 'Neural X2 Chip', desc: '3nm architecture with 45T ops/sec and extreme thermal efficiency.' },
              { num: '03', col: '#f472b6', title: 'Titanium Alloy Frame', desc: 'High-tensile structural bands protecting circuitry from drops and shock.' },
            ].map((item) => (
              <div key={item.num} style={{
                display: 'flex', gap: '1rem', alignItems: 'flex-start',
                justifyContent: isMobile ? 'center' : 'flex-start',
                textAlign: isMobile ? 'left' : 'left',
              }}>
                <div style={{ color: item.col, fontWeight: '900', fontSize: '1rem', flexShrink: 0 }}>{item.num}</div>
                <div>
                  <h4 style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{item.title}</h4>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.43)', lineHeight: 1.45, margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
