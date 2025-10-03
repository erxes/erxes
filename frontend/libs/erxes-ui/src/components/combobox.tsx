import React from 'react';
import { Button } from './button';
import { cn } from '../lib/utils';
import { IconCheck, IconChevronDown, IconLoader } from '@tabler/icons-react';
import { Popover } from './popover';
import { Command } from './command';
import { useInView } from 'react-intersection-observer';
import { mergeRefs } from 'react-merge-refs';
import { Skeleton } from './skeleton';
import type { ApolloError } from '@apollo/client';

export const ComboboxTriggerBase = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button> & {
    hideChevron?: boolean;
  }
>(({ className, children, hideChevron = false, ...props }, ref) => {
  return (
    <Popover.Trigger asChild>
      <Button
        ref={ref}
        role="combobox"
        variant="outline"
        {...props}
        type="button"
        className={cn(
          'flex truncate h-8 rounded pl-3 transition-[color,box-shadow] focus-visible:shadow-focus outline-none focus-visible:outline-none focus-visible:outline-offset-0 focus-visible:outline-transparent justify-between overflow-hidden font-normal text-left w-full gap-1',
          (!props.variant || props.variant === 'outline') && 'shadow-xs',
          props.size === 'lg' && 'gap-2',
          className,
        )}
      >
        {children}
      </Button>
    </Popover.Trigger>
  );
});

export const ComboboxTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button> & {
    hideChevron?: boolean;
  }
>(({ children, hideChevron = false, ...props }, ref) => {
  return (
    <ComboboxTriggerBase {...props} ref={ref}>
      {children}
      {!hideChevron && (
        <IconChevronDown className="size-4 opacity-50 text-muted-foreground" />
      )}
    </ComboboxTriggerBase>
  );
});

ComboboxTrigger.displayName = 'ComboboxTrigger';

export const ComboboxTriggerIcon = React.forwardRef<
  React.ElementRef<typeof IconChevronDown>,
  React.ComponentPropsWithoutRef<typeof IconChevronDown>
>(({ className, ...props }, ref) => {
  return (
    <IconChevronDown
      ref={ref}
      size={16}
      strokeWidth={2}
      aria-hidden="true"
      className={cn('flex-none opacity-50', className)}
      {...props}
    />
  );
});

export const ComboboxValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    placeholder?: string;
    loading?: boolean;
    value?: string | JSX.Element;
  }
>(({ value, className, placeholder, loading, ...props }, ref) => {
  if (loading) {
    return <Skeleton className="w-full flex-1 h-4" />;
  }

  return (
    <span
      ref={ref}
      {...props}
      className={cn('truncate', className, !value && 'text-accent-foreground')}
    >
      {value || placeholder || ''}
    </span>
  );
});

ComboboxValue.displayName = 'ComboboxValue';

export const ComboboxContent = React.forwardRef<
  React.ElementRef<typeof Popover.Content>,
  React.ComponentPropsWithoutRef<typeof Popover.Content>
>(({ className, ...props }, ref) => {
  return (
    <Popover.Content
      ref={ref}
      align="start"
      sideOffset={8}
      {...props}
      className={cn(
        'p-0 min-w-72 w-[--radix-popper-anchor-width] max-w-96',
        className,
      )}
    />
  );
});

ComboboxContent.displayName = 'ComboboxContent';

export const ComboboxCheck = React.forwardRef<
  React.ElementRef<typeof IconCheck>,
  React.ComponentPropsWithoutRef<typeof IconCheck> & {
    checked?: boolean;
  }
>(({ className, checked, ...props }, ref) => {
  if (!checked) {
    return null;
  }

  return (
    <IconCheck
      ref={ref}
      size={16}
      strokeWidth={2}
      className={cn('size-4 text-primary ml-auto', className)}
      {...props}
    />
  );
});

ComboboxCheck.displayName = 'ComboboxCheck';

export const ComboboxFetchMore = React.forwardRef<
  React.ElementRef<typeof Command.Item>,
  React.ComponentPropsWithoutRef<typeof Command.Item> & {
    totalCount: number;
    currentLength: number;
    fetchMore: () => void;
  }
>(({ className, totalCount, currentLength, fetchMore, ...props }, ref) => {
  const { ref: bottomRef } = useInView({
    onChange: (inView) => inView && fetchMore(),
  });

  if (currentLength >= totalCount || !totalCount || currentLength === 0) {
    return null;
  }

  return (
    <Command.Item
      ref={mergeRefs([ref, bottomRef])}
      {...props}
      className={cn(className)}
    >
      Load more...
      <IconLoader className="w-4 h-4 animate-spin text-muted-foreground ml-auto" />
    </Command.Item>
  );
});

ComboboxFetchMore.displayName = 'ComboboxFetchMore';

const ComboboxEmpty = React.forwardRef<
  React.ElementRef<typeof Command.Empty>,
  React.ComponentPropsWithoutRef<typeof Command.Empty> & {
    loading?: boolean;
    error?: ApolloError;
  }
>(({ className, loading, error, ...props }, ref) => {
  return (
    <Command.Empty ref={ref} {...props} className={cn(className)}>
      {loading ? (
        <div className="flex flex-col gap-2 items-start p-4">
          <Skeleton className="w-2/3 h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-2/3 h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-32 h-4" />
        </div>
      ) : error ? (
        <p className="text-muted-foreground p-8 text-center">{error.message}</p>
      ) : (
        <p className="text-muted-foreground p-8 text-center">
          No results found.
        </p>
      )}
    </Command.Empty>
  );
});

export const Combobox = {
  TriggerBase: ComboboxTriggerBase,
  Trigger: ComboboxTrigger,
  Value: ComboboxValue,
  Content: ComboboxContent,
  Check: ComboboxCheck,
  FetchMore: ComboboxFetchMore,
  Empty: ComboboxEmpty,
};
