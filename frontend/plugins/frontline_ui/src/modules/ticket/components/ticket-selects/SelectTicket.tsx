import {
  RecordTableInlineCell,
  Combobox,
  Popover,
  Badge,
  Filter,
  Form,
  Button,
} from 'erxes-ui';

export enum SelectTriggerVariant {
  TABLE = 'table',
  CARD = 'card',
  DETAIL = 'detail',
  FORM = 'form',
  FILTER = 'filter',
  ICON = 'icon',
}

export const SelectTriggerTicket = ({
  children,
  variant,
  disabled,
}: {
  children: React.ReactNode;
  variant: `${SelectTriggerVariant}`;
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
