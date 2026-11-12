import { cn } from 'erxes-ui';
import type { LabelHTMLAttributes } from 'react';

/** A setting's label in the automation panels: plain text (sentences read badly in the mono capitals of erxes-ui's Label). */
export const FieldLabel = ({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) => (
  <label {...props} className={cn('block text-xs font-medium text-muted-foreground', className)} />
);
