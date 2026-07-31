import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { Combobox, Command, Filter, PageSubHeader } from 'erxes-ui';
import { PositionsTotalCount } from './PositionsTotalCount';
import { SelectPositions } from 'ui-modules';
import { SelectStructureStatus } from '../SelectStructureStatus';
import { useTranslation } from 'react-i18next';

export const PositionsFilter = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  return (
    <PageSubHeader>
      <Filter id="positions">
        <Filter.Bar>
          <Filter.Popover scope={SettingsHotKeyScope.PositionsPage}>
            <Filter.Trigger />
            <Combobox.Content>
              <Filter.View>
                <Command>
                  <Filter.CommandInput
                    placeholder={t('filter', 'Filter')}
                    variant="secondary"
                    className="bg-background"
                  />
                  <Command.List className="p-1">
                    <Filter.SearchValueTrigger />
                    <SelectPositions.FilterItem
                      value="parentId"
                      label={t('by-parent', 'By Parent')}
                    />
                    <SelectStructureStatus.FilterItem />
                  </Command.List>
                </Command>
              </Filter.View>
              <SelectPositions.FilterView mode="single" filterKey="parentId" />
              <SelectStructureStatus.FilterView />
            </Combobox.Content>
          </Filter.Popover>
          <Filter.Dialog>
            <Filter.DialogStringView filterKey="searchValue" />
          </Filter.Dialog>
          <Filter.SearchValueBarItem />
          <SelectPositions.FilterBar
            mode="single"
            filterKey="parentId"
            label={t('by-parent', 'By Parent')}
          />
          <SelectStructureStatus.FilterBar />
          <PositionsTotalCount />
        </Filter.Bar>
      </Filter>
    </PageSubHeader>
  );
};
