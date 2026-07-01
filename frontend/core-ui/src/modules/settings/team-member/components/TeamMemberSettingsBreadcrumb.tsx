import { IconUsersGroup } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export function TeamMemberSettingsBreadcrumb() {
  const { t } = useTranslation('settings');
  return (
    <Button variant="ghost" className="font-semibold">
      <IconUsersGroup className="w-4 h-4 text-accent-foreground" />
      {t('team-member.members-and-permissions', 'Members & Permission groups')}
    </Button>
  );
}
