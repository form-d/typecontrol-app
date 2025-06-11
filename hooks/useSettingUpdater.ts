// hooks/useSettingUpdater.ts
import { useCallback } from 'react';
import { useGlobalState } from '../context/GlobalStateContext';
import type { UISettings } from '../context/GlobalStateContext';

export function useSettingUpdater() {
  const { setSettings } = useGlobalState();

  // returns a function that, given a setting key,
  // returns a setter for that key’s value
  return useCallback(
    <K extends keyof UISettings>(key: K) =>
      (value: UISettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
      },
    [setSettings]
  );
}