import {
  BroadcastSelectValueProvider,
  useBroadcastSelectValue,
} from '@/broadcast/context/BroadcastSelectValueContext';
import { BROADCAST_MESSAGE_STATUS } from '@/broadcast/constants';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  PopoverScoped,
  SelectOperationContent,
  SelectTriggerOperation,
  SelectTriggerVariant,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const MessageStatusValue = ({ placeholder }: { placeholder?: string }) => {
  const { t } = useTranslation('broadcasts');
  const { value } = useBroadcastSelectValue();

  if (!value) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select status...'}
      </span>
    );
  }

  const status = BROADCAST_MESSAGE_STATUS.find((item) => item.value === value);

  return <>{status ? t(status.labelKey) : null}</>;
};

const MessageStatusCommandItem = ({
  status,
  text,
}: {
  status: string;
  text: string;
}) => {
  const { onValueChange, value } = useBroadcastSelectValue();

  return (
    <Command.Item
      value={status}
      key={status}
      onSelect={() => {
        const newStatus = value === status ? '' : status;

        onValueChange(newStatus);
      }}
    >
      {text}
      <Combobox.Check checked={value === status} />
    </Command.Item>
  );
};

const MessageStatusContent = () => {
  const { t } = useTranslation('broadcasts');
  return (
    <Command id="status-command-menu">
      <Command.Input placeholder="Select status" />
      <Command.List>
        <Command.Empty>No status found</Command.Empty>
        {BROADCAST_MESSAGE_STATUS.map((item) => (
          <MessageStatusCommandItem
            key={item.value}
            status={item.value}
            text={t(item.labelKey)}
          />
        ))}
      </Command.List>
    </Command>
  );
};

const SelectBroadcastMessageStatusFilterView = ({
  queryKey,
}: {
  queryKey?: string;
}) => {
  const [types, setStatus] = useQueryState<string>(queryKey || 'status');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'status'}>
      <BroadcastSelectValueProvider
        value={types as string}
        onValueChange={(value) => {
          setStatus(value);
          resetFilterState();
        }}
      >
        <MessageStatusContent />
      </BroadcastSelectValueProvider>
    </Filter.View>
  );
};

const SelectBroadcastMessageStatusFilterBar = ({
  queryKey,
}: {
  queryKey?: string;
}) => {
  const [status, setStatus] = useQueryState<string>(queryKey || 'status');
  const [open, setOpen] = useState(false);

  return (
    <BroadcastSelectValueProvider
      value={status as string}
      onValueChange={(value) => {
        setStatus(value);
        setOpen(false);
      }}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey={queryKey || 'status'}>
            <MessageStatusValue />
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <MessageStatusContent />
        </Combobox.Content>
      </PopoverScoped>
    </BroadcastSelectValueProvider>
  );
};

const BroadcastMessageStatusRoot = ({
  value,
  variant,
  scope,
  onValueChange,
}: {
  value?: string;
  variant: `${SelectTriggerVariant}`;
  scope?: string;
  onValueChange?: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  const handleValueChange = (value: string) => {
    onValueChange?.(value);
    setOpen(false);
  };

  return (
    <BroadcastSelectValueProvider
      value={value}
      onValueChange={handleValueChange}
      variant={variant}
    >
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <SelectTriggerOperation variant={variant}>
          <MessageStatusValue />
        </SelectTriggerOperation>
        <SelectOperationContent variant={variant}>
          <MessageStatusContent />
        </SelectOperationContent>
      </PopoverScoped>
    </BroadcastSelectValueProvider>
  );
};

export const BroadcastMessageStatus = Object.assign(
  BroadcastMessageStatusRoot,
  {
    FilterView: SelectBroadcastMessageStatusFilterView,
    FilterBar: SelectBroadcastMessageStatusFilterBar,
  },
);
