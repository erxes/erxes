import {
  Combobox,
  Command,
  Filter,
  Form,
  Popover,
  RecordTableInlineCell,
  cn,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { IStage, useStages } from 'ui-modules/index';
import { IconChevronDown, IconListCheck } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import {
  SelectStagesContext,
  useSelectStagesContext,
} from 'ui-modules/modules/sales/contexts';

import { StagesInline } from '../StagesInline';
import { useDebounce } from 'use-debounce';

export const SelectStageProvider = ({
  children,
  mode = 'single',
  value,
  onValueChange,
  stages,
  pipelineId,
}: {
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
  value?: string[] | string;
  onValueChange: (value: string[] | string, isAutoSelection?: boolean) => void;
  stages?: IStage[];
  pipelineId?: string;
}) => {
  const [_stages, setStages] = useState<IStage[]>(stages || []);
  const isSingleMode = mode === 'single';

  const { stages: availableStages = [] } = useStages({
    variables: {
      pipelineId: pipelineId || undefined,
      search: '',
    },
    skip: !pipelineId,
  });

  useEffect(() => {
    if (pipelineId && availableStages.length > 0) {
      const currentStageId = Array.isArray(value) ? value[0] : value;

      const stage = availableStages.find((s) => s._id === currentStageId);
      const selectedStage = stage || availableStages[0];

      if (selectedStage) {
        setStages([selectedStage]);

        if (!stage && selectedStage) {
          onValueChange?.(selectedStage._id, true);
        }
      }
    }
  }, [pipelineId, availableStages, value, onValueChange]);

  const onSelect = (stage: IStage) => {
    if (!stage) return;
    if (isSingleMode) {
      setStages([stage]);
      return onValueChange?.(stage._id, false);
    }

    const arrayValue = Array.isArray(value) ? value : [];

    const isStageSelected = arrayValue.includes(stage._id);
    const newSelectedStageIds = isStageSelected
      ? arrayValue.filter((id) => id !== stage._id)
      : [...arrayValue, stage._id];

    setStages((prev) =>
      [...prev, stage].filter((s) => newSelectedStageIds.includes(s._id)),
    );
    onValueChange?.(newSelectedStageIds);
  };

  return (
    <SelectStagesContext.Provider
      value={{
        stages: _stages,
        stageIds: _stages.map((s) => s._id),
        onSelect,
        setStages,
        loading: false,
        error: null,
        pipelineId,
      }}
    >
      {children}
    </SelectStagesContext.Provider>
  );
};

const SelectStagesValue = ({ placeholder }: { placeholder?: string }) => {
  const { stageIds, stages, setStages } = useSelectStagesContext();

  return (
    <StagesInline
      stageIds={stageIds}
      stages={stages.length > 0 ? stages : undefined}
      updateStages={setStages}
      placeholder={placeholder}
    />
  );
};

const SelectStageCommandItem = ({ stage }: { stage: IStage }) => {
  const { onSelect, stageIds } = useSelectStagesContext();

  return (
    <Command.Item
      value={stage._id}
      onSelect={() => {
        onSelect(stage);
      }}
    >
      <StagesInline stages={[stage]} placeholder="Unnamed stage" />
      <Combobox.Check checked={stageIds.includes(stage._id)} />
    </Command.Item>
  );
};

const SelectStageContent = () => {
  const [search, setSearch] = React.useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const { stages: selectedStages, pipelineId } = useSelectStagesContext();

  const { stages = [], loading } = useStages({
    variables: {
      pipelineId: pipelineId || undefined,
      search: debouncedSearch || undefined,
    },
    skip: !pipelineId,
  });

  const isDisabled = !pipelineId;

  return (
    <Command shouldFilter={false} id="stage-command-menu">
      <Command.Input
        value={search}
        onValueChange={setSearch}
        variant="secondary"
        wrapperClassName="flex-auto"
        placeholder="Search stage..."
        className="h-9"
        disabled={isDisabled}
      />
      <Command.List>
        <Combobox.Empty loading={loading} />
        {isDisabled ? (
          <div className="p-2 text-sm text-accent-foreground/70">
            Please select a pipeline first
          </div>
        ) : (
          <>
            {selectedStages.length > 0 && (
              <>
                {selectedStages?.map((stage) => (
                  <SelectStageCommandItem key={stage._id} stage={stage} />
                ))}
                <Command.Separator className="my-1" />
              </>
            )}
            {stages
              .filter(
                (stage) => !selectedStages.some((s) => s._id === stage._id),
              )
              .map((stage) => (
                <SelectStageCommandItem key={stage._id} stage={stage} />
              ))}
          </>
        )}
      </Command.List>
    </Command>
  );
};

export const SelectStageFilterItem = () => {
  return (
    <Filter.Item value="stage">
      <IconListCheck />
      Stage
    </Filter.Item>
  );
};

export const SelectStageFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
  pipelineId,
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
  pipelineId?: string;
}) => {
  const [stage, setStage] = useQueryState<string[] | string>(
    queryKey || 'stage',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'stage'}>
      <SelectStageProvider
        mode={mode}
        value={stage || (mode === 'single' ? '' : [])}
        pipelineId={pipelineId}
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
  mode = 'single',
  pipelineId,
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
  pipelineId?: string;
}) => {
  const [stage, setStage] = useQueryState<string[] | string>(
    queryKey || 'stage',
  );
  const [open, setOpen] = useState(false);

  const isDisabled = !pipelineId;

  return (
    <Filter.BarItem queryKey={queryKey || 'stage'}>
      <Filter.BarName>
        <IconListCheck />
        {!iconOnly && 'Stage'}
      </Filter.BarName>
      <SelectStageProvider
        mode={mode}
        value={stage || (mode === 'single' ? '' : [])}
        pipelineId={pipelineId}
        onValueChange={(value) => {
          const hasValue = Array.isArray(value)
            ? value.length > 0
            : !!value && value.length > 0;
          if (hasValue) {
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
            <Filter.BarButton
              filterKey={queryKey || 'stage'}
              disabled={isDisabled}
            >
              <SelectStagesValue />
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

export const SelectStageInlineCell = ({
  onValueChange,
  pipelineId,
  className,
  ...props
}: Omit<React.ComponentProps<typeof SelectStageProvider>, 'children'> & {
  scope?: string;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const isDisabled = !pipelineId;

  return (
    <SelectStageProvider
      onValueChange={(value, isAutoSelection) => {
        onValueChange?.(value, isAutoSelection);
        if (!isAutoSelection) {
          setOpen(false);
        }
      }}
      pipelineId={pipelineId}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <RecordTableInlineCell.Trigger
          disabled={isDisabled}
          className={cn('flex items-center justify-between gap-2', className)}
        >
          <SelectStagesValue placeholder={''} />
          <IconChevronDown className="size-4 text-zinc-600 shrink-0" />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content>
          <SelectStageContent />
        </RecordTableInlineCell.Content>
      </Popover>
    </SelectStageProvider>
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
  const isDisabled = !pipelineId;

  return (
    <SelectStageProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      pipelineId={pipelineId}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger
            className={cn('w-full shadow-xs', className)}
            disabled={isDisabled}
          >
            <SelectStagesValue placeholder={placeholder} />
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

const SelectStageRoot = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectStageProvider>, 'children'> &
    React.ComponentProps<typeof Combobox.Trigger> & {
      placeholder?: string;
      pipelineId?: string;
    }
>(
  (
    {
      onValueChange,
      className,
      mode,
      value,
      placeholder,
      pipelineId,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const isDisabled = !pipelineId;

    return (
      <SelectStageProvider
        onValueChange={(value) => {
          onValueChange?.(value);
          setOpen(false);
        }}
        mode={mode}
        value={value}
        pipelineId={pipelineId}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Combobox.Trigger
            ref={ref}
            className={cn('w-full inline-flex', className)}
            variant="outline"
            disabled={isDisabled}
            {...props}
          >
            <SelectStagesValue placeholder={placeholder} />
          </Combobox.Trigger>
          <Combobox.Content>
            <SelectStageContent />
          </Combobox.Content>
        </Popover>
      </SelectStageProvider>
    );
  },
);

SelectStageRoot.displayName = 'SelectStageRoot';

export const SelectStage = Object.assign(SelectStageRoot, {
  Provider: SelectStageProvider,
  Value: SelectStagesValue,
  Content: SelectStageContent,
  FilterItem: SelectStageFilterItem,
  FilterView: SelectStageFilterView,
  FilterBar: SelectStageFilterBar,
  InlineCell: SelectStageInlineCell,
  FormItem: SelectStageFormItem,
});
