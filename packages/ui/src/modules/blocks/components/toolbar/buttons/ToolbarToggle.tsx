import { ShadCNDefaultComponents } from '@blocknote/shadcn';
import type { ShadCNComponents } from '@blocknote/shadcn';
import type { ComponentProps } from 'react';
import { cn } from 'erxes-ui/lib/utils';

// The shadcn Toggle passes className through cva, which only takes strings.
export const ToolbarToggle = ({
  className,
  ...props
}: ComponentProps<ShadCNComponents['Toggle']['Toggle']>) => (
  <ShadCNDefaultComponents.Toggle.Toggle
    className={cn(
      'transition-none enabled:pointer-events-auto',
      'hover:bg-(--color-primary)/15! hover:text-primary-text!',
      'active:bg-(--color-primary)/15! aria-pressed:bg-(--color-primary)/10! aria-pressed:text-primary-text!',
      typeof className === 'string' ? className : undefined,
    )}
    {...props}
  />
);
