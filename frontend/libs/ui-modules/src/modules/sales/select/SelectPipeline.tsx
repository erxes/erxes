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
import React, { useState } from 'react';
import {
  SelectPipelinesContext,
  useSelectPipelinesContext,
} from '../context/DealContext';

import { PipelinesInline } from '../inline/PipelineInline';
import { IPipeline } from '../types/pipelines';
import { IconArrowsRight, IconChevronDown } from '@tabler/icons-react';
import { usePipelines } from '../hooks/usePipelines';
import { useDebounce } from 'use-debounce';

export const SelectPipelineProvider = ({
  children,
  mode = 'single',
  value,
  onValueChange,
  pipelines,
  boardId,
}: {
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
  value?: string[] | string;
  onValueChange: (value: string[] | string) => void;
  pipelines?: IPipeline[];
  boardId?: string;
}) => {
  const [_pipelines, setPipelines] = useState<IPipeline[]>(pipelines || []);
  const isSingleMode = mode === 'single';

  const onSelect = (pipeline: IPipeline) => {
    if (!pipeline) return;
    if (isSingleMode) {
      setPipelines([pipeline]);
      return onValueChange?.(pipeline._id);
    }

    const arrayValue = Array.isArray(value) ? value : [];

    const isPipelineSelected = arrayValue.includes(pipeline._id);
    const newSelectedPipelineIds = isPipelineSelected
      ? arrayValue.filter((id) => id !== pipeline._id)
      : [...arrayValue, pipeline._id];

    setPipelines((prev) =>
      [...prev, pipeline].filter((p) => newSelectedPipelineIds.includes(p._id)),
    );
    onValueChange?.(newSelectedPipelineIds);
  };

  return (
    <SelectPipelinesContext.Provider
      value={{
        pipelines: _pipelines,
        pipelineIds: !value ? [] : Array.isArray(value) ? value : [value],
        onSelect,
        setPipelines,
        loading: false,
        error: null,
        boardId,
      }}
    >
      {children}
    </SelectPipelinesContext.Provider>
  );
};

const SelectPipelinesValue = ({ placeholder }: { placeholder?: string }) => {
  const { pipelineIds, pipelines, setPipelines } = useSelectPipelinesContext();

  return (
    <PipelinesInline
      pipelineIds={pipelineIds}
      pipelines={pipelines.length > 0 ? pipelines : undefined}
      updatePipelines={setPipelines}
      placeholder={placeholder}
    />
  );
};

const SelectPipelineCommandItem = ({ pipeline }: { pipeline: IPipeline }) => {
  const { onSelect, pipelineIds } = useSelectPipelinesContext();

  return (
    <Command.Item
      value={pipeline._id}
      onSelect={() => {
        onSelect(pipeline);
      }}
    >
      <PipelinesInline pipelines={[pipeline]} placeholder="Unnamed pipeline" />
      <Combobox.Check checked={pipelineIds.includes(pipeline._id)} />
    </Command.Item>
  );
};

const SelectPipelineContent = () => {
  const [search, setSearch] = React.useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const { pipelines: selectedPipelines, boardId } = useSelectPipelinesContext();

  const { pipelines = [], loading } = usePipelines({
    variables: {
      searchValue: debouncedSearch,
      boardId: boardId || undefined,
    },
    skip: !boardId,
  });

  const isDisabled = !boardId;

  return (
    <Command shouldFilter={false} id="pipeline-command-menu">
      <Command.Input
        value={search}
        onValueChange={setSearch}
        variant="secondary"
        wrapperClassName="flex-auto"
        placeholder="Search pipeline..."
        className="h-9"
        disabled={isDisabled}
      />
      <Command.List>
        <Combobox.Empty loading={loading} />
        {isDisabled ? (
          <div className="p-2 text-sm text-accent-foreground/70">
            Please select a board first
          </div>
        ) : (
          <>
            {selectedPipelines.length > 0 && (
              <>
                {selectedPipelines?.map((pipeline) => (
                  <SelectPipelineCommandItem
                    key={pipeline._id}
                    pipeline={pipeline}
                  />
                ))}
                <Command.Separator className="my-1" />
              </>
            )}
            {pipelines
              .filter(
                (pipeline) =>
                  !selectedPipelines.some((p) => p._id === pipeline._id),
              )
              .map((pipeline) => (
                <SelectPipelineCommandItem
                  key={pipeline._id}
                  pipeline={pipeline}
                />
              ))}
          </>
        )}
      </Command.List>
    </Command>
  );
};

export const SelectPipelineFilterItem = () => {
  return (
    <Filter.Item value="pipeline">
      <IconArrowsRight />
      Pipeline
    </Filter.Item>
  );
};

export const SelectPipelineFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
  boardId,
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
  boardId?: string;
}) => {
  const [pipeline, setPipeline] = useQueryState<string[] | string>(
    queryKey || 'pipeline',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'pipeline'}>
      <SelectPipelineProvider
        mode={mode}
        value={pipeline || (mode === 'single' ? '' : [])}
        boardId={boardId}
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
  mode = 'single',
  boardId,
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
  boardId?: string;
}) => {
  const [pipeline, setPipeline] = useQueryState<string[] | string>(
    queryKey || 'pipeline',
  );
  const [open, setOpen] = useState(false);

  const isDisabled = !boardId;

  return (
    <Filter.BarItem queryKey={queryKey || 'pipeline'}>
      <Filter.BarName>
        <IconArrowsRight />
        {!iconOnly && 'Pipeline'}
      </Filter.BarName>
      <SelectPipelineProvider
        mode={mode}
        value={pipeline || (mode === 'single' ? '' : [])}
        boardId={boardId}
        onValueChange={(value) => {
          const hasValue = Array.isArray(value)
            ? value.length > 0
            : !!value && value.length > 0;
          if (hasValue) {
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
            <Filter.BarButton
              filterKey={queryKey || 'pipeline'}
              disabled={isDisabled}
            >
              <SelectPipelinesValue />
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

export const SelectPipelineInlineCell = ({
  onValueChange,
  boardId,
  className,
  ...props
}: Omit<React.ComponentProps<typeof SelectPipelineProvider>, 'children'> & {
  scope?: string;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const isDisabled = !boardId;

  return (
    <SelectPipelineProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      boardId={boardId}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <RecordTableInlineCell.Trigger
          disabled={isDisabled}
          className={cn('flex items-center justify-between gap-2', className)}
        >
          <SelectPipelinesValue placeholder={''} />
          <IconChevronDown className="size-4 text-zinc-600 shrink-0" />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content>
          <SelectPipelineContent />
        </RecordTableInlineCell.Content>
      </Popover>
    </SelectPipelineProvider>
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
  const isDisabled = !boardId;

  return (
    <SelectPipelineProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      boardId={boardId}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger
            className={cn('w-full shadow-xs', className)}
            disabled={isDisabled}
          >
            <SelectPipelinesValue placeholder={placeholder} />
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

const SelectPipelineRoot = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectPipelineProvider>, 'children'> &
    React.ComponentProps<typeof Combobox.Trigger> & {
      placeholder?: string;
      boardId?: string;
    }
>(
  (
    { onValueChange, className, mode, value, placeholder, boardId, ...props },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const isDisabled = !boardId;

    return (
      <SelectPipelineProvider
        onValueChange={(value) => {
          onValueChange?.(value);
          setOpen(false);
        }}
        mode={mode}
        value={value}
        boardId={boardId}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Combobox.Trigger
            ref={ref}
            className={cn('w-full inline-flex', className)}
            variant="outline"
            disabled={isDisabled}
            {...props}
          >
            <SelectPipelinesValue placeholder={placeholder} />
          </Combobox.Trigger>
          <Combobox.Content>
            <SelectPipelineContent />
          </Combobox.Content>
        </Popover>
      </SelectPipelineProvider>
    );
  },
);

SelectPipelineRoot.displayName = 'SelectPipelineRoot';

export const SelectPipeline = Object.assign(SelectPipelineRoot, {
  Provider: SelectPipelineProvider,
  Value: SelectPipelinesValue,
  Content: SelectPipelineContent,
  FilterItem: SelectPipelineFilterItem,
  FilterView: SelectPipelineFilterView,
  FilterBar: SelectPipelineFilterBar,
  InlineCell: SelectPipelineInlineCell,
  FormItem: SelectPipelineFormItem,
});
