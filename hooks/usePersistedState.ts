import { useState, useEffect } from 'react';

export function usePersistedState<T>(key: string, defaultValue: T): [T, (v: T) => void] {
  // 1) Always initialize to default, so SSR and first client render match
  const [state, setState] = useState<T>(defaultValue);

  // 2) After hydration, read stored value (if any) exactly once
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        setState(JSON.parse(stored) as T);
      }
    } catch {
      /* ignore JSON errors */
    }
  }, [key]);

  // 3) Persist any changes back to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* ignore write errors */
    }
  }, [key, state]);

  return [state, setState];
}