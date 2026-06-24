import { useState } from 'react';
import { IconHash, IconSearch } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  useFilterContext,
  useFilterQueryState,
  useMultiQueryState,
} from 'erxes-ui';
import { CATEGORIES_CURSOR_SESSION_KEY } from '../constants/categoriesCursorSessionKey';
import { CategoriesTotalCount } from './CategoriesTotalCount';

const CATEGORY_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
] as const;

type CategoryStatusFilterValue =
  (typeof CATEGORY_STATUS_OPTIONS)[number]['value'];

const CategoryStatusFilterItem = () => (
  <Filter.Item value="status">
    <IconHash />
    Status
  </Filter.Item>
);

const CategoryStatusCommand = ({
  value,
  onValueChange,
}: {
  value: CategoryStatusFilterValue | null;
  onValueChange: (value: CategoryStatusFilterValue) => void;
}) => (
  <Command>
    <Command.Input placeholder="Search status" />
    <Command.Empty>
      <span className="text-muted-foreground">No statuses found</span>
    </Command.Empty>
    <Command.List>
      {CATEGORY_STATUS_OPTIONS.map((status) => (
        <Command.Item
          key={status.value}
          value={status.value}
          onSelect={() => onValueChange(status.value)}
        >
          <span className="font-medium">{status.label}</span>
          <Combobox.Check checked={status.value === value} />
        </Command.Item>
      ))}
    </Command.List>
  </Command>
);

const CategoryStatusFilterView = () => {
  const { resetFilterState, sessionKey } = useFilterContext();
  const [status, setStatus] = useFilterQueryState<CategoryStatusFilterValue>(
    'status',
    sessionKey ?? '',
  );

  return (
    <Filter.View filterKey="status">
      <CategoryStatusCommand
        value={status}
        onValueChange={(value) => {
          setStatus(value);
          resetFilterState();
        }}
      />
    </Filter.View>
  );
};

const CategoryStatusFilterBar = () => {
  const { sessionKey } = useFilterContext();
  const [status, setStatus] = useFilterQueryState<CategoryStatusFilterValue>(
    'status',
    sessionKey ?? '',
  );
  const [open, setOpen] = useState(false);
  const selectedStatus = CATEGORY_STATUS_OPTIONS.find(
    (option) => option.value === status,
  );

  return (
    <Filter.BarItem queryKey="status">
      <Filter.BarName>
        <IconHash />
        Status
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="status">
            {selectedStatus?.label || 'Select status'}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <CategoryStatusCommand
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setOpen(false);
            }}
          />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

const CategoriesFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    searchValue: string;
    status: CategoryStatusFilterValue;
  }>(['searchValue', 'status']);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <>
      <Filter.Popover>
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder="Filter"
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <Filter.Item value="searchValue" inDialog>
                  <IconSearch />
                  Search
                </Filter.Item>
                <CategoryStatusFilterItem />
              </Command.List>
            </Command>
          </Filter.View>
          <CategoryStatusFilterView />
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const CategoriesFilter = () => {
  const [searchValue] = useFilterQueryState<string>('searchValue');

  return (
    <Filter id="categories-filter" sessionKey={CATEGORIES_CURSOR_SESSION_KEY}>
      <Filter.Bar>
        <Filter.BarItem queryKey="searchValue">
          <Filter.BarName>
            <IconSearch />
            Search
          </Filter.BarName>
          <Filter.BarButton filterKey="searchValue" inDialog>
            {searchValue}
          </Filter.BarButton>
        </Filter.BarItem>
        <CategoryStatusFilterBar />
        <CategoriesFilterPopover />
        <CategoriesTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
