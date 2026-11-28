import { mergeProps } from '@base-ui/react/merge-props';
import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import type React from 'react';
import { createContext, use, useRef, useState } from 'react';
import { cn, mergeRefs } from 'erxes-ui/lib/utils';
import { FieldControlContext } from './field-control';

export type PopoverProps = PopoverPrimitive.Root.Props;

export type PopoverChangeDetails = PopoverPrimitive.Root.ChangeEventDetails;

type TriggerPress = React.MouseEvent | React.KeyboardEvent;

interface PopoverTriggers {
  /** Set until a trigger is first pressed or the popover first opens: it opens the popover. */
  press: ((event: TriggerPress) => void) | null;
  /** Base UI's trigger mounted: it takes the focus the pressed button it replaced had. */
  mounted: (element: HTMLElement | null) => void;
}

const PopoverTriggersContext = createContext<PopoverTriggers | null>(null);

/** What Base UI passes `onOpenChange` when its trigger opens a popover. */
const triggerPressDetails = (event: TriggerPress): PopoverChangeDetails => {
  let canceled = false;
  let propagationAllowed = false;

  return {
    reason: 'trigger-press',
    event: event.nativeEvent,
    trigger: event.currentTarget,
    cancel: () => {
      canceled = true;
    },
    allowPropagation: () => {
      propagationAllowed = true;
    },
    // Nothing is mounted to keep: the popover is opening.
    preventUnmountOnClose: () => undefined,
    get isCanceled() {
      return canceled;
    },
    get isPropagationAllowed() {
      return propagationAllowed;
    },
  };
};

/**
 * Base UI's trigger takes about a dozen hooks, three times its root's cost, and a table has a
 * popover in most cells. So a trigger is a plain button with the attributes Base UI's has while
 * closed until it is first pressed or the popover first opens; then Base UI's replaces it. The
 * root and the other children stay mounted throughout. The root holds the open state when its
 * owner doesn't, so the press that swaps the trigger opens the popover in the same render.
 */
const PopoverRoot = ({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: PopoverProps) => {
  const [ownOpen, setOwnOpen] = useState(defaultOpen);
  const isOpen = open ?? ownOpen;
  // A payload render function reads the trigger Base UI's handle tracks, so it starts live.
  const [live, setLive] = useState(isOpen || typeof children === 'function');
  const focusOnMount = useRef(false);

  if (isOpen && !live) setLive(true);

  const change = (next: boolean, details: PopoverChangeDetails) => {
    onOpenChange?.(next, details);

    if (!details.isCanceled && open === undefined) setOwnOpen(next);
  };

  const triggers: PopoverTriggers = {
    press: live
      ? null
      : (event) => {
          focusOnMount.current = event.currentTarget === document.activeElement;
          setLive(true);
          change(true, triggerPressDetails(event));
        },
    mounted: (element) => {
      if (!element || !focusOnMount.current) return;
      focusOnMount.current = false;

      // The pressed button left with focus; a popup that takes focus on open moves it on.
      if (document.activeElement === document.body) element.focus();
    },
  };

  return (
    <PopoverPrimitive.Root {...props} open={isOpen} onOpenChange={change}>
      {typeof children === 'function' ? (
        children
      ) : (
        <PopoverTriggersContext value={triggers}>{children}</PopoverTriggersContext>
      )}
    </PopoverPrimitive.Root>
  );
};

type PopoverTriggerProps = PopoverPrimitive.Trigger.Props & React.RefAttributes<HTMLElement>;

/** A trigger not yet pressed, with the attributes Base UI's has while closed. */
const DormantTrigger = ({
  press: onPress,
  ref,
  render,
  className,
  style,
  disabled = false,
  nativeButton = true,
  handle: _handle,
  payload: _payload,
  openOnHover: _openOnHover,
  delay: _delay,
  closeDelay: _closeDelay,
  ...props
}: PopoverTriggerProps & { press: (event: TriggerPress) => void }) => {
  const state = { open: false, disabled };

  const press = (event: TriggerPress) => {
    if (!disabled) onPress(event);
  };

  return useRender({
    defaultTagName: 'button',
    render,
    ref,
    state,
    props: mergeProps<'button'>(
      {
        type: nativeButton ? 'button' : undefined,
        disabled: nativeButton ? disabled : undefined,
        role: nativeButton ? undefined : 'button',
        tabIndex: nativeButton ? undefined : disabled ? -1 : 0,
        'aria-disabled': !nativeButton && disabled ? true : undefined,
        'aria-haspopup': 'dialog',
        'aria-expanded': false,
        'data-base-ui-click-trigger': '',
        className: typeof className === 'function' ? className(state) : className,
        style: typeof style === 'function' ? style(state) : style,
        onClick: press,
        onKeyDown: nativeButton
          ? undefined
          : (event: React.KeyboardEvent) => {
              if (event.key !== 'Enter' && event.key !== ' ') return;
              event.preventDefault();
              press(event);
            },
      } as React.ComponentProps<'button'>,
      props as React.ComponentProps<'button'>,
    ),
  });
};

/** A detached trigger (`handle`) belongs to another root, so it is always Base UI's. */
const PopoverTrigger = ({ ref, ...props }: PopoverTriggerProps) => {
  const triggers = use(PopoverTriggersContext);

  if (triggers?.press && !props.handle) {
    return <DormantTrigger {...props} ref={ref} press={triggers.press} />;
  }

  return <PopoverPrimitive.Trigger {...props} ref={mergeRefs(ref, triggers?.mounted)} />;
};

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
      {/* A search box in the popup belongs to the picker, not to the form row around it. */}
      <FieldControlContext value={null}>
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
      </FieldControlContext>
    </PopoverPrimitive.Portal>
  );
};

/**
 * A floating box anchored to its trigger, for a picker or a few controls.
 * Content sits in a positioner, which sets `--anchor-width` and `--available-height`.
 */
export const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Close: PopoverPrimitive.Close,
});
