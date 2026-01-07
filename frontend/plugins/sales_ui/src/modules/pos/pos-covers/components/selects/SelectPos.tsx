import {
  cn,
  Combobox,
  Command,
  Filter,
  Form,
  RecordTableInlineCell,
  Popover,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { useDebounce } from 'use-debounce';
import React, { useState, useCallback } from 'react';
import { IconLabel } from '@tabler/icons-react';
import { IPos } from '../../types/pos';
import {
  SelectPosContext,
  useSelectPosContext,
} from '../../context/SelectPosContext';
import { usePos } from '../../hooks/useSelectPos';
import { PosInline } from '../PosInline';

export const SelectPosProvider = ({
  children,
  mode = 'single',
  value,
  onValueChange,
  pos,
}: {
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
  value?: string[] | string | null;
  onValueChange: (value: string[] | string | null) => void;
  pos?: IPos[];
}) => {
  const [_pos, setPos] = useState<IPos[]>(pos || []);
  const isSingleMode = mode === 'single';

  const onSelect = useCallback(
    (pos: IPos) => {
      if (!pos) return;

      if (isSingleMode) {
        setPos([pos]);
        return onValueChange(pos._id);
      }

      const arrayValue = Array.isArray(value) ? value : [];
      const isPosSelected = arrayValue.includes(pos._id);
      const newSelectedPosIds = isPosSelected
        ? arrayValue.filter((id) => id !== pos._id)
        : [...arrayValue, pos._id];

      setPos((prev) =>
        [...prev, pos].filter((b) => newSelectedPosIds.includes(b._id)),
      );

      onValueChange(newSelectedPosIds);
    },
    [isSingleMode, onValueChange, value],
  );

  return (
    <SelectPosContext.Provider
      value={{
        pos: _pos,
        posIds: !value ? [] : Array.isArray(value) ? value : [value],
        onSelect,
        setPos,
        loading: false,
        error: null,
      }}
    >
      {children}
    </SelectPosContext.Provider>
  );
};

const SelectPosValue = ({ placeholder }: { placeholder?: string }) => {
  const { posIds, pos, setPos } = useSelectPosContext();

  return (
    <PosInline
      posIds={posIds}
      pos={pos}
      updatePos={setPos}
      placeholder={placeholder}
    />
  );
};

const SelectPosCommandItem = ({ pos }: { pos: IPos }) => {
  const { onSelect, posIds } = useSelectPosContext();

  return (
    <Command.Item value={pos._id} onSelect={() => onSelect(pos)}>
      <PosInline pos={[pos]} placeholder="Unnamed user" />
      <Combobox.Check checked={posIds.includes(pos._id)} />
    </Command.Item>
  );
};

const SelectPosContent = () => {
  const [search, setSearch] = React.useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const { pos: selectedPos } = useSelectPosContext();

  const {
    posList = [],
    loading,
    handleFetchMore,
    totalCount = 0,
  } = usePos({
    variables: { searchValue: debouncedSearch },
  });

  return (
    <Command shouldFilter={false} id="pos-command-menu">
      <Command.Input
        value={search}
        onValueChange={setSearch}
        variant="secondary"
        wrapperClassName="flex-auto"
        placeholder="Search pos..."
        className="h-9"
      />
      <Command.List>
        <Combobox.Empty loading={loading} />
        {selectedPos.length > 0 && (
          <>
            {selectedPos.map((pos) => (
              <SelectPosCommandItem key={pos._id} pos={pos} />
            ))}
            <Command.Separator className="my-1" />
          </>
        )}
        {posList
          .filter((pos) => selectedPos.every((b) => b._id !== pos._id))
          .map((pos) => (
            <SelectPosCommandItem key={pos._id} pos={pos} />
          ))}
        <Combobox.FetchMore
          fetchMore={handleFetchMore}
          totalCount={totalCount}
          currentLength={posList.length}
        />
      </Command.List>
    </Command>
  );
};

export const SelectPosFilterItem = () => (
  <Filter.Item value="pos">
    <IconLabel />
    Pos
  </Filter.Item>
);

export const SelectPosFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string | null) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [pos, setPos] = useQueryState<string[] | string | null>(
    queryKey || 'pos',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'pos'}>
      <SelectPosProvider
        mode={mode}
        value={pos ?? (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setPos(value);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectPosContent />
      </SelectPosProvider>
    </Filter.View>
  );
};

export const SelectPosFilterBar = ({
  iconOnly,
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string | null) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [pos, setPos] = useQueryState<string[] | string | null>(
    queryKey || 'pos',
  );
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={queryKey || 'pos'}>
      <Filter.BarName>
        <IconLabel />
        {!iconOnly && 'Pos'}
      </Filter.BarName>

      <SelectPosProvider
        mode={mode}
        value={pos ?? (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setPos(value || null);
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={queryKey || 'pos'}>
              <SelectPosValue />
            </Filter.BarButton>
          </Popover.Trigger>

          <Combobox.Content>
            <SelectPosContent />
          </Combobox.Content>
        </Popover>
      </SelectPosProvider>
    </Filter.BarItem>
  );
};

export const SelectPosInlineCell = ({
  onValueChange,
  scope,
  ...props
}: Omit<React.ComponentProps<typeof SelectPosProvider>, 'children'> & {
  scope?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectPosProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <RecordTableInlineCell.Trigger>
          <SelectPosValue placeholder="" />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content>
          <SelectPosContent />
        </RecordTableInlineCell.Content>
      </Popover>
    </SelectPosProvider>
  );
};

export const SelectPosFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof SelectPosProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectPosProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectPosValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectPosContent />
        </Combobox.Content>
      </Popover>
    </SelectPosProvider>
  );
};

SelectPosFormItem.displayName = 'SelectPosFormItem';

const SelectPosRoot = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectPosProvider>, 'children'> &
    React.ComponentProps<typeof Combobox.Trigger> & {
      placeholder?: string;
    }
>(({ onValueChange, className, mode, value, placeholder, ...props }, ref) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectPosProvider
      onValueChange={(v) => {
        onValueChange?.(v);
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
          <SelectPosValue placeholder={placeholder} />
        </Combobox.Trigger>

        <Combobox.Content>
          <SelectPosContent />
        </Combobox.Content>
      </Popover>
    </SelectPosProvider>
  );
});

SelectPosRoot.displayName = 'SelectPosRoot';

export const SelectPos = Object.assign(SelectPosRoot, {
  Provider: SelectPosProvider,
  Value: SelectPosValue,
  Content: SelectPosContent,
  FilterItem: SelectPosFilterItem,
  FilterView: SelectPosFilterView,
  FilterBar: SelectPosFilterBar,
  InlineCell: SelectPosInlineCell,
  FormItem: SelectPosFormItem,
});
