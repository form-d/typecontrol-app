import { useState, useEffect, useCallback } from 'react';

export function usePersistedState<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(key);
        if (stored !== null) {
          return JSON.parse(stored) as T;
        }
      } catch {
        // ignore errors
      }
    }
    return defaultValue;
  });

  // Die neue Setter-Funktion, die Updater-Funktionen akzeptiert!
  const setPersistedState: React.Dispatch<React.SetStateAction<T>> = useCallback(
    (valueOrFn) => {
      setState((prev) => {
        // Falls eine Funktion übergeben wurde, ausführen:
        const value =
          typeof valueOrFn === "function"
            ? (valueOrFn as (prev: T) => T)(prev)
            : valueOrFn;
        return value;
      });
    },
    []
  );

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* ignore write errors */
    }
  }, [key, state]);

  return [state, setPersistedState];
}
