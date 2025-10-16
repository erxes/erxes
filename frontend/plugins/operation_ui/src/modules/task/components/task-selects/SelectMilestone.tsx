import {
  SelectOperationContent,
  SelectTriggerOperation,
  SelectTriggerVariant,
} from '@/operation/components/SelectOperation';
import { useGetMilestone } from '@/project/hooks/useGetMilestone';
import { useMilestones } from '@/project/hooks/useMilestones';
import { IMilestone } from '@/project/types';
import { useUpdateTask } from '@/task/hooks/useUpdateTask';
import { IconSquareRotated } from '@tabler/icons-react';
import { format } from 'date-fns';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  PopoverScoped,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import React, { useState } from 'react';
import { useDebounce } from 'use-debounce';

interface SelectMilestoneContextType {
  value?: string;
  search?: string;
  milestones: IMilestone[];
  onValueChange: (value: string) => void;
  setSearch?: (search: string) => void;
  handleFetchMore: () => void;
  totalCount?: number;
  loading?: boolean;
}

const SelectMilestoneContext =
  React.createContext<SelectMilestoneContextType | null>(null);

const useSelectMilestoneContext = () => {
  const context = React.useContext(SelectMilestoneContext);
  if (!context) {
    throw new Error(
      'useSelectMilestoneContext must be used within SelectMilestoneProvider',
    );
  }
  return context;
};

export const SelectMilestoneFormItem = ({
  onValueChange,
  projectId,
  scope,
  value,
}: {
  projectId?: string;
  scope?: string;
  onValueChange: (value: string) => void;
  value?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectMilestoneProvider
      value={value}
      onValueChange={(value: string) => {
        onValueChange(value);
        setOpen(false);
      }}
      projectId={projectId}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTriggerOperation variant="form">
          <SelectMilestoneValue />
        </SelectTriggerOperation>
        <SelectOperationContent variant="form">
          <SelectMilestoneContent />
        </SelectOperationContent>
      </PopoverScoped>
    </SelectMilestoneProvider>
  );
};

const SelectMilestoneValue = ({ placeholder }: { placeholder?: string }) => {
  const { milestones, value } = useSelectMilestoneContext();

  const selectedMilestone = milestones.find((p) => p._id === value);

  const { milestone } = useGetMilestone({
    variables: { _id: value },
    skip: !!selectedMilestone || !value,
  });

  const milestoneName =
    selectedMilestone?.name || milestone?.name || 'No milestone';

  if (!value)
    return (
      <div className="flex items-center gap-2 text-accent-foreground">
        <IconSquareRotated className="size-4" />
        <span className="truncate font-medium">
          {milestones?.length
            ? placeholder || 'Select milestone'
            : 'No milestones'}
        </span>
      </div>
    );

  return (
    <div className="flex items-center gap-2">
      <IconSquareRotated className="size-4" />
      <span className="truncate font-medium">
        {milestoneName}&nbsp;
        <span className="text-xs text-muted-foreground">
          {selectedMilestone?.targetDate &&
            format(new Date(selectedMilestone.targetDate), 'MMM dd')}
        </span>
      </span>
    </div>
  );
};

const SelectMilestoneCommandItem = ({
  milestone,
}: {
  milestone: IMilestone;
}) => {
  const { onValueChange, value } = useSelectMilestoneContext();

  return (
    <Command.Item
      value={milestone._id}
      onSelect={() => onValueChange(milestone._id)}
    >
      <div className="flex items-center gap-2">
        <IconSquareRotated className="size-4" />
        <span className="truncate font-medium">
          {milestone.name}&nbsp;
          <span className="text-xs text-muted-foreground">
            {milestone.targetDate &&
              format(new Date(milestone.targetDate), 'MMM dd')}
          </span>
        </span>
      </div>
      <Combobox.Check checked={value === milestone._id} />
    </Command.Item>
  );
};

const SelectMilestoneContent = () => {
  const { milestones, search, setSearch, handleFetchMore, totalCount } =
    useSelectMilestoneContext();

  return (
    <Command shouldFilter={false} id="milestone-command-menu">
      <Command.Input
        placeholder="Search milestone"
        value={search}
        onValueChange={setSearch}
      />
      <Command.Empty>No milestone found</Command.Empty>
      <Command.List>
        <SelectMilestoneCommandItem
          milestone={{ _id: '', name: 'No milestone' } as IMilestone}
        />
        {milestones.map((milestone) => (
          <SelectMilestoneCommandItem
            key={milestone._id}
            milestone={milestone}
          />
        ))}
        <Combobox.FetchMore
          fetchMore={handleFetchMore}
          totalCount={totalCount || 0}
          currentLength={milestones.length}
        />
      </Command.List>
    </Command>
  );
};

const SelectMilestoneProvider = ({
  children,
  value,
  onValueChange,
  projectId,
}: {
  children: React.ReactNode;
  value?: string;
  onValueChange: (value: string) => void;
  projectId?: string;
}) => {
  const [search, setSearch] = useState('');

  const [debouncedSearch] = useDebounce(search, 500);

  const { milestones, handleFetchMore, totalCount, loading } = useMilestones({
    variables: { projectId, searchValue: debouncedSearch },
    skip: !projectId,
  });

  return (
    <SelectMilestoneContext.Provider
      value={{
        value,
        onValueChange,
        milestones: milestones || [],
        handleFetchMore,
        search,
        setSearch,
        totalCount,
        loading,
      }}
    >
      {children}
    </SelectMilestoneContext.Provider>
  );
};

const SelectMilestoneRoot = ({
  value,
  taskId,
  variant,
  projectId,
}: {
  value: string;
  taskId: string;
  variant: `${SelectTriggerVariant}`;
  projectId?: string;
}) => {
  const [open, setOpen] = useState(false);
  const { updateTask } = useUpdateTask();

  return (
    <SelectMilestoneProvider
      value={value}
      onValueChange={(value) => {
        updateTask({
          variables: {
            _id: taskId,
            milestoneId: value || null,
          },
        });
        setOpen(false);
      }}
      projectId={projectId}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <SelectTriggerOperation variant={variant}>
          <SelectMilestoneValue />
        </SelectTriggerOperation>
        <SelectOperationContent variant={variant}>
          <SelectMilestoneContent />
        </SelectOperationContent>
      </PopoverScoped>
    </SelectMilestoneProvider>
  );
};

const SelectMilestoneFilterBar = ({ projectId }: { projectId?: string }) => {
  const [milestone, setMilestone] = useQueryState<string>('milestone');
  const [open, setOpen] = useState(false);

  return (
    <SelectMilestoneProvider
      value={milestone || ''}
      onValueChange={(value) => setMilestone(value as string)}
      projectId={projectId}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <SelectTriggerOperation variant="filter">
          <SelectMilestoneValue />
        </SelectTriggerOperation>
        <SelectOperationContent variant="filter">
          <SelectMilestoneContent />
        </SelectOperationContent>
      </Popover>
    </SelectMilestoneProvider>
  );
};

const SelectMilestoneFilterView = ({ projectId }: { projectId?: string }) => {
  const [milestone, setMilestone] = useQueryState<string>('milestone');
  const { resetFilterState } = useFilterContext();
  return (
    <Filter.View filterKey="milestone">
      <SelectMilestoneProvider
        value={milestone || ''}
        onValueChange={(value) => {
          setMilestone(value as string);
          resetFilterState();
        }}
        projectId={projectId}
      >
        <SelectMilestoneContent />
      </SelectMilestoneProvider>
    </Filter.View>
  );
};

export const SelectMilestone = Object.assign(SelectMilestoneRoot, {
  FilterBar: SelectMilestoneFilterBar,
  FilterView: SelectMilestoneFilterView,
  FormItem: SelectMilestoneFormItem,
});
