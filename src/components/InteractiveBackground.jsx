import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const InteractiveBackground = () => {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Scene Setup ──
    const scene = new THREE.Scene();
    
    // Add dark cinematic fog
    scene.fog = new THREE.FogExp2(0x0a0a0c, 0.0012);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    camera.position.set(0, 350, 1000);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x060608, 1);
    container.appendChild(renderer.domElement);

    // ── Generate Circular Glowing Point Texture ──
    const generatePointTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
      return new THREE.CanvasTexture(canvas);
    };

    const pointTexture = generatePointTexture();

    // ── Grid Setup (3D Cinematic Wave) ──
    const amountX = 65;
    const amountY = 45;
    const numParticles = amountX * amountY;
    const spacing = 45;

    const positions = new Float32Array(numParticles * 3);
    const colors = new Float32Array(numParticles * 3);

    const colorPrimary = new THREE.Color('#6366f1'); // Indigo
    const colorSecondary = new THREE.Color('#ec4899'); // Pink
    const tempColor = new THREE.Color();

    let i = 0;
    for (let ix = 0; ix < amountX; ix++) {
      for (let iy = 0; iy < amountY; iy++) {
        // Center the grid around origin
        const x = (ix - amountX / 2) * spacing;
        const z = (iy - amountY / 2) * spacing;
        
        positions[i] = x;
        positions[i + 1] = 0; // modulated in render loop
        positions[i + 2] = z;

        // Gradient blend based on position
        const t = ix / amountX;
        tempColor.copy(colorPrimary).lerp(colorSecondary, t);
        
        colors[i] = tempColor.r;
        colors[i + 1] = tempColor.g;
        colors[i + 2] = tempColor.b;

        i += 3;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 4.5,
      map: pointTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // ── Mouse & Parallax tracking ──
    const onMouseMove = (e) => {
      mouseRef.current.targetX = (e.clientX - window.innerWidth / 2) * 0.45;
      mouseRef.current.targetY = (e.clientY - window.innerHeight / 2) * 0.35;
    };
    window.addEventListener('mousemove', onMouseMove);

    // ── Resize handler ──
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onWindowResize);

    // ── Animation Loop ──
    let count = 0;
    let animFrame;

    const animate = () => {
      animFrame = requestAnimationFrame(animate);

      count += 0.015;

      // Modulate particle heights (Y positions) using undulating sine waves
      const posAttr = points.geometry.attributes.position;
      let idx = 0;

      for (let ix = 0; ix < amountX; ix++) {
        for (let iy = 0; iy < amountY; iy++) {
          // Complex undulating wave calculation
          const y =
            Math.sin((ix + count) * 0.25) * 45 +
            Math.sin((iy + count) * 0.35) * 45 +
            Math.cos((ix + iy + count) * 0.15) * 30;

          posAttr.array[idx + 1] = y;
          idx += 3;
        }
      }
      posAttr.needsUpdate = true;

      // Smooth camera interpolation for cinematic lag
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // position camera relative to mouse and time
      camera.position.x = mouseRef.current.x;
      camera.position.y = 350 + Math.sin(count * 0.15) * 40 - mouseRef.current.y * 0.5;
      camera.lookAt(new THREE.Vector3(0, -50, 0));

      renderer.render(scene, camera);
    };

    animate();

    // ── Cleanup ──
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onWindowResize);
      cancelAnimationFrame(animFrame);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      pointTexture.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -2,
        pointerEvents: 'none',
        overflow: 'hidden',
        background: '#060608',
      }}
    />
  );
};
