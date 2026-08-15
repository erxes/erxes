import { useCallback, useSyncExternalStore } from 'react';

const canMatchMedia = (): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function';

// Read synchronously so the first render already matches the viewport.
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!canMatchMedia()) {
        return () => undefined;
      }

      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener('change', onChange);
      return () => mediaQuery.removeEventListener('change', onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => (canMatchMedia() ? window.matchMedia(query).matches : false),
    () => false,
  );
}
