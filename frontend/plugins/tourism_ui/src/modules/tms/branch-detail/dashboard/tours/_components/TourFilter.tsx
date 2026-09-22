import {
  Combobox,
  Command,
  Filter,
  useQueryState,
  useMultiQueryState,
  useFilterQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  IconCalendarEvent,
  IconCheck,
  IconListTree,
  IconProgressCheck,
  IconSearch,
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
  const { t } = useTranslation('tourism');
  return (
    <Filter.Item value="status">
      <IconProgressCheck />
      {t('status')}
    </Filter.Item>
  );
}

function SelectDateStatusFilterItem() {
  const { t } = useTranslation('tourism');
  return (
    <Filter.Item value="date_status">
      <IconCalendarEvent />
      {t('date-status')}
    </Filter.Item>
  );
}

function SelectCategoryFilterItem() {
  const { t } = useTranslation('tourism');
  return (
    <Filter.Item value="categoryIds">
      <IconListTree />
      {t('category')}
    </Filter.Item>
  );
}

function SelectTourSearchFilterItem() {
  const { t } = useTranslation('tourism');
  return (
    <Filter.Item value="tourSearchValue" inDialog>
      <IconSearch />
      {t('search')}
    </Filter.Item>
  );
}

function TourSearchValueBarItem() {
  const { t } = useTranslation('tourism');
  const [tourSearchValue] = useFilterQueryState<string>('tourSearchValue');

  return (
    <Filter.BarItem queryKey="tourSearchValue">
      <Filter.BarName>
        <IconSearch />
        {t('search')}
      </Filter.BarName>
      <Filter.BarButton filterKey="tourSearchValue" inDialog>
        {tourSearchValue}
      </Filter.BarButton>
    </Filter.BarItem>
  );
}

function SelectStatusFilterView() {
  const { t } = useTranslation('tourism');
  const [status, setStatus] = useQueryState<string | undefined>('status');

  return (
    <Filter.View filterKey="status">
      <Command>
        <Command.Input placeholder={t('search-status')} />
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
  const { t } = useTranslation('tourism');
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
        <Command.Input placeholder={t('search-categories')} />
        <Command.List>
          <Command.Empty>{t('no-categories-found')}</Command.Empty>
          {loading ? (
            <Command.Item disabled>{t('loading')}</Command.Item>
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
  const { t } = useTranslation('tourism');
  const [dateStatus, setDateStatus] = useQueryState<string | undefined>(
    'date_status',
  );

  return (
    <Filter.View filterKey="date_status">
      <Command>
        <Command.Input placeholder={t('search-date-status')} />
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
  const { t } = useTranslation('tourism');
  return (
    <>
      <Filter.Popover>
        <Filter.Trigger />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput placeholder={t('filter')} variant="secondary" />
              <Command.List className="p-1">
                <SelectTourSearchFilterItem />
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
        <Filter.View filterKey="tourSearchValue" inDialog>
          <Filter.DialogStringView filterKey="tourSearchValue" label={t('search')} />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const TourFilter = ({ branchId }: { branchId: string }) => {
  const { t } = useTranslation('tourism');
  const activeLang = useAtomValue(activeLangAtom);
  const [queries] = useMultiQueryState<{
    status: string;
    date_status: string;
    categoryIds: string;
  }>(['status', 'date_status', 'categoryIds']);

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
        ? t('x-selected', { count: selectedCategoryIds.length })
        : undefined;

  return (
    <Filter id="tours-filter" sessionKey={TOURS_CURSOR_SESSION_KEY}>
      <Filter.Bar>
        <TourFilterPopover branchId={branchId} />
        <TourSearchValueBarItem />

        <Filter.BarItem queryKey="status">
          <Filter.BarName>
            <IconProgressCheck />
            {t('status')}
          </Filter.BarName>
          <Filter.BarButton filterKey="status">
            {selectedStatusLabel || t('select-status')}
          </Filter.BarButton>
        </Filter.BarItem>

        <Filter.BarItem queryKey="date_status">
          <Filter.BarName>
            <IconCalendarEvent />
            {t('date-status')}
          </Filter.BarName>
          <Filter.BarButton filterKey="date_status">
            {selectedDateStatusLabel || t('select-date-status')}
          </Filter.BarButton>
        </Filter.BarItem>

        <Filter.BarItem queryKey="categoryIds">
          <Filter.BarName>
            <IconListTree />
            {t('category')}
          </Filter.BarName>
          <Filter.BarButton filterKey="categoryIds">
            {selectedCategoryLabel || t('select-category')}
          </Filter.BarButton>
        </Filter.BarItem>

        <TourTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
