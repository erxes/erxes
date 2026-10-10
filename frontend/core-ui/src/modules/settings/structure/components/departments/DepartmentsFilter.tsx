import { useTranslation } from 'react-i18next';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { Combobox, Command, Filter, PageSubHeader } from 'erxes-ui';
import { DepartmentsTotalCount } from './DepartmentsTotalCount';
import { SelectDepartments } from 'ui-modules';
import { SelectStructureStatus } from '../SelectStructureStatus';

export const DepartmentsFilter = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  return (
    <PageSubHeader>
      <Filter id="departments">
        <Filter.Bar>
          <Filter.Popover scope={SettingsHotKeyScope.DepartmentsPage}>
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
                    <SelectDepartments.FilterItem
                      value="parentId"
                      label={t('by-parent')}
                    />
                    <SelectStructureStatus.FilterItem />
                  </Command.List>
                </Command>
              </Filter.View>
              <SelectDepartments.FilterView
                mode="single"
                filterKey="parentId"
              />
              <SelectStructureStatus.FilterView />
            </Combobox.Content>
          </Filter.Popover>
          <Filter.Dialog>
            <Filter.DialogStringView filterKey="searchValue" />
          </Filter.Dialog>
          <Filter.SearchValueBarItem />
          <SelectDepartments.FilterBar
            mode="single"
            filterKey="parentId"
            label={t('by-parent')}
          />
          <SelectStructureStatus.FilterBar />
          <DepartmentsTotalCount />
        </Filter.Bar>
      </Filter>
    </PageSubHeader>
  );
};
