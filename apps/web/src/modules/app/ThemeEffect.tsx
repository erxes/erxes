import { themeState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useEffect, useSyncExternalStore } from 'react';

const DARK_QUERY = '(prefers-color-scheme: dark)';

const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(DARK_QUERY);

  query.addEventListener('change', onChange);

  return () => query.removeEventListener('change', onChange);
};

/** The theme the page shows: the member's choice, or the system's when they chose `system`. */
export const useAppliedTheme = () => {
  const theme = useAtomValue(themeState);
  const systemDark = useSyncExternalStore(subscribe, () => window.matchMedia(DARK_QUERY).matches);

  return theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
};

/** Applies the chosen theme (light, dark or the system's) to <html>. */
export const ThemeEffect = () => {
  const value = useAppliedTheme();

  useEffect(() => {
    const html = document.documentElement;

    html.classList.remove(value === 'dark' ? 'light' : 'dark');
    html.classList.add(value);
    html.style.colorScheme = value;
  }, [value]);

  return null;
};
