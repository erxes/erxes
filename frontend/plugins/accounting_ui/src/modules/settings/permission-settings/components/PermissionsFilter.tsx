import {
  IconCoins,
  IconEdit,
  IconEye,
  IconLayoutGridAdd,
  IconNotebook,
  IconStairs,
  IconToggleRightFilled,
  IconUser,
} from '@tabler/icons-react';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  AccountsFilterCategory,
  AccountsFilterCurrency,
  AccountsFilterIsOutBalance,
  AccountsFilterIsTemp,
  AccountsFilterJournal,
  AccountsFilterKind,
  AccountsFilterStatus,
  FilterBarCategory,
  FilterBarCurrency,
  FilterBarIsOutBalance,
  FilterBarIsTemp,
  FilterBarJournal,
  FilterBarKind,
  FilterBarStatus,
  FilterBarStringItem,
  FilterPopoverStringItems,
  FilterStringDialogViews,
} from '../../account/components/filters/FilterHelpers';
import {
  FilterBarLevel,
  FilterBarReads,
  FilterBarUser,
  FilterBarWrites,
  PermissionsFilterLevel,
  PermissionsFilterReads,
  PermissionsFilterUser,
  PermissionsFilterWrites,
} from './filters/FilterHelpers';
import { PermissionsTotalCount } from './PermissionsTotalCount';

const PERMISSION_QUERY_KEYS = [
  'searchValue',
  'code',
  'name',
  'categoryId',
  'currency',
  'kind',
  'journal',
  'status',
  'isTemp',
  'isOutBalance',
  'userId',
  'minLvl',
  'maxLvl',
  'reads',
  'writes',
];

const PermissionsFilterPopover = () => {
  const { t } = useTranslation('accounting');
  const [queries] = useMultiQueryState<Record<string, string>>(
    PERMISSION_QUERY_KEYS,
  );

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <>
      <Filter.Popover scope="permissions-filter">
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder={t('filter')}
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <FilterPopoverStringItems filterKeys={['searchValue']} />
                <Filter.Item value="userId">
                  <IconUser />
                  {t('user')}
                </Filter.Item>
                <Filter.Item value="reads">
                  <IconEye />
                  {t('read')}
                </Filter.Item>
                <Filter.Item value="writes">
                  <IconEdit />
                  {t('write')}
                </Filter.Item>
                <Filter.Item value="minLvl" inDialog>
                  <IconStairs />
                  {t('level')}
                </Filter.Item>
                <Command.Separator className="my-1" />
                <FilterPopoverStringItems filterKeys={['code', 'name']} />
                <Filter.Item value="category">
                  <IconLayoutGridAdd />
                  {t('category')}
                </Filter.Item>
                <Filter.Item value="currency">
                  <IconCoins />
                  {t('currency')}
                </Filter.Item>
                <Filter.Item value="kind">
                  <IconToggleRightFilled />
                  {t('kind')}
                </Filter.Item>
                <Command.Separator className="my-1" />
                <Filter.Item value="journal">
                  <IconNotebook />
                  {t('journal')}
                </Filter.Item>
                <Filter.Item value="isTemp">
                  <IconToggleRightFilled />
                  {t('is-temp')}
                </Filter.Item>
                <Filter.Item value="isOutBalance">
                  <IconToggleRightFilled />
                  {t('out-of-balance')}
                </Filter.Item>
                <Filter.Item value="status">
                  <IconToggleRightFilled />
                  {t('status')}
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <PermissionsFilterUser />
          <PermissionsFilterReads />
          <PermissionsFilterWrites />
          <AccountsFilterCategory />
          <Filter.View filterKey="currency">
            <AccountsFilterCurrency />
          </Filter.View>
          <Filter.View filterKey="kind">
            <AccountsFilterKind />
          </Filter.View>
          <Filter.View filterKey="journal">
            <AccountsFilterJournal />
          </Filter.View>
          <Filter.View filterKey="isTemp">
            <AccountsFilterIsTemp />
          </Filter.View>
          <Filter.View filterKey="isOutBalance">
            <AccountsFilterIsOutBalance />
          </Filter.View>
          <Filter.View filterKey="status">
            <AccountsFilterStatus />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <FilterStringDialogViews filterKeys={['searchValue', 'code', 'name']} />
        <PermissionsFilterLevel />
      </Filter.Dialog>
    </>
  );
};

export const PermissionsFilter = () => {
  const [queries] = useMultiQueryState<{
    searchValue: string;
    code: string;
    name: string;
  }>(['code', 'name', 'searchValue']);

  const { code, name, searchValue } = queries;

  return (
    <Filter id="permissions-filter">
      <Filter.Bar>
        <FilterBarStringItem queryKey="searchValue" value={searchValue} />
        <FilterBarUser />
        <FilterBarReads />
        <FilterBarWrites />
        <FilterBarLevel />
        <FilterBarStringItem queryKey="code" value={code} />
        <FilterBarStringItem queryKey="name" value={name} />
        <FilterBarCategory />
        <FilterBarCurrency />
        <FilterBarKind />
        <FilterBarJournal />
        <FilterBarIsTemp />
        <FilterBarIsOutBalance />
        <FilterBarStatus />
        <PermissionsFilterPopover />
        <PermissionsTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
