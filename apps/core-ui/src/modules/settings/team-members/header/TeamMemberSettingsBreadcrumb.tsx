import { IconUsersGroup } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { TEAM_MEMBERS_PATH } from '../constants';

export function TeamMemberSettingsBreadcrumb() {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  return (
    <Button variant="ghost" asChild>
      <Link to={TEAM_MEMBERS_PATH}>
        <IconUsersGroup />
        {t('team-members', 'Team members')}
      </Link>
    </Button>
  );
}
