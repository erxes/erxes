'use client';

import type { MouseEvent, ReactNode } from 'react';
import { cn } from '@/modules/ui/lib/cn';

const track = (event: MouseEvent<HTMLElement>) => {
  const target = event.currentTarget;
  const rect = target.getBoundingClientRect();

  target.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
  target.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
};

export const Spotlight = ({
  as: Tag = 'div',
  className,
  children,
}: {
  as?: 'div' | 'article';
  className?: string;
  children: ReactNode;
}) => (
  <Tag onMouseMove={track} className={cn('tile', className)}>
    <span aria-hidden="true" className="tile-glow" />
    {children}
  </Tag>
);
