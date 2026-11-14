import React from 'react';
import { Button } from './button';
import { cn, mergeRefs } from '../lib/utils';
import { IconCheck, IconChevronDown, IconX } from '@tabler/icons-react';
import { Popover } from './popover';
import { Command } from './command';
import { useOnInView } from 'react-intersection-observer';
import { Skeleton } from './skeleton';
import { Spinner } from './spinner';

const ComboboxTriggerBase = ({
  ref,
  className,
  children,
  hideChevron = false,
  ...props
}: React.ComponentProps<typeof Button> & {
  hideChevron?: boolean;
}) => {
  return (
    <Popover.Trigger
      render={
        <Button
          ref={ref}
          variant="outline"
          {...props}
          type="button"
          className={cn(
            'flex truncate h-7 rounded pl-3 transition-[color,box-shadow] focus-visible:shadow-focus outline-hidden focus-visible:outline-hidden focus-visible:outline-offset-0 focus-visible:outline-transparent justify-start overflow-hidden font-normal text-left w-full gap-1',
            (!props.variant || props.variant === 'outline') && 'shadow-xs',
            props.size === 'lg' && 'gap-2',
            className,
          )}
        />
      }
    >
      {children}
    </Popover.Trigger>
  );
};

const ComboboxTrigger = ({
  ref,
  children,
  hideChevron = false,
  ...props
}: React.ComponentProps<typeof Button> & {
  hideChevron?: boolean;
}) => {
  return (
    <ComboboxTriggerBase {...props} ref={ref}>
      {children}
      {!hideChevron && (
        <IconChevronDown className="size-4 opacity-50 text-muted-foreground  ml-auto" />
      )}
    </ComboboxTriggerBase>
  );
};

const ComboboxValue = ({
  ref,
  value,
  className,
  placeholder,
  loading,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  placeholder?: string;
  loading?: boolean;
  value?: string | React.JSX.Element;
} & React.RefAttributes<HTMLSpanElement>) => {
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
};

const ComboboxContent = ({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof Popover.Content>) => {
  return (
    <Popover.Content
      ref={ref}
      align="start"
      sideOffset={8}
      variant="flush"
      {...props}
      className={cn('min-w-72 w-(--anchor-width) max-w-96', className)}
    />
  );
};

const ComboboxCheck = ({
  ref,
  className,
  checked,
  ...props
}: React.ComponentProps<typeof IconCheck> & {
  checked?: boolean;
}) => {
  if (!checked) {
    return null;
  }

  return (
    <IconCheck
      ref={ref}
      size={16}
      strokeWidth={2}
      className={cn('size-4 text-primary-text ml-auto', className)}
      {...props}
    />
  );
};

const ComboboxChipTrigger = ({
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
        'data-popup-open:border-primary/40',
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
          <IconChevronDown className="size-3.5 shrink-0 text-muted-foreground transition-transform group-data-popup-open:rotate-180" />
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

const ComboboxFetchMore = ({
  ref,
  className,
  totalCount,
  currentLength,
  fetchMore,
  ...props
}: React.ComponentProps<typeof Command.Item> & {
  totalCount: number;
  currentLength: number;
  fetchMore: () => void;
}) => {
  const bottomRef = useOnInView<HTMLDivElement>((inView) => {
    if (inView) fetchMore();
  });

  if (currentLength >= totalCount || !totalCount || currentLength === 0) {
    return null;
  }

  return (
    <Command.Item ref={mergeRefs(ref, bottomRef)} {...props} className={cn(className)}>
      <Spinner
        className="size-4 text-muted-foreground"
        containerClassName="w-auto flex-none mr-2"
      />
      Load more...
    </Command.Item>
  );
};

const ComboboxEmpty = ({
  ref,
  className,
  loading,
  error,
  ...props
}: React.ComponentProps<typeof Command.Empty> & {
  loading?: boolean;
  error?: Pick<Error, 'message'> | null;
}) => {
  return (
    <Command.Empty ref={ref} {...props} className={cn('py-0', className)}>
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
        <p className="text-muted-foreground p-8 text-center">No results found.</p>
      )}
    </Command.Empty>
  );
};

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
