import {
  Combobox,
  Command,
  PopoverScoped,
  TextOverflowTooltip,
} from 'erxes-ui';
import React, { useCallback, useMemo, useState } from 'react';

import { IBoard } from '@/deals/types/boards';
import { useBoards } from '~/modules/deals/boards/hooks/useBoards';

// SelectBoard Context
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

// SelectBoard Provider
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

// SelectBoard Value Display
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

  const selectedBoard = boards?.find((board) => board._id === value);

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

// SelectBoard Command Item
const SelectBoardCommandItem = ({ board }: { board: IBoard }) => {
  const { onValueChange, value } = useSelectBoardContext();

  return (
    <Command.Item
      value={board._id}
      onSelect={() => {
        onValueChange(board._id);
      }}
    >
      <div className="flex overflow-hidden flex-1 gap-2 items-center">
        <TextOverflowTooltip value={board.name} />
      </div>
      <Combobox.Check checked={value === board._id} />
    </Command.Item>
  );
};

// SelectBoard Content
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

// SelectBoard Form Item
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

// Export hook for board data fetching
export const useSelectBoard = () => {
  const { boards, loading } = useBoards();

  return {
    boards,
    loading,
  };
};
