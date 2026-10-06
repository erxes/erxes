import type { ReactNode } from 'react';

export const CardReveal = ({
  id,
  index = 0,
  children,
}: {
  id?: string;
  index?: number;
  children: ReactNode;
}) => (
  <div
    id={id}
    className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both ease-out-soft h-full scroll-mt-20 duration-700"
    style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
  >
    {children}
  </div>
);
