import { useEffect, useState } from 'react';
import { WS_URL } from '../config/api';
import { emitRealtimeMessage } from '../realtime/events';

function readToken() {
  return (localStorage.getItem('token') || '').trim();
}

export default function RealtimeNotificationsBridge() {
  const [token, setToken] = useState(readToken());

  useEffect(() => {
    const syncToken = () => {
      const next = readToken();
      setToken(prev => (prev === next ? prev : next));
    };

    // same-tab login/logout won't trigger "storage", so poll lightly.
    const timer = setInterval(syncToken, 1500);
    window.addEventListener('storage', syncToken);
    window.addEventListener('focus', syncToken);

    return () => {
      clearInterval(timer);
      window.removeEventListener('storage', syncToken);
      window.removeEventListener('focus', syncToken);
    };
  }, []);

  useEffect(() => {
    if (!token || !WS_URL) {
      return undefined;
    }

    let closedByUnmount = false;
    let reconnectTimer = null;
    let retryCount = 0;
    let ws = null;

    const clearReconnect = () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    const connect = () => {
      clearReconnect();
      ws?.close();
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        retryCount = 0;
        console.log('[WebRealtime] connected');
        ws?.send(JSON.stringify({ type: 'auth', token }));
      };

      ws.onmessage = event => {
        try {
          const message = JSON.parse(String(event.data));
          if (!message) {
            return;
          }
          if (message.type === 'auth') {
            console.log('[WebRealtime] auth:', message.status || 'unknown');
            return;
          }
          if (message.type === 'ping') {
            return;
          }
          console.log('[WebRealtime] message:', message.type);
          emitRealtimeMessage(message);
        } catch {
          // ignore malformed payloads
        }
      };

      ws.onclose = () => {
        if (closedByUnmount) {
          return;
        }
        console.log('[WebRealtime] disconnected, retrying...');
        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
        retryCount += 1;
        reconnectTimer = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      closedByUnmount = true;
      clearReconnect();
      ws?.close();
    };
  }, [token]);

  return null;
}
