import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';

/** A board card's box; `overlay` is its copy under the pointer while it is dragged. */
export const BoardCardShell = ({
  overlay = false,
  className,
  ...props
}: ComponentProps<'div'> & { overlay?: boolean }) => (
  <div
    {...props}
    className={cn(
      'relative flex select-none flex-col gap-2 rounded-lg border bg-background p-3 text-left shadow-xs',
      overlay && 'w-68 rotate-2 cursor-grabbing shadow-lg ring-1 ring-primary/20',
      className,
    )}
  />
);
