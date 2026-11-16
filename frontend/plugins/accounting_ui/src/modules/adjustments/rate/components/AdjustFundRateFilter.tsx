import { IconSearch } from '@tabler/icons-react';
import { Combobox, Command, Filter, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AdjustFundRateFilter = () => {
  const { t } = useTranslation('accounting');
  const [searchValue] = useQueryState<string>('searchValue');

  return (
    <Filter id="adjust-fund-rate-filter">
      <Filter.Bar>
        <Filter.Popover scope="adjust-fund-rate-filter">
          <Filter.Trigger isFiltered={!!searchValue} />
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
                </Command.List>
              </Command>
            </Filter.View>
          </Combobox.Content>
        </Filter.Popover>
        <Filter.BarItem queryKey="searchValue">
          <Filter.BarName>
            <IconSearch />
            {t('search')}
          </Filter.BarName>
          <Filter.BarButton filterKey="searchValue" inDialog>
            {searchValue}
          </Filter.BarButton>
        </Filter.BarItem>
      </Filter.Bar>
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
      </Filter.Dialog>
    </Filter>
  );
};
