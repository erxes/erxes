import {
  cn,
  RecordTableInlineCell,
  Combobox,
  Command,
  Popover,
  PopoverScoped,
  Badge,
  Filter,
  Form,
  Button,
} from 'erxes-ui';
import { IconChevronDown } from '@tabler/icons-react';

export const SelectTriggerVariant = {
  TABLE: 'table',
  CARD: 'card',
  DETAIL: 'detail',
  FORM: 'form',
  FILTER: 'filter',
  ICON: 'icon',
} as const;

export type SelectTriggerVariantType =
  (typeof SelectTriggerVariant)[keyof typeof SelectTriggerVariant];

export const SelectTrigger = ({
  children,
  variant,
  disabled,
}: {
  children: React.ReactNode;
  variant: SelectTriggerVariantType;
  disabled?: boolean;
}) => {
  if (variant === SelectTriggerVariant.TABLE) {
    return (
      <RecordTableInlineCell.Trigger className="gap-1" disabled={disabled}>
        {children}
      </RecordTableInlineCell.Trigger>
    );
  }

  if (variant === SelectTriggerVariant.CARD) {
    return (
      <Popover.Trigger asChild disabled={disabled}>
        <Badge
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {children}
        </Badge>
      </Popover.Trigger>
    );
  }

  if (variant === SelectTriggerVariant.FILTER) {
    return (
      <Popover.Trigger asChild disabled={disabled}>
        <Filter.BarButton disabled={disabled}>{children}</Filter.BarButton>
      </Popover.Trigger>
    );
  }

  if (variant === SelectTriggerVariant.FORM) {
    return (
      <Form.Control className="w-full">
        <Combobox.TriggerBase
          className="w-full h-7 font-medium"
          disabled={disabled}
        >
          {children}
          <IconChevronDown className="h-4 w-4 opacity-50 ml-auto" />
        </Combobox.TriggerBase>
      </Form.Control>
    );
  }

  if (variant === SelectTriggerVariant.ICON) {
    return (
      <Popover.Trigger asChild disabled={disabled}>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {children}
        </Button>
      </Popover.Trigger>
    );
  }

  if (variant === SelectTriggerVariant.DETAIL) {
    return (
      <Popover.Trigger asChild disabled={disabled}>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="h-8 gap-2"
        >
          {children}
          <IconChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </Popover.Trigger>
    );
  }

  return (
    <Combobox.TriggerBase className="w-fit h-7" disabled={disabled}>
      {children}
    </Combobox.TriggerBase>
  );
};

export const SelectContent = ({
  variant,
  children,
}: {
  variant: SelectTriggerVariantType;
  children: React.ReactNode;
}) => {
  if (variant === SelectTriggerVariant.TABLE) {
    return (
      <RecordTableInlineCell.Content>{children}</RecordTableInlineCell.Content>
    );
  }

  const sideOffset =
    variant === SelectTriggerVariant.CARD ||
    variant === SelectTriggerVariant.DETAIL
      ? 4
      : 8;

  return (
    <Combobox.Content
      sideOffset={sideOffset}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </Combobox.Content>
  );
};

export const SelectItemValueBase = ({
  label,
  placeholder,
  className,
}: {
  label?: string;
  placeholder?: string;
  className?: string;
}) => {
  if (!label) {
    return (
      <span className="text-accent-foreground/80">{placeholder || 'Select...'}</span>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm', className)}>{label}</p>
    </div>
  );
};

export const SelectCommandList = ({
  loading,
  error,
  placeholder,
  loadingText,
  emptyText,
  errorText,
  children,
}: {
  loading?: boolean;
  error?: unknown;
  placeholder?: string;
  loadingText?: string;
  emptyText?: string;
  errorText?: string;
  children?: React.ReactNode;
}) => (
  <Command>
    <Command.Input placeholder={placeholder || 'Search...'} />
    {loading ? (
      <Command.List>
        <div className="flex items-center justify-center py-4 h-32">
          <span className="text-muted-foreground">{loadingText || 'Loading...'}</span>
        </div>
      </Command.List>
    ) : error ? (
      <Command.List>
        <div className="flex items-center justify-center py-4 h-32">
          <span className="text-muted-foreground">{errorText || 'Failed to load'}</span>
        </div>
      </Command.List>
    ) : (
      <>
        <Command.Empty>
          <span className="text-muted-foreground">{emptyText || 'No results found'}</span>
        </Command.Empty>
        <Command.List>{children}</Command.List>
      </>
    )}
  </Command>
);

export const SelectFormPopover = ({
  open,
  onOpenChange,
  className,
  children,
  content,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
  children: React.ReactNode;
  content: React.ReactNode;
}) => (
  <Popover open={open} onOpenChange={onOpenChange}>
    <Form.Control>
      <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
        {children}
      </Combobox.Trigger>
    </Form.Control>
    <Combobox.Content>{content}</Combobox.Content>
  </Popover>
);

export const SelectBarPopover = ({
  open,
  onOpenChange,
  filterKey,
  children,
  content,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filterKey: string;
  children: React.ReactNode;
  content: React.ReactNode;
}) => (
  <Popover open={open} onOpenChange={onOpenChange}>
    <Popover.Trigger asChild>
      <Filter.BarButton filterKey={filterKey}>{children}</Filter.BarButton>
    </Popover.Trigger>
    <Combobox.Content>{content}</Combobox.Content>
  </Popover>
);

export const SelectRootPopover = ({
  open,
  onOpenChange,
  scope,
  variant,
  disabled,
  children,
  content,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scope?: string;
  variant: SelectTriggerVariantType;
  disabled?: boolean;
  children: React.ReactNode;
  content: React.ReactNode;
}) => (
  <PopoverScoped open={open} onOpenChange={onOpenChange} scope={scope}>
    <SelectTrigger variant={variant} disabled={disabled}>
      {children}
    </SelectTrigger>
    <SelectContent variant={variant}>{content}</SelectContent>
  </PopoverScoped>
);
