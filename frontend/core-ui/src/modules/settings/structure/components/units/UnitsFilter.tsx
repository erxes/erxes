import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { Command } from 'cmdk';
import { Combobox, Filter, PageSubHeader } from 'erxes-ui';
import { UnitsTotalCount } from './UnitsTotalCount';

export const UnitsFilter = () => {
  return (
    <PageSubHeader>
      <Filter id="units">
        <Filter.Bar>
          <Filter.Popover scope={SettingsHotKeyScope.UnitsPage}>
            <Filter.Trigger />
            <Combobox.Content>
              <Filter.View>
                <Command>
                  <Filter.CommandInput />
                  <Command.List>
                    <Filter.SearchValueTrigger />
                  </Command.List>
                </Command>
              </Filter.View>
            </Combobox.Content>
          </Filter.Popover>
          <Filter.Dialog>
            <Filter.DialogStringView filterKey="searchValue" />
          </Filter.Dialog>
          <Filter.SearchValueBarItem />
          <UnitsTotalCount />
        </Filter.Bar>
      </Filter>
    </PageSubHeader>
  );
};
