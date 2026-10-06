'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { cn } from '@/modules/ui/lib/cn';
import {
  ROUTE_PROGRESS_START,
  startRouteProgress,
} from '../utils/routeProgress';

type Phase = 'idle' | 'loading' | 'done';

const TRICKLE_MS = 180;
const FINISH_MS = 450;
const GIVE_UP_MS = 12_000;

const clickedHref = (event: MouseEvent): string | null => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    !(event.target instanceof Element)
  ) {
    return null;
  }

  const anchor = event.target.closest('a');

  if (
    !anchor ||
    !anchor.href ||
    anchor.hasAttribute('download') ||
    (anchor.target && anchor.target !== '_self')
  ) {
    return null;
  }

  return anchor.href;
};

const Bar = () => {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const location = `${pathname}?${search}`;

  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [seen, setSeen] = useState(location);

  if (seen !== location) {
    setSeen(location);

    if (phase === 'loading') {
      setPhase('done');
      setProgress(100);
    }
  }

  useEffect(() => {
    const start = () => {
      setPhase('loading');
      setProgress(12);
    };

    const onClick = (event: MouseEvent) => {
      const href = clickedHref(event);

      if (href) {
        startRouteProgress(href);
      }
    };

    window.addEventListener(ROUTE_PROGRESS_START, start);
    document.addEventListener('click', onClick, true);

    return () => {
      window.removeEventListener(ROUTE_PROGRESS_START, start);
      document.removeEventListener('click', onClick, true);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'loading') {
      return;
    }

    const trickle = window.setInterval(() => {
      setProgress((current) => current + (90 - current) * 0.12);
    }, TRICKLE_MS);

    const giveUp = window.setTimeout(() => {
      setPhase('done');
      setProgress(100);
    }, GIVE_UP_MS);

    return () => {
      window.clearInterval(trickle);
      window.clearTimeout(giveUp);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'done') {
      return;
    }

    const reset = window.setTimeout(() => {
      setPhase('idle');
      setProgress(0);
    }, FINISH_MS);

    return () => window.clearTimeout(reset);
  }, [phase]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]"
    >
      <div
        style={{ width: `${progress}%` }}
        className={cn(
          'relative h-full rounded-r-full bg-brand shadow-[0_0_10px_var(--color-brand),0_0_4px_var(--color-brand)]',
          phase === 'idle' && 'opacity-0 transition-none',
          phase === 'loading' &&
            'opacity-100 transition-[width,opacity] delay-[0ms,120ms] duration-200 ease-out',
          phase === 'done' &&
            'opacity-0 transition-[width,opacity] delay-[0ms,200ms] duration-200 ease-out',
        )}
      >
        <span className="absolute right-0 top-1/2 h-full w-24 -translate-y-1/2 bg-gradient-to-r from-transparent to-white/60 blur-[2px]" />
      </div>
    </div>
  );
};

export const RouteProgress = () => (
  <Suspense fallback={null}>
    <Bar />
  </Suspense>
);
