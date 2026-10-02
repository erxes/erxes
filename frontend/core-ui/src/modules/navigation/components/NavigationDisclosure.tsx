import { animateNavigationDisclosure } from '@/navigation/utils/navigationDisclosureMotion';
import { cn } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousOpen = useRef(open);

  if (open && !mounted) {
    setMounted(true);
  }

  useLayoutEffect(() => {
    if (previousOpen.current === open) {
      return;
    }

    previousOpen.current = open;

    if (containerRef.current && contentRef.current) {
      animateNavigationDisclosure(
        containerRef.current,
        contentRef.current,
        open,
      );
    }
  }, [open]);

  return (
    <div
      ref={containerRef}
      aria-hidden={!open}
      className={cn('overflow-hidden', !open && 'invisible h-0', className)}
    >
      <div ref={contentRef} className="flow-root">
        {mounted && children}
      </div>
    </div>
  );
};
