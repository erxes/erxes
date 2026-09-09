'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/modules/ui/lib/cn';

/**
 * Settles its children in once, the first time they reach the fold. The content
 * is always rendered and readable — this only withholds a few pixels and some
 * opacity — so a page where the observer never runs still reads normally, and
 * `motion-reduce` drops the movement entirely rather than gating it in JS.
 */
export const Reveal = ({
  /** Beats a sibling apart, in ms, when several reveal together. */
  delay = 0,
  /** Keeps the wrapper semantic where it stands in for a landmark. */
  as: Tag = 'div',
  className,
  children,
}: {
  delay?: number;
  as?: 'div' | 'section';
  className?: string;
  children: ReactNode;
}) => {
  const ref = useRef<HTMLDivElement & HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      /*
       * Fires a little before the band reaches the fold, so it has settled by
       * the time the reader arrives at it.
       */
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      style={shown && delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        'transition-[opacity,transform] duration-700 ease-out',
        shown ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        /* Anyone who asks for less motion gets the content in place. */
        'motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none',
        className,
      )}
    >
      {children}
    </Tag>
  );
};
