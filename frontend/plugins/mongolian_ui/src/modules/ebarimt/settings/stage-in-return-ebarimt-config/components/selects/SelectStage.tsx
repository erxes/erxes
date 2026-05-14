import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { cn, Combobox, Command, PopoverScoped } from 'erxes-ui';
import { useGetSalesStages } from '@/ebarimt/settings/stage-in-ebarimt-config/hooks/useGetSalesStages';
import {
  SelectTrigger,
  SelectContent,
  SelectTriggerVariant,
} from '@/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectShared';

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
}: {
  value: string;
  onValueChange: (stageId: string) => void;
  children: React.ReactNode;
  pipelineId?: string;
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
      value: value || '',
      onValueChange: handleValueChange,
      stages,
      loading,
      error,
      pipelineId,
    }),
    [value, handleValueChange, stages, loading, error, pipelineId],
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
  const selectedStage = stages?.find((stage) => stage._id === value);

  if (!selectedStage) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select stage'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm capitalize', className)}>
        {selectedStage.name}
      </p>
    </div>
  );
};

const SelectStageCommandItem = ({ stage }: { stage: IStage }) => {
  const { onValueChange, value } = useSelectStageContext();
  const { _id: stageId, name } = stage || {};

  return (
    <Command.Item
      value={stageId}
      onSelect={() => {
        onValueChange(stageId);
      }}
    >
      <span className="font-medium capitalize">{name}</span>
      <Combobox.Check checked={value === stageId} />
    </Command.Item>
  );
};

const SelectStageContent = () => {
  const { stages, pipelineId, loading, error } = useSelectStageContext();

  const renderContent = useCallback(() => {
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
  }, [loading, error, stages]);

  const emptyMessage = pipelineId ? 'No stage found' : 'Pipeline not selected';

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

export const SelectStage = Object.assign(SelectStageRoot, {
  Provider: SelectStageProvider,
  Value: SelectStageValue,
  Content: SelectStageContent,
});
