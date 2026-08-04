import { IconSearch } from '@tabler/icons-react';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import {
  SelectBranches,
  SelectCategory,
  SelectDepartments,
  SelectProduct,
} from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { useReserveRemQueryParams } from '../hooks/useReserveRems';

const ReserveRemFilterPopover = () => {
  const { t } = useTranslation('accounting');
  const queryParams = useReserveRemQueryParams();
  const hasFilters = Object.values(queryParams || {}).some(
    (value) => value !== null && value !== undefined && value !== '',
  );

  return (
    <>
      <Filter.Popover scope="reserve-rems-filter">
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
                <Filter.Item value="searchValue" inDialog>
                  <IconSearch />
                  {t('search')}
                </Filter.Item>
                <SelectCategory.FilterItem
                  value="categoryId"
                  label={t('category')}
                />
                <SelectProduct.FilterItem
                  value="productId"
                  label={t('product')}
                />
                <SelectBranches.FilterItem value="branchId" label="Салбар" />
                <SelectDepartments.FilterItem
                  value="departmentId"
                  label="Хэлтэс"
                />
              </Command.List>
            </Command>
          </Filter.View>
          <SelectCategory.FilterView filterKey="categoryId" mode="single" />
          <SelectProduct.FilterView filterKey="productId" mode="single" />
          <SelectBranches.FilterView mode="single" filterKey="branchId" />
          <SelectDepartments.FilterView
            mode="single"
            filterKey="departmentId"
          />
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

export const ReserveRemFilter = ({
  afterBar,
}: {
  afterBar?: React.ReactNode;
}) => {
  const { t } = useTranslation('accounting');
  const [queries] = useMultiQueryState<{
    searchValue: string;
  }>(['searchValue']);

  const { searchValue } = queries;

  return (
    <Filter id="reserve-rems-filter">
      <Filter.Bar>
        <Filter.BarItem queryKey="searchValue">
          <Filter.BarName>
            <IconSearch />
            {t('search')}
          </Filter.BarName>
          <Filter.BarButton filterKey="searchValue" inDialog>
            {searchValue}
          </Filter.BarButton>
        </Filter.BarItem>
        <SelectCategory.FilterBar
          filterKey="categoryId"
          label={t('category')}
          mode="single"
        />
        <SelectProduct.FilterBar
          filterKey="productId"
          label={t('product')}
          mode="single"
        />
        <SelectBranches.FilterBar
          label="Салбар"
          filterKey="branchId"
          mode="single"
        />
        <SelectDepartments.FilterBar
          label="Хэлтэс"
          filterKey="departmentId"
          mode="single"
        />
        <ReserveRemFilterPopover />
        {afterBar && <>{afterBar}</>}
      </Filter.Bar>
    </Filter>
  );
};
