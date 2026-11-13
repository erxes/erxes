import type { ComponentProps } from 'react';
import { Toggle } from 'erxes-ui/components/toggle';
import { cn } from 'erxes-ui/lib/utils';

export const ToolbarToggle = ({ ref, className, ...props }: ComponentProps<typeof Toggle>) => (
  <Toggle
    ref={ref}
    className={cn(
      'transition-none enabled:pointer-events-auto',
      'hover:bg-(--color-primary)/15! hover:text-(--color-primary)!',
      'active:bg-(--color-primary)/15! data-[state=on]:bg-(--color-primary)/10! data-[state=on]:text-(--color-primary)!',
      className,
    )}
    {...props}
  />
);
