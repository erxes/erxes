import { cn } from 'erxes-ui';
import type { ReactNode } from 'react';

/**
 * A setting's label in the automation panels: plain text (sentences read
 * badly in the mono capitals of erxes-ui's Label). A `<label>` for the input
 * `htmlFor` names; a caption above a composite editor otherwise.
 */
export const FieldLabel = ({
  htmlFor,
  className,
  children,
}: {
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}) => {
  const classes = cn('block text-xs font-medium text-muted-foreground', className);

  return htmlFor ? (
    <label htmlFor={htmlFor} className={classes}>
      {children}
    </label>
  ) : (
    <span className={classes}>{children}</span>
  );
};
