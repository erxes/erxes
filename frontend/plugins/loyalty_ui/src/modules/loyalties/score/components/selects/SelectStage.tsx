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
import { IconLabel } from '@tabler/icons-react';
import { useGetSalesStages } from '../../hooks/useGetSalesStages';

interface IStage {
  _id: string;
  name: string;
}

interface SelectStageContextType {
  value: string;
  onValueChange: (stageId: string) => void;
  loading?: boolean;
  error?: Error;
  stages?: IStage[];
  pipelineId?: string;
  mode?: 'single' | 'multiple';
}

const SelectStageContext = createContext<SelectStageContextType | null>(null);

const useSelectStageContext = () => {
  const context = useContext(SelectStageContext);
  if (!context)
    throw new Error('useSelectStageContext must be used within SelectStageProvider');
  return context;
};

export const SelectStageProvider = ({
  value,
  onValueChange,
  pipelineId,
  children,
  mode = 'single',
}: {
  value: string | string[];
  onValueChange: (stageId: string) => void;
  children: React.ReactNode;
  pipelineId?: string;
  mode?: 'single' | 'multiple';
}) => {
  const { stages, loading, error } = useGetSalesStages(pipelineId, {
    skip: !pipelineId,
  });

  const handleValueChange = useCallback(
    (stageId: string) => {
      if (!stageId) return;
      onValueChange?.(stageId);
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
      stages,
      loading,
      error,
      pipelineId,
      mode,
    }),
    [value, handleValueChange, stages, loading, error, pipelineId, mode],
  );

  return (
    <SelectStageContext.Provider value={contextValue}>
      {children}
    </SelectStageContext.Provider>
  );
};

const SelectStageValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, stages } = useSelectStageContext();
  const selected = stages?.find((s) => s._id === value);

  if (!selected)
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select stage'}
      </span>
    );

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm capitalize', className)}>{selected.name}</p>
    </div>
  );
};

const SelectStageCommandItem = ({ stage }: { stage: IStage }) => {
  const { onValueChange, value, mode } = useSelectStageContext();
  return (
    <Command.Item value={stage._id} onSelect={() => onValueChange(stage._id)}>
      <span className="font-medium capitalize">{stage.name}</span>
      {mode === 'single' && <Combobox.Check checked={value === stage._id} />}
    </Command.Item>
  );
};

const SelectStageContent = () => {
  const { stages, pipelineId, loading, error } = useSelectStageContext();

  const renderContent = useCallback(() => {
    if (!pipelineId) return null;
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
    return stages?.map((s) => <SelectStageCommandItem key={s._id} stage={s} />);
  }, [pipelineId, loading, error, stages]);

  return (
    <Command>
      <Command.Input placeholder="Search stage" />
      <Command.Empty>
        <span className="text-muted-foreground">
          {pipelineId ? 'No stages found' : ''}
        </span>
      </Command.Empty>
      <Command.List>{renderContent()}</Command.List>
    </Command>
  );
};

export const SelectStageFilterItem = () => (
  <Filter.Item value="scoreStageId">
    <IconLabel />
    Stage
  </Filter.Item>
);

export const SelectStageFilterView = ({
  onValueChange,
  queryKey,
  pipelineId,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  pipelineId?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [stage, setStage] = useQueryState<string[] | string>(queryKey || 'scoreStageId');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'scoreStageId'}>
      <SelectStageProvider
        mode={mode}
        pipelineId={pipelineId}
        value={stage || (mode === 'single' ? '' : [])}
        onValueChange={(val) => {
          setStage(val as string[] | string);
          resetFilterState();
          onValueChange?.(val);
        }}
      >
        <SelectStageContent />
      </SelectStageProvider>
    </Filter.View>
  );
};

export const SelectStageFilterBar = ({
  iconOnly,
  onValueChange,
  queryKey,
  pipelineId,
  mode = 'single',
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  pipelineId?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [stage, setStage] = useQueryState<string[] | string>(queryKey || 'scoreStageId');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={queryKey || 'scoreStageId'}>
      <Filter.BarName>
        <IconLabel />
        {!iconOnly && 'Stage'}
      </Filter.BarName>
      <SelectStageProvider
        mode={mode}
        pipelineId={pipelineId}
        value={stage || (mode === 'single' ? '' : [])}
        onValueChange={(val) => {
          if (val.length > 0) setStage(val as string[] | string);
          else setStage(null);
          setOpen(false);
          onValueChange?.(val);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={queryKey || 'scoreStageId'}>
              <SelectStageValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectStageContent />
          </Combobox.Content>
        </Popover>
      </SelectStageProvider>
    </Filter.BarItem>
  );
};

export const SelectStageFormItem = ({
  onValueChange,
  className,
  placeholder,
  pipelineId,
  ...props
}: Omit<React.ComponentProps<typeof SelectStageProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
  pipelineId?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectStageProvider
      pipelineId={pipelineId}
      onValueChange={(val) => {
        onValueChange?.(val);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectStageValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>
        <Combobox.Content>
          <SelectStageContent />
        </Combobox.Content>
      </Popover>
    </SelectStageProvider>
  );
};

SelectStageFormItem.displayName = 'SelectStageFormItem';

const SelectStageRoot = ({
  value,
  pipelineId,
  scope,
  onValueChange,
  disabled,
}: {
  value: string;
  pipelineId?: string;
  scope?: string;
  onValueChange?: (val: string) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectStageProvider
      pipelineId={pipelineId}
      value={value}
      onValueChange={(val) => { onValueChange?.(val); setOpen(false); }}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <Combobox.Trigger disabled={disabled}>
          <SelectStageValue />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectStageContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectStageProvider>
  );
};

export const SelectStage = Object.assign(SelectStageRoot, {
  Provider: SelectStageProvider,
  Value: SelectStageValue,
  Content: SelectStageContent,
  FilterItem: SelectStageFilterItem,
  FilterView: SelectStageFilterView,
  FilterBar: SelectStageFilterBar,
  FormItem: SelectStageFormItem,
});
