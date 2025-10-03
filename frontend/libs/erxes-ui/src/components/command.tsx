import * as React from 'react';

import { IconSearch } from '@tabler/icons-react';
import { cva } from 'class-variance-authority';
import { Command as CommandPrimitive } from 'cmdk';

import { Dialog, DialogProps } from './dialog';
import { cn } from '../lib/utils';
import { useRef } from 'react';
import { useEffect } from 'react';
import { mergeRefs } from 'react-merge-refs';

const CommandRoot = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'flex h-full w-full flex-col overflow-hidden rounded-md bg-background outline-none',
      className,
    )}
    {...props}
  />
));
CommandRoot.displayName = CommandPrimitive.displayName;

type CommandDialogProps = DialogProps & {
  dialogContentClassName?: string;
};

const CommandDialog = ({
  children,
  dialogContentClassName,
  ...props
}: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <Dialog.Content
        className={cn(
          'overflow-hidden p-0 rounded-lg border-0',
          dialogContentClassName,
        )}
      >
        <CommandRoot className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </CommandRoot>
      </Dialog.Content>
    </Dialog>
  );
};

const commanInputVariants = cva(
  'flex h-9 w-full rounded-md p-3 text-sm font-medium outline-none placeholder:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-transparent',
        secondary: '',
      },
    },
  },
);

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> & {
    variant?: 'primary' | 'secondary';
    wrapperClassName?: string;
    focusOnMount?: boolean;
  }
>(
  (
    {
      className,
      variant = 'secondary',
      wrapperClassName,
      focusOnMount,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (inputRef.current && focusOnMount) {
        inputRef.current.focus();
      }
    }, [focusOnMount]);

    if (variant === 'primary') {
      return (
        <div
          className={cn('flex items-center border-b px-3', wrapperClassName)}
          cmdk-input-wrapper=""
        >
          <IconSearch className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <CommandPrimitive.Input
            ref={mergeRefs([inputRef, ref])}
            className={cn(
              commanInputVariants({ variant: 'primary' }),
              'pl-0',
              className,
            )}
            {...props}
          />
        </div>
      );
    }

    return (
      <div
        className={cn(
          'flex items-center bg-background border-b',
          wrapperClassName,
        )}
      >
        <CommandPrimitive.Input
          ref={mergeRefs([inputRef, ref])}
          className={cn(
            commanInputVariants({ variant: 'secondary' }),
            className,
          )}
          {...props}
          placeholder={props.placeholder || 'Search'}
        />
      </div>
    );
  },
);

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn(
      'max-h-[300px] overflow-y-auto overflow-x-hidden p-1 [&>div]:focus-within:outline-none focus-within:outline-none',
      className,
    )}
    {...props}
  />
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-8 text-center text-sm"
    {...props}
  />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-accent-foreground',
      className,
    )}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 h-px bg-border', className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[disabled=true]:opacity-50 [&>svg]:pointer-events-none [&>svg]:size-4 [&>svg]:shrink-0 h-8',
      className,
    )}
    {...props}
  />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        'ml-auto text-xs tracking-widest text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
};
CommandShortcut.displayName = 'CommandShortcut';

export const Command = Object.assign(CommandRoot, {
  Dialog: CommandDialog,
  Input: CommandInput,
  List: CommandList,
  Empty: CommandEmpty,
  Group: CommandGroup,
  Item: CommandItem,
  Shortcut: CommandShortcut,
  Separator: CommandSeparator,
  Primitive: CommandPrimitive,
});
