import { useEffect } from 'react';
import { WS_URL } from '../config/api';
import { emitRealtimeMessage } from '../realtime/events';

export default function RealtimeNotificationsBridge() {
  useEffect(() => {
    const token = (localStorage.getItem('token') || '').trim();
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
        ws?.send(JSON.stringify({ type: 'auth', token }));
      };

      ws.onmessage = event => {
        try {
          const message = JSON.parse(String(event.data));
          if (!message || message.type === 'auth' || message.type === 'ping') {
            return;
          }
          emitRealtimeMessage(message);
        } catch {
          // ignore malformed payloads
        }
      };

      ws.onclose = () => {
        if (closedByUnmount) {
          return;
        }
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
  }, []);

  return null;
}
