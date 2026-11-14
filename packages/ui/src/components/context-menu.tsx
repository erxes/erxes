import { ContextMenu as ContextMenuPrimitive } from '@base-ui/react/context-menu';
import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { cn } from '../lib/utils';
import { DropdownMenu, MenuPopup, type MenuPopupProps, popupAnimation } from './dropdown-menu';

/** Arrow keys stop at the first and last item, as they did under Radix. */
const ContextMenuRoot = ({ loopFocus = false, ...props }: ContextMenuPrimitive.Root.Props) => (
  <ContextMenuPrimitive.Root loopFocus={loopFocus} {...props} />
);

/** Opens beside the pointer, where Radix put it. */
const ContextMenuContent = ({
  className,
  side = 'right',
  sideOffset = 2,
  align = 'start',
  ...props
}: MenuPopupProps) => (
  <MenuPopup
    side={side}
    sideOffset={sideOffset}
    align={align}
    className={cn(
      'min-w-40 overflow-hidden rounded-lg bg-background p-1 shadow-lg outline-hidden',
      popupAnimation,
      className,
    )}
    {...props}
  />
);

const ContextMenuItem = ({
  className,
  inset,
  ...props
}: MenuPrimitive.Item.Props & { inset?: boolean }) => (
  <MenuPrimitive.Item
    className={cn(
      'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 font-medium text-sm outline-hidden transition-colors data-highlighted:bg-accent data-disabled:pointer-events-none data-disabled:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
);

export const ContextMenu = Object.assign(ContextMenuRoot, {
  Trigger: ContextMenuPrimitive.Trigger,
  Content: ContextMenuContent,
  Item: ContextMenuItem,
  Group: MenuPrimitive.Group,
  Label: DropdownMenu.Label,
  Separator: DropdownMenu.Separator,
  Shortcut: DropdownMenu.Shortcut,
});
