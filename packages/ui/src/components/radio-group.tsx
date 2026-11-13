import { Radio } from '@base-ui/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import { cn } from 'erxes-ui/lib/utils';

export type RadioGroupProps<Value = string> = RadioGroupPrimitive.Props<Value>;

const RadioGroupRoot = <Value = string,>({ className, ...props }: RadioGroupProps<Value>) => (
  <RadioGroupPrimitive className={cn('grid gap-3', className)} {...props} />
);

const RadioGroupItem = <Value = string,>({ className, ...props }: Radio.Root.Props<Value>) => (
  <Radio.Root
    className={cn(
      'inline-flex items-center justify-center aspect-square size-4 rounded-full border border-scroll bg-background shadow-xs shadow-black/5 outline-offset-2 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-ring/70 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground',
      className,
    )}
    {...props}
  >
    <Radio.Indicator className="flex items-center justify-center text-current">
      <svg
        width="6"
        height="6"
        viewBox="0 0 6 6"
        fill="currentcolor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="3" cy="3" r="3" />
      </svg>
    </Radio.Indicator>
  </Radio.Root>
);

export const RadioGroup = Object.assign(RadioGroupRoot, {
  Item: RadioGroupItem,
});
