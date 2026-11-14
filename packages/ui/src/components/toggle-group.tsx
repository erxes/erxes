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
}: ToggleGroupPrimitive.Props<Value> & VariantProps<typeof toggleVariants>) => (
  <ToggleGroupPrimitive
    className={cn(
      'flex items-center justify-center gap-1 isolate',
      variant === 'outline' && 'gap-0 bg-muted rounded',
      className,
    )}
    {...props}
  >
    <ToggleGroupContext value={{ variant, size }}>{children}</ToggleGroupContext>
  </ToggleGroupPrimitive>
);

const ToggleGroupItem = <Value extends string>({
  className,
  variant,
  size,
  ...props
}: TogglePrimitive.Props<Value> & VariantProps<typeof toggleVariants>) => {
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
        className,
      )}
      {...props}
    />
  );
};

export const ToggleGroup = Object.assign(ToggleGroupRoot, {
  Item: ToggleGroupItem,
});
