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

export const SelectTriggerOperation = ({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: `${SelectTriggerVariant}`;
}) => {
  if (variant === SelectTriggerVariant.TABLE) {
    return (
      <RecordTableInlineCell.Trigger className="gap-1">
        {children}
      </RecordTableInlineCell.Trigger>
    );
  }
  if (variant === SelectTriggerVariant.CARD) {
    return (
      <Popover.Trigger asChild>
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
      <Popover.Trigger asChild>
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
    <Combobox.TriggerBase className="w-fit h-7">
      {children}
    </Combobox.TriggerBase>
  );
};

export const SelectOperationContent = ({
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
