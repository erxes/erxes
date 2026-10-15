import { cn } from 'erxes-ui';
import { ReactNode, useState } from 'react';

export const KbDisclosure = ({
  id,
  open,
  children,
}: {
  id: string;
  open: boolean;
  children: ReactNode;
}) => {
  const [mounted, setMounted] = useState(open);

  if (open && !mounted) {
    setMounted(true);
  }

  return (
    <div
      id={id}
      aria-hidden={!open}
      data-state={open ? 'open' : 'closed'}
      className={cn(
        'grid transition-[grid-template-rows] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
        open ? 'grid-rows-[1fr]' : 'invisible grid-rows-[0fr]',
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
