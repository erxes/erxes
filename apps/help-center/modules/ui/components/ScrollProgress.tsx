'use client';

import { useEffect, useState } from 'react';

export const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const { scrollHeight, clientHeight, scrollTop } =
        document.documentElement;
      const scrollable = scrollHeight - clientHeight;

      setProgress(scrollable > 0 ? Math.min(scrollTop / scrollable, 1) : 0);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-40 h-0.5 lg:left-64"
    >
      <div
        className="h-full origin-left bg-brand transition-transform duration-150 ease-out"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
};
