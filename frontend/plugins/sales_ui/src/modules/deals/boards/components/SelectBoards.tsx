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
  SelectBoardsContext,
  useSelectBoardsContext,
} from '@/deals/context/DealContext';

import { BoardsInline } from './BoardsInline';
import { IBoard } from '@/deals/types/boards';
import { IconLabel } from '@tabler/icons-react';
import { useBoards } from '../hooks/useBoards';
import { useDebounce } from 'use-debounce';

export const SelectBoardProvider = ({
  children,
  mode = 'single',
  value,
  onValueChange,
  boards,
}: {
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
  value?: string[] | string;
  onValueChange: (value: string[] | string) => void;
  boards?: IBoard[];
}) => {
  const [_boards, setBoards] = useState<IBoard[]>(boards || []);
  const isSingleMode = mode === 'single';

  const onSelect = (board: IBoard) => {
    if (!board) return;
    if (isSingleMode) {
      setBoards([board]);
      return onValueChange?.(board._id);
    }

    const arrayValue = Array.isArray(value) ? value : [];

    const isBoardSelected = arrayValue.includes(board._id);
    const newSelectedBoardIds = isBoardSelected
      ? arrayValue.filter((id) => id !== board._id)
      : [...arrayValue, board._id];

    setBoards((prev) =>
      [...prev, board].filter((b) => newSelectedBoardIds.includes(b._id)),
    );
    onValueChange?.(newSelectedBoardIds);
  };

  return (
    <SelectBoardsContext.Provider
      value={{
        boards: _boards,
        boardIds: !value ? [] : Array.isArray(value) ? value : [value],
        onSelect,
        setBoards,
        loading: false,
        error: null,
      }}
    >
      {children}
    </SelectBoardsContext.Provider>
  );
};

const SelectBoardsValue = ({ placeholder }: { placeholder?: string }) => {
  const { boardIds, boards, setBoards } = useSelectBoardsContext();

  return (
    <BoardsInline
      boardIds={boardIds}
      boards={boards}
      updateBoards={setBoards}
      placeholder={placeholder}
    />
  );
};

const SelectBoardCommandItem = ({ board }: { board: IBoard }) => {
  const { onSelect, boardIds } = useSelectBoardsContext();

  return (
    <Command.Item
      value={board._id}
      onSelect={() => {
        onSelect(board);
      }}
    >
      <BoardsInline boards={[board]} placeholder="Unnamed board" />
      <Combobox.Check checked={boardIds.includes(board._id)} />
    </Command.Item>
  );
};

const SelectBoardContent = () => {
  const [search, setSearch] = React.useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const { boards: selectedBoards } = useSelectBoardsContext();

  const { boards = [], loading } = useBoards({
    variables: {
      searchValue: debouncedSearch,
    },
  });

  return (
    <Command shouldFilter={false} id="board-command-menu">
      <Command.Input
        value={search}
        onValueChange={setSearch}
        variant="secondary"
        wrapperClassName="flex-auto"
        placeholder="Search board..."
        className="h-9"
      />
      <Command.List>
        <Combobox.Empty loading={loading} />
        {selectedBoards.length > 0 && (
          <>
            {selectedBoards?.map((board) => (
              <SelectBoardCommandItem key={board._id} board={board} />
            ))}
            <Command.Separator className="my-1" />
          </>
        )}
        {boards
          .filter((board) => !selectedBoards.some((b) => b._id === board._id))
          .map((board) => (
            <SelectBoardCommandItem key={board._id} board={board} />
          ))}
      </Command.List>
    </Command>
  );
};

export const SelectBoardFilterItem = () => {
  return (
    <Filter.Item value="board">
      <IconLabel />
      Board
    </Filter.Item>
  );
};

export const SelectBoardFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [board, setBoard] = useQueryState<string[] | string>(
    queryKey || 'board',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'board'}>
      <SelectBoardProvider
        mode={mode}
        value={board || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setBoard(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
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
  queryKey,
  mode = 'single',
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [board, setBoard] = useQueryState<string[] | string>(
    queryKey || 'board',
  );
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={queryKey || 'board'}>
      <Filter.BarName>
        <IconLabel />
        {!iconOnly && 'Board'}
      </Filter.BarName>
      <SelectBoardProvider
        mode={mode}
        value={board || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          if (value.length > 0) {
            setBoard(value as string[] | string);
          } else {
            setBoard(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={queryKey || 'board'}>
              <SelectBoardsValue />
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

export const SelectBoardInlineCell = ({
  onValueChange,
  scope,
  ...props
}: Omit<React.ComponentProps<typeof SelectBoardProvider>, 'children'> & {
  scope?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectBoardProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <RecordTableInlineCell.Trigger>
          <SelectBoardsValue placeholder={''} />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content>
          <SelectBoardContent />
        </RecordTableInlineCell.Content>
      </Popover>
    </SelectBoardProvider>
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
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectBoardsValue placeholder={placeholder} />
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

const SelectBoardRoot = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectBoardProvider>, 'children'> &
    React.ComponentProps<typeof Combobox.Trigger> & {
      placeholder?: string;
    }
>(({ onValueChange, className, mode, value, placeholder, ...props }, ref) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectBoardProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      mode={mode}
      value={value}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.Trigger
          ref={ref}
          className={cn('w-full inline-flex', className)}
          variant="outline"
          {...props}
        >
          <SelectBoardsValue placeholder={placeholder} />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectBoardContent />
        </Combobox.Content>
      </Popover>
    </SelectBoardProvider>
  );
});

SelectBoardRoot.displayName = 'SelectBoardRoot';

export const SelectBoard = Object.assign(SelectBoardRoot, {
  Provider: SelectBoardProvider,
  Value: SelectBoardsValue,
  Content: SelectBoardContent,
  FilterItem: SelectBoardFilterItem,
  FilterView: SelectBoardFilterView,
  FilterBar: SelectBoardFilterBar,
  InlineCell: SelectBoardInlineCell,
  FormItem: SelectBoardFormItem,
});
