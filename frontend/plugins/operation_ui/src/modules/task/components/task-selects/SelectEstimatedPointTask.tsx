import React, { useState } from 'react';
import { IEstimateChoice } from '@/task/types';
import {
  Badge,
  Button,
  cn,
  Combobox,
  Command,
  Filter,
  isUndefinedOrNull,
  PopoverScoped,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { IconTriangle } from '@tabler/icons-react';
import { useGetEstimateChoiceByTeam } from '~/modules/task/hooks/useGetEstimateChoiceByTeam';
import {
  SelectOperationContent,
  SelectTriggerOperation,
  SelectTriggerVariant,
} from '@/operation/components/SelectOperation';
import { useUpdateTask } from '@/task/hooks/useUpdateTask';
import { useParams } from 'react-router-dom';

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
  const { estimateChoices: teamEstimateChoices } = useGetEstimateChoiceByTeam({
    variables: { teamId },
    skip: !teamId,
  });

  const defaultEstimateChoices: IEstimateChoice[] = [
    { value: 0, label: 'No estimate' },
    { value: 1, label: '1 points' },
    { value: 2, label: '2 points' },
    { value: 3, label: '3 points' },
    { value: 5, label: '5 points' },
    { value: 8, label: '8 points' },
  ];

  const estimateChoices = teamId ? teamEstimateChoices : defaultEstimateChoices;

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
        <IconTriangle className="size-4 flex-shrink-0" />
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
      <IconTriangle className="size-4 flex-shrink-0" />
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
        <IconTriangle className="w-4 h-4" stroke={1.8} />
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

const SelectEstimatedPointFilterView = () => {
  const { teamId } = useParams();
  const [estimatePoint, setEstimatePoint] =
    useQueryState<number>('estimatePoint');
  const { resetFilterState } = useFilterContext();
  return (
    <Filter.View filterKey="estimatePoint">
      <SelectEstimatedPointProvider
        value={estimatePoint ?? undefined}
        onValueChange={(value) => {
          setEstimatePoint(value);
          resetFilterState();
        }}
        teamId={teamId || ''}
      >
        <SelectEstimatedPointContent />
      </SelectEstimatedPointProvider>
    </Filter.View>
  );
};

const SelectEstimatedPointFilterBar = () => {
  const { teamId } = useParams();
  const [estimatePoint, setEstimatePoint] =
    useQueryState<number>('estimatePoint');
  const [open, setOpen] = useState(false);

  return (
    <SelectEstimatedPointProvider
      value={estimatePoint || undefined}
      onValueChange={(value) => {
        setEstimatePoint(value);
        setOpen(false);
      }}
      teamId={teamId || ''}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <SelectTriggerOperation variant="filter">
          <SelectEstimatedPointValue />
        </SelectTriggerOperation>
        <SelectOperationContent variant="filter">
          <SelectEstimatedPointContent />
        </SelectOperationContent>
      </PopoverScoped>
    </SelectEstimatedPointProvider>
  );
};

export const SelectEstimatedPoint = Object.assign(SelectEstimatedPointRoot, {
  FormItem: SelectEstimatedPointFormItem,
  FilterView: SelectEstimatedPointFilterView,
  FilterBar: SelectEstimatedPointFilterBar,
});
