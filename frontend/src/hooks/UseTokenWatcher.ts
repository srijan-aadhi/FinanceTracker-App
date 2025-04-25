// src/hooks/useTokenWatcher.ts
import { useEffect } from 'react';

function getTokenExpiry(token: string): number | null {
  try {
    const [, payload] = token.split('.');
    const { exp } = JSON.parse(atob(payload));
    return typeof exp === 'number' ? exp * 1000 : null; // to ms
  } catch {
    return null;
  }
}

function forceLogout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
}

export default function useTokenWatcher() {
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const expMs = getTokenExpiry(token);
    if (!expMs) return;

    const now = Date.now();
    const delay = expMs - now;

    if (delay <= 0) {
      forceLogout(); // already expired
      return;
    }

    const timeout = setTimeout(() => {
      forceLogout(); // logout when time hits
    }, delay);

    return () => clearTimeout(timeout); // cleanup on unmount
  }, []);
}
