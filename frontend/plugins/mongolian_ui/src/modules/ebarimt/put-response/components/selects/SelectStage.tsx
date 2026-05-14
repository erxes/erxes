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
  SelectTriggerVariant,
} from 'erxes-ui';

import { SelectContent, SelectTrigger } from './SelectShared';
import { IconLabel } from '@tabler/icons-react';
import { useGetSalesStages } from '../../hooks/useGetSalesStage';
interface IStage {
  _id: string;
  name: string;
  [key: string]: any;
}

interface SelectStageContextType {
  value: string;
  onValueChange: (stageId: string) => void;
  loading?: boolean;
  error?: any;
  stages?: IStage[];
  pipelineId?: string;
  mode?: 'single' | 'multiple';
}

const SelectStageContext = createContext<SelectStageContextType | null>(null);

const useSelectStageContext = () => {
  const context = useContext(SelectStageContext);
  if (!context) {
    throw new Error(
      'useSelectStageContext must be used within SelectStageProvider',
    );
  }
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
  const { value, stages, mode } = useSelectStageContext();
  const selectedStage = stages?.find((stage) => stage._id === value);

  if (!selectedStage && mode === 'single') {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select stage'}
      </span>
    );
  }

  if (mode === 'multiple') {
    const selectedStages = stages?.filter((stage) =>
      (value as string).split(',').includes(stage._id),
    );

    if (!selectedStages?.length) {
      return (
        <span className="text-accent-foreground/80">
          {placeholder || 'Select stages'}
        </span>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <p className={cn('font-medium text-sm capitalize', className)}>
          {selectedStages.map((s) => s.name).join(', ')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm capitalize', className)}>
        {selectedStage?.name}
      </p>
    </div>
  );
};

const SelectStageCommandItem = ({ stage }: { stage: IStage }) => {
  const { onValueChange, value, mode } = useSelectStageContext();
  const { _id: stageId, name } = stage || {};

  return (
    <Command.Item
      value={stageId}
      onSelect={() => {
        onValueChange(stageId);
      }}
    >
      <span className="font-medium capitalize">{name}</span>
      {mode === 'single' && <Combobox.Check checked={value === stageId} />}
    </Command.Item>
  );
};

const SelectStageContent = () => {
  const { stages, pipelineId, loading, error } = useSelectStageContext();

  const renderContent = useCallback(() => {
    if (!pipelineId) {
      return null;
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

    return stages?.map((stage) => (
      <SelectStageCommandItem key={stage._id} stage={stage} />
    ));
  }, [pipelineId, loading, error, stages]);

  const emptyMessage = pipelineId ? 'No stage found' : '';

  return (
    <Command>
      <Command.Input placeholder="Search stage" />
      <Command.Empty>
        <span className="text-muted-foreground">{emptyMessage}</span>
      </Command.Empty>
      <Command.List>{renderContent()}</Command.List>
    </Command>
  );
};

const SelectStageRoot = ({
  value,
  id,
  pipelineId,
  variant,
  scope,
  onValueChange,
  disabled,
}: {
  value: string;
  id: string;
  pipelineId: string;
  variant: `${SelectTriggerVariant}`;
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
    <SelectStageProvider
      pipelineId={pipelineId}
      value={value}
      onValueChange={handleValueChange}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTrigger variant={variant} disabled={disabled}>
          <SelectStageValue />
        </SelectTrigger>
        <SelectContent variant={variant}>
          <SelectStageContent />
        </SelectContent>
      </PopoverScoped>
    </SelectStageProvider>
  );
};

export const SelectStageFilterItem = () => {
  return (
    <Filter.Item value="stageId">
      <IconLabel />
      Stage
    </Filter.Item>
  );
};

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
  const [stage, setStage] = useQueryState<string[] | string>(
    queryKey || 'stageId',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'stageId'}>
      <SelectStageProvider
        mode={mode}
        pipelineId={pipelineId}
        value={stage || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setStage(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
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
  const [stage, setStage] = useQueryState<string[] | string>(
    queryKey || 'stageId',
  );
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={queryKey || 'stageId'}>
      <Filter.BarName>
        <IconLabel />
        {!iconOnly && 'Stage'}
      </Filter.BarName>
      <SelectStageProvider
        mode={mode}
        pipelineId={pipelineId}
        value={stage || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          if (value.length > 0) {
            setStage(value as string[] | string);
          } else {
            setStage(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={queryKey || 'stageId'}>
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
      onValueChange={(value) => {
        onValueChange?.(value);
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

export const SelectStage = Object.assign(SelectStageRoot, {
  Provider: SelectStageProvider,
  Value: SelectStageValue,
  Content: SelectStageContent,
  FilterItem: SelectStageFilterItem,
  FilterView: SelectStageFilterView,
  FilterBar: SelectStageFilterBar,
  FormItem: SelectStageFormItem,
});
