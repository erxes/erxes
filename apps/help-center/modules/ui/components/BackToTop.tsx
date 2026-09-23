'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/modules/ui/lib/cn';
import { Icon } from './Icon';

const SHOW_AFTER = 640;

export const BackToTop = ({ label = 'Back to top' }: { label?: string }) => {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const update = () => setShown(window.scrollY > SHOW_AFTER);

    update();
    window.addEventListener('scroll', update, { passive: true });

    return () => window.removeEventListener('scroll', update);
  }, []);

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-hidden={!shown}
      tabIndex={shown ? 0 : -1}
      title={label}
      className={cn(
        'fixed bottom-6 right-6 z-40 flex size-11 items-center justify-center rounded-full border border-line bg-white text-ink-soft shadow-card-hover',
        'transition-[opacity,transform,color,border-color] duration-300 ease-out',
        'hover:-translate-y-0.5 hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        shown
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0',
      )}
    >
      <span className="sr-only">{label}</span>
      <Icon name="chevronDown" size={18} className="rotate-180" />
    </button>
  );
};
