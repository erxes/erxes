import { useAtom, useAtomValue } from 'jotai';
import { ThemeOption, themeState, ThemeValue } from 'erxes-ui';
import { useEffect, useSyncExternalStore } from 'react';

const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';

export const resolveThemeValue = (selected: ThemeOption): ThemeValue => {
  if (selected === 'system') {
    return window.matchMedia(SYSTEM_DARK_QUERY).matches ? 'dark' : 'light';
  }

  return selected;
};

const subscribeToSystemTheme = (onChange: () => void) => {
  const mediaQuery = window.matchMedia(SYSTEM_DARK_QUERY);

  mediaQuery.addEventListener('change', onChange);

  return () => mediaQuery.removeEventListener('change', onChange);
};

const getSystemPrefersDark = () => window.matchMedia(SYSTEM_DARK_QUERY).matches;

export const useResolvedTheme = (): ThemeValue => {
  const theme = useAtomValue(themeState);
  const systemPrefersDark = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemPrefersDark,
  );

  if (theme === 'system') {
    return systemPrefersDark ? 'dark' : 'light';
  }

  return theme;
};

const applyThemeValue = (html: HTMLElement, themeValue: ThemeValue) => {
  const otherValue = themeValue === 'light' ? 'dark' : 'light';

  if (
    html.classList.contains(themeValue) &&
    !html.classList.contains(otherValue) &&
    html.style.colorScheme === themeValue
  ) {
    return;
  }

  html.classList.remove(otherValue);
  html.classList.add(themeValue);
  html.style.colorScheme = themeValue;
};

export const ThemeEffect = () => {
  const [theme] = useAtom(themeState);

  useEffect(() => {
    const html = document.documentElement;
    const applySelectedTheme = () =>
      applyThemeValue(html, resolveThemeValue(theme));

    const mediaQuery = window.matchMedia(SYSTEM_DARK_QUERY);
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        applySelectedTheme();
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    const css = document.createElement('style');
    css.appendChild(
      document.createTextNode(
        `* {
            -webkit-transition: none !important;
            -moz-transition: none !important;
            -o-transition: none !important;
            -ms-transition: none !important;
            transition: none !important;
          }`,
      ),
    );
    document.head.appendChild(css);

    applySelectedTheme();

    window.getComputedStyle(css).getPropertyValue('opacity');
    document.head.removeChild(css);

    const observer = new MutationObserver(applySelectedTheme);

    observer.observe(html, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
      observer.disconnect();
    };
  }, [theme]);

  return <></>;
};
