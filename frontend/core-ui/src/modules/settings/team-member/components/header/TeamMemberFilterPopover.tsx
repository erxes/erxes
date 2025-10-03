import { IconChecks } from '@tabler/icons-react';
import { Combobox, Command, Filter } from 'erxes-ui';
import { IsActiveBar } from './IsActiveBar';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import {
  SelectBranches,
  SelectBrands,
  SelectDepartments,
  SelectUnit,
} from 'ui-modules';

export function TeamMemberFilterPopover() {
  return (
    <Filter.Popover scope={SettingsHotKeyScope.UsersPage}>
      <Filter.Trigger />
      <Combobox.Content>
        <Filter.View>
          <Command>
            <Filter.CommandInput placeholder="Filter" variant="secondary" />

            <Command.List className="p-1">
              <Filter.SearchValueTrigger />
              <SelectBrands.FilterItem value="brandIds" label="Brands" />
              <Command.Item className="flex items-center gap-1">
                <IconChecks />
                isActive
                <IsActiveBar />
              </Command.Item>
            </Command.List>
          </Command>
        </Filter.View>
        <SelectBrands.FilterView mode="multiple" filterKey="brandIds" />
      </Combobox.Content>
    </Filter.Popover>
  );
}
