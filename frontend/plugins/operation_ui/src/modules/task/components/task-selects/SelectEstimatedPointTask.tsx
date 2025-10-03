import React, { useState } from 'react';
import { IEstimateChoice } from '@/task/types';
import {
  Badge,
  Button,
  cn,
  Combobox,
  Command,
  isUndefinedOrNull,
  PopoverScoped,
} from 'erxes-ui';
import { IconHash } from '@tabler/icons-react';
import { useGetEstimateChoiceByTeam } from '~/modules/task/hooks/useGetEstimateChoiceByTeam';
import {
  SelectOperationContent,
  SelectTriggerOperation,
  SelectTriggerVariant,
} from '@/operation/components/SelectOperation';
import { useUpdateTask } from '@/task/hooks/useUpdateTask';

interface SelectEstimatedPointContextType {
  value?: number;
  onValueChange: (value: number) => void;
  estimateChoices: IEstimateChoice[];
}

const SelectEstimatedPointContext =
  React.createContext<SelectEstimatedPointContextType | null>(null);

const useSelectEstimatedPointContext = () => {
  const context = React.useContext(SelectEstimatedPointContext);
  if (!context) {
    throw new Error(
      'useSelectEstimatedPointContext must be used within SelectEstimatedPointProvider',
    );
  }
  return context;
};

export const SelectEstimatedPointProvider = ({
  children,
  value,
  onValueChange,
  teamId,
  variant,
}: {
  children: React.ReactNode;
  value?: number;
  onValueChange: (value: number) => void;
  teamId: string;
  variant?: `${SelectTriggerVariant}`;
}) => {
  const { estimateChoices } = useGetEstimateChoiceByTeam({
    variables: { teamId },
    skip: !teamId,
  });

  if (!estimateChoices || !estimateChoices?.length) {
    return null;
  }

  const handleValueChange = (estimate: number) => {
    if (isUndefinedOrNull(estimate)) return;
    onValueChange?.(estimate);
  };

  if (!estimateChoices || !estimateChoices?.length) {
    if (variant === SelectTriggerVariant.CARD) {
      return (
        <Badge variant="secondary" className="opacity-50">
          Estimate not enabled
        </Badge>
      );
    }
    return (
      <Button variant="secondary" className="text-muted-foreground" disabled>
        Estimate not enabled
      </Button>
    );
  }

  return (
    <SelectEstimatedPointContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        estimateChoices: estimateChoices || [],
      }}
    >
      {children}
    </SelectEstimatedPointContext.Provider>
  );
};

const SelectEstimatedPointValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, estimateChoices } = useSelectEstimatedPointContext();
  if (!value) {
    return (
      <div className="flex items-center gap-2 text-accent-foreground">
        <IconHash className="size-4 flex-shrink-0" />
        <span className="truncate font-medium">
          {placeholder || 'Select estimate'}
        </span>
      </div>
    );
  }

  const estimate = estimateChoices.find(
    (estimate) => estimate.value === Number(value),
  );

  return (
    <div className="flex items-center gap-2">
      <IconHash className="size-4 flex-shrink-0" />
      <p className={cn('font-medium', className)}>{estimate?.label}</p>
    </div>
  );
};

const SelectEstimatedPointCommandItem = ({
  estimate,
}: {
  estimate: IEstimateChoice;
}) => {
  const { value, onValueChange } = useSelectEstimatedPointContext();

  return (
    <Command.Item
      value={estimate.value.toString()}
      onSelect={() => onValueChange(estimate.value)}
    >
      <div className="flex items-center gap-2 flex-1">
        <IconHash className="w-4 h-4" stroke={1.8} />
        <span className="font-medium">{estimate.label}</span>
      </div>
      <Combobox.Check checked={value === estimate.value} />
    </Command.Item>
  );
};

const SelectEstimatedPointContent = () => {
  const { estimateChoices } = useSelectEstimatedPointContext();

  return (
    <Command>
      <Command.Input placeholder="Search estimate" />
      <Command.Empty>No estimate found</Command.Empty>
      <Command.List>
        {(estimateChoices || []).map((estimate) => (
          <SelectEstimatedPointCommandItem
            key={estimate.value}
            estimate={estimate}
          />
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectEstimatedPointRoot = ({
  value,
  taskId,
  teamId,
  variant,
}: {
  value: number;
  taskId: string;
  teamId: string;
  variant: `${SelectTriggerVariant}`;
}) => {
  const [open, setOpen] = useState(false);
  const { updateTask } = useUpdateTask();

  return (
    <SelectEstimatedPointProvider
      value={value}
      onValueChange={(value) => {
        updateTask({
          variables: {
            _id: taskId,
            estimatePoint: value,
          },
        });
        setOpen(false);
      }}
      teamId={teamId}
      variant={variant}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <SelectTriggerOperation variant={variant}>
          <SelectEstimatedPointValue />
        </SelectTriggerOperation>
        <SelectOperationContent variant={variant}>
          <SelectEstimatedPointContent />
        </SelectOperationContent>
      </PopoverScoped>
    </SelectEstimatedPointProvider>
  );
};

export const SelectEstimatedPointFormItem = ({
  value,
  teamId,
  onValueChange,
  scope,
}: {
  value: number;
  teamId: string;
  onValueChange: (value: number) => void;
  scope: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectEstimatedPointProvider
      value={value}
      onValueChange={(value) => {
        onValueChange(value);
        setOpen(false);
      }}
      teamId={teamId}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTriggerOperation variant="form">
          <SelectEstimatedPointValue />
        </SelectTriggerOperation>
        <SelectOperationContent variant="form">
          <SelectEstimatedPointContent />
        </SelectOperationContent>
      </PopoverScoped>
    </SelectEstimatedPointProvider>
  );
};

export const SelectEstimatedPoint = Object.assign(SelectEstimatedPointRoot, {
  FormItem: SelectEstimatedPointFormItem,
});
