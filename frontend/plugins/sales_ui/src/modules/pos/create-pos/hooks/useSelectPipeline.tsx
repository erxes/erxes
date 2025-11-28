import React, { useCallback, useMemo, useState } from 'react';
import {
  Combobox,
  Command,
  PopoverScoped,
  TextOverflowTooltip,
} from 'erxes-ui';
import { usePipelines } from '@/deals/boards/hooks/usePipelines';
import { IPipeline } from '@/deals/types/pipelines';

// SelectPipeline Context
interface SelectPipelineContextType {
  value: string;
  onValueChange: (value: string) => void;
  loading: boolean;
  pipelines?: IPipeline[];
  boardId?: string;
}

const SelectPipelineContext =
  React.createContext<SelectPipelineContextType | null>(null);

const useSelectPipelineContext = () => {
  const context = React.useContext(SelectPipelineContext);
  if (!context) {
    throw new Error(
      'useSelectPipelineContext must be used within SelectPipelineProvider',
    );
  }
  return context;
};

// SelectPipeline Provider
const SelectPipelineProvider = ({
  children,
  value,
  onValueChange,
  setOpen,
  boardId,
}: {
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  setOpen?: (open: boolean) => void;
  boardId?: string;
}) => {
  const { pipelines, loading } = usePipelines({
    variables: {
      boardId,
    },
    skip: !boardId,
  });

  const handleValueChange = useCallback(
    (pipelineId: string) => {
      if (!pipelineId) return;
      onValueChange(pipelineId);
      setOpen?.(false);
    },
    [onValueChange, setOpen],
  );

  const contextValue = useMemo(
    () => ({
      value,
      onValueChange: handleValueChange,
      loading,
      pipelines,
      boardId,
    }),
    [value, handleValueChange, loading, pipelines, boardId],
  );

  return (
    <SelectPipelineContext.Provider value={contextValue}>
      {children}
    </SelectPipelineContext.Provider>
  );
};

// SelectPipeline Value Display
const SelectPipelineValue = ({ placeholder }: { placeholder?: string }) => {
  const { value, pipelines, loading } = useSelectPipelineContext();

  if (loading) {
    return (
      <span className="text-accent-foreground/80">Loading pipelines...</span>
    );
  }

  if (!pipelines || pipelines.length === 0 || !value) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select pipeline'}
      </span>
    );
  }

  const selectedPipeline = pipelines?.find(
    (pipeline) => pipeline._id === value,
  );

  if (!selectedPipeline) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select pipeline'}
      </span>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <TextOverflowTooltip value={selectedPipeline.name} className="max-w-32" />
    </div>
  );
};

// SelectPipeline Command Item
const SelectPipelineCommandItem = ({ pipeline }: { pipeline: IPipeline }) => {
  const { onValueChange, value } = useSelectPipelineContext();

  return (
    <Command.Item
      value={pipeline._id}
      onSelect={() => {
        onValueChange(pipeline._id);
      }}
    >
      <div className="flex overflow-hidden flex-1 gap-2 items-center">
        <TextOverflowTooltip value={pipeline.name} />
      </div>
      <Combobox.Check checked={value === pipeline._id} />
    </Command.Item>
  );
};

// SelectPipeline Content
const SelectPipelineContent = () => {
  const { pipelines, boardId, loading } = useSelectPipelineContext();
  const emptyMessage = loading
    ? 'Loading pipelines...'
    : boardId
    ? 'No pipelines found'
    : 'Board not selected';
  return (
    <Command>
      <Command.List>
        <Command.Empty>
          <div className="text-muted-foreground">{emptyMessage}</div>
        </Command.Empty>
        {pipelines?.map((pipeline) => (
          <SelectPipelineCommandItem key={pipeline._id} pipeline={pipeline} />
        ))}
      </Command.List>
    </Command>
  );
};

// SelectPipeline Form Item
export const SelectPipelineFormItem = ({
  value,
  onValueChange,
  boardId,
  placeholder,
}: {
  value?: string;
  onValueChange: (value: string) => void;
  boardId?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectPipelineProvider
      value={value || ''}
      onValueChange={onValueChange}
      setOpen={setOpen}
      boardId={boardId}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <Combobox.Trigger className="w-full h-8">
          <SelectPipelineValue placeholder={placeholder} />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectPipelineContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectPipelineProvider>
  );
};

// Export hook for pipeline data fetching
export const useSelectPipeline = (boardId?: string) => {
  const { pipelines, loading } = usePipelines({
    variables: {
      boardId,
    },
    skip: !boardId,
  });

  return {
    pipelines,
    loading,
  };
};
