import { useTranslation } from 'react-i18next';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { Combobox, Command, Filter, PageSubHeader } from 'erxes-ui';
import { SelectBranches } from 'ui-modules';
import { BranchesTotalCount } from './BranchesTotalCount';
import { SelectStructureStatus } from '../SelectStructureStatus';

export const BranchesFilter = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  return (
    <PageSubHeader>
      <Filter id="branches">
        <Filter.Bar>
          <Filter.Popover scope={SettingsHotKeyScope.BranchesPage}>
            <Filter.Trigger />
            <Combobox.Content>
              <Filter.View>
                <Command>
                  <Filter.CommandInput
                    placeholder={t('filter')}
                    variant="secondary"
                    className="bg-background"
                  />
                  <Command.List className="p-1">
                    <Filter.SearchValueTrigger />
                    <SelectBranches.FilterItem
                      value="parentId"
                      label={t('by-parent')}
                    />
                    <SelectStructureStatus.FilterItem />
                  </Command.List>
                </Command>
              </Filter.View>
              <SelectBranches.FilterView mode="single" filterKey="parentId" />
              <SelectStructureStatus.FilterView />
            </Combobox.Content>
          </Filter.Popover>
          <Filter.Dialog>
            <Filter.DialogStringView filterKey="searchValue" />
          </Filter.Dialog>
          <Filter.SearchValueBarItem />
          <SelectBranches.FilterBar
            mode="single"
            filterKey="parentId"
            label={t('by-parent')}
          />
          <SelectStructureStatus.FilterBar />
          <BranchesTotalCount />
        </Filter.Bar>
      </Filter>
    </PageSubHeader>
  );
};
