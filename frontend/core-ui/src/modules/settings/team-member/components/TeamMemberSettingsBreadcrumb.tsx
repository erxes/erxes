import { IconUsersGroup } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { TEAM_MEMBER_SETTINGS } from '../constants/teamMemberRoutes';

export function TeamMemberSettingsBreadcrumb() {
  const { t } = useTranslation('settings', {
    keyPrefix: 'team-member',
  });

  return (
    <>
      <Button variant="ghost" className="font-semibold" asChild>
        <Link to={TEAM_MEMBER_SETTINGS}>
          <IconUsersGroup className="w-4 h-4 text-accent-foreground" />
          {t('_')}
        </Link>
      </Button>
    </>
  );
}
