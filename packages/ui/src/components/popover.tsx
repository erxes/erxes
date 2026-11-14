import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { cva, type VariantProps } from 'class-variance-authority';
import { useRef } from 'react';
import { cn, mergeRefs } from 'erxes-ui/lib/utils';

export type PopoverProps = PopoverPrimitive.Root.Props;

export type PopoverChangeDetails = PopoverPrimitive.Root.ChangeEventDetails;

const popoverContentVariants = cva(
  'w-72 rounded-md bg-background text-sm shadow-lg outline-hidden data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0',
  {
    variants: {
      variant: {
        default: 'p-4',
        /** A list of items, such as menu rows or swatches, inset like a menu. */
        compact: 'p-1',
        /** Edge to edge, for a Command or a picker that pads itself. */
        flush: 'p-0',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export type PopoverContentProps = PopoverPrimitive.Popup.Props &
  Pick<
    PopoverPrimitive.Positioner.Props,
    'side' | 'sideOffset' | 'align' | 'alignOffset' | 'collisionPadding' | 'anchor'
  > &
  VariantProps<typeof popoverContentVariants> & {
    disableTransition?: boolean;
  };

/**
 * The popup sits in a positioner, which sets `--anchor-width` and `--available-height` for it.
 * A command list without a search box takes focus on open: cmdk handles the arrow keys and Enter
 * on its root, which has no tabbable element for the default focus to land on.
 */
const PopoverContent = ({
  ref,
  className,
  side = 'bottom',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  collisionPadding = 0,
  anchor,
  variant,
  disableTransition,
  initialFocus,
  ...props
}: PopoverContentProps) => {
  const popupRef = useRef<HTMLDivElement>(null);

  const focusCommand = () =>
    popupRef.current?.querySelector<HTMLElement>('[cmdk-root]:not(:has([cmdk-input]))') ?? true;

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        className="isolate z-50"
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        anchor={anchor}
      >
        <PopoverPrimitive.Popup
          ref={mergeRefs(popupRef, ref)}
          initialFocus={initialFocus ?? focusCommand}
          className={cn(
            popoverContentVariants({ variant }),
            !disableTransition &&
              'data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            className,
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
};

export const Popover = Object.assign(PopoverPrimitive.Root, {
  Trigger: PopoverPrimitive.Trigger,
  Content: PopoverContent,
  Close: PopoverPrimitive.Close,
});
