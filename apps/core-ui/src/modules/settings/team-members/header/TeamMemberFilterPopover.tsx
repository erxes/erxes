import { IconChecks } from '@tabler/icons-react';
import { Combobox, Command, Filter } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { OptionFilter } from '~/components/OptionFilter';
import { TEAM_MEMBERS_HOTKEY_SCOPE } from '../constants';
import { IsActiveBar } from './IsActiveBar';
import { useRoleFilter } from './useRoleFilter';

export function TeamMemberFilterPopover() {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const role = useRoleFilter();

  return (
    <Filter.Popover scope={TEAM_MEMBERS_HOTKEY_SCOPE}>
      <Filter.Trigger />
      <Combobox.Content>
        <Filter.View>
          <Command>
            <Filter.CommandInput placeholder={t('filter')} variant="secondary" />
            <Command.List className="p-1">
              <Filter.SearchValueTrigger />
              <OptionFilter.Item {...role} />
              <Command.Item className="flex items-center gap-1">
                <IconChecks />
                {t('is-active')}
                <IsActiveBar />
              </Command.Item>
            </Command.List>
          </Command>
        </Filter.View>
        <OptionFilter.View {...role} />
      </Combobox.Content>
    </Filter.Popover>
  );
}
