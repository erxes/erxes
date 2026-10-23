import React from 'react';
import { Button } from './button';
import { cn } from '../lib/utils';
import { IconCheck, IconChevronDown, IconX } from '@tabler/icons-react';
import { Popover } from './popover';
import { Command } from './command';
import { useInView } from 'react-intersection-observer';
import { mergeRefs } from 'react-merge-refs';
import { Skeleton } from './skeleton';
import type { ApolloError } from '@apollo/client';
import { Spinner } from './spinner';

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
          'flex truncate h-7 rounded pl-3 transition-[color,box-shadow] focus-visible:shadow-focus outline-hidden focus-visible:outline-hidden focus-visible:outline-offset-0 focus-visible:outline-transparent justify-start overflow-hidden font-normal text-left w-full gap-1',
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
        <IconChevronDown className="size-4 opacity-50 text-muted-foreground  ml-auto" />
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
        'p-0 min-w-72 w-(--radix-popper-anchor-width) max-w-96',
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

export const ComboboxChipTrigger = ({
  label,
  children,
  className,
  disabled,
  onClear,
  clearLabel,
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClear?: () => void;
  clearLabel?: string;
}) => {
  const trigger = (
    <ComboboxTriggerBase
      className={cn(
        'group w-fit max-w-sm h-7 rounded p-0 gap-0 overflow-hidden',
        'data-[state=open]:border-primary/40',
        className,
      )}
      disabled={disabled}
    >
      {label && (
        <span className="flex h-full shrink-0 items-center whitespace-nowrap px-3 text-muted-foreground bg-muted/40 border-r">
          {label}
        </span>
      )}
      <span className="flex min-w-0 items-center gap-1.5 pl-3 pr-2.5 font-medium text-foreground">
        <span className="flex min-w-0 items-center gap-1.5 overflow-hidden whitespace-nowrap [&_svg]:size-4 [&_svg]:shrink-0">
          {children}
        </span>
        {onClear ? (
          <span className="size-5 shrink-0" />
        ) : (
          <IconChevronDown className="size-3.5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        )}
      </span>
    </ComboboxTriggerBase>
  );

  if (!onClear) {
    return trigger;
  }

  return (
    <div className="relative w-fit max-w-sm">
      {trigger}
      <Button
        variant="ghost"
        size="icon"
        aria-label={clearLabel}
        title={clearLabel}
        className="absolute right-2 top-1/2 size-5 -translate-y-1/2 p-0 text-muted-foreground"
        onClick={(e) => {
          e.stopPropagation();
          onClear();
        }}
      >
        <IconX />
      </Button>
    </div>
  );
};

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
      <Spinner
        className="size-4 text-muted-foreground"
        containerClassName="w-auto flex-none mr-2"
      />
      Load more...
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
  ChipTrigger: ComboboxChipTrigger,
  FetchMore: ComboboxFetchMore,
  Empty: ComboboxEmpty,
};
