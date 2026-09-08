import { IconSearch } from '@tabler/icons-react';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SelectBrand } from 'ui-modules';
import { HelpCenterTotalCount } from '@/helpcenter/components/HelpCenterTotalCount';
import { HELP_CENTER_FILTER_ID } from '@/helpcenter/constants';
import { HelpCenterHotKeyScope } from '@/helpcenter/types';

const HelpCenterFilterPopover = () => {
  const { t } = useTranslation('frontline');
  const [queries] = useMultiQueryState<{
    searchValue: string;
    brand: string;
  }>(['searchValue', 'brand']);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <>
      <Filter.Popover scope={HelpCenterHotKeyScope.HelpCentersPage}>
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
                <SelectBrand.FilterItem />
              </Command.List>
            </Command>
          </Filter.View>
          <SelectBrand.FilterView />
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

export const HelpCenterFilter = () => {
  const { t } = useTranslation('frontline');
  const [queries] = useMultiQueryState<{
    searchValue: string;
    brand: string;
  }>(['searchValue', 'brand']);
  const { searchValue } = queries || {};

  return (
    <Filter id={HELP_CENTER_FILTER_ID}>
      <Filter.Bar>
        <HelpCenterFilterPopover />
        <HelpCenterTotalCount />
        {searchValue && (
          <Filter.BarItem queryKey="searchValue">
            <Filter.BarName>
              <IconSearch />
              {t('search')}
            </Filter.BarName>
            <Filter.BarButton filterKey="searchValue" inDialog>
              {searchValue}
            </Filter.BarButton>
          </Filter.BarItem>
        )}
        <SelectBrand.FilterBar />
      </Filter.Bar>
    </Filter>
  );
};
