import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { Command } from 'cmdk';
import { Combobox, Filter, PageSubHeader } from 'erxes-ui';
import { DepartmentsTotalCount } from './DepartmentsTotalCount';
import { SelectDepartments } from 'ui-modules';

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
                  <Filter.CommandInput />
                  <Command.List>
                    <Filter.SearchValueTrigger />
                    <SelectDepartments.FilterItem
                      value="parentId"
                      label="By Parent"
                    />
                  </Command.List>
                </Command>
              </Filter.View>
              <SelectDepartments.FilterView
                mode="single"
                filterKey="parentId"
              />
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
          <DepartmentsTotalCount />
        </Filter.Bar>
      </Filter>
    </PageSubHeader>
  );
};
