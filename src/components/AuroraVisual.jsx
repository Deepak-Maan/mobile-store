import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const BADGES = [
  { icon: '⚡', label: '3nm A18 Chip', angle: 0,   radius: 175 },
  { icon: '📷', label: '48MP ProRAW',  angle: 60,  radius: 175 },
  { icon: '🔋', label: '29hr Battery', angle: 120, radius: 175 },
  { icon: '🌐', label: '5G Ultra Fast',angle: 180, radius: 175 },
  { icon: '💎', label: 'Titanium Body',angle: 240, radius: 175 },
  { icon: '🎮', label: 'ProMotion 120',angle: 300, radius: 175 },
];

const SPARKS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  const r = 100 + (i % 3) * 18;
  return { x: Math.cos(a) * r, y: Math.sin(a) * r, size: 3 + (i % 3) };
});

export const AuroraVisual = () => {
  const wrapRef  = useRef(null);
  const orbRef   = useRef(null);
  const ring1Ref = useRef(null);
  const ring2Ref = useRef(null);
  const ring3Ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(wrapRef.current, { opacity: 0, scale: 0.7, duration: 1.4, ease: 'power3.out', delay: 0.2 });
      gsap.to(orbRef.current, { scale: 1.06, duration: 3.5, ease: 'sine.inOut', repeat: -1, yoyo: true });
      gsap.to(ring1Ref.current, { rotation: 360,  duration: 9,  ease: 'none', repeat: -1 });
      gsap.to(ring2Ref.current, { rotation: -360, duration: 14, ease: 'none', repeat: -1 });
      gsap.to(ring3Ref.current, { rotation: 360,  duration: 20, ease: 'none', repeat: -1 });

      document.querySelectorAll('.aurora-badge').forEach((el, i) => {
        gsap.to(el, { y: i % 2 === 0 ? -10 : 10, duration: 2.4 + i * 0.35, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: i * 0.22 });
      });
      document.querySelectorAll('.aurora-spark').forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, scale: 0 },
          { opacity: 1, scale: 1, duration: 1.1 + i * 0.2, ease: 'power2.out', delay: 0.5 + i * 0.15, repeat: -1, yoyo: true }
        );
      });
    }, wrapRef);
    return () => ctx.revert();
  }, []);

  const polar = (angleDeg, r) => {
    const a = (angleDeg - 90) * (Math.PI / 180);
    return { x: Math.cos(a) * r, y: Math.sin(a) * r };
  };

  return (
    <>
      <style>{`
        @keyframes orbMorph {
          0%   { border-radius: 50%; }
          25%  { border-radius: 48% 52% 55% 45% / 50% 46% 54% 50%; }
          50%  { border-radius: 55% 45% 48% 52% / 46% 54% 46% 54%; }
          75%  { border-radius: 45% 55% 50% 50% / 54% 46% 54% 46%; }
          100% { border-radius: 50%; }
        }

        /* ── outer clip: prevents any layout bleed ── */
        .aurora-clip {
          width: 100%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          /* height = 420px at full scale */
          height: 420px;
        }

        /* ── the 420×420 scene, scaled down at narrower viewports ── */
        .aurora-visual-wrap {
          position: relative;
          width: 420px;
          height: 420px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          /* use transform-origin top so the visual doesn't drop below clip boundary */
          transform-origin: center top;
        }

        /* Tablet (≤ 1024px): scale to 78 % → visual height ≈ 328px */
        @media (max-width: 1024px) {
          .aurora-clip        { height: 330px; }
          .aurora-visual-wrap { transform: scale(0.78); }
        }

        /* Small mobile (≤ 640px): scale to 52 % → visual height ≈ 218px; hide badges */
        @media (max-width: 640px) {
          .aurora-clip        { height: 220px; }
          .aurora-visual-wrap { transform: scale(0.52); }
          .aurora-badge       { display: none !important; }
        }
      `}</style>

      {/* clip wrapper — ZERO layout overflow */}
      <div className="aurora-clip">
        <div ref={wrapRef} className="aurora-visual-wrap">

          {/* Ambient glow */}
          <div style={{
            position: 'absolute', inset: -60, borderRadius: '50%',
            background: 'radial-gradient(circle, hsla(250,95%,65%,0.18) 0%, hsla(320,95%,60%,0.10) 45%, transparent 70%)',
            filter: 'blur(30px)', pointerEvents: 'none',
          }} />

          {/* Ring 1 – indigo */}
          <div ref={ring1Ref} style={{
            position: 'absolute', width: 340, height: 340, borderRadius: '50%',
            border: '1.5px solid rgba(99,102,241,0.55)',
            boxShadow: '0 0 14px rgba(99,102,241,0.30)',
            transform: 'rotateX(70deg) rotateZ(0deg)',
          }}>
            <div style={{ position:'absolute', top:-5, left:'50%', marginLeft:-5, width:10, height:10, borderRadius:'50%', background:'var(--primary)', boxShadow:'0 0 10px var(--primary)' }} />
          </div>

          {/* Ring 2 – pink */}
          <div ref={ring2Ref} style={{
            position: 'absolute', width: 280, height: 280, borderRadius: '50%',
            border: '1.5px solid rgba(236,72,153,0.55)',
            boxShadow: '0 0 12px rgba(236,72,153,0.25)',
            transform: 'rotateX(75deg) rotateY(30deg)',
          }}>
            <div style={{ position:'absolute', top:-5, left:'50%', marginLeft:-5, width:10, height:10, borderRadius:'50%', background:'var(--secondary)', boxShadow:'0 0 10px var(--secondary)' }} />
          </div>

          {/* Ring 3 – teal dashed */}
          <div ref={ring3Ref} style={{
            position: 'absolute', width: 220, height: 220, borderRadius: '50%',
            border: '1px dashed rgba(20,200,200,0.45)',
            boxShadow: '0 0 10px rgba(20,200,200,0.15)',
          }}>
            <div style={{ position:'absolute', top:-4, left:'50%', marginLeft:-4, width:8, height:8, borderRadius:'50%', background:'#14c8c8', boxShadow:'0 0 8px #14c8c8' }} />
          </div>

          {/* Central Orb */}
          <div ref={orbRef} style={{
            position: 'relative', width: 150, height: 150, borderRadius: '50%',
            background: `radial-gradient(circle at 35% 35%, hsl(270,90%,78%) 0%, hsl(250,95%,60%) 30%, hsl(320,90%,55%) 60%, hsl(200,80%,45%) 100%)`,
            boxShadow: `0 0 40px rgba(99,102,241,0.7), 0 0 80px rgba(236,72,153,0.4), 0 0 120px rgba(99,102,241,0.2), inset 0 0 30px rgba(255,255,255,0.15)`,
            animation: 'orbMorph 8s ease-in-out infinite', zIndex: 2,
          }}>
            <div style={{ position:'absolute', top:'15%', left:'18%', width:'40%', height:'35%', borderRadius:'50%', background:'radial-gradient(circle, rgba(255,255,255,0.45) 0%, transparent 70%)', transform:'rotate(-30deg)' }} />
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:'var(--font-display)', textAlign:'center' }}>
              <span style={{ fontSize:'0.55rem', letterSpacing:'0.15em', opacity:0.85, textTransform:'uppercase' }}>AURA</span>
              <span style={{ fontSize:'1.1rem', fontWeight:800, lineHeight:1.1 }}>Store</span>
            </div>
          </div>

          {/* Sparks */}
          {SPARKS.map((s, i) => (
            <div key={i} className="aurora-spark" style={{
              position:'absolute', left:'50%', top:'50%',
              marginLeft: s.x - s.size / 2, marginTop: s.y - s.size / 2,
              width: s.size, height: s.size, borderRadius:'50%',
              background: i % 3 === 0 ? 'var(--primary)' : i % 3 === 1 ? 'var(--secondary)' : '#14c8c8',
              boxShadow:`0 0 ${s.size * 2}px currentColor`, opacity:0,
            }} />
          ))}

          {/* Badges */}
          {BADGES.map((b, i) => {
            const { x, y } = polar(b.angle, b.radius);
            return (
              <div key={i} className="aurora-badge" style={{
                position:'absolute', left:'50%', top:'50%',
                marginLeft: x - 58, marginTop: y - 22,
                width:116, display:'flex', alignItems:'center', gap:'6px',
                padding:'6px 10px', borderRadius:'30px',
                background:'rgba(15,15,25,0.70)', border:'1px solid rgba(255,255,255,0.12)',
                backdropFilter:'blur(12px)',
                boxShadow:'0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
                fontSize:'0.65rem', fontWeight:600, color:'var(--text-primary)',
                letterSpacing:'0.02em', whiteSpace:'nowrap', zIndex:3, userSelect:'none',
              }}>
                <span style={{ fontSize:'0.9rem' }}>{b.icon}</span>
                <span>{b.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
