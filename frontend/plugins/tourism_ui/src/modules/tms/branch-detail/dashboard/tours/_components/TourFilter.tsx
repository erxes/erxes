import {
  Combobox,
  Command,
  Filter,
  useQueryState,
  useMultiQueryState,
} from 'erxes-ui';
import {
  IconCalendarEvent,
  IconCheck,
  IconListTree,
  IconProgressCheck,
} from '@tabler/icons-react';
import { useAtomValue } from 'jotai';
import { activeLangAtom } from '@/tms/atoms/activeLangAtom';
import { TOURS_CURSOR_SESSION_KEY } from '../constants/tourCursorSessionKey';
import { useCategories } from '../../category/hooks/useCategories';
import { ICategory } from '../../category';
import { TourTotalCount } from './TourTotalCount';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];

const DATE_STATUS_OPTIONS = [
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'unscheduled', label: 'Unscheduled' },
] as const;

function SelectStatusFilterItem() {
  return (
    <Filter.Item value="status">
      <IconProgressCheck />
      Status
    </Filter.Item>
  );
}

function SelectDateStatusFilterItem() {
  return (
    <Filter.Item value="date_status">
      <IconCalendarEvent />
      Date status
    </Filter.Item>
  );
}

function SelectCategoryFilterItem() {
  return (
    <Filter.Item value="categoryIds">
      <IconListTree />
      Category
    </Filter.Item>
  );
}

function SelectStatusFilterView() {
  const [status, setStatus] = useQueryState<string | undefined>('status');

  return (
    <Filter.View filterKey="status">
      <Command>
        <Command.Input placeholder="Search status" />
        <Command.List>
          {STATUS_OPTIONS.map((item) => (
            <Command.Item
              key={item.value}
              value={item.value}
              onSelect={() => setStatus(item.value)}
            >
              {item.label}
              {status === item.value && <IconCheck />}
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </Filter.View>
  );
}

function SelectCategoryFilterView({ branchId }: { branchId: string }) {
  const [categoryIds, setCategoryIds] = useQueryState<string | undefined>(
    'categoryIds',
  );
  const activeLang = useAtomValue(activeLangAtom);

  const { categories, loading } = useCategories({
    variables: {
      language: activeLang || undefined,
      branchId,
    },
  });

  const value = categoryIds ? categoryIds.split(',').filter(Boolean) : [];

  const handleToggle = (categoryId: string) => {
    const next = value.includes(categoryId)
      ? value.filter((id) => id !== categoryId)
      : [...value, categoryId];

    setCategoryIds(next.length ? next.join(',') : null);
  };

  return (
    <Filter.View filterKey="categoryIds">
      <Command>
        <Command.Input placeholder="Search categories..." />
        <Command.List>
          <Command.Empty>No categories found.</Command.Empty>
          {loading ? (
            <Command.Item disabled>Loading...</Command.Item>
          ) : (
            categories.map((category: ICategory) => {
              const isSelected = value.includes(category._id);

              return (
                <Command.Item
                  key={category._id}
                  value={`${category.name ?? ''} ${category._id}`}
                  onSelect={() => handleToggle(category._id)}
                >
                  {category.name}
                  {isSelected && <IconCheck />}
                </Command.Item>
              );
            })
          )}
        </Command.List>
      </Command>
    </Filter.View>
  );
}

function SelectDateStatusFilterView() {
  const [dateStatus, setDateStatus] = useQueryState<string | undefined>(
    'date_status',
  );

  return (
    <Filter.View filterKey="date_status">
      <Command>
        <Command.Input placeholder="Search date status" />
        <Command.List>
          {DATE_STATUS_OPTIONS.map((item) => (
            <Command.Item
              key={item.value}
              value={item.value}
              onSelect={() => setDateStatus(item.value)}
            >
              {item.label}
              {dateStatus === item.value && <IconCheck />}
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </Filter.View>
  );
}

const TourFilterPopover = ({ branchId }: { branchId: string }) => {
  return (
    <>
      <Filter.Popover>
        <Filter.Trigger />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput placeholder="Filter" variant="secondary" />
              <Command.List className="p-1">
                <Filter.SearchValueTrigger />
                <Command.Separator className="my-1" />
                <SelectStatusFilterItem />
                <SelectDateStatusFilterItem />
                <SelectCategoryFilterItem />
              </Command.List>
            </Command>
          </Filter.View>
          <SelectStatusFilterView />
          <SelectDateStatusFilterView />
          <SelectCategoryFilterView branchId={branchId} />
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

export const TourFilter = ({ branchId }: { branchId: string }) => {
  const activeLang = useAtomValue(activeLangAtom);
  const [queries] = useMultiQueryState<{
    searchValue: string;
    status: string;
    date_status: string;
    categoryIds: string;
  }>(['searchValue', 'status', 'date_status', 'categoryIds']);

  const { categories } = useCategories({
    variables: {
      language: activeLang || undefined,
      branchId,
    },
  });

  const selectedStatusLabel = STATUS_OPTIONS.find(
    (item) => item.value === queries?.status,
  )?.label;

  const selectedDateStatusLabel = DATE_STATUS_OPTIONS.find(
    (item) => item.value === queries?.date_status,
  )?.label;

  const selectedCategoryIds = queries?.categoryIds
    ? queries.categoryIds.split(',').filter(Boolean)
    : [];

  const selectedCategoryNames = selectedCategoryIds
    .map((id) => categories.find((c: ICategory) => c._id === id)?.name)
    .filter(Boolean) as string[];

  const selectedCategoryLabel =
    selectedCategoryNames.length > 0
      ? selectedCategoryNames.join(', ')
      : selectedCategoryIds.length > 0
        ? `${selectedCategoryIds.length} selected`
        : undefined;

  return (
    <Filter id="tours-filter" sessionKey={TOURS_CURSOR_SESSION_KEY}>
      <Filter.Bar>
        <TourFilterPopover branchId={branchId} />
        <Filter.SearchValueBarItem />

        <Filter.BarItem queryKey="status">
          <Filter.BarName>
            <IconProgressCheck />
            Status
          </Filter.BarName>
          <Filter.BarButton filterKey="status">
            {selectedStatusLabel || 'Select status'}
          </Filter.BarButton>
        </Filter.BarItem>

        <Filter.BarItem queryKey="date_status">
          <Filter.BarName>
            <IconCalendarEvent />
            Date status
          </Filter.BarName>
          <Filter.BarButton filterKey="date_status">
            {selectedDateStatusLabel || 'Select date status'}
          </Filter.BarButton>
        </Filter.BarItem>

        <Filter.BarItem queryKey="categoryIds">
          <Filter.BarName>
            <IconListTree />
            Category
          </Filter.BarName>
          <Filter.BarButton filterKey="categoryIds">
            {selectedCategoryLabel || 'Select category'}
          </Filter.BarButton>
        </Filter.BarItem>

        <TourTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
