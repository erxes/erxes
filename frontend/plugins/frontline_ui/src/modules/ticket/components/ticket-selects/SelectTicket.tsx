import {
  RecordTableInlineCell,
  Combobox,
  Popover,
  Badge,
  Filter,
  Form,
  Button,
} from 'erxes-ui';
import { IconChevronDown, IconX } from '@tabler/icons-react';

export enum SelectTriggerVariant {
  TABLE = 'table',
  CARD = 'card',
  DETAIL = 'detail',
  FORM = 'form',
  FILTER = 'filter',
  ICON = 'icon',
}

export const SelectTicketChipTrigger = ({
  label,
  children,
  disabled,
  onClear,
  clearLabel,
}: {
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
  onClear?: () => void;
  clearLabel?: string;
}) => {
  const trigger = (
    <Combobox.TriggerBase
      className="group w-fit max-w-sm h-7 rounded p-0 gap-0 overflow-hidden data-[state=open]:border-primary/40"
      disabled={disabled}
    >
      <span className="flex h-full shrink-0 items-center whitespace-nowrap px-3 text-muted-foreground bg-muted/40 border-r">
        {label}
      </span>
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
    </Combobox.TriggerBase>
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

export const SelectTriggerTicket = ({
  children,
  variant,
  disabled,
  label,
}: {
  children: React.ReactNode;
  variant: `${SelectTriggerVariant}`;
  disabled?: boolean;
  label?: string;
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
          className="cursor-pointer"
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
        <Filter.BarButton>{children}</Filter.BarButton>
      </Popover.Trigger>
    );
  }

  if (variant === SelectTriggerVariant.FORM) {
    return (
      <Form.Control>
        <Combobox.TriggerBase className="w-fit h-7 font-medium max-w-64">
          {children}
        </Combobox.TriggerBase>
      </Form.Control>
    );
  }

  if (variant === SelectTriggerVariant.ICON) {
    return (
      <Popover.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {children}
        </Button>
      </Popover.Trigger>
    );
  }

  if (variant === SelectTriggerVariant.DETAIL && label) {
    return (
      <SelectTicketChipTrigger label={label} disabled={disabled}>
        {children}
      </SelectTicketChipTrigger>
    );
  }

  return (
    <Combobox.TriggerBase className="w-fit h-7" disabled={disabled}>
      {children}
    </Combobox.TriggerBase>
  );
};

export const SelectTicketContent = ({
  variant,
  children,
}: {
  variant: `${SelectTriggerVariant}`;
  children: React.ReactNode;
}) => {
  if (variant === SelectTriggerVariant.TABLE) {
    return (
      <RecordTableInlineCell.Content>{children}</RecordTableInlineCell.Content>
    );
  }
  return (
    <Combobox.Content
      sideOffset={variant === SelectTriggerVariant.CARD ? 4 : 8}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </Combobox.Content>
  );
};
