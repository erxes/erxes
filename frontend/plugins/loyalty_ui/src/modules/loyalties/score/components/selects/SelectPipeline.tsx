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
  Form,
  Popover,
  PopoverScoped,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { IconCards } from '@tabler/icons-react';
import { useGetSalesPipelines } from '../../hooks/useGetSalesPipelines';

interface IPipeline {
  _id: string;
  name: string;
}

interface SelectPipelineContextType {
  value: string;
  onValueChange: (pipelineId: string) => void;
  loading?: boolean;
  error?: Error;
  pipelines?: IPipeline[];
  boardId?: string;
  mode?: 'single' | 'multiple';
}

const SelectPipelineContext = createContext<SelectPipelineContextType | null>(
  null,
);

const useSelectPipelineContext = () => {
  const context = useContext(SelectPipelineContext);
  if (!context)
    throw new Error(
      'useSelectPipelineContext must be used within SelectPipelineProvider',
    );
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
  const { value, pipelines, boardId } = useSelectPipelineContext();
  const selected = pipelines?.find((p) => p._id === value);

  if (!boardId)
    return (
      <span className="text-accent-foreground/80">Choose board first</span>
    );

  if (!selected)
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select pipeline'}
      </span>
    );

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm capitalize', className)}>
        {selected.name}
      </p>
    </div>
  );
};

const SelectPipelineCommandItem = ({ pipeline }: { pipeline: IPipeline }) => {
  const { onValueChange, value, mode } = useSelectPipelineContext();
  return (
    <Command.Item
      value={pipeline._id}
      onSelect={() => onValueChange(pipeline._id)}
    >
      <span className="font-medium capitalize">{pipeline.name}</span>
      {mode === 'single' && <Combobox.Check checked={value === pipeline._id} />}
    </Command.Item>
  );
};

const SelectPipelineContent = () => {
  const { pipelines, boardId, loading, error } = useSelectPipelineContext();

  const renderContent = useCallback(() => {
    if (!boardId)
      return (
        <div className="flex items-center justify-center h-24">
          <span className="text-muted-foreground">Choose board first</span>
        </div>
      );
    if (loading)
      return (
        <div className="flex items-center justify-center h-24">
          <span className="text-muted-foreground">Loading...</span>
        </div>
      );
    if (error)
      return (
        <div className="flex items-center justify-center h-24 text-destructive">
          Error: {error.message}
        </div>
      );
    return pipelines?.map((p) => (
      <SelectPipelineCommandItem key={p._id} pipeline={p} />
    ));
  }, [boardId, loading, error, pipelines]);

  return (
    <Command>
      <Command.Input placeholder="Search pipeline" />
      <Command.Empty>
        <span className="text-muted-foreground">
          {boardId ? 'No pipelines found' : 'Choose board first'}
        </span>
      </Command.Empty>
      <Command.List>{renderContent()}</Command.List>
    </Command>
  );
};

export const SelectPipelineFilterItem = () => (
  <Filter.Item value="scorePipelineId">
    <IconCards />
    Pipeline
  </Filter.Item>
);

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
    queryKey || 'scorePipelineId',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'scorePipelineId'}>
      <SelectPipelineProvider
        mode={mode}
        boardId={boardId}
        value={pipeline || (mode === 'single' ? '' : [])}
        onValueChange={(val) => {
          setPipeline(val as string[] | string);
          resetFilterState();
          onValueChange?.(val);
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
    queryKey || 'scorePipelineId',
  );
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={queryKey || 'scorePipelineId'}>
      <Filter.BarName>
        <IconCards />
        {!iconOnly && 'Pipeline'}
      </Filter.BarName>
      <SelectPipelineProvider
        mode={mode}
        boardId={boardId}
        value={pipeline || (mode === 'single' ? '' : [])}
        onValueChange={(val) => {
          if (val.length > 0) setPipeline(val as string[] | string);
          else setPipeline(null);
          setOpen(false);
          onValueChange?.(val);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={queryKey || 'scorePipelineId'}>
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
      onValueChange={(val) => {
        onValueChange?.(val);
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

const SelectPipelineRoot = ({
  value,
  boardId,
  scope,
  onValueChange,
  disabled,
}: {
  value: string;
  boardId?: string;
  scope?: string;
  onValueChange?: (val: string) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectPipelineProvider
      boardId={boardId}
      value={value}
      onValueChange={(val) => {
        onValueChange?.(val);
        setOpen(false);
      }}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <Combobox.Trigger disabled={disabled || !boardId}>
          <SelectPipelineValue />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectPipelineContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectPipelineProvider>
  );
};

export const SelectPipeline = Object.assign(SelectPipelineRoot, {
  Provider: SelectPipelineProvider,
  Value: SelectPipelineValue,
  Content: SelectPipelineContent,
  FilterItem: SelectPipelineFilterItem,
  FilterView: SelectPipelineFilterView,
  FilterBar: SelectPipelineFilterBar,
  FormItem: SelectPipelineFormItem,
});
