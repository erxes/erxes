import { cn } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useLiveMode } from '~/lib/live';

export const Listening = ({ children }: { children: ReactNode }) => {
  const live = useLiveMode() === 'live';

  return (
    <>
      <span
        aria-hidden
        className={cn(
          'mr-2 inline-block size-1.5 rounded-full align-middle',
          live ? 'animate-pulse bg-primary' : 'bg-muted-foreground',
        )}
      />
      {children}
    </>
  );
};
