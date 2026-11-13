import React from 'react';

import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui';
import { IconCheck } from '@tabler/icons-react';

import { cn } from '../lib/utils';

const DropdownMenuSubTrigger = ({
  ref,
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      'flex min-h-8 cursor-default gap-2 select-none items-center rounded-sm text-sm px-2 outline-hidden focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
      inset && 'pl-8',
      className,
    )}
    {...props}
  >
    {children}
  </DropdownMenuPrimitive.SubTrigger>
);

const DropdownMenuSubContent = ({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      'z-50 min-w-32 overflow-hidden rounded-md text-sm bg-background p-1 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className,
    )}
    {...props}
  />
);

const DropdownMenuContent = ({
  ref,
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-[300px] overflow-hidden rounded-lg bg-background p-1 shadow-lg',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
);

const DropdownMenuItem = ({
  ref,
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
}) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex min-h-8 cursor-default select-none items-center gap-2 rounded-sm px-2 text-sm outline-hidden transition-colors focus:bg-accent data-disabled:pointer-events-none data-disabled:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
);

const DropdownMenuCheckboxItem = ({
  ref,
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      'relative flex min-h-8 cursor-default select-none items-center rounded-sm pl-8 pr-2 text-sm outline-hidden transition-colors focus:bg-accent data-disabled:pointer-events-none data-disabled:opacity-50',
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <IconCheck className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
);

const DropdownMenuRadioItem = ({
  ref,
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      'relative flex min-h-8 cursor-default select-none items-center rounded-sm text-sm pl-2 pr-8 outline-hidden transition-colors focus:bg-accent data-disabled:pointer-events-none data-disabled:opacity-50 data-[state=checked]:text-primary-text [&>svg]:size-4 [&>svg]:shrink-0 gap-2',
      className,
    )}
    {...props}
  >
    {children}
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <IconCheck className="size-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
  </DropdownMenuPrimitive.RadioItem>
);

const DropdownMenuLabel = ({
  ref,
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      'px-2 py-1.5 text-xs font-medium text-accent-foreground',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
);

const DropdownMenuSeparator = ({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
);

const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span className={cn('ml-auto text-xs tracking-widest opacity-60', className)} {...props} />
  );
};

export const DropdownMenu = Object.assign(DropdownMenuPrimitive.Root, {
  Trigger: DropdownMenuPrimitive.Trigger,
  Group: DropdownMenuPrimitive.Group,
  Portal: DropdownMenuPrimitive.Portal,
  Sub: DropdownMenuPrimitive.Sub,
  SubTrigger: DropdownMenuSubTrigger,
  SubContent: DropdownMenuSubContent,
  RadioGroup: DropdownMenuPrimitive.RadioGroup,
  RadioItem: DropdownMenuRadioItem,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  CheckboxItem: DropdownMenuCheckboxItem,
  Label: DropdownMenuLabel,
  Shortcut: DropdownMenuShortcut,
  Separator: DropdownMenuSeparator,
});
