<<<<<<< HEAD
import { IconUsersGroup } from '@tabler/icons-react';
import { Breadcrumb, Button, Toggle } from 'erxes-ui';
=======
import { IconShieldLock, IconUsersGroup } from '@tabler/icons-react';
import { Breadcrumb, Toggle } from 'erxes-ui';
>>>>>>> a0a9aa95ef (update)
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { TeamMembersPath } from '../constants/teamMemberRoutes';
import { useLocation } from 'react-router';

export function TeamMemberSettingsBreadcrumb() {
  const { pathname } = useLocation();
  const { t } = useTranslation('settings');

  return (
    <Breadcrumb.List className="gap-1">
<<<<<<< HEAD
      <Breadcrumb.Item>
        <Button variant="ghost" asChild>
          <Link to={`${TeamMembersPath.Index}`}>
            <IconUsersGroup className="w-4 h-4 text-accent-foreground" />
            Members & Permission groups
          </Link>
        </Button>
      </Breadcrumb.Item>
=======
>>>>>>> a0a9aa95ef (update)
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
<<<<<<< HEAD
=======
            <IconUsersGroup className="w-4 h-4 text-accent-foreground" />
>>>>>>> a0a9aa95ef (update)
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
<<<<<<< HEAD
            {t('Permission groups')}
=======
            <IconShieldLock className="w-4 h-4 text-accent-foreground" />
            {t('Permissions')}
>>>>>>> a0a9aa95ef (update)
          </Link>
        </Toggle>
      </Breadcrumb.Page>
    </Breadcrumb.List>
  );
}
