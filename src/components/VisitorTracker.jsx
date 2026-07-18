import { useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';

// Generates or reuses a persistent session ID for this browser tab
const getSessionId = () => {
  let id = sessionStorage.getItem('aura_visitor_sid');
  if (!id) {
    id = 'vis-' + Math.random().toString(36).slice(2, 11) + '-' + Date.now().toString(36);
    sessionStorage.setItem('aura_visitor_sid', id);
  }
  return id;
};

const PAGE_LABELS = {
  storefront: 'Storefront',
  checkout:   'Checkout',
  tracking:   'Order Tracker',
  history:    'Order History',
  profile:    'My Profile',
  success:    'Order Success',
  admin:      'Admin Panel',
};

export const VisitorTracker = () => {
  const { currentView } = useStore();
  const geoRef  = useRef(null);   // cached geo data
  const sentRef = useRef(false);  // whether first beat was sent

  // Step 1: fetch public IP → resolve geo once on mount
  useEffect(() => {
    const resolveGeo = async () => {
      try {
        // Get public IP
        const ipRes  = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(4000) });
        const { ip } = await ipRes.json();

        // Resolve geo from IP
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,lat,lon,countryCode`, { signal: AbortSignal.timeout(4000) });
        const geo    = await geoRes.json();

        geoRef.current = {
          country:     geo.country     || 'Unknown',
          city:        geo.city        || 'Unknown',
          lat:         geo.lat         || 0,
          lon:         geo.lon         || 0,
          countryCode: geo.countryCode || '--',
        };
      } catch {
        // Fallback if geo fails — still track with unknown location
        geoRef.current = { country: 'Unknown', city: 'Unknown', lat: 0, lon: 0, countryCode: '--' };
      }
    };
    resolveGeo();
  }, []);

  // Step 2: send heartbeat whenever view changes or on 20s interval
  useEffect(() => {
    const sendBeat = async () => {
      // Wait until geo is resolved (up to 5s)
      if (!geoRef.current && !sentRef.current) {
        await new Promise(r => setTimeout(r, 2000));
      }
      const geo = geoRef.current || { country: 'Unknown', city: 'Unknown', lat: 0, lon: 0, countryCode: '--' };

      try {
        await fetch('/api/track-visit', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: getSessionId(),
            page:      PAGE_LABELS[currentView] || currentView,
            ...geo,
          }),
          keepalive: true,
        });
        sentRef.current = true;
      } catch {
        // Silent — never break the storefront for tracking errors
      }
    };

    sendBeat(); // immediate beat on view change
    const interval = setInterval(sendBeat, 20000); // heartbeat every 20s
    return () => clearInterval(interval);
  }, [currentView]);

  return null; // renders nothing — purely a background tracker
};
