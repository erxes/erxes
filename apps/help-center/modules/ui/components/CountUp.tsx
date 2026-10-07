'use client';

import { useEffect, useRef, useState } from 'react';

const DURATION = 1100;

const canAnimate = (): boolean =>
  typeof IntersectionObserver !== 'undefined' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const easeOut = (progress: number): number => 1 - (1 - progress) ** 3;

export const CountUp = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState<number | null>(null);

  useEffect(() => {
    const node = ref.current;

    if (!node || value <= 0 || !canAnimate()) {
      return;
    }

    setShown(0);

    let frame = 0;

    const run = (start: number) => {
      const step = (now: number) => {
        const progress = Math.min((now - start) / DURATION, 1);

        setShown(Math.round(easeOut(progress) * value));

        if (progress < 1) {
          frame = requestAnimationFrame(step);
        }
      };

      frame = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          run(performance.now());
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {(shown ?? value).toLocaleString('en-US')}
    </span>
  );
};
