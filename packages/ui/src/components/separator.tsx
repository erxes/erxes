import React from 'react';
import { Separator as SeparatorPrimitive } from '@base-ui/react/separator';
import { cn } from '../lib/utils';

/** `variant="print"` prints in the text's colour, so the rule shows on paper (a report's header). */
const SeparatorRoot = ({
  className,
  orientation = 'horizontal',
  variant = 'default',
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive> & { variant?: 'default' | 'print' }) => (
  <SeparatorPrimitive
    orientation={orientation}
    className={cn(
      'shrink-0 bg-border',
      variant === 'print' && 'print:bg-foreground',
      orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
      className,
    )}
    {...props}
  />
);

const SeparatorInline = ({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive>) => (
  <SeparatorPrimitive
    orientation={orientation}
    className={cn(
      'inline-block bg-border rounded-lg flex-none',
      orientation === 'horizontal' ? 'w-3 h-0.5' : 'w-0.5 h-3',
      className,
    )}
    {...props}
  />
);

/**
 * A thin horizontal or vertical line between sections.
 * `Separator.Inline` is a short tick in text.
 */
export const Separator = Object.assign(SeparatorRoot, {
  Inline: SeparatorInline,
});
