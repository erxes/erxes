import { IconSearch } from '@tabler/icons-react';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SelectBrand } from 'ui-modules';
import { TOPICS_FILTER_ID } from '@/knowledgebase/constants';
import { TopicsTotalCount } from '@/knowledgebase/topics/components/TopicsTotalCount';
import { KnowledgeBaseHotKeyScope } from '@/knowledgebase/types';

const TopicsFilterPopover = () => {
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
      <Filter.Popover scope={KnowledgeBaseHotKeyScope.TopicsPage}>
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

export const TopicsFilter = () => {
  const { t } = useTranslation('frontline');
  const [queries] = useMultiQueryState<{
    searchValue: string;
    brand: string;
  }>(['searchValue', 'brand']);
  const { searchValue } = queries || {};

  return (
    <Filter id={TOPICS_FILTER_ID}>
      <Filter.Bar>
        <TopicsFilterPopover />
        <TopicsTotalCount />
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
