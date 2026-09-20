import {
  BroadcastSelectValueProvider,
  useBroadcastSelectValue,
} from '@/broadcast/context/BroadcastSelectValueContext';
import {
  BROADCAST_MESSAGE_METHODS,
  BROADCAST_SELECTABLE_METHODS,
} from '@/broadcast/constants';
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

const MessageMethodValue = ({ placeholder }: { placeholder?: string }) => {
  const { t } = useTranslation('broadcasts');
  const { value } = useBroadcastSelectValue();

  if (!value) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select method...'}
      </span>
    );
  }

  const status = BROADCAST_MESSAGE_METHODS.find((item) => item.value === value);

  return <>{status ? t(status.labelKey) : null}</>;
};

const MessageMethodCommandItem = ({
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

const MessageMethodContent = () => {
  const { t } = useTranslation('broadcasts');
  return (
    <Command id="status-command-menu">
      <Command.Input placeholder="Select method" />
      <Command.List>
        <Command.Empty>No method found</Command.Empty>
        {BROADCAST_SELECTABLE_METHODS.map((item) => (
          <MessageMethodCommandItem
            key={item.value}
            status={item.value}
            text={t(item.labelKey)}
          />
        ))}
      </Command.List>
    </Command>
  );
};

const SelectBroadcastMessageMethodFilterView = ({
  queryKey,
}: {
  queryKey?: string;
}) => {
  const [types, setStatus] = useQueryState<string>(queryKey || 'methods');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'methods'}>
      <BroadcastSelectValueProvider
        value={types as string}
        onValueChange={(value) => {
          setStatus(value);
          resetFilterState();
        }}
      >
        <MessageMethodContent />
      </BroadcastSelectValueProvider>
    </Filter.View>
  );
};

const SelectBroadcastMessageMethodFilterBar = ({
  queryKey,
}: {
  queryKey?: string;
}) => {
  const [status, setStatus] = useQueryState<string>(queryKey || 'methods');
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
          <Filter.BarButton filterKey={queryKey || 'methods'}>
            <MessageMethodValue />
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <MessageMethodContent />
        </Combobox.Content>
      </PopoverScoped>
    </BroadcastSelectValueProvider>
  );
};

const BroadcastMessageMethodRoot = ({
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
          <MessageMethodValue />
        </SelectTriggerOperation>
        <SelectOperationContent variant={variant}>
          <MessageMethodContent />
        </SelectOperationContent>
      </PopoverScoped>
    </BroadcastSelectValueProvider>
  );
};

export const BroadcastMessageMethod = Object.assign(
  BroadcastMessageMethodRoot,
  {
    FilterView: SelectBroadcastMessageMethodFilterView,
    FilterBar: SelectBroadcastMessageMethodFilterBar,
  },
);
