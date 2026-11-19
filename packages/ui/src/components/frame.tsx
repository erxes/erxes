import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from 'erxes-ui/lib/utils';

const frameVariants = cva('relative rounded-xl border border-dashed transition-colors', {
  variants: {
    selected: {
      true: 'border-primary bg-primary/5',
      false: 'border-primary/50',
    },
  },
  defaultVariants: { selected: false },
});

const FrameRoot = ({
  ref,
  className,
  selected,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof frameVariants>) => (
  <div ref={ref} className={cn(frameVariants({ selected }), className)} {...props} />
);

/** The frame's name, as a tab that sits on its top edge. */
const FrameLabel = ({ ref, className, ...props }: React.ComponentProps<'div'>) => (
  <div
    ref={ref}
    className={cn(
      'absolute top-0 left-3 flex h-7 max-w-5/6 -translate-y-1/2 items-center gap-1.5 rounded-md bg-muted px-2 text-sm font-medium',
      className,
    )}
    {...props}
  />
);

/**
 * A dashed box with a name tab, around things that belong together.
 * A department's people on an org chart, a group of steps. `Frame.Label` is the tab on its top
 * edge; `selected` tints the frame.
 */
export const Frame = Object.assign(FrameRoot, { Label: FrameLabel });
