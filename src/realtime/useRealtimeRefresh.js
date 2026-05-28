import { useEffect, useRef } from 'react';
import { REALTIME_EVENT } from './events';

/**
 * Subscribe to global realtime events and call `refresh` when `shouldRefresh` matches.
 */
export default function useRealtimeRefresh(refresh, shouldRefresh) {
  const refreshRef = useRef(refresh);
  const predicateRef = useRef(shouldRefresh);

  refreshRef.current = refresh;
  predicateRef.current = shouldRefresh;

  useEffect(() => {
    const onRealtime = event => {
      const payload = event?.detail;
      if (predicateRef.current?.(payload) !== true) {
        return;
      }
      refreshRef.current?.();
    };

    window.addEventListener(REALTIME_EVENT, onRealtime);
    return () => window.removeEventListener(REALTIME_EVENT, onRealtime);
  }, []);
}
