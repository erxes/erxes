import * as React from 'react';
import { Slider as SliderPrimitive } from 'radix-ui';

import { cn } from 'erxes-ui/lib/utils';

const Slider = ({
  ref,
  className,
  hideThumb,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  hideThumb?: boolean;
}) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn('relative flex w-full touch-none select-none items-center', className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    {!hideThumb && (
      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
    )}
  </SliderPrimitive.Root>
);

export { Slider };
