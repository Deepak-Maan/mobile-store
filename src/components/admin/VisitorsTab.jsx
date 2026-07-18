import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Globe, Monitor, Smartphone, Flag, RefreshCw, Users, MapPin, Clock, ShieldAlert, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmtDuration = (ms) => {
  const s = Math.floor(ms / 1000);
  if (s < 60)  return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60)  return `${m}m ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
};

const latLonToVec3 = (lat, lon, r = 1.02) => {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
};

const FLAG_MAP = {
  IN: '🇮🇳', US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', FR: '🇫🇷', CN: '🇨🇳',
  JP: '🇯🇵', AU: '🇦🇺', CA: '🇨🇦', BR: '🇧🇷', RU: '🇷🇺', '--': '🌐',
};
const flag = (code) => FLAG_MAP[code] || '🌐';

// ── Three.js Globe ────────────────────────────────────────────────────────────
const GlobeCanvas = ({ sessions }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef({});

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const w = el.clientWidth, h = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0, 2.8);

    // Globe sphere
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshPhongMaterial({
        color:     0x0a0f1e,
        emissive:  0x040810,
        shininess: 40,
        transparent: true,
        opacity: 0.95,
      })
    );
    scene.add(sphere);

    // Wireframe grid (latitude/longitude lines)
    const grid = new THREE.Mesh(
      new THREE.SphereGeometry(1.001, 32, 32),
      new THREE.MeshBasicMaterial({
        color:       0x1a2540,
        wireframe:   true,
        transparent: true,
        opacity:     0.18,
      })
    );
    scene.add(grid);

    // Atmosphere glow
    const atmo = new THREE.Mesh(
      new THREE.SphereGeometry(1.08, 64, 64),
      new THREE.MeshBasicMaterial({
        color:       0x1a3a6b,
        transparent: true,
        opacity:     0.12,
        side:        THREE.BackSide,
      })
    );
    scene.add(atmo);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    const dirLight = new THREE.DirectionalLight(0x6366f1, 1.2);
    dirLight.position.set(3, 2, 3);
    const rimLight = new THREE.DirectionalLight(0xec4899, 0.4);
    rimLight.position.set(-3, -1, -2);
    scene.add(ambient, dirLight, rimLight);

    // Visitor dots
    const dotGroup = new THREE.Group();
    const dotGeo = new THREE.SphereGeometry(0.018, 8, 8);

    sessions.forEach(s => {
      if (!s.lat && !s.lon) return;
      const mat = new THREE.MeshBasicMaterial({
        color: s.flagged ? 0xef4444 : 0x22c55e,
      });
      const dot = new THREE.Mesh(dotGeo, mat);
      const pos = latLonToVec3(s.lat, s.lon);
      dot.position.copy(pos);
      dotGroup.add(dot);

      // Pulse ring around each dot
      const ringGeo = new THREE.RingGeometry(0.022, 0.038, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: s.flagged ? 0xef4444 : 0x22c55e,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.lookAt(0, 0, 0);
      ring.userData.isPulse = true;
      ring.userData.phase   = Math.random() * Math.PI * 2;
      dotGroup.add(ring);
    });
    scene.add(dotGroup);

    sceneRef.current = { renderer, scene, camera, dotGroup };

    // Mouse drag rotation
    let isDragging = false, prevX = 0, prevY = 0;
    let rotX = 0, rotY = 0, velX = 0, velY = 0;

    const onDown = (e) => { isDragging = true; prevX = e.clientX; prevY = e.clientY; };
    const onUp   = () => { isDragging = false; };
    const onMove = (e) => {
      if (!isDragging) return;
      velX = (e.clientX - prevX) * 0.003;
      velY = (e.clientY - prevY) * 0.003;
      rotY += velX; rotX += velY;
      prevX = e.clientX; prevY = e.clientY;
    };
    renderer.domElement.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);

    let frame;
    const animate = () => {
      frame = requestAnimationFrame(animate);

      if (!isDragging) {
        rotY  += 0.0018;
        velX  *= 0.94;
        velY  *= 0.94;
        rotY  += velX;
        rotX  += velY;
      }

      rotX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotX));
      sphere.rotation.y = rotY;
      sphere.rotation.x = rotX;
      grid.rotation.y   = rotY;
      grid.rotation.x   = rotX;
      dotGroup.rotation.y = rotY;
      dotGroup.rotation.x = rotX;

      // Pulse rings
      const t = performance.now() * 0.001;
      dotGroup.children.forEach(child => {
        if (child.userData.isPulse) {
          const scale = 1 + 0.6 * Math.abs(Math.sin(t * 1.8 + child.userData.phase));
          child.scale.setScalar(scale);
          child.material.opacity = 0.35 * (1 - (scale - 1) / 0.6);
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      const nw = el.clientWidth, nh = el.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frame);
      renderer.domElement.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, [sessions]);

  return (
    <div ref={mountRef} style={{ width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden', cursor: 'grab' }} />
  );
};

// ── Main Tab ─────────────────────────────────────────────────────────────────
export const VisitorsTab = () => {
  const { addToast } = useStore();
  const [sessions,  setSessions]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [flagging,  setFlagging]  = useState(null);
  const tickRef = useRef(null);

  const fetchSessions = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const token = sessionStorage.getItem('mobile_store_admin_token');
    try {
      const res  = await fetch('/api/admin/visitors', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setSessions(data.sessions || []);
    } catch {
      if (!silent) addToast('Failed to load visitor data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(() => fetchSessions(true), 10000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  // Ticker: update durations every second
  const [, forceRender] = useState(0);
  useEffect(() => {
    tickRef.current = setInterval(() => forceRender(n => n + 1), 1000);
    return () => clearInterval(tickRef.current);
  }, []);

  const flagSession = async (sessionId) => {
    setFlagging(sessionId);
    const token = sessionStorage.getItem('mobile_store_admin_token');
    try {
      const res  = await fetch(`/api/admin/visitors/${sessionId}/flag`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.flagged ? '🚩 Session flagged as suspicious.' : '✅ Flag removed.', data.flagged ? 'error' : 'success');
        fetchSessions(true);
      }
    } catch {
      addToast('Failed to flag session.', 'error');
    } finally {
      setFlagging(null);
    }
  };

  const totalLive    = sessions.length;
  const flaggedCount = sessions.filter(s => s.flagged).length;
  const countries    = new Set(sessions.map(s => s.countryCode)).size;
  const avgDuration  = totalLive > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (Date.now() - s.startedAt), 0) / totalLive)
    : 0;

  const statCards = [
    { icon: Users,      label: 'Live Visitors',  value: totalLive,          color: '#22c55e', glow: 'rgba(34,197,94,0.2)'   },
    { icon: Globe,      label: 'Countries',       value: countries,          color: '#6366f1', glow: 'rgba(99,102,241,0.2)'  },
    { icon: ShieldAlert,label: 'Flagged',         value: flaggedCount,       color: '#ef4444', glow: 'rgba(239,68,68,0.2)'   },
    { icon: Clock,      label: 'Avg Duration',    value: fmtDuration(avgDuration), color: '#f59e0b', glow: 'rgba(245,158,11,0.2)' },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '1rem' }}>
        <Globe size={28} style={{ color: 'var(--primary)', animation: 'spin 2s linear infinite' }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading visitor data…</span>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(99,102,241,0.2))', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe size={20} color="#22c55e" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.45rem', color: '#fff', margin: 0, letterSpacing: '-0.4px' }}>
              Live Visitors
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', animation: 'pulse 2s infinite' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Live · refreshes every 10s</span>
            </div>
          </div>
        </div>
        <button onClick={() => fetchSessions()} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        {statCards.map(({ icon: Icon, label, value, color, glow }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.85rem', boxShadow: `0 2px 16px ${glow}` }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '9px', background: `${color}18`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={17} color={color} />
            </div>
            <div>
              <div style={{ fontSize: label === 'Avg Duration' ? '1rem' : '1.5rem', fontWeight: '800', color: '#fff', lineHeight: 1.1 }}>{value}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Globe + Table ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1rem', alignItems: 'start' }}>

        {/* Globe */}
        <div style={{ background: 'rgba(5,8,20,0.8)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: '16px', overflow: 'hidden', height: '380px', position: 'relative' }}>
          {/* Drag hint */}
          <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', zIndex: 2, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', padding: '3px 8px', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
            🖱 Drag to rotate
          </div>
          {/* Country dots legend */}
          <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', zIndex: 2, display: 'flex', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', padding: '3px 8px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Active</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', padding: '3px 8px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Flagged</span>
            </div>
          </div>
          {sessions.length === 0 ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
              <Globe size={40} style={{ opacity: 0.15 }} />
              <span style={{ fontSize: '0.8rem' }}>No active visitors</span>
            </div>
          ) : (
            <GlobeCanvas sessions={sessions} />
          )}
        </div>

        {/* Session Table */}
        <div style={{ background: 'rgba(10,10,18,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Active Sessions</span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{totalLive} live</span>
          </div>

          {/* Rows */}
          <div style={{ maxHeight: '330px', overflowY: 'auto' }}>
            <AnimatePresence>
              {sessions.length === 0 ? (
                <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.3 }}>🌐</div>
                  No active sessions right now
                </div>
              ) : sessions.map((s, i) => {
                const durationMs = Date.now() - s.startedAt;
                const isIdle     = (Date.now() - s.lastSeen) > 25000;
                const statusColor = s.flagged ? '#ef4444' : isIdle ? '#f59e0b' : '#22c55e';
                const statusLabel = s.flagged ? 'Flagged' : isIdle ? 'Idle' : 'Active';

                return (
                  <motion.div
                    key={s.sessionId}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18, delay: i * 0.03 }}
                    style={{
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: s.flagged ? 'rgba(239,68,68,0.04)' : 'transparent',
                      display: 'flex', flexDirection: 'column', gap: '0.4rem',
                    }}
                  >
                    {/* Row 1: status dot + IP + location + flag btn */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor, boxShadow: `0 0 6px ${statusColor}`, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>{s.ip}</span>
                      <span style={{ fontSize: '0.75rem' }}>{flag(s.countryCode)}</span>
                      <span style={{ fontSize: '0.7rem', color: '#fff', fontWeight: '600' }}>{s.city}, {s.country}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '0.6rem', padding: '1px 7px', borderRadius: '999px', fontWeight: '700', background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}33` }}>{statusLabel}</span>
                      <button
                        onClick={() => flagSession(s.sessionId)}
                        disabled={flagging === s.sessionId}
                        title={s.flagged ? 'Unflag' : 'Flag as suspicious'}
                        style={{ background: s.flagged ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)', border: `1px solid ${s.flagged ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '6px', padding: '3px 7px', cursor: 'pointer', color: s.flagged ? '#ef4444' : 'var(--text-muted)', fontSize: '0.68rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                      >
                        {flagging === s.sessionId ? <RefreshCw size={9} className="animate-spin" /> : <Flag size={9} />}
                        {s.flagged ? 'Unflag' : 'Flag'}
                      </button>
                    </div>

                    {/* Row 2: device + page + duration */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', paddingLeft: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {s.device === 'Mobile' ? <Smartphone size={10} color="var(--text-muted)" /> : <Monitor size={10} color="var(--text-muted)" />}
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{s.os} · {s.browser}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Eye size={10} color="var(--text-muted)" />
                        <span style={{ fontSize: '0.65rem', color: '#6366f1', fontWeight: '600' }}>{s.page}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }}>
                        <Clock size={10} color="var(--text-muted)" />
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{fmtDuration(durationMs)}</span>
                      </div>
                    </div>

                    {/* Row 3: pages visited */}
                    {s.pagesVisited?.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', paddingLeft: '1rem', flexWrap: 'wrap' }}>
                        <MapPin size={9} color="var(--text-muted)" />
                        {s.pagesVisited.map((p, pi) => (
                          <span key={pi} style={{ fontSize: '0.6rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '4px', padding: '1px 5px', color: 'var(--text-muted)' }}>{p}</span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
