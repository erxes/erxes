import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/** Opens after 700ms and skips the delay for 300ms after one closes, the timings the app had under Radix. */
const TooltipProvider = ({
  delay = 700,
  timeout = 300,
  ...props
}: TooltipPrimitive.Provider.Props) => (
  <TooltipPrimitive.Provider delay={delay} timeout={timeout} {...props} />
);

const tooltipContentVariants = cva(
  'overflow-hidden rounded-md text-xs animate-in fade-in-0 zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
  {
    variants: {
      variant: {
        default: 'bg-foreground px-3 py-1.5 text-background',
        /** What is wrong with a form, listed: red on the page's ground, with a pale red rule. */
        error: 'border border-tint-destructive bg-background p-2 text-destructive-soft shadow-md',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

const TooltipContent = ({
  className,
  variant,
  side = 'top',
  sideOffset = 8,
  align = 'center',
  alignOffset = 0,
  ...props
}: TooltipPrimitive.Popup.Props &
  VariantProps<typeof tooltipContentVariants> &
  Pick<TooltipPrimitive.Positioner.Props, 'side' | 'sideOffset' | 'align' | 'alignOffset'>) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Positioner
      className="isolate z-50"
      side={side}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
      collisionPadding={0}
    >
      <TooltipPrimitive.Popup
        className={cn(tooltipContentVariants({ variant }), className)}
        {...props}
      />
    </TooltipPrimitive.Positioner>
  </TooltipPrimitive.Portal>
);

/**
 * A short label that shows on hover or focus of its trigger.
 * Wrap it in `Tooltip.Provider`. For an icon button's label, use `IconTip`.
 */
export const Tooltip = Object.assign(TooltipPrimitive.Root, {
  Provider: TooltipProvider,
  Trigger: TooltipPrimitive.Trigger,
  Content: TooltipContent,
});
