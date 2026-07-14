import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Gift } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export const CouponSpinner = ({ isOpen, onClose }) => {
  const { addToast } = useStore();
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinRotation, setSpinRotation] = useState(0);
  const [award, setAward] = useState(null);

  const canvasRef = useRef(null);
  const wheelRef = useRef(null);

  const segments = [
    { code: 'AURA10', label: '10% OFF' },
    { code: 'WELCOME50', label: '50% OFF' },
    { code: 'AURA20', label: '20% OFF' },
    { code: 'WELCOME50', label: '50% OFF' },
    { code: 'AURA10', label: '10% OFF' },
    { code: 'AURA20', label: '20% OFF' }
  ];

  const handleSpin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setAward(null);

    // Spin at least 5 full rotations (1800deg) + random angle
    const baseRotation = 1800;
    const randomAngle = Math.random() * 360;
    const finalRotation = spinRotation + baseRotation + randomAngle;
    
    setSpinRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      
      // Calculate which segment landed at the top pointer (12 o'clock / 270 deg)
      // Since SVG rotates clockwise:
      const R = finalRotation % 360;
      const normalizedAngle = (270 - R + 360) % 360;
      
      // 6 segments: each is 60 degrees
      const segmentIndex = Math.floor(normalizedAngle / 60) % 6;
      const winningSegment = segments[segmentIndex];

      setAward(winningSegment);
      
      try {
        navigator.clipboard.writeText(winningSegment.code);
        addToast(`Congratulations! Awarded coupon ${winningSegment.code} (copied to clipboard).`, 'success');
      } catch {
        addToast(`Congratulations! Awarded coupon ${winningSegment.code}.`, 'success');
      }

      // Trigger Confetti
      if (canvasRef.current) {
        triggerConfetti(canvasRef.current);
      }
    }, 3600); 
  };

  const triggerConfetti = (canvas) => {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    const ctx = canvas.getContext('2d');
    const particles = [];
    const colors = ['#6366f1', '#ec4899', '#10b981', '#fbbf24', '#3b82f6'];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.45,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.7) * 14 - 5,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3; 
        p.vx *= 0.98; 
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.012;

        if (p.opacity > 0) {
          active = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (active) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  };

  if (!isOpen) return null;

  return (
    <div className="form-modal-overlay" style={{ zIndex: 300 }}>
      <div 
        className="form-modal-container" 
        style={{ 
          maxWidth: '460px', 
          width: '90%', 
          background: 'linear-gradient(135deg, rgba(20,20,30,0.98), rgba(10,10,15,0.99))',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.7)',
          position: 'relative',
          padding: '2.5rem 2rem 2rem 2rem',
          textAlign: 'center',
          overflow: 'hidden'
        }}
      >
        <canvas 
          ref={canvasRef} 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            pointerEvents: 'none',
            zIndex: 10
          }} 
        />

        <button className="form-modal-close" onClick={onClose} style={{ zIndex: 20 }}>
          <X width="18" height="18" />
        </button>

        <div style={{ zIndex: 20, position: 'relative' }}>
          <div 
            style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '50%', 
              background: 'rgba(99, 102, 241, 0.12)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 0.75rem auto',
              color: 'var(--primary)'
            }}
          >
            <Gift width="20" height="20" />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>AURA Lucky Spinner</h3>
          <p style={{ margin: '0.2rem 0 2rem 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Spin the wheel to unlock high-tier promotional coupons for your checkout purchase!
          </p>

          {/* SVG Wheel Box with Stationary Shadow */}
          <div 
            style={{ 
              position: 'relative', 
              width: '240px', 
              height: '240px', 
              margin: '0 auto 2.5rem auto',
              borderRadius: '50%',
              boxShadow: '0 12px 35px rgba(99, 102, 241, 0.2)'
            }}
          >
            {/* Top Pointer arrow (Stationary) */}
            <div 
              style={{ 
                position: 'absolute', 
                top: '-10px', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                width: '0', 
                height: '0', 
                borderLeft: '10px solid transparent', 
                borderRight: '10px solid transparent', 
                borderTop: '20px solid var(--accent-red)', 
                zIndex: 30
              }} 
            />

            <svg 
              ref={wheelRef}
              viewBox="0 0 200 200" 
              style={{ 
                width: '100%', 
                height: '100%', 
                transform: `rotate(${spinRotation}deg)`,
                transition: 'transform 3.6s cubic-bezier(0.15, 0.85, 0.15, 1)'
              }}
            >
              {/* Segments background */}
              {segments.map((seg, idx) => {
                const angle = idx * 60;
                const radians = (angle * Math.PI) / 180;
                const nextAngle = (idx + 1) * 60;
                const nextRadians = (nextAngle * Math.PI) / 180;
                
                const x1 = 100 + 100 * Math.cos(radians);
                const y1 = 100 + 100 * Math.sin(radians);
                const x2 = 100 + 100 * Math.cos(nextRadians);
                const y2 = 100 + 100 * Math.sin(nextRadians);

                const fillColors = ['#6366f1', '#1f1f2e', '#ec4899', '#151520', '#6366f1', '#1f1f2e'];
                
                return (
                  <g key={idx}>
                    <path 
                      d={`M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`} 
                      fill={fillColors[idx]}
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="0.5"
                    />
                    
                    {/* Text Label */}
                    <text 
                      x="100" 
                      y="40" 
                      transform={`rotate(${angle + 30} 100 100)`}
                      fill="#fff" 
                      fontSize="9" 
                      fontWeight="800"
                      textAnchor="middle"
                      fontFamily="sans-serif"
                      letterSpacing="0.5"
                    >
                      {seg.label}
                    </text>
                  </g>
                );
              })}
              
              {/* Center Circle cap */}
              <circle cx="100" cy="100" r="22" fill="#0c0d12" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            </svg>
            
            {/* Center SPIN Button Trigger */}
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                border: '2px solid rgba(255,255,255,0.3)',
                color: '#fff',
                fontSize: '0.78rem',
                fontWeight: '800',
                cursor: isSpinning ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 5px 15px rgba(99, 102, 241, 0.4)',
                zIndex: 35
              }}
            >
              SPIN
            </button>
          </div>

          <AnimatePresence>
            {award && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  animation: 'fadeIn 0.35s ease'
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-green)', letterSpacing: '0.04em', display: 'block' }}>
                  YOU WON A COUPON!
                </span>
                <span style={{ fontSize: '1.25rem', color: '#fff', fontWeight: '800', fontFamily: 'monospace', letterSpacing: '0.05em', display: 'block', margin: '0.2rem 0' }}>
                  {award.code}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Code copied to clipboard. Paste at checkout for savings!
                </span>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
