import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../../context/StoreContext';
import { Cpu, Activity, RefreshCw, Layers, Database, Gauge, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const SystemTab = () => {
  const { addToast } = useStore();
  
  const [metrics, setMetrics] = useState({
    uptime: 0,
    memory: { rss: 0, heapTotal: 0, heapUsed: 0 },
    dbSize: 0,
    catalogSize: 0,
    shoppersCount: 0,
    ordersCount: 0,
    cpuLoad: 0,
    apiLatency: 0
  });

  const [loading, setLoading] = useState(true);
  const [latencyHistory, setLatencyHistory] = useState([20, 25, 18, 30, 22, 28, 24, 19, 21, 23]);
  const [performingAction, setPerformingAction] = useState(null); // 'optimize' | 'cache' | 'benchmark'
  
  const pollIntervalRef = useRef(null);

  const fetchMetrics = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    const token = sessionStorage.getItem('mobile_store_admin_token');
    try {
      const res = await fetch('/api/admin/system-status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
        
        // Update latency sparkline history
        setLatencyHistory(prev => {
          const next = [...prev.slice(1), data.apiLatency];
          return next;
        });
      }
    } catch {
      // suppress warning to keep console clean during dev reloads
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  // Set up polling interval to fetch metrics every 3 seconds
  useEffect(() => {
    fetchMetrics(true);
    
    pollIntervalRef.current = setInterval(() => {
      fetchMetrics();
    }, 3000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [fetchMetrics]);

  const triggerAction = async (action) => {
    setPerformingAction(action);
    const token = sessionStorage.getItem('mobile_store_admin_token');
    try {
      const res = await fetch('/api/admin/system-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      
      const data = await res.json();
      if (res.ok) {
        addToast(data.message, 'success');
        fetchMetrics();
      } else {
        addToast(data.error || 'Operation failed.', 'error');
      }
    } catch {
      addToast('Connection error executing action.', 'error');
    } finally {
      setPerformingAction(null);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--text-muted)' }}>
        <RefreshCw className="animate-spin" style={{ marginBottom: '1rem' }} />
        <span>Initializing telemetry probes...</span>
      </div>
    );
  }

  // Calculate memory ratios
  const ramPercent = Math.min(100, Math.round((metrics.memory.heapUsed / metrics.memory.heapTotal) * 100));

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <Activity width="20" height="20" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#fff', margin: 0 }}>
              System Telemetry Monitor
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.1rem 0 0 0' }}>
              Real-time Node process telemetry, memory pool leaks checks, and active memory pools.
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchMetrics(true)}
          disabled={performingAction !== null}
          className="admin-filter-btn"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer',
            background: 'rgba(255,255,255,0.04)', color: '#fff',
            border: '1px solid var(--border-color)', fontWeight: '600',
            fontSize: '0.82rem'
          }}
        >
          <RefreshCw size={14} className={performingAction === 'benchmark' ? 'animate-spin' : ''} />
          Force Telemetry Poll
        </button>
      </div>

      {/* Main Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        
        {/* Metric 1: CPU Load circular dial */}
        <div className="checkout-card" style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(20,20,25,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyCenter: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', marginBottom: '1rem', display: 'block' }}>CPU Telemetry Load</span>
          
          <div style={{ position: 'relative', width: '110px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* SVG circle meter */}
            <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="55" cy="55" r="48" fill="transparent" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
              <motion.circle 
                cx="55" cy="55" r="48" fill="transparent" 
                stroke="var(--primary)" strokeWidth="6" 
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - metrics.cpuLoad / 100)}
                strokeLinecap="round"
                animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - metrics.cpuLoad / 100) }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </svg>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#fff', lineHeight: 1 }}>{metrics.cpuLoad}%</span>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '3px' }}>Active Core</span>
            </div>
          </div>
        </div>

        {/* Metric 2: RAM/Memory Pool Bar */}
        <div className="checkout-card" style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(20,20,25,0.4)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>RAM Pool (Heap)</span>
            <Cpu size={16} color="var(--primary)" />
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '800', color: '#fff', marginBottom: '0.2rem' }}>
              <span>{ramPercent}%</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>{formatBytes(metrics.memory.heapUsed)} / {formatBytes(metrics.memory.heapTotal)}</span>
            </div>
            {/* progress bar */}
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
              <motion.div 
                style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), #a855f7)', borderRadius: '4px' }}
                animate={{ width: `${ramPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.6rem', marginTop: '0.4rem' }}>
            <span>RSS Allocation:</span>
            <span style={{ color: '#fff', fontWeight: '600' }}>{formatBytes(metrics.memory.rss)}</span>
          </div>
        </div>

        {/* Metric 3: Uptime display */}
        <div className="checkout-card" style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(20,20,25,0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Process Uptime</span>
            <Zap size={16} color="#eab308" />
          </div>

          <div style={{ margin: '1rem 0' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#eab308', letterSpacing: '-0.5px', fontFamily: 'monospace' }}>
              {formatUptime(metrics.uptime)}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Telemetric server run duration</span>
          </div>

          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.6rem' }}>
            <span>Telemetry Status:</span>
            <span style={{ color: '#22c55e', fontWeight: '700' }}> ● Operational</span>
          </div>
        </div>

        {/* Metric 4: Database Storage footprint */}
        <div className="checkout-card" style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(20,20,25,0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Database Footprint</span>
            <Database size={16} color="#ec4899" />
          </div>

          <div style={{ margin: '1rem 0' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#fff' }}>
              {formatBytes(metrics.dbSize)}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Size of db.json storage file</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.6rem' }}>
            <span>Database Records Count:</span>
            <span style={{ color: '#fff', fontWeight: '600' }}>
              {metrics.catalogSize} products | {metrics.ordersCount} orders
            </span>
          </div>
        </div>

      </div>

      {/* Latency History and Maintenance Tools */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Latency Sparkline */}
        <div className="checkout-card" style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(20,20,25,0.4)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>API Network Latency</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: '700' }}>Current: {metrics.apiLatency}ms</span>
          </div>

          {/* Sparkline canvas graph */}
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '80px', gap: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', padding: '0.5rem 0.8rem', overflow: 'hidden' }}>
            {latencyHistory.map((l, idx) => {
              // map latency to height (max latency cap 60ms)
              const heightPercent = Math.min(100, Math.round((l / 60) * 100));
              return (
                <div key={idx} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end' }}>
                  <motion.div 
                    style={{
                      width: '100%',
                      height: `${heightPercent}%`,
                      background: l > 35 ? '#ef4444' : l > 25 ? '#f97316' : '#6366f1',
                      borderRadius: '2px',
                      boxShadow: l > 35 ? '0 0 8px rgba(239, 68, 68, 0.4)' : '0 0 10px rgba(99, 102, 241, 0.35)'
                    }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  />
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            <span>10 Polls History (30s)</span>
            <span>Target: &lt; 50ms</span>
          </div>
        </div>

        {/* Maintenance Controls */}
        <div className="checkout-card" style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(20,20,25,0.4)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', marginBottom: '0.2rem' }}>Server Maintenance Console</span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            
            {/* Button 1: Optimize Database */}
            <button
              onClick={() => triggerAction('optimize')}
              disabled={performingAction !== null}
              style={{
                display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '0.85rem',
                padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.02)', color: '#fff', cursor: 'pointer', outline: 'none',
                fontSize: '0.82rem', fontWeight: '600', transition: 'background 0.2s', width: '100%', textAlign: 'left'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            >
              <Database size={16} color="var(--primary)" />
              <div style={{ flex: 1 }}>
                <div>Optimize Database</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>Rebuild indexes and compact json records.</div>
              </div>
              {performingAction === 'optimize' ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} color="var(--primary)" />}
            </button>

            {/* Button 2: Purge Cache */}
            <button
              onClick={() => triggerAction('clear-cache')}
              disabled={performingAction !== null}
              style={{
                display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '0.85rem',
                padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.02)', color: '#fff', cursor: 'pointer', outline: 'none',
                fontSize: '0.82rem', fontWeight: '600', transition: 'background 0.2s', width: '100%', textAlign: 'left'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(168, 85, 247, 0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            >
              <Layers size={16} color="#a855f7" />
              <div style={{ flex: 1 }}>
                <div>Clear Server Cache</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>Flush static page buffers and asset stores.</div>
              </div>
              {performingAction === 'clear-cache' ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} color="#a855f7" />}
            </button>

            {/* Button 3: Latency Diagnostics */}
            <button
              onClick={() => triggerAction('benchmark')}
              disabled={performingAction !== null}
              style={{
                display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '0.85rem',
                padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.02)', color: '#fff', cursor: 'pointer', outline: 'none',
                fontSize: '0.82rem', fontWeight: '600', transition: 'background 0.2s', width: '100%', textAlign: 'left'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(236, 72, 153, 0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            >
              <Gauge size={16} color="#ec4899" />
              <div style={{ flex: 1 }}>
                <div>Run Diagnostics Benchmark</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>Test telemetric loop and report pings.</div>
              </div>
              {performingAction === 'benchmark' ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} color="#ec4899" />}
            </button>

          </div>
        </div>

      </div>

    </div>
  );
};
