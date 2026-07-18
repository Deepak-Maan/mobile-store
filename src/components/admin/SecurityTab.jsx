import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Lock, Plus, Trash2, Globe, ShieldCheck, KeyRound } from 'lucide-react';

export const SecurityTab = () => {
  const { addToast, clientIPInfo } = useStore();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    ipWhitelistEnabled: false,
    whitelistedIPs: ['127.0.0.1'],
    geofencingEnabled: false,
    blockedCountries: ['CN', 'KP', 'RU'],
    twoFactorSecret: 'KVKVEV2JKREU2UKKKBJE4V2KGNGEOT2L'
  });

  const [newIp, setNewIp] = useState('');
  const [newCountry, setNewCountry] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      const token = sessionStorage.getItem('mobile_store_admin_token');
      try {
        const res = await fetch('/api/admin/security-settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch {
        addToast('Failed to load security settings.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [addToast]);

  const saveSettings = async (updated) => {
    const token = sessionStorage.getItem('mobile_store_admin_token');
    try {
      const res = await fetch('/api/admin/security-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        addToast('Security policies updated successfully.', 'success');
      }
    } catch {
      addToast('Failed to update security policies.', 'error');
    }
  };

  const handleToggleIpWhitelist = () => {
    const updated = { ...settings, ipWhitelistEnabled: !settings.ipWhitelistEnabled };
    saveSettings(updated);
  };

  const handleToggleGeofence = () => {
    const updated = { ...settings, geofencingEnabled: !settings.geofencingEnabled };
    saveSettings(updated);
  };

  const handleAddIp = (e) => {
    e.preventDefault();
    if (!newIp.trim()) return;
    
    // Simple IP validator regex (supports IPv4 and basic IPv6 formats)
    const ipPattern = /^([0-9a-fA-F:.]{3,40})$/;
    if (!ipPattern.test(newIp.trim())) {
      addToast('Please enter a valid IP address format.', 'warning');
      return;
    }

    if (settings.whitelistedIPs.includes(newIp.trim())) {
      addToast('IP address is already whitelisted.', 'warning');
      return;
    }

    const updated = {
      ...settings,
      whitelistedIPs: [...settings.whitelistedIPs, newIp.trim()]
    };
    setSettings(updated);
    saveSettings(updated);
    setNewIp('');
  };

  const handleRemoveIp = (ipToRemove) => {
    if (ipToRemove === '127.0.0.1' || ipToRemove === '::1') {
      addToast('Cannot remove default loopback whitelist interfaces.', 'warning');
      return;
    }
    const updated = {
      ...settings,
      whitelistedIPs: settings.whitelistedIPs.filter(ip => ip !== ipToRemove)
    };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleAddCountry = (e) => {
    e.preventDefault();
    const code = newCountry.trim().toUpperCase();
    if (!code || code.length !== 2) {
      addToast('Please enter a valid 2-letter country code.', 'warning');
      return;
    }

    if (settings.blockedCountries.includes(code)) {
      addToast('Country is already restricted.', 'warning');
      return;
    }

    const updated = {
      ...settings,
      blockedCountries: [...settings.blockedCountries, code]
    };
    setSettings(updated);
    saveSettings(updated);
    setNewCountry('');
  };

  const handleRemoveCountry = (codeToRemove) => {
    const updated = {
      ...settings,
      blockedCountries: settings.blockedCountries.filter(c => c !== codeToRemove)
    };
    setSettings(updated);
    saveSettings(updated);
  };

  if (loading) {
    return <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>Retrieving secure configurations...</div>;
  }

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--primary)' }}>
          <Lock width="20" height="20" style={{ margin: 'auto' }} />
        </div>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#fff', margin: 0 }}>
            Security Control Panel
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.1rem 0 0 0' }}>
            Enforce geofencing restrictions, IP access control lists, and multi-factor setup.
          </p>
        </div>
      </div>

      {/* Settings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Section 1: IP Access Whitelisting */}
        <div className="checkout-card" style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(20,20,25,0.4)', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <ShieldCheck size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff', margin: 0 }}>IP Whitelisting</h3>
            </div>
            {/* Toggle switch */}
            <button
              onClick={handleToggleIpWhitelist}
              style={{
                width: '44px', height: '24px', borderRadius: '12px',
                background: settings.ipWhitelistEnabled ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                border: 'none', cursor: 'pointer', position: 'relative', outline: 'none',
                transition: 'background 0.2s', padding: 0
              }}
            >
              <div style={{
                width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                position: 'absolute', top: '3px',
                left: settings.ipWhitelistEnabled ? '23px' : '3px',
                transition: 'left 0.2s'
              }} />
            </button>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Strict IP check blocks all administrative API endpoint operations unless the source IP address matches the lists below.
          </p>

          {/* Current IP Indicator */}
          <div style={{ fontSize: '0.8rem', background: 'rgba(99,102,241,0.08)', border: '1px dashed rgba(99,102,241,0.25)', padding: '0.6rem 0.8rem', borderRadius: '8px', color: '#a5b4fc', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Detected Public IP:</span>
              <strong style={{ fontFamily: 'monospace' }}>{clientIPInfo.ip}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              <span>Geolocation:</span>
              <strong>📍 {clientIPInfo.city}, {clientIPInfo.country}</strong>
            </div>
          </div>

          {/* Whitelisted IPs list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '150px', overflowY: 'auto', paddingRight: '4px' }}>
            {settings.whitelistedIPs.map((ip) => (
              <div key={ip} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.45rem 0.75rem', borderRadius: '8px', fontSize: '0.82rem' }}>
                <span style={{ fontFamily: 'monospace', color: '#e0e7ff' }}>{ip}</span>
                {ip !== '127.0.0.1' && ip !== '::1' && (
                  <button
                    onClick={() => handleRemoveIp(ip)}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: 0 }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add IP input */}
          <form onSubmit={handleAddIp} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="e.g. 192.168.1.100"
              value={newIp}
              onChange={e => setNewIp(e.target.value)}
              style={{ flex: 1, padding: '0.45rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid var(--border-color)' }}
            />
            <button type="submit" className="add-btn" style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={14} />
            </button>
          </form>
        </div>

        {/* Section 2: Geofencing Protection */}
        <div className="checkout-card" style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(20,20,25,0.4)', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Globe size={18} color="#ec4899" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff', margin: 0 }}>Geofencing Rules</h3>
            </div>
            {/* Toggle switch */}
            <button
              onClick={handleToggleGeofence}
              style={{
                width: '44px', height: '24px', borderRadius: '12px',
                background: settings.geofencingEnabled ? '#ec4899' : 'rgba(255,255,255,0.1)',
                border: 'none', cursor: 'pointer', position: 'relative', outline: 'none',
                transition: 'background 0.2s', padding: 0
              }}
            >
              <div style={{
                width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                position: 'absolute', top: '3px',
                left: settings.geofencingEnabled ? '23px' : '3px',
                transition: 'left 0.2s'
              }} />
            </button>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Blocks administrative control console access attempts originating from blacklisted geolocations or country codes.
          </p>

          {/* Blocked Countries list */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', minHeight: '40px' }}>
            {settings.blockedCountries.map((c) => (
              <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', color: '#fca5a5' }}>
                {c}
                <button
                  onClick={() => handleRemoveCountry(c)}
                  style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                >
                  &times;
                </button>
              </span>
            ))}
            {settings.blockedCountries.length === 0 && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No regions restricted.</span>
            )}
          </div>

          {/* Add country input */}
          <form onSubmit={handleAddCountry} style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
            <input
              type="text"
              placeholder="Country Code (e.g. RU, CN)"
              value={newCountry}
              onChange={e => setNewCountry(e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 2))}
              style={{ flex: 1, padding: '0.45rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid var(--border-color)' }}
            />
            <button type="submit" className="add-btn" style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={14} />
            </button>
          </form>
        </div>

        {/* Section 3: Two-Factor Authentication Configuration */}
        <div className="checkout-card" style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(20,20,25,0.4)', display: 'flex', flexDirection: 'column', gap: '1.2rem', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <KeyRound size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff', margin: 0 }}>Two-Factor Authentication (2FA) Config</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'row', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Live QR Code Generator */}
            <div style={{ background: '#fff', padding: '0.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '130px', height: '130px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', flexShrink: 0, overflow: 'hidden' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=115x115&data=${encodeURIComponent(`otpauth://totp/AuraStore:Admin?secret=${settings.twoFactorSecret || 'KVKVEV2JKREU2UKKKBJE4V2KGNGEOT2L'}&issuer=AuraStore`)}`} 
                alt="Scan to set up Admin 2FA" 
                style={{ width: '115px', height: '115px', display: 'block' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Scan the QR code with your authenticator app (Google Authenticator, Microsoft Authenticator) or input the manual security key below to bind.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>2FA Secret Key</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <code style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '0.45rem 1rem', borderRadius: '8px', color: '#a5b4fc', fontSize: '0.85rem', fontFamily: 'monospace', letterSpacing: '1px' }}>
                    {settings.twoFactorSecret}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
