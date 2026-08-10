import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { Combobox, Command, Filter, PageSubHeader } from 'erxes-ui';
import { DepartmentsTotalCount } from './DepartmentsTotalCount';
import { SelectDepartments } from 'ui-modules';
import { SelectStructureStatus } from '../SelectStructureStatus';

export const DepartmentsFilter = () => {
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
                    placeholder="Filter"
                    variant="secondary"
                    className="bg-background"
                  />
                  <Command.List className="p-1">
                    <Filter.SearchValueTrigger />
                    <SelectDepartments.FilterItem
                      value="parentId"
                      label="By Parent"
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
            label="By Parent"
          />
          <SelectStructureStatus.FilterBar />
          <DepartmentsTotalCount />
        </Filter.Bar>
      </Filter>
    </PageSubHeader>
  );
};
