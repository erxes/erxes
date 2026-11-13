import React from 'react';
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import { type VariantProps } from 'class-variance-authority';

import { toggleVariants } from './toggle';
import { cn } from '../lib/utils';

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
  size: 'default',
  variant: 'default',
});

const ToggleGroupRoot = ({
  ref,
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants>) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn(
      'flex items-center justify-center gap-1 isolate',
      variant === 'outline' && 'gap-0 bg-muted rounded',
      className,
    )}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ variant, size }}>{children}</ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
);

const ToggleGroupItem = ({
  ref,
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) => {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
          className:
            context.variant === 'outline' &&
            'shadow-none bg-transparent data-[state=on]:bg-background data-[state=on]:shadow-xs relative data-[state=on]:z-10 hover:text-foreground',
        }),
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
};

export const ToggleGroup = Object.assign(ToggleGroupRoot, {
  Item: ToggleGroupItem,
});
