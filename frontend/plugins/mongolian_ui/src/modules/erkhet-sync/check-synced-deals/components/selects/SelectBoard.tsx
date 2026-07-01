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
  Popover,
  PopoverScoped,
  Form,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { useGetSalesBoards } from '../../hooks/useGetSalesBoards';
import {
  SelectTriggerVariant,
  SelectTrigger,
  SelectContent,
} from './SelectShared';
import { IconLayoutCards } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

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
  mode = 'single',
}: {
  value: string | string[];
  onValueChange: (boardId: string) => void;
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
}) => {
  const { boards, loading, error } = useGetSalesBoards();

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
    }),
    [value, handleValueChange, boards, loading, error, mode],
  );

  return (
    <SelectSalesBoardContext.Provider value={contextValue}>
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
  const { t } = useTranslation('mongolian');
  const selectedBoard = boards?.find((board) => board._id === value);

  if (!selectedBoard) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || t('select-board')}
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
  const { t } = useTranslation('mongolian');

  const renderContent = useCallback(() => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-24">
          <span className="text-muted-foreground">{t('loading')}</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-24 text-destructive">
          {t('error')}: {error.message}
        </div>
      );
    }

    return boards?.map((board) => (
      <SelectSalesBoardCommandItem key={board._id} board={board} />
    ));
  }, [loading, error, boards, t]);

  return (
    <Command>
      <Command.Input placeholder={t('search-board')} />
      <Command.Empty>
        <span className="text-muted-foreground">{t('no-boards-found')}</span>
      </Command.Empty>
      <Command.List>{renderContent()}</Command.List>
    </Command>
  );
};
export const SelectSalesBoardFilterItem = () => {
  const { t } = useTranslation('mongolian');
  return (
    <Filter.Item value="boardId">
      <IconLayoutCards />
      {t('choose-filter-stage-board')}
    </Filter.Item>
  );
};
export const SelectSalesBoardFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [boardId, setBoardId] = useQueryState<string[] | string>(
    queryKey || 'boardId',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'boardId'}>
      <SelectSalesBoardProvider
        mode={mode}
        value={boardId || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setBoardId(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectSalesBoardContent />
      </SelectSalesBoardProvider>
    </Filter.View>
  );
};
export const SelectSalesBoardFilterBar = ({
  iconOnly,
  onValueChange,
  mode = 'single',
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
}) => {
  const [boardId, setBoardId] = useQueryState<string[] | string>('boardId');
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('mongolian');

  return (
    <Filter.BarItem queryKey={'boardId'}>
      <Filter.BarName>
        <IconLayoutCards />
        {t('board')}
      </Filter.BarName>
      <SelectSalesBoardProvider
        mode={mode}
        value={boardId || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          if (value.length > 0) {
            setBoardId(value as string[] | string);
          } else {
            setBoardId(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={'boardId'}>
              <SelectSalesBoardValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectSalesBoardContent />
          </Combobox.Content>
        </Popover>
      </SelectSalesBoardProvider>
    </Filter.BarItem>
  );
};
export const SelectSalesBoardFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof SelectSalesBoardProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectSalesBoardProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectSalesBoardValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectSalesBoardContent />
        </Combobox.Content>
      </Popover>
    </SelectSalesBoardProvider>
  );
};

SelectSalesBoardFormItem.displayName = 'SelectSalesBoardFormItem';

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

  const handleValueChange = useCallback(
    (value: string) => {
      onValueChange?.(value);
      setOpen(false);
    },
    [onValueChange],
  );

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
  FilterItem: SelectSalesBoardFilterItem,
  FilterView: SelectSalesBoardFilterView,
  FilterBar: SelectSalesBoardFilterBar,
  FormItem: SelectSalesBoardFormItem,
});
