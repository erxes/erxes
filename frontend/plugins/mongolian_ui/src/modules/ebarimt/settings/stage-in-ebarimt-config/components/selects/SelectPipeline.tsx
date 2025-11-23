import React, { createContext, useContext, useState } from 'react';
import {
  cn,
  Combobox,
  Command,
  PopoverScoped,
  SelectTriggerVariant,
} from 'erxes-ui';
import { useGetSalesPipelines } from '@/ebarimt/settings/stage-in-ebarimt-config/hooks/useGetSalesPipelines';
import { SelectContent, SelectTrigger } from '@/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectShared';

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
}: {
  value: string;
  onValueChange: (pipelineId: string) => void;
  children: React.ReactNode;
  boardId?: string;
}) => {
  const { pipelines, loading, error } = useGetSalesPipelines({
    variables: boardId ? { boardId } : undefined,
    skip: !boardId,
  });

  const handleValueChange = (pipelineId: string) => {
    if (!pipelineId) return;
    onValueChange?.(pipelineId);
  };

  return (
    <SelectPipelineContext.Provider
      value={{
        value: value || '',
        onValueChange: handleValueChange,
        pipelines,
        loading,
        error,
        boardId,
      }}
    >
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
  const selectedPipeline = pipelines?.find(
    (pipeline) => pipeline._id === value,
  );

  if (!boardId) {
    return (
      <span className="text-accent-foreground/80">Choose board first</span>
    );
  }

  if (!selectedPipeline) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select pipeline'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm capitalize', className)}>
        {selectedPipeline.name}
      </p>
    </div>
  );
};

const SelectPipelineCommandItem = ({ pipeline }: { pipeline: IPipeline }) => {
  const { onValueChange, value } = useSelectPipelineContext();
  const { _id: pipelineId, name } = pipeline || {};

  return (
    <Command.Item
      value={pipelineId}
      onSelect={() => {
        onValueChange(pipelineId);
      }}
    >
      <span className="font-medium capitalize">{name}</span>
      <Combobox.Check checked={value === pipelineId} />
    </Command.Item>
  );
};

const SelectPipelineContent = () => {
  const { pipelines, boardId, loading, error } = useSelectPipelineContext();

  return (
    <Command>
      <Command.Input placeholder="Search pipeline" />
      <Command.Empty>
        <span className="text-muted-foreground">
          {!boardId ? 'Choose board first' : 'No pipelines found'}
        </span>
      </Command.Empty>
      <Command.List>
        {!boardId ? (
          <div className="flex items-center justify-center h-24">
            <span className="text-muted-foreground">Choose board first</span>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-24">
            <span className="text-muted-foreground">Loading...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-24 text-destructive">
            Error: {error.message}
          </div>
        ) : (
          pipelines?.map((pipeline) => (
            <SelectPipelineCommandItem key={pipeline._id} pipeline={pipeline} />
          ))
        )}
      </Command.List>
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

  const handleValueChange = (value: string) => {
    onValueChange?.(value);
    setOpen(false);
  };

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

export const SelectPipeline = Object.assign(SelectPipelineRoot, {
  Provider: SelectPipelineProvider,
  Value: SelectPipelineValue,
  Content: SelectPipelineContent,
});
