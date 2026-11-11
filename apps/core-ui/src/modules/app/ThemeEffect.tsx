import { themeState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useEffect, useSyncExternalStore } from 'react';

const DARK_QUERY = '(prefers-color-scheme: dark)';

const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(DARK_QUERY);

  query.addEventListener('change', onChange);

  return () => query.removeEventListener('change', onChange);
};

/** Applies the chosen theme (light, dark or the system's) to <html>, as old core-ui. */
export const ThemeEffect = () => {
  const theme = useAtomValue(themeState);
  const systemDark = useSyncExternalStore(subscribe, () => window.matchMedia(DARK_QUERY).matches);
  const value = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    const html = document.documentElement;

    html.classList.remove(value === 'dark' ? 'light' : 'dark');
    html.classList.add(value);
    html.style.colorScheme = value;
  }, [value]);

  return null;
};
