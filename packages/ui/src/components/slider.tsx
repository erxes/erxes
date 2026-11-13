import { Slider as SliderPrimitive } from '@base-ui/react/slider';

import { cn } from 'erxes-ui/lib/utils';

/** `value={n}` hands `onValueChange` a number, `value={[from, to]}` an array. */
export type SliderProps<Value extends number | readonly number[]> =
  SliderPrimitive.Root.Props<Value> & {
    hideThumb?: boolean;
  };

export const Slider = <Value extends number | readonly number[]>({
  className,
  hideThumb,
  ...props
}: SliderProps<Value>) => {
  // Base UI wants one thumb per value: two for a range.
  const initial = props.value ?? props.defaultValue;
  const thumbs = typeof initial === 'object' ? initial.length : 1;

  return (
    <SliderPrimitive.Root
      thumbAlignment="edge"
      className={cn('relative flex w-full touch-none select-none items-center', className)}
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full items-center">
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
          <SliderPrimitive.Indicator className="bg-primary" />
        </SliderPrimitive.Track>
        {!hideThumb &&
          Array.from({ length: thumbs }, (_, index) => (
            <SliderPrimitive.Thumb
              key={index}
              index={index}
              className="block h-4 w-4 rounded-full border border-primary bg-background shadow transition-colors has-focus-visible:outline-hidden has-focus-visible:ring-1 has-focus-visible:ring-ring data-disabled:pointer-events-none data-disabled:opacity-50"
            />
          ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
};
