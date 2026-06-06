import {
  RecordTableInlineCell,
  Combobox,
  Popover,
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
