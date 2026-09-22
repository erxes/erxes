import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

const getViewportWidth = () => {
  if (typeof window === 'undefined') {
    return Number.POSITIVE_INFINITY;
  }

  try {
    if (window.parent && window.parent !== window && window.parent.innerWidth) {
      return window.parent.innerWidth;
    }
  } catch {
    return window.screen?.width || window.innerWidth;
  }

  return window.screen?.width || window.innerWidth;
};

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(
    () => getViewportWidth() < MOBILE_BREAKPOINT,
  );

  React.useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(getViewportWidth() < MOBILE_BREAKPOINT);
    };

    updateIsMobile();

    window.addEventListener('resize', updateIsMobile);

    try {
      if (window.parent && window.parent !== window) {
        window.parent.addEventListener('resize', updateIsMobile);

        return () => {
          window.removeEventListener('resize', updateIsMobile);
          window.parent.removeEventListener('resize', updateIsMobile);
        };
      }
    } catch {
      return () => window.removeEventListener('resize', updateIsMobile);
    }

    return () => window.removeEventListener('resize', updateIsMobile);
  }, []);

  return isMobile;
}
