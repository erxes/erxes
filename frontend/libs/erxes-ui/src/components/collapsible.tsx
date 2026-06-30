import { Collapsible as CollapsiblePrimitive } from 'radix-ui';
import React from 'react';
import { Button } from 'erxes-ui/components';
import { cn } from 'erxes-ui/lib';
import { IconCaretDownFilled } from '@tabler/icons-react';
export const TriggerButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button>
>(({ className, ...props }, ref) => {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger asChild ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'w-full justify-start text-accent-foreground group',
          className,
        )}
        {...props}
      />
    </CollapsiblePrimitive.CollapsibleTrigger>
  );
});

export const TriggerIcon = React.forwardRef<
  React.ElementRef<typeof IconCaretDownFilled>,
  React.ComponentPropsWithoutRef<typeof IconCaretDownFilled>
>(({ className, ...props }, ref) => {
  return (
    <IconCaretDownFilled
      className={cn(
        'transition-transform duration-100 group-data-[state=closed]:-rotate-90',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

export const Collapsible = Object.assign(CollapsiblePrimitive.Root, {
  Trigger: CollapsiblePrimitive.CollapsibleTrigger,
  TriggerIcon: TriggerIcon,
  TriggerButton: TriggerButton,
  Content: CollapsiblePrimitive.CollapsibleContent,
});

/**
 * Hover-driven variant of `Collapsible`: it opens when the pointer enters the
 * root and closes when the pointer leaves, instead of relying on a click on the
 * trigger. The trigger still works for keyboard/click users. Open state is
 * uncontrolled by default (`defaultOpen`) but can be controlled via
 * `open`/`onOpenChange`; `onOpenChange` always fires so callers can react to
 * hover transitions (e.g. lazy-loading content).
 */
const HoverCollapsibleRoot = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root>
>(
  (
    {
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref,
  ) => {
    const isControlled = openProp !== undefined;
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
    const open = isControlled ? openProp : internalOpen;

    const setOpen = React.useCallback(
      (next: boolean) => {
        if (!isControlled) {
          setInternalOpen(next);
        }
        onOpenChange?.(next);
      },
      [isControlled, onOpenChange],
    );

    return (
      <CollapsiblePrimitive.Root
        ref={ref}
        open={open}
        onOpenChange={setOpen}
        onMouseEnter={(e) => {
          onMouseEnter?.(e);
          setOpen(true);
        }}
        onMouseLeave={(e) => {
          onMouseLeave?.(e);
          setOpen(false);
        }}
        {...props}
      />
    );
  },
);

HoverCollapsibleRoot.displayName = 'HoverCollapsible';

export const HoverCollapsible = Object.assign(HoverCollapsibleRoot, {
  Trigger: CollapsiblePrimitive.CollapsibleTrigger,
  TriggerIcon: TriggerIcon,
  TriggerButton: TriggerButton,
  Content: CollapsiblePrimitive.CollapsibleContent,
});
