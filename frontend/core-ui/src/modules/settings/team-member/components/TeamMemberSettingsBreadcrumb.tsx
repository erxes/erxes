import { IconShieldLock, IconUsersGroup } from '@tabler/icons-react';
import { Breadcrumb, Toggle } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { TeamMembersPath } from '../constants/teamMemberRoutes';
import { useLocation } from 'react-router';

export function TeamMemberSettingsBreadcrumb() {
  const { pathname } = useLocation();
  const { t } = useTranslation('settings');

  return (
    <Breadcrumb.List className="gap-1">
      <Breadcrumb.Page>
        <Toggle
          type="button"
          asChild
          pressed={
            pathname ===
            `${TeamMembersPath.Index}${TeamMembersPath.TeamMembers}`
          }
        >
          <Link to={`${TeamMembersPath.Index}${TeamMembersPath.TeamMembers}`}>
            <IconUsersGroup className="w-4 h-4 text-accent-foreground" />
            {t('Members')}
          </Link>
        </Toggle>
      </Breadcrumb.Page>
      <Breadcrumb.Separator />
      <Breadcrumb.Page>
        <Toggle
          type="button"
          asChild
          pressed={
            pathname ===
            `${TeamMembersPath.Index}${TeamMembersPath.TeamPermissions}`
          }
        >
          <Link
            to={`${TeamMembersPath.Index}${TeamMembersPath.TeamPermissions}`}
          >
            <IconShieldLock className="w-4 h-4 text-accent-foreground" />
            {t('Permissions')}
          </Link>
        </Toggle>
      </Breadcrumb.Page>
    </Breadcrumb.List>
  );
}
