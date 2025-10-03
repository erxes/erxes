import {
  SelectOperationContent,
  SelectTriggerOperation,
  SelectTriggerVariant,
} from '@/operation/components/SelectOperation';
import { StatusInlineIcon } from '@/operation/components/StatusInline';
import {
  SelectProjectContext,
  useSelectProjectContext,
} from '@/project/contexts/SelectProjectContext';
import { useGetProject } from '@/project/hooks/useGetProject';
import { useProjectsInline } from '@/project/hooks/useGetProjects';
import { IProject } from '@/project/types';
import { useUpdateTask } from '@/task/hooks/useUpdateTask';
import { IconClipboard } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  PopoverScoped,
  cn,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDebounce } from 'use-debounce';

export const SelectProjectProvider = ({
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
  const { teamId: _teamId } = useParams();

  const [search, setSearch] = useState('');

  const [debouncedSearch] = useDebounce(search, 500);

  const { projects, handleFetchMore, totalCount } = useProjectsInline({
    variables: {
      teamIds: [teamId || _teamId],
      active: false,
      taskId: taskId,
      name: debouncedSearch,
    },
  });

  return (
    <SelectProjectContext.Provider
      value={{
        value,
        onValueChange,
        projects: projects || [],
        handleFetchMore,
        totalCount,
        search,
        setSearch,
      }}
    >
      {children}
    </SelectProjectContext.Provider>
  );
};

const SelectProjectValue = () => {
  const { projects, value } = useSelectProjectContext();

  const name = projects.find((p) => p._id === value)?.name;

  const { project } = useGetProject({
    variables: { _id: value },
    skip: !!name || !value,
  });

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        !value && 'text-muted-foreground',
      )}
    >
      <IconClipboard className="size-4" />
      <span className="truncate font-medium">
        {name || project?.name || 'No project'}
      </span>
    </div>
  );
};

const SelectProjectCommandItem = ({
  project,
}: {
  project: { _id: string; name: string; status: number };
}) => {
  const { onValueChange, value } = useSelectProjectContext();

  const { _id, name, status } = project || {};

  return (
    <Command.Item
      value={name}
      onSelect={() => onValueChange(_id)}
      className={cn(!project._id && 'text-muted-foreground')}
    >
      <div className="flex items-center gap-2">
        <StatusInlineIcon
          statusType={status}
          className="w-4 h-4"
          stroke={1.8}
        />
        <span className="truncate font-medium">{name}</span>
      </div>
      <Combobox.Check checked={value === _id} />
    </Command.Item>
  );
};

const SelectProjectContent = () => {
  const { projects, handleFetchMore, totalCount, search, setSearch } =
    useSelectProjectContext();

  return (
    <Command id="project-command-menu">
      <Command.Input
        placeholder="Search project"
        value={search}
        onValueChange={setSearch}
      />
      <Command.Empty>No project found</Command.Empty>
      <Command.List>
        <SelectProjectCommandItem
          project={{ _id: '', name: 'No project' } as IProject}
        />
        {projects.map((project) => (
          <SelectProjectCommandItem key={project._id} project={project} />
        ))}
        <Combobox.FetchMore
          fetchMore={handleFetchMore}
          totalCount={totalCount || 0}
          currentLength={projects.length}
        />
      </Command.List>
    </Command>
  );
};

export const SelectProjectFilterView = () => {
  const [project, setProject] = useQueryState<string>('project');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={'project'}>
      <SelectProjectProvider
        value={project || ''}
        onValueChange={(value: string) => {
          setProject(value);
          resetFilterState();
        }}
      >
        <SelectProjectContent />
      </SelectProjectProvider>
    </Filter.View>
  );
};

export const SelectProjectFormItem = ({
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
    <SelectProjectProvider
      value={value}
      onValueChange={(value: string) => {
        onValueChange(value);
        setOpen(false);
      }}
      teamId={teamId}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTriggerOperation variant="form">
          <SelectProjectValue />
        </SelectTriggerOperation>
        <SelectOperationContent variant="form">
          <SelectProjectContent />
        </SelectOperationContent>
      </PopoverScoped>
    </SelectProjectProvider>
  );
};

const SelectProjectRoot = ({
  taskId,
  value,
  scope,
  variant,
  teamId,
}: {
  taskId: string;
  value: string;
  scope?: string;
  variant: `${SelectTriggerVariant}`;
  teamId?: string;
}) => {
  const [open, setOpen] = useState(false);
  const { updateTask } = useUpdateTask();

  return (
    <SelectProjectProvider
      teamId={teamId}
      onValueChange={(value) => {
        updateTask({
          variables: {
            _id: taskId,
            projectId: value,
          },
        });
        setOpen(false);
      }}
      value={value}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTriggerOperation variant={variant}>
          <SelectProjectValue />
        </SelectTriggerOperation>
        <SelectOperationContent variant={variant}>
          <SelectProjectContent />
        </SelectOperationContent>
      </PopoverScoped>
    </SelectProjectProvider>
  );
};

export const SelectProjectFilterBar = () => {
  const [project, setProject] = useQueryState<string>('project');
  const [open, setOpen] = useState(false);
  return (
    <SelectProjectProvider
      value={project || ''}
      onValueChange={(value: string) => {
        setProject(value);
        setOpen(false);
      }}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <SelectTriggerOperation variant="filter">
          <SelectProjectValue />
        </SelectTriggerOperation>
        <SelectOperationContent variant="filter">
          <SelectProjectContent />
        </SelectOperationContent>
      </PopoverScoped>
    </SelectProjectProvider>
  );
};

export const SelectProject = Object.assign(SelectProjectRoot, {
  FilterView: SelectProjectFilterView,
  FilterBar: SelectProjectFilterBar,
  FormItem: SelectProjectFormItem,
});
