import { IconLayoutGridAdd } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  Skeleton,
  useMultiQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  AccountsFilterCategory,
  FilterBarCategory,
  FilterBarStringItem,
  FilterPopoverStringItems,
  FilterStringDialogViews,
} from '../../components/filters/FilterHelpers';
import { useFilteredAccountCategories } from '../hooks/useFilteredAccountCategories';

const AccountCategoriesFilterPopover = () => {
  const { t } = useTranslation('accounting');
  const [queries] = useMultiQueryState<{
    searchValue: string;
    categoryId: string;
  }>(['searchValue', 'categoryId']);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <>
      <Filter.Popover scope="account-categories-filter">
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder={t('filter-label-2')}
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <FilterPopoverStringItems filterKeys={['searchValue']} />
                <Filter.Item value="category">
                  <IconLayoutGridAdd />
                  {t('category')}
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <AccountsFilterCategory />
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <FilterStringDialogViews filterKeys={['searchValue']} />
      </Filter.Dialog>
    </>
  );
};

const AccountCategoriesTotalCount = () => {
  const { t } = useTranslation('accounting');
  const { matchedIds, loading } = useFilteredAccountCategories();

  return (
    <span className="text-sm text-muted-foreground">
      {loading ? (
        <Skeleton className="size-4" />
      ) : (
        `${matchedIds.size} ${t('records-found')}`
      )}
    </span>
  );
};

export const AccountCategoriesFilter = () => {
  const [{ searchValue }] = useMultiQueryState<{ searchValue: string }>([
    'searchValue',
  ]);

  return (
    <Filter id="account-categories-filter">
      <Filter.Bar>
        <FilterBarStringItem queryKey="searchValue" value={searchValue} />
        <FilterBarCategory />
        <AccountCategoriesFilterPopover />
        <AccountCategoriesTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
