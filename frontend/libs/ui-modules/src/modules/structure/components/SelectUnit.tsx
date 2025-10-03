import React, { useState } from 'react';
import { SelectUnitContext } from '../contexts/SelectUnitContext';
import { useDebounce } from 'use-debounce';
import { useSelectUnitContext } from '../hooks/useSelectUnitContext';
import {
  Button,
  cn,
  Combobox,
  Command,
  Filter,
  Form,
  PopoverScoped,
  RecordTableInlineCell,
  Popover,
  TextOverflowTooltip,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { IconUsers, IconPlus } from '@tabler/icons-react';
import { ISelectUnitProviderProps, IUnit } from '../types/Unit';
import { useUnits } from '../hooks/useUnits';
import { UnitBadge } from './UnitBadge';
import { CreateUnitForm, SelectUnitCreateContainer } from './CreateUnitForm';

export const SelectUnitProvider = ({
  children,
  value,
  onValueChange,
}: ISelectUnitProviderProps) => {
  const [newUnitName, setNewUnitName] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<IUnit>();

  const handleSelectCallback = (unit: IUnit) => {
    if (!unit) return;

    const newSelectedUnitId = unit._id;

    const newSelectedUnit = unit;

    setSelectedUnit(newSelectedUnit);
    onValueChange?.(newSelectedUnitId);
  };

  return (
    <SelectUnitContext.Provider
      value={{
        onSelect: handleSelectCallback,
        value,
        selectedUnit,
        setSelectedUnit,
        newUnitName,
        setNewUnitName,
      }}
    >
      {children}
    </SelectUnitContext.Provider>
  );
};

export const SelectUnitCommand = ({
  disableCreateOption,
}: {
  disableCreateOption?: boolean;
}) => {
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [noUnitSearchValue, setNoUnitSearchValue] = useState<string>('');

  const { units, loading, error, handleFetchMore, totalCount } = useUnits({
    variables: {
      searchValue: debouncedSearch,
    },
    skip: debouncedSearch === noUnitSearchValue,
    onCompleted(data) {
      const { totalCount } = data?.unitsMain || {};
      setNoUnitSearchValue(totalCount === 0 ? debouncedSearch : '');
    },
  });

  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        variant="secondary"
        wrapperClassName="flex-auto"
        focusOnMount
      />
      <Command.List className="max-h-[300px] overflow-y-auto">
        <SelectUnitCreate
          search={search}
          show={!disableCreateOption && !loading && !units?.length}
        />
        <Combobox.Empty loading={loading} error={error} />
        {units && units.length > 0 && (
          <>
            {units.map((unit) => (
              <SelectUnitItem key={unit._id} unit={unit} />
            ))}
          </>
        )}

        <Combobox.FetchMore
          fetchMore={handleFetchMore}
          currentLength={units?.length || 0}
          totalCount={totalCount}
        />
      </Command.List>
    </Command>
  );
};

export const SelectUnitCreate = ({
  search,
  show,
}: {
  search: string;
  show: boolean;
}) => {
  const { setNewUnitName } = useSelectUnitContext();

  if (!search || !show) return null;

  return (
    <Command.Item
      onSelect={() => setNewUnitName(search)}
      className="font-medium"
    >
      <IconPlus />
      Create new unit: "{search}"
    </Command.Item>
  );
};

export const SelectUnitItem = ({ unit }: { unit: IUnit }) => {
  const { onSelect, selectedUnit } = useSelectUnitContext();
  const isSelected = selectedUnit?._id === unit._id;
  return (
    <Command.Item
      key={unit._id}
      value={unit._id}
      onSelect={() => {
        onSelect(unit);
      }}
    >
      <TextOverflowTooltip
        value={unit.title}
        className="flex-auto w-auto font-medium"
      />
      <Combobox.Check checked={isSelected} />
    </Command.Item>
  );
};

export const SelectUnitValue = ({ placeholder }: { placeholder?: string }) => {
  const { selectedUnit, value, setSelectedUnit, onSelect } =
    useSelectUnitContext();

  if (!value || value === undefined) {
    return <Combobox.Value placeholder={placeholder || ''} />;
  }

  return (
    <UnitBadge
      unit={selectedUnit}
      variant={'secondary'}
      unitId={value}
      renderAsPlainText
      onCompleted={(unit) => {
        if (!unit) return;
        setSelectedUnit(unit);
      }}
      onClose={() => onSelect?.(selectedUnit as IUnit)}
    />
  );
};

export const SelectUnitContent = ({
  disableCreateOption,
}: {
  disableCreateOption?: boolean;
}) => {
  const { newUnitName } = useSelectUnitContext();

  if (newUnitName) {
    return (
      <SelectUnitCreateContainer>
        <CreateUnitForm />
      </SelectUnitCreateContainer>
    );
  }
  return <SelectUnitCommand disableCreateOption={disableCreateOption} />;
};

export const SelectUnitInlineCell = ({
  onValueChange,
  scope,
  ...props
}: Omit<React.ComponentProps<typeof SelectUnitProvider>, 'children'> & {
  scope?: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <SelectUnitProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <RecordTableInlineCell.Trigger>
          <SelectUnitValue placeholder="Select unit" />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content className="min-w-72">
          <SelectUnitContent />
        </RecordTableInlineCell.Content>
      </PopoverScoped>
    </SelectUnitProvider>
  );
};

export const SelectUnitDetail = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectUnitProvider>, 'children'> &
    Omit<
      React.ComponentPropsWithoutRef<typeof Combobox.Trigger>,
      'children'
    > & {
      scope?: string;
    }
>(({ onValueChange, scope, value, options, ...props }, ref) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectUnitProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...{ value, options }}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <Combobox.Trigger ref={ref} {...props}>
          <SelectUnitValue placeholder="Select unit" />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectUnitContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectUnitProvider>
  );
});

SelectUnitDetail.displayName = 'SelectUnitDetail';

export const SelectUnitCommandbarItem = ({
  onValueChange,
  ...props
}: Omit<React.ComponentProps<typeof SelectUnitProvider>, 'children'>) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectUnitProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Button variant={'secondary'} asChild>
          <RecordTableInlineCell.Trigger>
            <IconUsers />
            Unit
          </RecordTableInlineCell.Trigger>
        </Button>
        <RecordTableInlineCell.Content className="w-96">
          <SelectUnitContent />
        </RecordTableInlineCell.Content>
      </Popover>
    </SelectUnitProvider>
  );
};

export const SelectUnitFormItem = ({
  onValueChange,
  className,
  ...props
}: Omit<React.ComponentProps<typeof SelectUnitProvider>, 'children'> & {
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectUnitProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectUnitValue placeholder="Select unit" />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectUnitContent />
        </Combobox.Content>
      </Popover>
    </SelectUnitProvider>
  );
};

export const SelectUnitFilterItem = () => {
  return (
    <Filter.Item value={'unitId'}>
      <IconUsers />
      Unit
    </Filter.Item>
  );
};

export const SelectUnitFilterView = () => {
  const [query, setQuery] = useQueryState<string>('unitId');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={'unitId'}>
      <SelectUnitProvider
        value={query as string}
        onValueChange={(value) => {
          setQuery(value as string);
          resetFilterState();
        }}
      >
        <SelectUnitContent disableCreateOption />
      </SelectUnitProvider>
    </Filter.View>
  );
};

export const SelectUnitFilterBar = () => {
  const [query, setQuery] = useQueryState<string>('unitId');
  const [open, setOpen] = useState<boolean>(false);

  if (!query) {
    return null;
  }

  return (
    <Filter.BarItem queryKey="unitId">
      <Filter.BarName>
        <IconUsers />
        Unit
      </Filter.BarName>
      <SelectUnitProvider
        value={query as string}
        onValueChange={(value) => {
          if (value) {
            setQuery(value as string);
          } else {
            setQuery(null);
          }
          setOpen(false);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={'unitId'}>
              <SelectUnitValue placeholder="Select unit" />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectUnitContent disableCreateOption />
          </Combobox.Content>
        </Popover>
      </SelectUnitProvider>
    </Filter.BarItem>
  );
};

export const SelectUnit = Object.assign(SelectUnitProvider, {
  Provider: SelectUnitProvider,
  CommandBarItem: SelectUnitCommandbarItem,
  Content: SelectUnitContent,
  Command: SelectUnitCommand,
  Item: SelectUnitItem,
  Value: SelectUnitValue,
  InlineCell: SelectUnitInlineCell,
  FormItem: SelectUnitFormItem,
  FilterItem: SelectUnitFilterItem,
  FilterView: SelectUnitFilterView,
  FilterBar: SelectUnitFilterBar,
  Detail: SelectUnitDetail,
});
