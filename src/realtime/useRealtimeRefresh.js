import { useEffect, useRef } from 'react';
import { REALTIME_EVENT } from './events';

/**
 * Subscribe to global realtime events and call `refresh` when `shouldRefresh` matches.
 */
export default function useRealtimeRefresh(
  refresh,
  shouldRefresh,
  label = 'Realtime',
  debounceMs = 250,
) {
  const refreshRef = useRef(refresh);
  const predicateRef = useRef(shouldRefresh);
  const timerRef = useRef(null);

  refreshRef.current = refresh;
  predicateRef.current = shouldRefresh;

  useEffect(() => {
    const onRealtime = event => {
      const payload = event?.detail;
      if (predicateRef.current?.(payload) !== true) {
        return;
      }
      console.log(`[${label}] refresh by`, payload?.type || 'unknown');
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        refreshRef.current?.();
      }, debounceMs);
    };

    window.addEventListener(REALTIME_EVENT, onRealtime);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      window.removeEventListener(REALTIME_EVENT, onRealtime);
    };
  }, [debounceMs]);
}
