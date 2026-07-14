import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export const WebGLDisplacementSlider = ({ activeIndex, slides, isMobile }) => {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const programRef = useRef(null);
  const texturesRef = useRef([]);
  const transitionRef = useRef({ progress: 0 });
  const prevIndexRef = useRef(activeIndex);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Load and cache all textures
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }
    glRef.current = gl;

    // --- Shaders ---
    const vertexShaderSrc = `
      attribute vec2 aPosition;
      attribute vec2 aUv;
      varying vec2 vUv;
      void main() {
        vUv = aUv;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fragmentShaderSrc = `
      precision mediump float;
      varying vec2 vUv;
      uniform sampler2D uTexturePrev;
      uniform sampler2D uTextureActive;
      uniform float uProgress;
      
      // Simplex 2D noise generator for organic liquid shifting
      vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                 -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
          dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 a0 = x - floor(x + 0.5);
        vec3 g = a0.xyw * vec3(m.x, x12.xz) + h.xyw * vec3(m.y, x12.yw);
        g.z = a0.z * m.z + h.z * x12.y;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = vUv;
        
        // Compute wave ripple displacement
        float noise = snoise(uv * 4.5 + vec2(0.0, uProgress * 1.8));
        float wave = sin(uv.y * 12.0 + uProgress * 6.28) * 0.04 * uProgress * (1.0 - uProgress);
        
        // Offset mapping coordinates
        vec2 uvPrev = vec2(uv.x + wave + noise * 0.06 * uProgress, uv.y + wave);
        vec2 uvActive = vec2(uv.x - wave - noise * 0.06 * (1.0 - uProgress), uv.y - wave);
        
        // Clip coordinates check to avoid visual artifacts
        vec4 colorPrev = (uvPrev.x >= 0.0 && uvPrev.x <= 1.0 && uvPrev.y >= 0.0 && uvPrev.y <= 1.0) 
          ? texture2D(uTexturePrev, uvPrev) 
          : vec4(0.0);
        vec4 colorActive = (uvActive.x >= 0.0 && uvActive.x <= 1.0 && uvActive.y >= 0.0 && uvActive.y <= 1.0) 
          ? texture2D(uTextureActive, uvActive) 
          : vec4(0.0);
        
        // Liquid crossfade mix
        gl_FragColor = mix(colorPrev, colorActive, uProgress);
      }
    `;

    const createShader = (src, type) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(sh));
      }
      return sh;
    };

    const vs = createShader(vertexShaderSrc, gl.VERTEX_SHADER);
    const fs = createShader(fragmentShaderSrc, gl.FRAGMENT_SHADER);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(prog));
    }
    programRef.current = prog;

    // --- Quad geometry definition ---
    const vertices = new Float32Array([
      -1,  1,   0, 0,
      -1, -1,   0, 1,
       1,  1,   1, 0,
       1, -1,   1, 1,
    ]);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'aPosition');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);

    const aUv = gl.getAttribLocation(prog, 'aUv');
    gl.enableVertexAttribArray(aUv);
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);

    // --- Texture Loading ---
    const loadTexture = (url) => {
      return new Promise((resolve) => {
        const tex = gl.createTexture();
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = url;
        img.onload = () => {
          gl.bindTexture(gl.TEXTURE_2D, tex);
          
          // WebGL Texture settings
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          resolve(tex);
        };
      });
    };

    // Load all slides
    Promise.all(slides.map(s => loadTexture(s.image))).then((loadedTextures) => {
      texturesRef.current = loadedTextures;
      setImagesLoaded(true);
    });

    return () => {
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      texturesRef.current.forEach(t => gl.deleteTexture(t));
    };
  }, [slides]);

  // Size handler and render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imagesLoaded) return;
    const gl = glRef.current;

    const resize = () => {
      const w = isMobile ? 220 : 340;
      const h = isMobile ? 440 : 640;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    };
    resize();
    window.addEventListener('resize', resize);

    // Render loop function
    let animId;
    const render = () => {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(programRef.current);

      // Texture bindings
      const prevTex = texturesRef.current[prevIndexRef.current];
      const activeTex = texturesRef.current[activeIndex];

      if (prevTex && activeTex) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, prevTex);
        gl.uniform1i(gl.getUniformLocation(programRef.current, 'uTexturePrev'), 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, activeTex);
        gl.uniform1i(gl.getUniformLocation(programRef.current, 'uTextureActive'), 1);

        gl.uniform1f(gl.getUniformLocation(programRef.current, 'uProgress'), transitionRef.current.progress);
      }

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [activeIndex, imagesLoaded, isMobile]);

  // Handle slide index transitions
  useEffect(() => {
    if (!imagesLoaded) return;

    // Trigger liquid distortion sweep using GSAP to transition progress variable
    transitionRef.current.progress = 0;
    gsap.to(transitionRef.current, {
      progress: 1,
      duration: 0.85,
      ease: 'power2.inOut',
      onComplete: () => {
        prevIndexRef.current = activeIndex;
      }
    });
  }, [activeIndex, imagesLoaded]);

  return (
    <div
      style={{
        position: 'relative',
        width: isMobile ? '220px' : '340px',
        height: isMobile ? '440px' : '640px',
        borderRadius: isMobile ? '36px' : '50px',
        border: '3px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 45px 120px rgba(0,0,0,0.85), inset 0 2px 8px rgba(255,255,255,0.1)',
        background: '#07070a',
        overflow: 'hidden',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Absolute canvas container */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          position: 'absolute',
          inset: 0,
        }}
      />

      {/* Floating shine layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />
    </div>
  );
};
