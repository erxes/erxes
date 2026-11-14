import React from 'react';

import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { IconCheck } from '@tabler/icons-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../lib/utils';

/** Arrow keys stop at the first and last item, as they did under Radix. */
const DropdownMenuRoot = ({ loopFocus = false, ...props }: MenuPrimitive.Root.Props) => (
  <MenuPrimitive.Root loopFocus={loopFocus} {...props} />
);

const DropdownMenuSub = ({ loopFocus = false, ...props }: MenuPrimitive.SubmenuRoot.Props) => (
  <MenuPrimitive.SubmenuRoot loopFocus={loopFocus} {...props} />
);

export const popupAnimation =
  'data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2';

export type MenuPopupProps = MenuPrimitive.Popup.Props &
  Pick<MenuPrimitive.Positioner.Props, 'side' | 'sideOffset' | 'align' | 'alignOffset'>;

/** A menu popup in its portal and positioner, shared by the dropdown and context menus. */
export const MenuPopup = ({
  side,
  sideOffset,
  align,
  alignOffset = 0,
  ...props
}: MenuPopupProps) => (
  <MenuPrimitive.Portal>
    <MenuPrimitive.Positioner
      className="isolate z-50 outline-none"
      side={side}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
      collisionPadding={0}
    >
      <MenuPrimitive.Popup {...props} />
    </MenuPrimitive.Positioner>
  </MenuPrimitive.Portal>
);

const DropdownMenuSubTrigger = ({
  className,
  inset,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props & { inset?: boolean }) => (
  <MenuPrimitive.SubmenuTrigger
    className={cn(
      'flex min-h-8 cursor-default gap-2 select-none items-center rounded-sm text-sm px-2 outline-hidden data-highlighted:bg-accent data-popup-open:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
);

const DropdownMenuSubContent = ({
  className,
  side = 'inline-end',
  align = 'start',
  ...props
}: MenuPopupProps) => (
  <MenuPopup
    side={side}
    align={align}
    className={cn(
      'min-w-32 overflow-hidden rounded-md text-sm bg-background p-1 shadow-lg outline-hidden',
      popupAnimation,
      className,
    )}
    {...props}
  />
);

const DropdownMenuContent = ({
  className,
  side = 'bottom',
  sideOffset = 4,
  align = 'center',
  ...props
}: MenuPopupProps) => (
  <MenuPopup
    side={side}
    sideOffset={sideOffset}
    align={align}
    className={cn(
      'min-w-[300px] overflow-hidden rounded-lg bg-background p-1 text-sm shadow-lg outline-hidden',
      popupAnimation,
      className,
    )}
    {...props}
  />
);

const menuItemVariants = cva(
  'relative flex min-h-8 cursor-default select-none items-center gap-2 rounded-sm px-2 text-sm outline-hidden transition-colors data-highlighted:bg-accent data-disabled:pointer-events-none data-disabled:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground',
  {
    variants: {
      variant: {
        default: '',
        destructive: 'text-destructive',
      },
      inset: { true: 'pl-8' },
    },
    defaultVariants: { variant: 'default' },
  },
);

type MenuItemVariants = VariantProps<typeof menuItemVariants>;

const DropdownMenuItem = ({
  className,
  variant,
  inset,
  ...props
}: MenuPrimitive.Item.Props & MenuItemVariants) => (
  <MenuPrimitive.Item className={cn(menuItemVariants({ variant, inset }), className)} {...props} />
);

/** A menu item that navigates; it closes the menu like any other item. */
const DropdownMenuLinkItem = ({
  className,
  variant,
  inset,
  closeOnClick = true,
  ...props
}: MenuPrimitive.LinkItem.Props & MenuItemVariants) => (
  <MenuPrimitive.LinkItem
    closeOnClick={closeOnClick}
    className={cn(menuItemVariants({ variant, inset }), className)}
    {...props}
  />
);

const DropdownMenuCheckboxItem = ({
  className,
  children,
  closeOnClick = true,
  ...props
}: MenuPrimitive.CheckboxItem.Props) => (
  <MenuPrimitive.CheckboxItem
    closeOnClick={closeOnClick}
    className={cn(
      'relative flex min-h-8 cursor-default select-none items-center rounded-sm pl-8 pr-2 text-sm outline-hidden transition-colors data-highlighted:bg-accent data-disabled:pointer-events-none data-disabled:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenuPrimitive.CheckboxItemIndicator>
        <IconCheck className="h-4 w-4" />
      </MenuPrimitive.CheckboxItemIndicator>
    </span>
    {children}
  </MenuPrimitive.CheckboxItem>
);

const DropdownMenuRadioGroup = <Value,>(
  props: Omit<MenuPrimitive.RadioGroup.Props, 'value' | 'defaultValue' | 'onValueChange'> & {
    value?: Value;
    defaultValue?: Value;
    onValueChange?: (
      value: Value,
      eventDetails: MenuPrimitive.RadioGroup.ChangeEventDetails,
    ) => void;
  },
) => <MenuPrimitive.RadioGroup {...props} />;

const DropdownMenuRadioItem = ({
  className,
  children,
  closeOnClick = true,
  ...props
}: MenuPrimitive.RadioItem.Props) => (
  <MenuPrimitive.RadioItem
    closeOnClick={closeOnClick}
    className={cn(
      'relative flex min-h-8 cursor-default select-none items-center rounded-sm text-sm pl-2 pr-8 outline-hidden transition-colors data-highlighted:bg-accent data-disabled:pointer-events-none data-disabled:opacity-50 data-checked:text-primary-text [&>svg]:size-4 [&>svg]:shrink-0 gap-2',
      className,
    )}
    {...props}
  >
    {children}
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenuPrimitive.RadioItemIndicator>
        <IconCheck className="size-4" />
      </MenuPrimitive.RadioItemIndicator>
    </span>
  </MenuPrimitive.RadioItem>
);

/** A heading inside a menu. It isn't an item, so arrow keys skip it. */
const DropdownMenuLabel = ({
  className,
  inset,
  ...props
}: React.ComponentProps<'div'> & { inset?: boolean }) => (
  <div
    className={cn(
      'px-2 py-1.5 text-xs font-medium text-accent-foreground',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
);

const DropdownMenuSeparator = ({ className, ...props }: MenuPrimitive.Separator.Props) => (
  <MenuPrimitive.Separator className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
);

const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span className={cn('ml-auto text-xs tracking-widest opacity-60', className)} {...props} />
  );
};

export const DropdownMenu = Object.assign(DropdownMenuRoot, {
  Trigger: MenuPrimitive.Trigger,
  Group: MenuPrimitive.Group,
  Sub: DropdownMenuSub,
  SubTrigger: DropdownMenuSubTrigger,
  SubContent: DropdownMenuSubContent,
  RadioGroup: DropdownMenuRadioGroup,
  RadioItem: DropdownMenuRadioItem,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  LinkItem: DropdownMenuLinkItem,
  CheckboxItem: DropdownMenuCheckboxItem,
  Label: DropdownMenuLabel,
  Shortcut: DropdownMenuShortcut,
  Separator: DropdownMenuSeparator,
});
