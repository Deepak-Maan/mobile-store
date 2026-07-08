import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';
import { AuroraVisual } from './AuroraVisual';

export const Hero = ({ onExplore }) => {
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const canvasRef = useRef(null);

  // GSAP Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });

      tl.to('.hero-content', { opacity: 1, y: 0, duration: 0.1 })
        .fromTo('.hero-desc', { y: 25, opacity: 0 }, { y: 0, opacity: 1 }, 0.3)
        .fromTo('.hero-btn', { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, ease: 'back.out(1.5)' }, 0.5);

      tl.fromTo('.aurora-visual-wrap',
        { scale: 0.7, opacity: 0, y: 40 },
        { scale: 1, opacity: 1, y: 0, duration: 1.8, ease: 'power3.out' },
        0.2
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Magnetic Button Physics
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleMouseMove = (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      const distance = Math.sqrt(x * x + y * y);

      // Active pull radius of 75px
      if (distance < 75) {
        gsap.to(button, {
          x: x * 0.35,
          y: y * 0.35,
          duration: 0.3,
          ease: 'power2.out'
        });
      } else {
        gsap.to(button, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1.1, 0.4)'
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1.1, 0.4)'
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Background Particle System
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let particles = [];
    const mouse = { x: -1000, y: -1000 };

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / 18000);
      for (let i = 0; i < Math.max(25, particleCount); i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          baseX: 0,
          baseY: 0,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 2 + 1,
          color: Math.random() > 0.5 ? '#6366f1' : '#ec4899',
          alpha: Math.random() * 0.35 + 0.15
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        // Drift movement
        p.x += p.vx;
        p.y += p.vy;

        // Wall collisions
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Mouse avoidance push
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 120) {
          const force = (120 - distance) / 120;
          const angle = Math.atan2(dy, dx);
          // Push particles slightly away from cursor direction
          p.x -= Math.cos(angle) * force * 1.5;
          p.y -= Math.sin(angle) * force * 1.5;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(drawParticles);
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    canvas.parentElement.addEventListener('mousemove', handleMouseMove);
    canvas.parentElement.addEventListener('mouseleave', handleMouseLeave);
    
    drawParticles();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      if (canvas.parentElement) {
        canvas.parentElement.removeEventListener('mousemove', handleMouseMove);
        canvas.parentElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <div className="hero-container" ref={containerRef} style={{ position: 'relative' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />
      <section className="hero-banner" id="featured-hero" style={{ position: 'relative', zIndex: 10 }}>
        <div className="hero-content">
          <div className="reveal-wrapper" style={{ marginBottom: '0.75rem' }}>
            <span className="hero-badge reveal-text-mask" id="hero-badge-title" style={{ animationDelay: '0.1s' }}>
              Exclusive Titanium Future
            </span>
          </div>
          
          <div className="reveal-wrapper" style={{ display: 'block', marginBottom: '1.5rem' }}>
            <h1 className="hero-title reveal-text-mask" id="hero-heading" style={{ animationDelay: '0.25s' }}>
              Next-Gen
              <br />
              Smartphones
            </h1>
          </div>

          <p className="hero-desc" id="hero-subtext">
            Discover the world's finest flagship smartphones — powered by cutting-edge chips, pro-grade cameras, and all-day batteries. Explore our curated collection and find your perfect device.
          </p>
          
          <button ref={buttonRef} className="hero-btn" id="hero-cta-btn" onClick={onExplore}>
            Explore Store
            <ArrowRight width="18" height="18" strokeWidth={2.5} style={{ marginLeft: '0.4rem' }} />
          </button>
        </div>
        
        <div className="hero-visual" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AuroraVisual />
        </div>
      </section>
    </div>
  );
};
