import { useEffect, useRef, useCallback } from 'react';

const WARNING_MS = 25 * 60 * 1000;
const LOGOUT_MS  = 30 * 60 * 1000;

export function useSessionTimeout(onWarning, onLogout) {
  const warnTimer   = useRef(null);
  const logoutTimer = useRef(null);

  const reset = useCallback(() => {
    clearTimeout(warnTimer.current);
    clearTimeout(logoutTimer.current);
    warnTimer.current   = setTimeout(onWarning, WARNING_MS);
    logoutTimer.current = setTimeout(onLogout,  LOGOUT_MS);
  }, [onWarning, onLogout]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      clearTimeout(warnTimer.current);
      clearTimeout(logoutTimer.current);
    };
  }, [reset]);

  return reset;
}
