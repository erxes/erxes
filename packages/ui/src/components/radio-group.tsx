import * as React from 'react';
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import { cn } from 'erxes-ui/lib/utils';

export type RadioGroupProps = React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>;

const RadioGroupRoot = ({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) => {
  return <RadioGroupPrimitive.Root className={cn('grid gap-3', className)} {...props} ref={ref} />;
};

const RadioGroupItem = ({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'aspect-square size-4 rounded-full border border-scroll bg-background shadow-xs shadow-black/5 outline-offset-2 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-ring/70 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center text-current">
        <svg
          width="6"
          height="6"
          viewBox="0 0 6 6"
          fill="currentcolor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="3" cy="3" r="3" />
        </svg>
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
};

export const RadioGroup = Object.assign(RadioGroupRoot, {
  Item: RadioGroupItem,
});
