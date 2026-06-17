import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { Combobox, Command, Filter, PageSubHeader } from 'erxes-ui';
import { SelectBranches } from 'ui-modules';
import { BranchesTotalCount } from './BranchesTotalCount';
import { SelectStructureStatus } from '../SelectStructureStatus';

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
                  <Filter.CommandInput
                    placeholder="Filter"
                    variant="secondary"
                    className="bg-background"
                  />
                  <Command.List className="p-1">
                    <Filter.SearchValueTrigger />
                    <SelectBranches.FilterItem
                      value="parentId"
                      label="By Parent"
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
            label="By Parent"
          />
          <SelectStructureStatus.FilterBar />
          <BranchesTotalCount />
        </Filter.Bar>
      </Filter>
    </PageSubHeader>
  );
};
