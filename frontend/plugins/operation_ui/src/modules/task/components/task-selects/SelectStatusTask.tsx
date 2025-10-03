import React, { useEffect, useState } from 'react';
import {
  cn,
  Combobox,
  Command,
  Filter,
  PopoverScoped,
  useQueryState,
} from 'erxes-ui';
import { addTaskSchema, ITaskStatus } from '@/task/types';
import { useUpdateTask } from '@/task/hooks/useUpdateTask';
import { useGetStatusByTeam } from '@/task/hooks/useGetStatusByTeam';
import {
  STATUS_TYPES,
  StatusInlineIcon,
} from '@/operation/components/StatusInline';
import {
  SelectOperationContent,
  SelectTriggerOperation,
  SelectTriggerVariant,
} from '@/operation/components/SelectOperation';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { z } from 'zod';

interface SelectStatusContextType {
  value: string;
  onValueChange: (status: string) => void;
  loading?: boolean;
  error?: any;
  statuses?: ITaskStatus[];
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
  teamId,
  children,
}: {
  value: string;
  onValueChange: (status: string) => void;
  children: React.ReactNode;
  teamId?: string;
}) => {
  const handleValueChange = (status: string) => {
    if (!status) return;
    onValueChange?.(status);
  };
  const { statuses, loading, error } = useGetStatusByTeam({
    variables: { teamId },
    skip: !teamId,
  });

  return (
    <SelectStatusContext.Provider
      value={{
        value: value || '',
        onValueChange: handleValueChange,
        statuses,
        loading,
        error,
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

const SelectStatusCommandItem = ({ status }: { status: ITaskStatus }) => {
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
  const { statuses } = useSelectStatusContext();
  return (
    <Command>
      <Command.Input placeholder="Search status" />
      <Command.Empty>No status found</Command.Empty>
      <Command.List>
        {statuses?.map((status) => (
          <SelectStatusCommandItem key={status.value} status={status} />
        ))}
      </Command.List>
    </Command>
  );
};

const SelectStatusTaskRoot = ({
  value,
  id,
  teamId,
  variant,
  scope,
  onValueChange,
}: {
  value: string;
  id: string;
  teamId: string;
  variant: `${SelectTriggerVariant}`;
  scope?: string;
  onValueChange?: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const { updateTask } = useUpdateTask();

  const handleValueChange = (value: string) => {
    if (id) {
      updateTask({
        variables: {
          _id: id,
          status: value,
        },
      });
      onValueChange?.(value);
    }
    setOpen(false);
  };

  return (
    <SelectStatusProvider
      teamId={teamId}
      value={value}
      onValueChange={handleValueChange}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTriggerOperation variant={variant}>
          <SelectStatusValue />
        </SelectTriggerOperation>
        <SelectOperationContent variant={variant}>
          <SelectStatusContent />
        </SelectOperationContent>
      </PopoverScoped>
    </SelectStatusProvider>
  );
};

export const SelectStatusTaskFilterView = ({ teamId }: { teamId?: string }) => {
  const [status, setStatus] = useQueryState<string>(
    teamId ? 'status' : 'statusType',
  );

  return (
    <Filter.View filterKey={teamId ? 'status' : 'statusType'}>
      <SelectStatusProvider
        value={status || ''}
        teamId={teamId}
        onValueChange={(value) => setStatus(value as string)}
      >
        <SelectStatusContent />
      </SelectStatusProvider>
    </Filter.View>
  );
};

export const SelectStatusTaskFilterBar = ({
  teamId,
  scope,
}: {
  teamId?: string;
  scope?: string;
}) => {
  const [status, setStatus] = useQueryState<string>(
    teamId ? 'status' : 'statusType',
  );
  const [open, setOpen] = useState(false);

  return (
    <SelectStatusProvider
      teamId={teamId}
      value={status || ''}
      onValueChange={(value) => {
        setStatus(value);
        setOpen(false);
      }}
    >
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <Filter.BarButton filterKey={teamId ? 'status' : 'statusType'}>
          <SelectStatusValue placeholder="Status" />
        </Filter.BarButton>
        <Combobox.Content>
          <SelectStatusContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectStatusProvider>
  );
};

export const SelectStatusTaskFormItem = ({
  value,
  onValueChange,
  form,
}: {
  value: string;
  onValueChange: (value: string) => void;
  form?: UseFormReturn<z.infer<typeof addTaskSchema>>;
}) => {
  const teamId = useWatch({ name: 'teamId', control: form?.control });
  const { statuses } = useGetStatusByTeam({
    variables: { teamId },
    skip: !teamId,
  });

  const [open, setOpen] = useState(false);

  const fallBackStatus = statuses?.find(
    (status) => status.type === STATUS_TYPES.UNSTARTED,
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
      teamId={teamId}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <SelectTriggerOperation variant="form">
          <SelectStatusValue />
        </SelectTriggerOperation>
        <Combobox.Content>
          <SelectStatusContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectStatusProvider>
  );
};

export const SelectStatusTask = Object.assign(SelectStatusTaskRoot, {
  Provider: SelectStatusProvider,
  Value: SelectStatusValue,
  Content: SelectStatusContent,
  FilterView: SelectStatusTaskFilterView,
  FilterBar: SelectStatusTaskFilterBar,
  FormItem: SelectStatusTaskFormItem,
});
