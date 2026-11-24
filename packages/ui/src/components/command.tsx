import React, { useEffect, useRef } from 'react';

import { IconSearch } from '@tabler/icons-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Command as CommandPrimitive } from 'cmdk';
import { useTranslation } from 'react-i18next';
import { cn, mergeRefs } from '../lib/utils';
import { Dialog } from './dialog';

const CommandRoot = ({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'flex h-full w-full flex-col overflow-hidden rounded-md bg-background outline-hidden',
      className,
    )}
    {...props}
  />
);

/**
 * A command palette in a dialog. The title names the dialog for screen readers; it isn't shown.
 * `shouldFilter={false}` shows the items as given, for results a server already matched.
 */
const CommandDialog = ({
  title,
  description,
  className,
  shouldFilter,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, 'children'> & {
  children: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
  shouldFilter?: boolean;
}) => (
  <Dialog {...props}>
    <Dialog.Content className={cn('overflow-hidden p-0 rounded-lg border-0', className)}>
      <Dialog.Title className="sr-only">{title}</Dialog.Title>
      {description && <Dialog.Description className="sr-only">{description}</Dialog.Description>}
      <CommandRoot
        shouldFilter={shouldFilter}
        className="**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 **:[[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 **:[[cmdk-input]]:h-12 **:[[cmdk-item]]:px-2 **:[[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
      >
        {children}
      </CommandRoot>
    </Dialog.Content>
  </Dialog>
);

const commanInputVariants = cva(
  'flex h-8 w-full rounded-md px-3 text-sm font-medium outline-hidden placeholder:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-transparent',
        secondary: '',
      },
    },
  },
);

const CommandInput = ({
  ref,
  className,
  variant = 'secondary',
  wrapperClassName,
  focusOnMount,
  trailing,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input> & {
  variant?: 'primary' | 'secondary';
  wrapperClassName?: string;
  focusOnMount?: boolean;
  /** Sits at the end of the search row, such as the key that focuses it. */
  trailing?: React.ReactNode;
}) => {
  const { t } = useTranslation('ui', { keyPrefix: 'list' });
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
          ref={mergeRefs(inputRef, ref)}
          className={cn(commanInputVariants({ variant: 'primary' }), 'pl-0', className)}
          {...props}
        />
        {trailing}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center bg-background border-b', wrapperClassName)}>
      <CommandPrimitive.Input
        ref={mergeRefs(inputRef, ref)}
        className={cn(commanInputVariants({ variant: 'secondary' }), className)}
        {...props}
        placeholder={props.placeholder || t('search', 'Search')}
      />
      {trailing && <span className="mr-2 flex shrink-0">{trailing}</span>}
    </div>
  );
};

const CommandList = ({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn(
      'max-h-72 overflow-y-auto hide-scroll m-1 focus-within:[&>div]:outline-hidden focus-within:outline-hidden',
      className,
    )}
    {...props}
  />
);

const CommandEmpty = ({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) => (
  <CommandPrimitive.Empty
    ref={ref}
    className={cn('py-8 text-center text-sm', className)}
    {...props}
  />
);

const commandGroupVariants = cva(
  'overflow-hidden p-1 text-foreground **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-accent-foreground',
  {
    variants: {
      layout: {
        list: '',
        /** Its items side by side, three to a row: `variant="card"` choices. */
        cards:
          '**:[[cmdk-group-items]]:grid **:[[cmdk-group-items]]:grid-cols-3 **:[[cmdk-group-items]]:gap-1',
        /** Its items two to a row: `variant="choice"` cards. */
        choices:
          '**:[[cmdk-group-items]]:grid **:[[cmdk-group-items]]:grid-cols-2 **:[[cmdk-group-items]]:gap-2',
      },
    },
    defaultVariants: { layout: 'list' },
  },
);

const CommandGroup = ({
  ref,
  className,
  layout,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group> &
  VariantProps<typeof commandGroupVariants>) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(commandGroupVariants({ layout }), className)}
    {...props}
  />
);

const CommandSeparator = ({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 h-px bg-border', className)}
    {...props}
  />
);

const commandItemVariants = cva(
  'relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[disabled=true]:opacity-50 [&>svg]:pointer-events-none [&>svg]:size-4 [&>svg]:shrink-0 h-8',
  {
    variants: {
      variant: {
        default: '',
        destructive: 'text-destructive-text',
        /** A card in a grid of choices; checked, it is outlined and tinted primary. */
        tile: 'h-auto gap-2.5 rounded-md border border-transparent py-2',
        /** A square choice in a `layout="cards"` group: its icon over a short label. */
        card: 'h-auto min-h-16 flex-col justify-center gap-1 rounded-lg border border-transparent p-1.5 text-center text-xs data-[selected=true]:border-border',
        /** An outlined card in a `layout="choices"` group: an icon, a name and a line on what it does. */
        choice:
          'h-auto cursor-pointer flex-col items-stretch gap-2 rounded-lg border p-3 data-[selected=true]:border-foreground/20',
      },
      /** The current value among the items, such as the picked icon or the open filter. */
      checked: { true: 'text-primary-text' },
      /**
       * `nested` sits under a group's heading, its text further in. `flush` has no padding, for
       * an item that holds a link filling it (`flex size-full items-center pr-2 pl-7` on the
       * link), so a middle click opens the page in a new tab.
       */
      inset: { default: '', nested: 'cursor-pointer pl-7', flush: 'cursor-pointer p-0' },
    },
    compoundVariants: [
      { variant: ['tile', 'card'], checked: true, className: 'border-primary/30 bg-primary/5' },
      {
        variant: 'choice',
        checked: true,
        className:
          'border-primary bg-primary/10 text-foreground data-[selected=true]:border-primary',
      },
    ],
    defaultVariants: { variant: 'default' },
  },
);

const CommandItem = ({
  ref,
  className,
  variant,
  checked,
  inset,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item> &
  VariantProps<typeof commandItemVariants>) => (
  <CommandPrimitive.Item
    ref={ref}
    aria-current={checked ? 'true' : undefined}
    className={cn(commandItemVariants({ variant, checked, inset }), className)}
    {...props}
  />
);

const CommandActionItem = ({
  icon: Icon,
  label,
  onSelect,
  disabled,
  trailing,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: React.ReactNode;
  onSelect: () => void;
  disabled?: boolean;
  trailing?: React.ReactNode;
  className?: string;
}) => (
  <CommandItem className={cn('justify-between', className)} onSelect={onSelect} disabled={disabled}>
    <div className="flex gap-2 items-center">
      <Icon className="size-4" />
      <div className="flex items-center">{label}</div>
    </div>
    {trailing}
  </CommandItem>
);

const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)}
      {...props}
    />
  );
};

/**
 * A searchable list of items to pick or run, built on cmdk.
 * `Command.Dialog` puts it in a palette; inside `Combobox.Content` it is a picker's list.
 */
export const Command = Object.assign(CommandRoot, {
  Dialog: CommandDialog,
  Input: CommandInput,
  List: CommandList,
  Empty: CommandEmpty,
  Group: CommandGroup,
  Item: CommandItem,
  ActionItem: CommandActionItem,
  Shortcut: CommandShortcut,
  Separator: CommandSeparator,
});
