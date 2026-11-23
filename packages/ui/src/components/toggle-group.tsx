import React from 'react';
import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group';
import { type VariantProps } from 'class-variance-authority';

import { toggleVariants } from './toggle';
import { cn } from '../lib/utils';

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
  size: 'default',
  variant: 'default',
});

/** The value is an array: one item for a single choice, empty when nothing is pressed. */
const ToggleGroupRoot = <Value extends string>({
  className,
  variant,
  size,
  children,
  ...props
}: ToggleGroupPrimitive.Props<Value> & VariantProps<typeof toggleVariants>) => {
  const look = React.useMemo(() => ({ variant, size }), [variant, size]);

  return (
    <ToggleGroupPrimitive
      className={cn(
        'flex items-center justify-center gap-1 isolate',
        variant === 'outline' && 'gap-0 bg-muted rounded',
        className,
      )}
      {...props}
    >
      <ToggleGroupContext value={look}>{children}</ToggleGroupContext>
    </ToggleGroupPrimitive>
  );
};

/** `capitalize` starts its label with a capital, for words kept in lower case (3.x's tab names). */
const ToggleGroupItem = <Value extends string>({
  className,
  variant,
  size,
  capitalize,
  ...props
}: TogglePrimitive.Props<Value> &
  VariantProps<typeof toggleVariants> & { capitalize?: boolean }) => {
  const context = React.use(ToggleGroupContext);

  return (
    <TogglePrimitive
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
          className:
            context.variant === 'outline' &&
            'shadow-none bg-transparent data-pressed:bg-background data-pressed:shadow-xs relative data-pressed:z-10 hover:text-foreground',
        }),
        capitalize && 'capitalize',
        className,
      )}
      {...props}
    />
  );
};

/**
 * A row of toggle buttons where one or several stay pressed.
 * The value is an array: one item for a single choice, empty when nothing is pressed. A list's
 * table or board switch is `DisplayMenu`, not this.
 */
export const ToggleGroup = Object.assign(ToggleGroupRoot, {
  Item: ToggleGroupItem,
});
