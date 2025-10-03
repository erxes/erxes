import { useAtom } from 'jotai';
import { ThemeOption, themeState, ThemeValue } from 'erxes-ui';
import { useEffect } from 'react';

export const ThemeEffect = () => {
  const [theme, setTheme] = useAtom(themeState);

  function getThemeValue(selected: ThemeOption): ThemeValue {
    if (selected === 'system') {
      if (window !== undefined) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      }

      // Default to light theme if we can't detect the system preference
      return 'light';
    }

    return selected;
  }

  useEffect(() => {
    const html = document.querySelector('html');
    if (!html) return;

    const themeValue = getThemeValue(theme);

    // Add media query listener for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const newThemeValue = e.matches ? 'dark' : 'light';
        html.classList.remove(newThemeValue === 'light' ? 'dark' : 'light');
        html.classList.add(newThemeValue);
        html.style.colorScheme = newThemeValue;
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    /**
     * Temporarily disable transitions to prevent
     * the theme change from flashing.
     */
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

    html.classList.remove(themeValue === 'light' ? 'dark' : 'light');
    html.classList.add(themeValue);
    // Ensures that native elements respect the theme, e.g. the scrollbar.
    html.style.colorScheme = themeValue;

    /**
     * Re-enable transitions after the theme has been set,
     * and force the browser to repaint.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    window.getComputedStyle(css).opacity;
    document.head.removeChild(css);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme]);

  return <></>;
};
