import React from 'react';
import { PopoverScoped, Combobox, Command } from 'erxes-ui';
import { useGetActiveCycles } from '@/cycle/hooks/useGetActiveCycles';
import { IconRestore } from '@tabler/icons-react';
import { useState } from 'react';
import { useGetTeam } from '@/team/hooks/useGetTeam';
import { ICycle } from '@/cycle/types';
import {
  SelectTriggerOperation,
  SelectTriggerVariant,
} from '@/operation/components/SelectOperation';
import { useUpdateTask } from '@/task/hooks/useUpdateTask';
import { SelectOperationContent } from '@/operation/components/SelectOperation';
import { format } from 'date-fns';

interface SelectCycleContextType {
  value?: string;
  onValueChange: (value: string) => void;
  activeCycles: ICycle[];
}

const SelectCycleContext = React.createContext<SelectCycleContextType | null>(
  null,
);

const useSelectCycleContext = () => {
  const context = React.useContext(SelectCycleContext);
  if (!context) {
    throw new Error(
      'useSelectCycleContext must be used within SelectCycleProvider',
    );
  }
  return context;
};

export const SelectCycleFormItem = ({
  onValueChange,
  teamId,
  scope,
  value,
}: {
  teamId?: string;
  scope?: string;
  onValueChange: (value: string) => void;
  value?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectCycleProvider
      value={value}
      onValueChange={(value: string) => {
        onValueChange(value);
        setOpen(false);
      }}
      teamId={teamId}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTriggerOperation variant="form">
          <SelectCycleValue />
        </SelectTriggerOperation>
        <SelectOperationContent variant="form">
          <SelectCycleContent />
        </SelectOperationContent>
      </PopoverScoped>
    </SelectCycleProvider>
  );
};

const SelectCycleValue = ({ placeholder }: { placeholder?: string }) => {
  const { activeCycles, value } = useSelectCycleContext();

  if (!value)
    return (
      <div className="flex items-center gap-2 text-accent-foreground">
        <IconRestore className="size-4" />
        <span className="truncate font-medium">
          {placeholder || 'Select cycle'}
        </span>
      </div>
    );

  const selectedCycle = activeCycles.find((c) => c._id === value);

  return (
    <div className="flex items-center gap-2">
      <IconRestore className="size-4" />
      <span className="truncate font-medium">
        {selectedCycle?.name}&nbsp;
        <span className="text-xs text-muted-foreground">
          {selectedCycle?.startDate &&
            format(new Date(selectedCycle.startDate), 'MMM dd')}
          -
          {selectedCycle?.endDate &&
            format(new Date(selectedCycle.endDate), 'MMM dd')}
        </span>
      </span>
    </div>
  );
};

const SelectCycleCommandItem = ({ cycle }: { cycle: ICycle }) => {
  const { onValueChange, value } = useSelectCycleContext();

  return (
    <Command.Item value={cycle._id} onSelect={() => onValueChange(cycle._id)}>
      <div className="flex items-center gap-2">
        <IconRestore className="size-4" />
        <span className="truncate font-medium">
          {cycle.name}&nbsp;
          <span className="text-xs text-muted-foreground">
            {cycle.startDate && format(new Date(cycle.startDate), 'MMM dd')}-{' '}
            {cycle.endDate && format(new Date(cycle.endDate), 'MMM dd')}
          </span>
        </span>
      </div>
      <Combobox.Check checked={value === cycle._id} />
    </Command.Item>
  );
};

const SelectCycleContent = () => {
  const { activeCycles } = useSelectCycleContext();

  return (
    <Command id="cycle-command-menu">
      <Command.Input placeholder="Search cycle" />
      <Command.Empty>No cycle found</Command.Empty>
      <Command.List>
        <SelectCycleCommandItem
          cycle={{ _id: '', name: 'No cycle' } as ICycle}
        />
        {activeCycles.map((cycle) => (
          <SelectCycleCommandItem key={cycle._id} cycle={cycle} />
        ))}
      </Command.List>
    </Command>
  );
};

const SelectCycleProvider = ({
  children,
  value,
  onValueChange,
  teamId,
  taskId,
}: {
  children: React.ReactNode;
  value?: string;
  onValueChange: (value: string) => void;
  teamId?: string;
  taskId?: string;
}) => {
  const { team } = useGetTeam({ variables: { _id: teamId }, skip: !teamId });
  const { activeCycles } = useGetActiveCycles(teamId, taskId);

  if (!team?.cycleEnabled) return null;

  const handleValueChange = (cycleId: string) => {
    onValueChange(cycleId);
  };

  return (
    <SelectCycleContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        activeCycles: activeCycles || [],
      }}
    >
      {children}
    </SelectCycleContext.Provider>
  );
};

const SelectCycleRoot = ({
  value,
  taskId,
  teamId,
  variant,
}: {
  value: string;
  taskId: string;
  teamId: string;
  variant: `${SelectTriggerVariant}`;
}) => {
  const [open, setOpen] = useState(false);
  const { updateTask } = useUpdateTask();

  return (
    <SelectCycleProvider
      value={value}
      onValueChange={(value) => {
        updateTask({
          variables: {
            _id: taskId,
            cycleId: value || null,
          },
        });
        setOpen(false);
      }}
      teamId={teamId}
      taskId={taskId}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <SelectTriggerOperation variant={variant}>
          <SelectCycleValue />
        </SelectTriggerOperation>
        <SelectOperationContent variant={variant}>
          <SelectCycleContent />
        </SelectOperationContent>
      </PopoverScoped>
    </SelectCycleProvider>
  );
};

export const SelectCycle = Object.assign(SelectCycleRoot, {
  FormItem: SelectCycleFormItem,
});
