import { Slider as SliderPrimitive } from '@base-ui/react/slider';

import { cn } from 'erxes-ui/lib/utils';

const Slider = ({
  className,
  hideThumb,
  ...props
}: SliderPrimitive.Root.Props & {
  hideThumb?: boolean;
}) => (
  <SliderPrimitive.Root
    thumbAlignment="edge"
    className={cn('relative flex w-full touch-none select-none items-center', className)}
    {...props}
  >
    <SliderPrimitive.Control className="relative flex w-full items-center">
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
        <SliderPrimitive.Indicator className="bg-primary" />
      </SliderPrimitive.Track>
      {!hideThumb && (
        <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors has-focus-visible:outline-hidden has-focus-visible:ring-1 has-focus-visible:ring-ring data-disabled:pointer-events-none data-disabled:opacity-50" />
      )}
    </SliderPrimitive.Control>
  </SliderPrimitive.Root>
);

export { Slider };
