import React, { createContext, useContext, useState } from 'react';
import { cn, Combobox, Command, PopoverScoped } from 'erxes-ui';
import { useGetSalesBoards } from '@/ebarimt/settings/stage-in-ebarimt-config/hooks/useGetSalesBoards';
import {
  SelectTrigger,
  SelectContent,
  SelectTriggerVariant,
} from '@/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectShared';

interface IBoard {
  _id: string;
  name: string;
  [key: string]: any;
}

interface SelectSalesBoardContextType {
  value: string;
  onValueChange: (boardId: string) => void;
  loading?: boolean;
  error?: any;
  boards?: IBoard[];
}

const SelectSalesBoardContext =
  createContext<SelectSalesBoardContextType | null>(null);

const useSelectSalesBoardContext = () => {
  const context = useContext(SelectSalesBoardContext);
  if (!context) {
    throw new Error(
      'useSelectSalesBoardContext must be used within SelectSalesBoardProvider',
    );
  }
  return context;
};

export const SelectSalesBoardProvider = ({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (boardId: string) => void;
  children: React.ReactNode;
}) => {
  const { boards, loading, error } = useGetSalesBoards();

  const handleValueChange = (boardId: string) => {
    if (!boardId) return;
    onValueChange?.(boardId);
  };

  return (
    <SelectSalesBoardContext.Provider
      value={{
        value: value || '',
        onValueChange: handleValueChange,
        boards,
        loading,
        error,
      }}
    >
      {children}
    </SelectSalesBoardContext.Provider>
  );
};

const SelectSalesBoardValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, boards } = useSelectSalesBoardContext();
  const selectedBoard = boards?.find((board) => board._id === value);

  if (!selectedBoard) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select board'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm capitalize', className)}>
        {selectedBoard.name}
      </p>
    </div>
  );
};

const SelectSalesBoardCommandItem = ({ board }: { board: IBoard }) => {
  const { onValueChange, value } = useSelectSalesBoardContext();
  const { _id: boardId, name } = board || {};

  return (
    <Command.Item
      value={boardId}
      onSelect={() => {
        onValueChange(boardId);
      }}
    >
      <span className="font-medium capitalize">{name}</span>
      <Combobox.Check checked={value === boardId} />
    </Command.Item>
  );
};

const SelectSalesBoardContent = () => {
  const { boards, loading, error } = useSelectSalesBoardContext();

  return (
    <Command>
      <Command.Input placeholder="Search board" />
      <Command.Empty>
        <span className="text-muted-foreground">No boards found</span>
      </Command.Empty>
      <Command.List>
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <span className="text-muted-foreground">Loading...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-24 text-destructive">
            Error: {error.message}
          </div>
        ) : (
          boards?.map((board) => (
            <SelectSalesBoardCommandItem key={board._id} board={board} />
          ))
        )}
      </Command.List>
    </Command>
  );
};

const SelectSalesBoardRoot = ({
  value,
  variant = 'form',
  scope,
  onValueChange,
  disabled,
}: {
  value: string;
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
    <SelectSalesBoardProvider value={value} onValueChange={handleValueChange}>
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTrigger variant={variant} disabled={disabled}>
          <SelectSalesBoardValue />
        </SelectTrigger>
        <SelectContent variant={variant}>
          <SelectSalesBoardContent />
        </SelectContent>
      </PopoverScoped>
    </SelectSalesBoardProvider>
  );
};

export const SelectSalesBoard = Object.assign(SelectSalesBoardRoot, {
  Provider: SelectSalesBoardProvider,
  Value: SelectSalesBoardValue,
  Content: SelectSalesBoardContent,
});
