'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/modules/ui/lib/cn';

export const Reveal = ({
  delay = 0,
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
        'motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none',
        className,
      )}
    >
      {children}
    </Tag>
  );
};
