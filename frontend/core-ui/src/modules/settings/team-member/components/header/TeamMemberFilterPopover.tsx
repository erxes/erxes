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
import { useTranslation } from 'react-i18next';

export function TeamMemberFilterPopover() {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  return (
    <Filter.Popover scope={SettingsHotKeyScope.UsersPage}>
      <Filter.Trigger />
      <Combobox.Content>
        <Filter.View>
          <Command>
            <Filter.CommandInput
              placeholder={t('filter')}
              variant="secondary"
            />

            <Command.List className="p-1">
              <Filter.SearchValueTrigger />
              <SelectBrands.FilterItem value="brandIds" label={t('brands')} />
              <SelectBranches.FilterItem
                value="branchIds"
                label={t('branches')}
              />
              <SelectDepartments.FilterItem
                value="departmentIds"
                label={t('departments')}
              />
              <SelectUnit.FilterItem />
              <Command.Item className="flex items-center gap-1">
                <IconChecks />
                {t('is-active')}
                <IsActiveBar />
              </Command.Item>
            </Command.List>
          </Command>
        </Filter.View>
        <SelectBrands.FilterView mode="multiple" filterKey="brandIds" />
        <SelectBranches.FilterView mode="multiple" filterKey="branchIds" />
        <SelectDepartments.FilterView
          mode="multiple"
          filterKey="departmentIds"
        />
        <SelectUnit.FilterView />
      </Combobox.Content>
    </Filter.Popover>
  );
}
