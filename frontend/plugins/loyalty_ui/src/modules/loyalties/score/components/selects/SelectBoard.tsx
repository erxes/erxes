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
  Form,
  Popover,
  PopoverScoped,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { IconLayoutKanban } from '@tabler/icons-react';
import { useGetSalesBoards } from '../../hooks/useGetSalesBoards';

interface IBoard {
  _id: string;
  name: string;
}

interface SelectBoardContextType {
  value: string;
  onValueChange: (boardId: string) => void;
  loading?: boolean;
  error?: Error;
  boards?: IBoard[];
  mode?: 'single' | 'multiple';
}

const SelectBoardContext = createContext<SelectBoardContextType | null>(null);

const useSelectBoardContext = () => {
  const context = useContext(SelectBoardContext);
  if (!context)
    throw new Error('useSelectBoardContext must be used within SelectBoardProvider');
  return context;
};

export const SelectBoardProvider = ({
  value,
  onValueChange,
  children,
  mode = 'single',
  preloadedBoards,
}: {
  value: string | string[];
  onValueChange: (boardId: string) => void;
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
  preloadedBoards?: IBoard[];
}) => {
  const { boards: fetchedBoards, loading, error } = useGetSalesBoards({
    skip: !!preloadedBoards,
  });
  const boards = preloadedBoards ?? fetchedBoards;

  const handleValueChange = useCallback(
    (boardId: string) => {
      if (!boardId) return;
      onValueChange?.(boardId);
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
      boards,
      loading,
      error,
      mode,
    }),
    [value, handleValueChange, boards, loading, error, mode],
  );

  return (
    <SelectBoardContext.Provider value={contextValue}>
      {children}
    </SelectBoardContext.Provider>
  );
};

const SelectBoardValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, boards } = useSelectBoardContext();
  const selected = boards?.find((b) => b._id === value);

  if (!selected)
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select board'}
      </span>
    );

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm capitalize', className)}>{selected.name}</p>
    </div>
  );
};

const SelectBoardCommandItem = ({ board }: { board: IBoard }) => {
  const { onValueChange, value } = useSelectBoardContext();
  return (
    <Command.Item value={board._id} onSelect={() => onValueChange(board._id)}>
      <span className="font-medium capitalize">{board.name}</span>
      <Combobox.Check checked={value === board._id} />
    </Command.Item>
  );
};

const SelectBoardContent = () => {
  const { boards, loading, error } = useSelectBoardContext();

  const renderContent = useCallback(() => {
    if (loading)
      return (
        <div className="flex items-center justify-center h-24">
          <span className="text-muted-foreground">Loading...</span>
        </div>
      );
    if (error)
      return (
        <div className="flex items-center justify-center h-24">
          <span className="text-muted-foreground text-xs text-center px-2">
            Sales plugin unavailable
          </span>
        </div>
      );
    return boards?.map((b) => <SelectBoardCommandItem key={b._id} board={b} />);
  }, [loading, error, boards]);

  return (
    <Command>
      <Command.Input placeholder="Search board" />
      <Command.Empty>
        <span className="text-muted-foreground">No boards found</span>
      </Command.Empty>
      <Command.List>{renderContent()}</Command.List>
    </Command>
  );
};

export const SelectBoardFilterItem = () => (
  <Filter.Item value="scoreBoardId">
    <IconLayoutKanban />
    Board
  </Filter.Item>
);

export const SelectBoardFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
  preloadedBoards,
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
  preloadedBoards?: IBoard[];
}) => {
  const [boardId, setBoardId] = useQueryState<string[] | string>(queryKey || 'scoreBoardId');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'scoreBoardId'}>
      <SelectBoardProvider
        mode={mode}
        value={boardId || (mode === 'single' ? '' : [])}
        preloadedBoards={preloadedBoards}
        onValueChange={(val) => {
          setBoardId(val as string[] | string);
          resetFilterState();
          onValueChange?.(val);
        }}
      >
        <SelectBoardContent />
      </SelectBoardProvider>
    </Filter.View>
  );
};

export const SelectBoardFilterBar = ({
  iconOnly,
  onValueChange,
  mode = 'single',
  preloadedBoards,
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
  preloadedBoards?: IBoard[];
}) => {
  const [boardId, setBoardId] = useQueryState<string[] | string>('scoreBoardId');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey="scoreBoardId">
      <Filter.BarName>
        <IconLayoutKanban />
        {!iconOnly && 'Board'}
      </Filter.BarName>
      <SelectBoardProvider
        mode={mode}
        value={boardId || (mode === 'single' ? '' : [])}
        preloadedBoards={preloadedBoards}
        onValueChange={(val) => {
          if (val.length > 0) setBoardId(val as string[] | string);
          else setBoardId(null);
          setOpen(false);
          onValueChange?.(val);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey="scoreBoardId">
              <SelectBoardValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectBoardContent />
          </Combobox.Content>
        </Popover>
      </SelectBoardProvider>
    </Filter.BarItem>
  );
};

export const SelectBoardFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof SelectBoardProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectBoardProvider
      onValueChange={(val) => {
        onValueChange?.(val);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectBoardValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>
        <Combobox.Content>
          <SelectBoardContent />
        </Combobox.Content>
      </Popover>
    </SelectBoardProvider>
  );
};

SelectBoardFormItem.displayName = 'SelectBoardFormItem';

const SelectBoardRoot = ({
  value,
  scope,
  onValueChange,
  disabled,
}: {
  value: string;
  scope?: string;
  onValueChange?: (val: string) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectBoardProvider value={value} onValueChange={(val) => { onValueChange?.(val); setOpen(false); }}>
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <Combobox.Trigger disabled={disabled}>
          <SelectBoardValue />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectBoardContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectBoardProvider>
  );
};

export const SelectBoard = Object.assign(SelectBoardRoot, {
  Provider: SelectBoardProvider,
  Value: SelectBoardValue,
  Content: SelectBoardContent,
  FilterItem: SelectBoardFilterItem,
  FilterView: SelectBoardFilterView,
  FilterBar: SelectBoardFilterBar,
  FormItem: SelectBoardFormItem,
});
