import type { ReactNode } from 'react';
import { cn } from 'erxes-ui';
import { useState } from 'react';

export const NavigationDisclosure = ({
  children,
  className,
  open,
}: Readonly<{
  children: ReactNode;
  className?: string;
  open: boolean;
}>) => {
  const [mounted, setMounted] = useState(open);

  if (open && !mounted) {
    setMounted(true);
  }

  return (
    <div
      aria-hidden={!open}
      className={cn(
        'grid transition-[grid-template-rows] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
        open ? 'grid-rows-[1fr]' : 'invisible grid-rows-[0fr]',
        className,
      )}
    >
      <div
        className={cn(
          'min-h-0 overflow-hidden transition-opacity duration-150 ease-out motion-reduce:transition-none',
          !open && 'opacity-0',
        )}
      >
        {mounted && children}
      </div>
    </div>
  );
};
