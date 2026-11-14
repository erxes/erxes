import { IconUsersGroup } from '@tabler/icons-react';
import { buttonVariants } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { paths } from '~/lib/paths';

export function TeamMemberSettingsBreadcrumb() {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  return (
    <Link to={paths.settings.teamMembers} className={buttonVariants({ variant: 'ghost' })}>
      <IconUsersGroup />
      {t('team-members', 'Team members')}
    </Link>
  );
}
