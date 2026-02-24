import React, { useCallback, useMemo, useState } from 'react';
import {
  Combobox,
  Command,
  PopoverScoped,
  TextOverflowTooltip,
} from 'erxes-ui';
import {
  IBoard,
  IPipeline,
  IStage,
  useBoards,
  usePipelines,
  useStages,
} from 'ui-modules';

interface SelectBoardContextType {
  value: string;
  onValueChange: (value: string) => void;
  loading: boolean;
  boards?: IBoard[];
}

const SelectBoardContext = React.createContext<SelectBoardContextType | null>(
  null,
);

const useSelectBoardContext = () => {
  const context = React.useContext(SelectBoardContext);
  if (!context) {
    throw new Error(
      'useSelectBoardContext must be used within SelectBoardProvider',
    );
  }

  return context;
};

const SelectBoardProvider = ({
  children,
  value,
  onValueChange,
  setOpen,
}: {
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  setOpen?: (open: boolean) => void;
}) => {
  const { boards, loading } = useBoards();

  const handleValueChange = useCallback(
    (boardId: string) => {
      if (!boardId) return;
      onValueChange(boardId);
      setOpen?.(false);
    },
    [onValueChange, setOpen],
  );

  const contextValue = useMemo(
    () => ({
      value,
      onValueChange: handleValueChange,
      loading,
      boards,
    }),
    [value, handleValueChange, loading, boards],
  );

  return (
    <SelectBoardContext.Provider value={contextValue}>
      {children}
    </SelectBoardContext.Provider>
  );
};

const SelectBoardValue = ({ placeholder }: { placeholder?: string }) => {
  const { value, boards, loading } = useSelectBoardContext();

  if (loading) {
    return <span className="text-accent-foreground/80">Loading boards...</span>;
  }

  if (!boards || boards.length === 0 || !value) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select board'}
      </span>
    );
  }

  const selectedBoard = boards.find((board) => board._id === value);

  if (!selectedBoard) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select board'}
      </span>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <TextOverflowTooltip value={selectedBoard.name} className="max-w-32" />
    </div>
  );
};

const SelectBoardCommandItem = ({ board }: { board: IBoard }) => {
  const { onValueChange, value } = useSelectBoardContext();

  return (
    <Command.Item value={board._id} onSelect={() => onValueChange(board._id)}>
      <div className="flex overflow-hidden flex-1 gap-2 items-center">
        <TextOverflowTooltip value={board.name} />
      </div>
      <Combobox.Check checked={value === board._id} />
    </Command.Item>
  );
};

const SelectBoardContent = () => {
  const { boards, loading } = useSelectBoardContext();

  return (
    <Command>
      <Command.List>
        <Command.Empty>
          <div className="text-muted-foreground">
            {loading ? 'Loading boards...' : 'No boards found'}
          </div>
        </Command.Empty>
        {boards?.map((board) => (
          <SelectBoardCommandItem key={board._id} board={board} />
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectBoardFormItem = ({
  value,
  onValueChange,
  placeholder,
}: {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectBoardProvider
      value={value || ''}
      onValueChange={onValueChange}
      setOpen={setOpen}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <Combobox.Trigger className="w-full h-8">
          <SelectBoardValue placeholder={placeholder} />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectBoardContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectBoardProvider>
  );
};

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
    variables: { boardId },
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

  const selectedPipeline = pipelines.find((pipeline) => pipeline._id === value);

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

const SelectPipelineCommandItem = ({ pipeline }: { pipeline: IPipeline }) => {
  const { onValueChange, value } = useSelectPipelineContext();

  return (
    <Command.Item
      value={pipeline._id}
      onSelect={() => onValueChange(pipeline._id)}
    >
      <div className="flex overflow-hidden flex-1 gap-2 items-center">
        <TextOverflowTooltip value={pipeline.name} />
      </div>
      <Combobox.Check checked={value === pipeline._id} />
    </Command.Item>
  );
};

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
  const { stages, loading } = useStages({
    variables: { pipelineId },
    skip: !pipelineId,
  });

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

  const selectedStage = stages.find((stage) => stage._id === value);

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

const SelectStageCommandItem = ({ stage }: { stage: IStage }) => {
  const { onValueChange, value } = useSelectStageContext();

  return (
    <Command.Item value={stage._id} onSelect={() => onValueChange(stage._id)}>
      <div className="flex overflow-hidden flex-1 gap-2 items-center">
        <TextOverflowTooltip value={stage.name} />
      </div>
      <Combobox.Check checked={value === stage._id} />
    </Command.Item>
  );
};

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
