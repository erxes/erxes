import { Switch as SwitchPrimitives } from '@base-ui/react/switch';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'erxes-ui/lib/utils';

const switchVariants = cva(
  'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-transparent transition-colors focus-visible:outline-hidden focus-visible:shadow-focus data-disabled:cursor-not-allowed data-disabled:opacity-50 data-checked:bg-primary data-unchecked:bg-accent shadow-inner',
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
  'pointer-events-none block rounded-full bg-background dark:bg-foreground shadow-sm ring-0 transition-transform data-unchecked:translate-x-0',
  {
    variants: {
      size: {
        default: 'size-4 data-checked:translate-x-4',
        sm: 'size-3 data-checked:translate-x-3',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

export const Switch = ({
  className,
  size,
  ...props
}: SwitchPrimitives.Root.Props & VariantProps<typeof switchVariants>) => (
  <SwitchPrimitives.Root className={cn(switchVariants({ size }), className)} {...props}>
    <SwitchPrimitives.Thumb className={switchThumbVariants({ size })} />
  </SwitchPrimitives.Root>
);
