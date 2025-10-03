import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { Command } from 'cmdk';
import { Combobox, Filter, PageSubHeader } from 'erxes-ui';
import { SelectBranches } from 'ui-modules';
import { BranchesTotalCount } from './BranchesTotalCount';

export const BranchesFilter = () => {
  return (
    <PageSubHeader>
      <Filter id="branches">
        <Filter.Bar>
          <Filter.Popover scope={SettingsHotKeyScope.BranchesPage}>
            <Filter.Trigger />
            <Combobox.Content>
              <Filter.View>
                <Command>
                  <Filter.CommandInput />
                  <Command.List>
                    <Filter.SearchValueTrigger />
                    <SelectBranches.FilterItem
                      value="parentId"
                      label="By Parent"
                    />
                  </Command.List>
                </Command>
              </Filter.View>
              <SelectBranches.FilterView mode="single" filterKey="parentId" />
            </Combobox.Content>
          </Filter.Popover>
          <Filter.Dialog>
            <Filter.DialogStringView filterKey="searchValue" />
          </Filter.Dialog>
          <Filter.SearchValueBarItem />
          <SelectBranches.FilterBar
            mode="single"
            filterKey="parentId"
            label="By Parent"
          />
          <BranchesTotalCount />
        </Filter.Bar>
      </Filter>
    </PageSubHeader>
  );
};
