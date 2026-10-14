import { useAtom } from 'jotai';
import { ThemeOption, themeState, ThemeValue } from 'erxes-ui';
import { useEffect } from 'react';

export const resolveThemeValue = (selected: ThemeOption): ThemeValue => {
  if (selected === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  return selected;
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

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
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

    void window.getComputedStyle(css).opacity;
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
