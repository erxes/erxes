import * as React from 'react';
import { Switch as SwitchPrimitives } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'erxes-ui/lib/utils';

const switchVariants = cva(
  'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-transparent transition-colors focus-visible:outline-hidden focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50 aria-checked:bg-primary aria-[checked=false]:bg-accent shadow-inner',
  {
    variants: {
      size: {
        default: 'h-6 w-10 p-1',
        sm: 'h-4 w-7 p-0.5',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

const switchThumbVariants = cva(
  'pointer-events-none block rounded-full bg-background dark:bg-foreground shadow-sm ring-0 transition-transform data-[state=unchecked]:translate-x-0',
  {
    variants: {
      size: {
        default: 'size-4 data-[state=checked]:translate-x-4',
        sm: 'size-3 data-[state=checked]:translate-x-3',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> &
    VariantProps<typeof switchVariants>
>(({ className, size, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(switchVariants({ size }), className)}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb className={switchThumbVariants({ size })} />
  </SwitchPrimitives.Root>
));

Switch.displayName = SwitchPrimitives.Root.displayName;
