import { PreviewCard as PreviewCardPrimitive } from '@base-ui/react/preview-card';
import { cn } from '../lib/utils';

/** Opens after 700ms, the delay Radix's hover card had. */
const HoverCardTrigger = ({ delay = 700, ...props }: PreviewCardPrimitive.Trigger.Props) => (
  <PreviewCardPrimitive.Trigger delay={delay} {...props} />
);

const HoverCardContent = ({
  className,
  side = 'bottom',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  ...props
}: PreviewCardPrimitive.Popup.Props &
  Pick<PreviewCardPrimitive.Positioner.Props, 'side' | 'sideOffset' | 'align' | 'alignOffset'>) => (
  <PreviewCardPrimitive.Portal>
    <PreviewCardPrimitive.Positioner
      className="isolate z-50"
      side={side}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
      collisionPadding={0}
    >
      <PreviewCardPrimitive.Popup
        className={cn(
          'w-64 rounded-lg bg-background p-4 text-foreground shadow-lg outline-hidden data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className,
        )}
        {...props}
      />
    </PreviewCardPrimitive.Positioner>
  </PreviewCardPrimitive.Portal>
);

export const HoverCard = Object.assign(PreviewCardPrimitive.Root, {
  Trigger: HoverCardTrigger,
  Content: HoverCardContent,
});
