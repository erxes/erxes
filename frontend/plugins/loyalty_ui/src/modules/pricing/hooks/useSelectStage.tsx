import React, { useCallback, useMemo, useState } from 'react';
import {
  Combobox,
  Command,
  PopoverScoped,
  TextOverflowTooltip,
} from 'erxes-ui';
import { useSalesStages, IStage } from '@/pricing/hooks/useSalesStages';

// SelectStage Context
interface SelectStageContextType {
  value: string;
  onValueChange: (value: string) => void;
  loading: boolean;
  stages?: IStage[];
  pipelineId?: string;
}

const SelectStageContext = React.createContext<SelectStageContextType | null>(
  null,
);

const useSelectStageContext = () => {
  const context = React.useContext(SelectStageContext);
  if (!context) {
    throw new Error(
      'useSelectStageContext must be used within SelectStageProvider',
    );
  }
  return context;
};

// SelectStage Provider
const SelectStageProvider = ({
  children,
  value,
  onValueChange,
  setOpen,
  pipelineId,
}: {
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  setOpen?: (open: boolean) => void;
  pipelineId?: string;
}) => {
  const { stages, loading } = useSalesStages({ pipelineId });

  const handleValueChange = useCallback(
    (stageId: string) => {
      if (!stageId) return;
      onValueChange(stageId);
      setOpen?.(false);
    },
    [onValueChange, setOpen],
  );

  const contextValue = useMemo(
    () => ({
      value,
      onValueChange: handleValueChange,
      loading,
      stages,
      pipelineId,
    }),
    [value, handleValueChange, loading, stages, pipelineId],
  );

  return (
    <SelectStageContext.Provider value={contextValue}>
      {children}
    </SelectStageContext.Provider>
  );
};

// SelectStage Value Display
const SelectStageValue = ({ placeholder }: { placeholder?: string }) => {
  const { value, stages, loading } = useSelectStageContext();

  if (loading) {
    return <span className="text-accent-foreground/80">Loading stages...</span>;
  }

  if (!stages || stages.length === 0 || !value) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select stage'}
      </span>
    );
  }

  const selectedStage = stages?.find((stage) => stage._id === value);

  if (!selectedStage) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select stage'}
      </span>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <TextOverflowTooltip value={selectedStage.name} className="max-w-32" />
    </div>
  );
};

// SelectStage Command Item
const SelectStageCommandItem = ({ stage }: { stage: IStage }) => {
  const { onValueChange, value } = useSelectStageContext();

  return (
    <Command.Item
      value={stage._id}
      onSelect={() => {
        onValueChange(stage._id);
      }}
    >
      <div className="flex overflow-hidden flex-1 gap-2 items-center">
        <TextOverflowTooltip value={stage.name} />
      </div>
      <Combobox.Check checked={value === stage._id} />
    </Command.Item>
  );
};

// SelectStage Content
const SelectStageContent = () => {
  const { stages, pipelineId, loading } = useSelectStageContext();
  const emptyMessage = loading
    ? 'Loading stages...'
    : pipelineId
    ? 'No stages found'
    : 'Pipeline not selected';
  return (
    <Command>
      <Command.List>
        <Command.Empty>
          <div className="text-muted-foreground">{emptyMessage}</div>
        </Command.Empty>
        {stages?.map((stage) => (
          <SelectStageCommandItem key={stage._id} stage={stage} />
        ))}
      </Command.List>
    </Command>
  );
};

// SelectStage Form Item
export const SelectStageFormItem = ({
  value,
  onValueChange,
  pipelineId,
  placeholder,
}: {
  value?: string;
  onValueChange: (value: string) => void;
  pipelineId?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectStageProvider
      value={value || ''}
      onValueChange={onValueChange}
      setOpen={setOpen}
      pipelineId={pipelineId}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <Combobox.Trigger className="w-full h-8">
          <SelectStageValue placeholder={placeholder} />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectStageContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectStageProvider>
  );
};

// Export hook for stage data fetching
export const useSelectStage = (pipelineId?: string) => {
  const { stages, loading } = useSalesStages({ pipelineId });

  return {
    stages,
    loading,
  };
};
