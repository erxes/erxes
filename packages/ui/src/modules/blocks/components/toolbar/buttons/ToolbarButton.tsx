import { ShadCNDefaultComponents } from '@blocknote/shadcn';
import type { ShadCNComponents } from '@blocknote/shadcn';
import type { ComponentProps } from 'react';
import { cn } from 'erxes-ui/lib/utils';

// The shadcn Button passes className through cva, which only takes strings.
export const ToolbarButton = ({
  className,
  ...props
}: ComponentProps<ShadCNComponents['Button']['Button']>) => (
  <ShadCNDefaultComponents.Button.Button
    className={cn(
      'transition-none enabled:pointer-events-auto',
      'hover:bg-(--color-primary)/15! hover:text-primary-text!',
      'aria-expanded:bg-(--color-primary)/10! aria-expanded:text-primary-text!',
      typeof className === 'string' ? className : undefined,
    )}
    {...props}
  />
);
