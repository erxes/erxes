import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { Combobox, Command, Filter, PageSubHeader } from 'erxes-ui';
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
                  <Filter.CommandInput
                    placeholder="Filter"
                    variant="secondary"
                    className="bg-background"
                  />
                  <Command.List className="p-1">
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
