import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { Command } from 'cmdk';
import { Combobox, Filter, PageSubHeader } from 'erxes-ui';
import { PositionsTotalCount } from './PositionsTotalCount';
import { SelectPositions } from 'ui-modules';

export const PositionsFilter = () => {
  return (
    <PageSubHeader>
      <Filter id="positions">
        <Filter.Bar>
          <Filter.Popover scope={SettingsHotKeyScope.PositionsPage}>
            <Filter.Trigger />
            <Combobox.Content>
              <Filter.View>
                <Command>
                  <Filter.CommandInput />
                  <Command.List>
                    <Filter.SearchValueTrigger />
                    <SelectPositions.FilterItem
                      value="parentId"
                      label="By Parent"
                    />
                  </Command.List>
                </Command>
              </Filter.View>
              <SelectPositions.FilterView mode="single" filterKey="parentId" />
            </Combobox.Content>
          </Filter.Popover>
          <Filter.Dialog>
            <Filter.DialogStringView filterKey="searchValue" />
          </Filter.Dialog>
          <Filter.SearchValueBarItem />
          <SelectPositions.FilterBar
            mode="single"
            filterKey="parentId"
            label="By Parent"
          />
          <PositionsTotalCount />
        </Filter.Bar>
      </Filter>
    </PageSubHeader>
  );
};
