import { IconSearch } from '@tabler/icons-react';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { SelectBranches, SelectDepartments } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { ADJUST_DEBT_RATE_FILTER_KEYS } from '@/adjustments/debt/hooks/useAdjustDebtRates';

export const AdjustDebtRateFilter = () => {
  const { t } = useTranslation('accounting');
  const [filters] = useMultiQueryState<Record<string, string>>(
    ADJUST_DEBT_RATE_FILTER_KEYS,
  );

  return (
    <Filter id="adjust-debt-rate-filter">
      <Filter.Bar>
        <Filter.Popover scope="adjust-debt-rate-filter">
          <Filter.Trigger isFiltered={Object.values(filters).some(Boolean)} />
          <Combobox.Content>
            <Filter.View>
              <Command>
                <Filter.CommandInput
                  placeholder={t('filter')}
                  variant="secondary"
                  className="bg-background"
                />
                <Command.List className="p-1">
                  <Filter.Item value="searchValue" inDialog>
                    <IconSearch />
                    {t('search')}
                  </Filter.Item>
                  <SelectBranches.FilterItem
                    value="branchId"
                    label={t('branch')}
                  />
                  <SelectDepartments.FilterItem
                    value="departmentId"
                    label={t('department')}
                  />
                </Command.List>
              </Command>
            </Filter.View>
            <SelectBranches.FilterView filterKey="branchId" mode="single" />
            <SelectDepartments.FilterView
              filterKey="departmentId"
              mode="single"
            />
          </Combobox.Content>
        </Filter.Popover>
        <Filter.BarItem queryKey="searchValue">
          <Filter.BarName>
            <IconSearch />
            {t('search')}
          </Filter.BarName>
          <Filter.BarButton filterKey="searchValue" inDialog>
            {filters.searchValue}
          </Filter.BarButton>
        </Filter.BarItem>
        <SelectBranches.FilterBar
          filterKey="branchId"
          label={t('branch')}
          mode="single"
        />
        <SelectDepartments.FilterBar
          filterKey="departmentId"
          label={t('department')}
          mode="single"
        />
      </Filter.Bar>
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
      </Filter.Dialog>
    </Filter>
  );
};
