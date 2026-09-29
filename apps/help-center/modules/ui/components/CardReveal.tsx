import type { ReactNode } from 'react';

export const CardReveal = ({
  index = 0,
  children,
}: {
  index?: number;
  children: ReactNode;
}) => (
  <div
    className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both ease-out-soft h-full duration-700"
    style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
  >
    {children}
  </div>
);
