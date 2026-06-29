import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeHologram = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    
    // Transparent background
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 13;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- Hologram Smartphone Model Group ---
    const phoneGroup = new THREE.Group();
    scene.add(phoneGroup);

    // 1. Outer Frame (Bezel outline)
    const bezelGeo = new THREE.BoxGeometry(4.2, 8.2, 0.45);
    const bezelMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1, // primary indigo glow
      wireframe: true,
      transparent: true,
      opacity: 0.75
    });
    const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
    phoneGroup.add(bezelMesh);

    // 2. Inner Digital Screen (Glowing glass effect)
    const screenGeo = new THREE.PlaneGeometry(3.9, 7.9);
    const screenMat = new THREE.MeshBasicMaterial({
      color: 0xec4899, // secondary pink glow
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    // Offset slightly forward to prevent z-fighting
    screenMesh.position.z = 0.02;
    phoneGroup.add(screenMesh);

    // 3. Screen Grid Overlay (Data nodes)
    const gridGeo = new THREE.PlaneGeometry(3.9, 7.9, 12, 24);
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const gridMesh = new THREE.Mesh(gridGeo, gridMat);
    gridMesh.position.z = 0.03;
    phoneGroup.add(gridMesh);

    // 4. Rear Pro Camera Lenses (Holographic cylinders)
    const cameraIsletGeo = new THREE.BoxGeometry(1.8, 1.8, 0.2);
    const cameraIsletMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    const cameraIslet = new THREE.Mesh(cameraIsletGeo, cameraIsletMat);
    cameraIslet.position.set(-0.8, 2.5, -0.23);
    phoneGroup.add(cameraIslet);

    // Three rear lens cylinders
    const lensGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 16);
    const lensMat = new THREE.MeshBasicMaterial({
      color: 0xec4899,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });

    const lensLocations = [
      { x: -0.8, y: 2.9 },
      { x: -0.8, y: 2.1 },
      { x: -0.45, y: 2.5 }
    ];

    lensLocations.forEach((loc) => {
      const lens = new THREE.Mesh(lensGeo, lensMat);
      lens.rotation.x = Math.PI / 2;
      lens.position.set(loc.x, loc.y, -0.34);
      phoneGroup.add(lens);
    });

    // 5. Floating Orbital Data Stream (Particle ring)
    const particleCount = 180;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Create a rotating ring shape of points surrounding the phone
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 5.2 + Math.random() * 0.8;
      
      // Ring lies on the X-Z plane with minor random elevation Y
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      // Gradient color from Indigo to Pink
      const colorRatio = i / particleCount;
      colors[i * 3] = 0.38 + colorRatio * 0.5; // red component
      colors[i * 3 + 1] = 0.4;
      colors[i * 3 + 2] = 0.94 - colorRatio * 0.4; // blue component
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Points Material
    const pointsMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    const particleSystem = new THREE.Points(particlesGeo, pointsMat);
    scene.add(particleSystem);

    // --- Interactive Drag & Tilt Controls ---
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    // Inertia rotation targets
    const targetRotation = { x: 0.3, y: -0.5 };
    const currentRotation = { x: 0.3, y: -0.5 };

    // Tilt relative to mouse position
    const screenMouse = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      // 1. Mouse Drag to spin model in 3D
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        targetRotation.y += deltaX * 0.007;
        targetRotation.x += deltaY * 0.007;

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }

      // 2. Global mouse tracking to apply a minor visual tilt skew
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      screenMouse.x = (x / rect.width) * 2 - 1;
      screenMouse.y = -(y / rect.height) * 2 + 1;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    // Touch Support
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;

        targetRotation.y += deltaX * 0.009;
        targetRotation.x += deltaY * 0.009;

        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);

    // --- Resize Handler ---
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- Animation Loop ---
    let animFrameId;
    let time = 0;

    const animate = () => {
      time += 0.005;

      // Auto rotation orbit (only rotates when user is not dragging)
      if (!isDragging) {
        targetRotation.y += 0.004;
      }

      // Smoothly interpolate current rotation to target with damping
      currentRotation.x += (targetRotation.x - currentRotation.x) * 0.08;
      currentRotation.y += (targetRotation.y - currentRotation.y) * 0.08;

      // Apply rotations
      phoneGroup.rotation.x = currentRotation.x;
      phoneGroup.rotation.y = currentRotation.y;
      
      // Apply minor mouse tilt deflection
      if (!isDragging) {
        phoneGroup.rotation.y += screenMouse.x * 0.15;
        phoneGroup.rotation.x += screenMouse.y * 0.15;
      }

      // Rotate orbital data stream ring in opposite direction
      particleSystem.rotation.y = -time * 0.8;
      particleSystem.rotation.x = Math.sin(time * 0.2) * 0.15;

      // Bobbing floating motion
      phoneGroup.position.y = Math.sin(time * 1.5) * 0.25;

      // Sparkle/Glow effect: oscillate screen opacity
      screenMat.opacity = 0.10 + Math.sin(time * 3) * 0.04;
      bezelMat.opacity = 0.65 + Math.sin(time * 2) * 0.15;

      renderer.render(scene, camera);
      animFrameId = requestAnimationFrame(animate);
    };
    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      
      scene.clear();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="three-hologram-container"
      style={{
        width: '100%',
        height: '420px',
        position: 'relative',
        cursor: 'grab'
      }}
    />
  );
};
