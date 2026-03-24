import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  cn,
  Combobox,
  Command,
  Filter,
  Popover,
  PopoverScoped,
  Form,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';

import {
  SelectTrigger,
  SelectContent,
  SelectTriggerVariant,
} from './SelectShared';
import { useGetSalesPipelines } from '../../hooks/useGetSalesPipeline';
import { IconCards } from '@tabler/icons-react';

interface IPipeline {
  _id: string;
  name: string;
  [key: string]: any;
}

interface SelectPipelineContextType {
  value: string;
  onValueChange: (pipelineId: string) => void;
  loading?: boolean;
  error?: any;
  pipelines?: IPipeline[];
  boardId?: string;
  mode?: 'single' | 'multiple';
}

const SelectPipelineContext = createContext<SelectPipelineContextType | null>(
  null,
);

const useSelectPipelineContext = () => {
  const context = useContext(SelectPipelineContext);
  if (!context) {
    throw new Error(
      'useSelectPipelineContext must be used within SelectPipelineProvider',
    );
  }
  return context;
};

export const SelectPipelineProvider = ({
  value,
  onValueChange,
  boardId,
  children,
  mode = 'single',
}: {
  value: string | string[];
  onValueChange: (pipelineId: string) => void;
  children: React.ReactNode;
  boardId?: string;
  mode?: 'single' | 'multiple';
}) => {
  const { pipelines, loading, error } = useGetSalesPipelines({
    variables: boardId ? { boardId } : undefined,
    skip: !boardId,
  });

  const handleValueChange = useCallback(
    (pipelineId: string) => {
      if (!pipelineId) return;
      onValueChange?.(pipelineId);
    },
    [onValueChange],
  );

  const contextValue = useMemo(
    () => ({
      value:
        mode === 'single'
          ? (value as string) || ''
          : (value as string[]).join(','),
      onValueChange: handleValueChange,
      pipelines,
      loading,
      error,
      boardId,
      mode,
    }),
    [value, handleValueChange, pipelines, loading, error, boardId, mode],
  );

  return (
    <SelectPipelineContext.Provider value={contextValue}>
      {children}
    </SelectPipelineContext.Provider>
  );
};
const SelectPipelineValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, pipelines, boardId, mode } = useSelectPipelineContext();
  const selectedPipeline = pipelines?.find(
    (pipeline) => pipeline._id === value,
  );

  if (!boardId) {
    return (
      <span className="text-accent-foreground/80">Choose board first</span>
    );
  }

  if (!selectedPipeline && mode === 'single') {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select pipeline'}
      </span>
    );
  }

  if (mode === 'multiple') {
    const selectedPipelines = pipelines?.filter((pipeline) =>
      (value as string).split(',').includes(pipeline._id),
    );

    if (!selectedPipelines?.length) {
      return (
        <span className="text-accent-foreground/80">
          {placeholder || 'Select pipelines'}
        </span>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <p className={cn('font-medium text-sm capitalize', className)}>
          {selectedPipelines.map((p) => p.name).join(', ')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm capitalize', className)}>
        {selectedPipeline?.name}
      </p>
    </div>
  );
};

const SelectPipelineCommandItem = ({ pipeline }: { pipeline: IPipeline }) => {
  const { onValueChange, value, mode } = useSelectPipelineContext();
  const { _id: pipelineId, name } = pipeline || {};

  return (
    <Command.Item
      value={pipelineId}
      onSelect={() => {
        onValueChange(pipelineId);
      }}
    >
      <span className="font-medium capitalize">{name}</span>
      {mode === 'single' && <Combobox.Check checked={value === pipelineId} />}
    </Command.Item>
  );
};

const SelectPipelineContent = () => {
  const { pipelines, boardId, loading, error } = useSelectPipelineContext();

  const renderContent = useCallback(() => {
    if (!boardId) {
      return (
        <div className="flex items-center justify-center h-24">
          <span className="text-muted-foreground">Choose board first</span>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center h-24">
          <span className="text-muted-foreground">Loading...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-24 text-destructive">
          Error: {error.message}
        </div>
      );
    }

    return pipelines?.map((pipeline) => (
      <SelectPipelineCommandItem key={pipeline._id} pipeline={pipeline} />
    ));
  }, [boardId, loading, error, pipelines]);

  const emptyMessage = boardId ? 'No pipelines found' : 'Choose board first';

  return (
    <Command>
      <Command.Input placeholder="Search pipeline" />
      <Command.Empty>
        <span className="text-muted-foreground">{emptyMessage}</span>
      </Command.Empty>
      <Command.List>{renderContent()}</Command.List>
    </Command>
  );
};

const SelectPipelineRoot = ({
  value,
  boardId,
  variant = 'form',
  scope,
  onValueChange,
  disabled,
}: {
  value: string;
  boardId?: string;
  variant?: `${SelectTriggerVariant}`;
  scope?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  const handleValueChange = useCallback(
    (value: string) => {
      onValueChange?.(value);
      setOpen(false);
    },
    [onValueChange],
  );

  return (
    <SelectPipelineProvider
      boardId={boardId}
      value={value}
      onValueChange={handleValueChange}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTrigger variant={variant} disabled={disabled || !boardId}>
          <SelectPipelineValue />
        </SelectTrigger>
        <SelectContent variant={variant}>
          <SelectPipelineContent />
        </SelectContent>
      </PopoverScoped>
    </SelectPipelineProvider>
  );
};

export const SelectPipelineFilterItem = () => {
  return (
    <Filter.Item value="pipelineId">
      <IconCards />
      Pipeline
    </Filter.Item>
  );
};

export const SelectPipelineFilterView = ({
  onValueChange,
  queryKey,
  boardId,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  boardId?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [pipeline, setPipeline] = useQueryState<string[] | string>(
    queryKey || 'pipelineId',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'pipelineId'}>
      <SelectPipelineProvider
        mode={mode}
        boardId={boardId}
        value={pipeline || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setPipeline(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectPipelineContent />
      </SelectPipelineProvider>
    </Filter.View>
  );
};

export const SelectPipelineFilterBar = ({
  iconOnly,
  onValueChange,
  queryKey,
  boardId,
  mode = 'single',
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  boardId?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [pipeline, setPipeline] = useQueryState<string[] | string>(
    queryKey || 'pipelineId',
  );
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={queryKey || 'pipelineId'}>
      <Filter.BarName>
        <IconCards />
        {!iconOnly && 'Pipeline'}
      </Filter.BarName>
      <SelectPipelineProvider
        mode={mode}
        boardId={boardId}
        value={pipeline || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          if (value.length > 0) {
            setPipeline(value as string[] | string);
          } else {
            setPipeline(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={queryKey || 'pipelineId'}>
              <SelectPipelineValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectPipelineContent />
          </Combobox.Content>
        </Popover>
      </SelectPipelineProvider>
    </Filter.BarItem>
  );
};

export const SelectPipelineFormItem = ({
  onValueChange,
  className,
  placeholder,
  boardId,
  ...props
}: Omit<React.ComponentProps<typeof SelectPipelineProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
  boardId?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectPipelineProvider
      boardId={boardId}
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectPipelineValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectPipelineContent />
        </Combobox.Content>
      </Popover>
    </SelectPipelineProvider>
  );
};

SelectPipelineFormItem.displayName = 'SelectPipelineFormItem';

export const SelectPipeline = Object.assign(SelectPipelineRoot, {
  Provider: SelectPipelineProvider,
  Value: SelectPipelineValue,
  Content: SelectPipelineContent,
  FilterItem: SelectPipelineFilterItem,
  FilterView: SelectPipelineFilterView,
  FilterBar: SelectPipelineFilterBar,
  FormItem: SelectPipelineFormItem,
});
