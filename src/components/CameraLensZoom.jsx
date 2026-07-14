import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

/* ─────────────────────────────────────────
   Data
───────────────────────────────────────── */
const MODES = [
  { id: 'photo',    label: 'PHOTO',    icon: '📷', color: '#e2e8f0' },
  { id: 'night',    label: 'NIGHT',    icon: '🌙', color: '#818cf8' },
  { id: 'macro',    label: 'MACRO',    icon: '🔬', color: '#34d399' },
  { id: 'video',    label: 'VIDEO',    icon: '🎬', color: '#f472b6' },
  { id: 'portrait', label: 'PORTRAIT', icon: '🖼', color: '#fb923c' },
];

const SHOTS = [
  {
    mode: 'photo',
    title: 'Crystal Clear Daylight',
    location: 'Santorini, Greece',
    meta: { ISO: '50', SS: '1/2000s', F: 'f/1.8', ZOOM: '1×' },
    img: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?q=80&w=900&auto=format&fit=crop',
    accent: '#e2e8f0',
  },
  {
    mode: 'night',
    title: 'Night City Pulse',
    location: 'Tokyo — 11:45 PM',
    meta: { ISO: '6400', SS: '1/15s', F: 'f/1.8', ZOOM: '1×' },
    img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=900&auto=format&fit=crop',
    accent: '#818cf8',
  },
  {
    mode: 'macro',
    title: 'Micro World',
    location: 'Dewdrops on Silk',
    meta: { ISO: '200', SS: '1/500s', F: 'f/2.4', ZOOM: '10×' },
    img: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?q=80&w=900&auto=format&fit=crop',
    accent: '#34d399',
  },
  {
    mode: 'video',
    title: '8K Cinematic Frame',
    location: 'Icelandic Highlands',
    meta: { ISO: '800', SS: '1/60s', F: 'f/2.8', ZOOM: '2×' },
    img: 'https://images.unsplash.com/photo-1527489377706-5bf97e608852?q=80&w=900&auto=format&fit=crop',
    accent: '#f472b6',
  },
  {
    mode: 'portrait',
    title: 'Bokeh Perfection',
    location: 'Studio — Natural Light',
    meta: { ISO: '100', SS: '1/250s', F: 'f/1.4', ZOOM: '3×' },
    img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=900&auto=format&fit=crop',
    accent: '#fb923c',
  },
];

const SPECS = [
  { label: 'Main',  val: '200MP', sub: 'f/1.7 OIS'  },
  { label: 'Ultra', val: '12MP',  sub: '120° FOV'   },
  { label: 'Tele',  val: '50MP',  sub: '5× Optical' },
  { label: 'Macro', val: '10MP',  sub: 'f/2.4'      },
];

/* ─────────────────────────────────────────
   Breakpoint hook
───────────────────────────────────────── */
const useBreakpoint = () => {
  const [bp, setBp] = useState('md');
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      setBp(w < 480 ? 'xs' : w < 768 ? 'sm' : 'md');
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  return bp;
};

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */
const ViewfinderCorners = ({ accent, sz }) => {
  const defs = [
    { top: 0,    left: 0,    borderTop:    `2px solid ${accent}`, borderLeft:   `2px solid ${accent}` },
    { top: 0,    right: 0,   borderTop:    `2px solid ${accent}`, borderRight:  `2px solid ${accent}` },
    { bottom: 0, left: 0,    borderBottom: `2px solid ${accent}`, borderLeft:   `2px solid ${accent}` },
    { bottom: 0, right: 0,   borderBottom: `2px solid ${accent}`, borderRight:  `2px solid ${accent}` },
  ];
  return (
    <>
      {defs.map((s, i) => (
        <div key={i} style={{ position: 'absolute', width: sz, height: sz, zIndex: 20, pointerEvents: 'none', ...s }} />
      ))}
    </>
  );
};

const FocusRing = ({ accent, isFocusing, sz = 72 }) => (
  <motion.div
    animate={
      isFocusing
        ? { scale: [1.7, 1.1, 1.0], opacity: [0, 1, 1], borderColor: accent }
        : { scale: 1.0, opacity: 0.5, borderColor: accent }
    }
    transition={{ duration: 0.55, ease: 'easeOut' }}
    style={{
      position: 'absolute',
      width: sz, height: sz,
      borderRadius: '10px',
      border: `1.5px solid ${accent}`,
      pointerEvents: 'none',
      boxShadow: `0 0 10px ${accent}44`,
    }}
  />
);

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
export const CameraLensZoom = () => {
  const sectionRef = useRef(null);
  const bp         = useBreakpoint();
  const isXs       = bp === 'xs';
  const isSm       = bp === 'sm';
  const isMobile   = bp !== 'md';

  /* useInView — triggers entrance animation once when section scrolls into view */
  const isInView = useInView(sectionRef, { once: true, margin: '-80px 0px' });

  const [activeIdx,    setActiveIdx]    = useState(0);
  const [isFocusing,   setIsFocusing]   = useState(false);
  const [shutterFlash, setShutterFlash] = useState(false);
  const focusTimer = useRef(null);

  /* ── Shutter ── */
  const triggerShutter = useCallback(() => {
    setIsFocusing(true);
    clearTimeout(focusTimer.current);
    focusTimer.current = setTimeout(() => {
      setShutterFlash(true);
      setTimeout(() => { setShutterFlash(false); setIsFocusing(false); }, 260);
    }, 480);
  }, []);

  const handleModeSelect = (modeId) => {
    const idx = SHOTS.findIndex((s) => s.mode === modeId);
    if (idx !== -1 && idx !== activeIdx) {
      setActiveIdx(idx);
      triggerShutter();
    }
  };

  const shot   = SHOTS[activeIdx];
  const accent = shot.accent;

  /* ── Sizing ── */
  const vfHeight  = isXs ? '56vw' : isSm ? '52vw' : '430px';
  const vfMinH    = isXs ? '200px' : isSm ? '230px' : '430px';
  const cornerSz  = isXs ? '12px' : isSm ? '15px' : '20px';
  const focusSz   = isXs ? 50 : isSm ? 60 : 76;

  /* section vertical padding — no huge vh needed any more */
  const padTop    = isXs ? '3rem' : isSm ? '4rem' : '5rem';
  const padBottom = isXs ? '3.5rem' : isSm ? '4.5rem' : '5.5rem';
  const innerGap  = isXs ? '0.9rem' : isSm ? '1.1rem' : '1.6rem';

  /* Entrance animation variants */
  const fadeUp = {
    hidden:  { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
  };
  const stagger = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  return (
    <div
      ref={sectionRef}
      style={{
        position: 'relative',
        background: 'linear-gradient(180deg, #060608 0%, #0a0a10 50%, #060608 100%)',
        overflow: 'hidden',
        paddingTop: padTop,
        paddingBottom: padBottom,
      }}
    >
      {/* ── Ambient glow (shifts with mode colour) ── */}
      <AnimatePresence>
        <motion.div
          key={accent}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isXs ? '100vw' : isSm ? '90vw' : '60vw',
            height: isXs ? '100vw' : isSm ? '90vw' : '60vw',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${accent}14 0%, transparent 68%)`,
            filter: 'blur(60px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      </AnimatePresence>

      {/* ══════════ CONTENT WRAPPER ══════════ */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '900px',
          margin: '0 auto',
          padding: isXs ? '0 0.875rem' : isSm ? '0 1.25rem' : '0 2rem',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: innerGap,
        }}
      >

        {/* ── Section header ── */}
        <motion.div variants={fadeUp} style={{ textAlign: 'center' }}>
          <span style={{
            display: 'block',
            fontSize: isXs ? '0.65rem' : '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: isXs ? '3px' : '4px',
            marginBottom: isXs ? '0.5rem' : '0.65rem',
            background: 'linear-gradient(90deg, #ec4899, #818cf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Quad-Lens Array
          </span>
          <h2 style={{
            fontSize: isXs
              ? 'clamp(1.6rem, 8vw, 1.9rem)'
              : isSm
              ? 'clamp(1.9rem, 6.5vw, 2.3rem)'
              : 'clamp(2.4rem, 4vw, 3rem)',
            fontWeight: 900,
            letterSpacing: isXs ? '-1px' : '-1.5px',
            lineHeight: 1.1,
            color: '#fff',
            margin: 0,
          }}>
            See Everything.{' '}
            <span style={{
              background: `linear-gradient(90deg, ${accent}, #818cf8)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Miss Nothing.
            </span>
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: isXs ? '0.75rem' : '0.85rem',
            marginTop: isXs ? '0.5rem' : '0.65rem',
            lineHeight: 1.5,
          }}>
            {isMobile ? 'Tap a mode. Tap the frame to shoot.' : 'Select a mode below and click the frame to trigger the shutter.'}
          </p>
        </motion.div>

        {/* ── Mode Strip ── */}
        <motion.div
          variants={fadeUp}
          style={{
            display: 'flex',
            alignItems: 'center',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            gap: 0,
            /* distribute evenly on all sizes */
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            paddingBottom: '2px',
          }}
        >
          {MODES.map((m) => {
            const isActive = m.id === shot.mode;
            return (
              <motion.button
                key={m.id}
                onClick={() => handleModeSelect(m.id)}
                animate={{ opacity: isActive ? 1 : 0.38 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isActive ? m.color : '#fff',
                  fontSize: isXs ? '0.58rem' : isSm ? '0.63rem' : '0.68rem',
                  fontWeight: 'bold',
                  letterSpacing: isXs ? '1px' : '1.5px',
                  textTransform: 'uppercase',
                  padding: isXs ? '0.55rem 0' : '0.65rem 0',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  borderBottom: isActive ? `2px solid ${m.color}` : '2px solid transparent',
                  marginBottom: '-2px',
                  minHeight: '44px',
                  fontFamily: "'Courier New', monospace",
                  transition: 'color 0.2s, border-color 0.2s',
                  display: 'flex',
                  flexDirection: isXs ? 'column' : 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                }}
              >
                <span>{m.icon}</span>
                {!isXs && <span>{m.label}</span>}
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── Viewfinder Frame ── */}
        <motion.div
          variants={fadeUp}
          style={{
            position: 'relative',
            width: '100%',
            height: vfHeight,
            minHeight: vfMinH,
            borderRadius: isXs ? '14px' : isSm ? '16px' : '20px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: `0 0 0 1px ${accent}1a, 0 20px 60px rgba(0,0,0,0.85)`,
            cursor: 'crosshair',
            flexShrink: 0,
          }}
          onClick={triggerShutter}
        >
          {/* Corner brackets */}
          <ViewfinderCorners accent={accent} sz={cornerSz} />

          {/* Focus ring */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)', zIndex: 18,
          }}>
            <FocusRing accent={accent} isFocusing={isFocusing} sz={focusSz} />
          </div>

          {/* Shutter flash */}
          <AnimatePresence>
            {shutterFlash && (
              <motion.div
                key="flash"
                initial={{ opacity: 0.9 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.24 }}
                style={{
                  position: 'absolute', inset: 0,
                  background: '#fff', zIndex: 30,
                  pointerEvents: 'none', borderRadius: 'inherit',
                }}
              />
            )}
          </AnimatePresence>

          {/* Photo */}
          <AnimatePresence mode="wait">
            <motion.div
              key={shot.mode}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${shot.img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          </AnimatePresence>

          {/* Bottom scrim */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '62%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.94) 0%, transparent 100%)',
            zIndex: 14, pointerEvents: 'none',
          }} />

          {/* HUD — Top */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            padding: isXs ? '0.5rem 0.75rem' : isSm ? '0.6rem 0.9rem' : '0.75rem 1.25rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%)',
            zIndex: 16, gap: '0.5rem',
          }}>
            {/* Live dot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
              <motion.div
                animate={{ opacity: [1, 0.15, 1] }}
                transition={{ repeat: Infinity, duration: 1.1 }}
                style={{ width: isXs ? '5px' : '6px', height: isXs ? '5px' : '6px', borderRadius: '50%', background: '#f43f5e' }}
              />
              <span style={{
                fontSize: isXs ? '0.5rem' : '0.58rem',
                fontWeight: 'bold', color: '#fff',
                letterSpacing: '1.5px',
                fontFamily: "'Courier New', monospace",
              }}>
                {shot.mode === 'video' ? 'REC' : 'LIVE'}
              </span>
            </div>

            {/* Mode badge */}
            <AnimatePresence mode="wait">
              <motion.span
                key={shot.mode + '-badge'}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
                style={{
                  padding: isXs ? '0.12rem 0.45rem' : '0.18rem 0.6rem',
                  borderRadius: '20px',
                  border: `1px solid ${accent}40`,
                  background: `${accent}12`,
                  fontSize: isXs ? '0.48rem' : '0.56rem',
                  fontWeight: 'bold', color: accent,
                  letterSpacing: '1.5px', textTransform: 'uppercase',
                  fontFamily: "'Courier New', monospace",
                  whiteSpace: 'nowrap',
                }}
              >
                {MODES.find((m) => m.id === shot.mode)?.icon}
                {!isXs && ` ${shot.mode.toUpperCase()}`}
              </motion.span>
            </AnimatePresence>

            {/* Zoom + battery */}
            <span style={{
              fontSize: isXs ? '0.48rem' : '0.56rem',
              color: 'rgba(255,255,255,0.4)',
              fontFamily: "'Courier New', monospace",
              flexShrink: 0,
            }}>
              {shot.meta.ZOOM} 🔋
            </span>
          </div>

          {/* HUD — Bottom */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: isXs
              ? '0.6rem 0.75rem 0.7rem'
              : isSm
              ? '0.8rem 1rem 0.85rem'
              : '1rem 1.4rem 1.1rem',
            zIndex: 16,
            display: 'flex', flexDirection: 'column',
            gap: isXs ? '0.3rem' : '0.45rem',
          }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={shot.mode + '-text'}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{
                  fontSize: isXs ? '0.5rem' : isSm ? '0.54rem' : '0.62rem',
                  color: accent, fontWeight: 'bold',
                  textTransform: 'uppercase', letterSpacing: '1.5px',
                  marginBottom: '0.15rem',
                  fontFamily: "'Courier New', monospace",
                  overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                }}>
                  📍 {shot.location}
                </div>
                <div style={{
                  fontSize: isXs ? '0.88rem' : isSm ? '1rem' : '1.4rem',
                  fontWeight: 900, color: '#fff',
                  overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                  lineHeight: 1.2,
                }}>
                  {shot.title}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* EXIF strip — hidden on xs */}
            {!isXs && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={shot.mode + '-exif'}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, delay: 0.07 }}
                  style={{ display: 'flex', gap: isSm ? '0.8rem' : '1.1rem', fontFamily: "'Courier New', monospace" }}
                >
                  {Object.entries(shot.meta).map(([k, v]) => (
                    <div key={k} style={{ textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: isSm ? '0.43rem' : '0.48rem', color: 'rgba(255,255,255,0.32)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{k}</div>
                      <div style={{ fontSize: isSm ? '0.65rem' : '0.72rem', fontWeight: 'bold', color: accent }}>{v}</div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Desktop side label */}
          {!isMobile && (
            <div style={{
              position: 'absolute', top: '50%', right: '1.2rem',
              transform: 'translateY(-50%)',
              fontSize: '0.5rem', color: 'rgba(255,255,255,0.18)',
              letterSpacing: '1.5px', textTransform: 'uppercase',
              writingMode: 'vertical-rl', zIndex: 16,
              fontFamily: "'Courier New', monospace",
            }}>
              click to focus
            </div>
          )}
        </motion.div>

        {/* ── Spec cards — always 4-col grid, scales via font/padding ── */}
        <motion.div
          variants={fadeUp}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: isXs ? '0.5rem' : isSm ? '0.65rem' : '0.9rem',
            width: '100%',
          }}
        >
          {SPECS.map((spec) => (
            <motion.div
              key={spec.label}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${accent}20`,
                borderRadius: isXs ? '10px' : '13px',
                padding: isXs ? '0.5rem 0.3rem' : isSm ? '0.65rem 0.5rem' : '0.85rem 0.8rem',
                textAlign: 'center', color: '#fff',
                cursor: 'default',
              }}
            >
              <div style={{
                fontSize: isXs ? '0.46rem' : isSm ? '0.52rem' : '0.58rem',
                color: accent, fontWeight: 'bold',
                textTransform: 'uppercase', letterSpacing: '1px',
                marginBottom: '0.2rem',
              }}>
                {spec.label}
              </div>
              <div style={{ fontSize: isXs ? '0.8rem' : isSm ? '0.9rem' : '1.05rem', fontWeight: 900 }}>
                {spec.val}
              </div>
              <div style={{
                fontSize: isXs ? '0.46rem' : '0.56rem',
                color: 'rgba(255,255,255,0.36)',
                marginTop: '0.1rem',
              }}>
                {spec.sub}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Mobile shutter button ── */}
        {isMobile && (
          <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'center' }}>
            <motion.button
              whileTap={{ scale: 0.87 }}
              onClick={triggerShutter}
              aria-label="Trigger shutter"
              style={{
                width: isXs ? '52px' : '60px',
                height: isXs ? '52px' : '60px',
                borderRadius: '50%',
                border: `3px solid ${accent}`,
                background: 'rgba(255,255,255,0.04)',
                boxShadow: `0 0 16px ${accent}44`,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 0,
              }}
            >
              <div style={{
                width: isXs ? '36px' : '42px',
                height: isXs ? '36px' : '42px',
                borderRadius: '50%',
                background: accent,
                opacity: 0.88,
              }} />
            </motion.button>
          </motion.div>
        )}

      </motion.div>

      {/* Spinning decorative ring — absolute, behind content, subtle */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: isXs ? '260px' : isSm ? '340px' : '480px',
        height: isXs ? '260px' : isSm ? '340px' : '480px',
        borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.025)',
        pointerEvents: 'none', zIndex: 1,
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 14, ease: 'linear' }}
          style={{
            position: 'absolute', inset: '-1px', borderRadius: '50%',
            border: '1px solid transparent',
            borderTopColor: `${accent}55`,
            borderRightColor: `${accent}22`,
            filter: `drop-shadow(0 0 6px ${accent}44)`,
          }}
        />
      </div>

    </div>
  );
};
