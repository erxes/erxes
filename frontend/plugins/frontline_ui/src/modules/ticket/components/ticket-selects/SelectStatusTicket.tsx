import React, { useEffect, useState } from 'react';
import {
  cn,
  Combobox,
  Command,
  Filter,
  PopoverScoped,
  useQueryState,
  useFilterContext,
} from 'erxes-ui';
import { addTicketSchema } from '@/ticket/types';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';
import { useGetTicketStatusesByPipeline } from '@/status/hooks/useGetTicketStatus';
import { ITicketStatusChoice } from '@/status/types';
import { TICKET_STATUS_TYPES } from '@/status/constants';
import { StatusInlineIcon } from '@/status/components/StatusInline';
import {
  SelectTicketContent,
  SelectTriggerTicket,
  SelectTriggerVariant,
} from '@/ticket/components/ticket-selects/SelectTicket';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { z } from 'zod';

interface SelectStatusContextType {
  value: string;
  onValueChange: (status: string) => void;
  loading?: boolean;
  error?: any;
  statuses?: ITicketStatusChoice[];
  pipelineId?: string;
}

const SelectStatusContext = React.createContext<SelectStatusContextType | null>(
  null,
);

const useSelectStatusContext = () => {
  const context = React.useContext(SelectStatusContext);
  if (!context) {
    throw new Error(
      'useSelectStatusContext must be used within SelectStatusProvider',
    );
  }
  return context;
};

export const SelectStatusProvider = ({
  value,
  onValueChange,
  pipelineId,
  children,
}: {
  value: string;
  onValueChange: (status: string) => void;
  children: React.ReactNode;
  pipelineId?: string;
}) => {
  const handleValueChange = (status: string) => {
    if (!status) return;
    onValueChange?.(status);
  };
  const { statuses, loading, error } = useGetTicketStatusesByPipeline({
    variables: { pipelineId },
    skip: !pipelineId,
  });
  return (
    <SelectStatusContext.Provider
      value={{
        value: value || '',
        onValueChange: handleValueChange,
        statuses,
        loading,
        error,
        pipelineId,
      }}
    >
      {children}
    </SelectStatusContext.Provider>
  );
};

const SelectStatusValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, statuses } = useSelectStatusContext();
  const selectedStatus = statuses?.find((status) => status.value === value);

  if (!selectedStatus) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select status'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <StatusInlineIcon
        statusType={selectedStatus.type}
        color={selectedStatus.color}
      />
      <p className={cn('font-medium text-sm capitalize', className)}>
        {selectedStatus.label}
      </p>
    </div>
  );
};

const SelectStatusCommandItem = ({
  status,
}: {
  status: ITicketStatusChoice;
}) => {
  const { onValueChange, value } = useSelectStatusContext();
  const { label, value: statusValue, type, color } = status || {};

  return (
    <Command.Item
      value={statusValue}
      onSelect={() => {
        onValueChange(statusValue);
      }}
    >
      <div className="flex items-center gap-2 flex-1">
        <StatusInlineIcon statusType={type} color={color} />
        <span className="font-medium capitalize">{label}</span>
      </div>
      <Combobox.Check checked={value === statusValue} />
    </Command.Item>
  );
};

const SelectStatusContent = () => {
  const { statuses, pipelineId } = useSelectStatusContext();
  return (
    <Command>
      <Command.Input placeholder="Search status" />
      <Command.Empty>
        <span className="text-muted-foreground">
          {pipelineId ? 'No status found' : 'Pipeline not selected'}
        </span>
      </Command.Empty>
      <Command.List>
        {statuses?.map((status) => (
          <SelectStatusCommandItem key={status.value} status={status} />
        ))}
      </Command.List>
    </Command>
  );
};

const SelectStatusTicketRoot = ({
  value,
  id,
  pipelineId,
  variant,
  scope,
  onValueChange,
}: {
  value: string;
  id: string;
  pipelineId: string;
  variant: `${SelectTriggerVariant}`;
  scope?: string;
  onValueChange?: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const { updateTicket } = useUpdateTicket();
  const handleValueChange = (value: string) => {
    if (id) {
      updateTicket({
        variables: {
          _id: id,
          statusId: value,
        },
      });
      onValueChange?.(value);
    }
    setOpen(false);
  };

  return (
    <SelectStatusProvider
      pipelineId={pipelineId}
      value={value}
      onValueChange={handleValueChange}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTriggerTicket variant={variant}>
          <SelectStatusValue />
        </SelectTriggerTicket>
        <SelectTicketContent variant={variant}>
          <SelectStatusContent />
        </SelectTicketContent>
      </PopoverScoped>
    </SelectStatusProvider>
  );
};

export const SelectStatusTicketFilterView = ({
  pipelineId,
}: {
  pipelineId?: string;
}) => {
  const [status, setStatus] = useQueryState<string>('statusId');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="statusId">
      <SelectStatusProvider
        value={status || ''}
        pipelineId={pipelineId}
        onValueChange={(value) => {
          setStatus(value as string);
          resetFilterState();
        }}
      >
        <SelectStatusContent />
      </SelectStatusProvider>
    </Filter.View>
  );
};

export const SelectStatusTicketFilterBar = ({
  pipelineId,
  scope,
}: {
  pipelineId?: string;
  scope?: string;
}) => {
  const [status, setStatus] = useQueryState<string>('statusId');
  const [open, setOpen] = useState(false);

  return (
    <SelectStatusProvider
      pipelineId={pipelineId}
      value={status || ''}
      onValueChange={(value) => {
        setStatus(value);
        setOpen(false);
      }}
    >
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <Filter.BarButton filterKey="statusId">
          <SelectStatusValue placeholder="Status" />
        </Filter.BarButton>
        <Combobox.Content>
          <SelectStatusContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectStatusProvider>
  );
};

export const SelectStatusTicketFormItem = ({
  value,
  onValueChange,
  form,
}: {
  value: string;
  onValueChange: (value: string) => void;
  form?: UseFormReturn<z.infer<typeof addTicketSchema>>;
}) => {
  const pipelineId = useWatch({ name: 'pipelineId', control: form?.control });
  const { statuses } = useGetTicketStatusesByPipeline({
    variables: { pipelineId },
    skip: !pipelineId,
  });

  const [open, setOpen] = useState(false);

  const fallBackStatus = statuses?.find(
    (status) => status.type === TICKET_STATUS_TYPES.NEW,
  )?.value;

  useEffect(() => {
    if (fallBackStatus && !value) {
      onValueChange(fallBackStatus);
    }
  }, [fallBackStatus, value, onValueChange]);

  return (
    <SelectStatusProvider
      value={value}
      onValueChange={(value) => {
        onValueChange(value);
        setOpen(false);
      }}
      pipelineId={pipelineId || undefined}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <SelectTriggerTicket variant="form">
          <SelectStatusValue />
        </SelectTriggerTicket>
        <Combobox.Content>
          <SelectStatusContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectStatusProvider>
  );
};

export const SelectStatusTicket = Object.assign(SelectStatusTicketRoot, {
  Provider: SelectStatusProvider,
  Value: SelectStatusValue,
  Content: SelectStatusContent,
  FilterView: SelectStatusTicketFilterView,
  FilterBar: SelectStatusTicketFilterBar,
  FormItem: SelectStatusTicketFormItem,
});
