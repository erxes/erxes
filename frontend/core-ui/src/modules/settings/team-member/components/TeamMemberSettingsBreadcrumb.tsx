import { IconUsersGroup } from '@tabler/icons-react';
import { Breadcrumb, Button, Tabs, Toggle, ToggleGroup } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { TeamMembersPath } from '../constants/teamMemberRoutes';
import { useLocation } from 'react-router';

export function TeamMemberSettingsBreadcrumb() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation('settings');

  return (
    <Breadcrumb.List className="gap-1">
      <Breadcrumb.Item>
        <Button variant="ghost" asChild>
          <Link to={`${TeamMembersPath.Index}`}>
            <IconUsersGroup className="w-4 h-4 text-accent-foreground" />
            Members & Permission groups
          </Link>
        </Button>
      </Breadcrumb.Item>
      <Breadcrumb.Separator className="mx-2" />
      <ToggleGroup
        type="single"
        variant="outline"
        value={
          pathname === `${TeamMembersPath.Index}${TeamMembersPath.TeamMembers}`
            ? 'members'
            : 'permissions'
        }
        onValueChange={(value) => {
          if (value === 'members') {
            navigate(`${TeamMembersPath.Index}${TeamMembersPath.TeamMembers}`);
          } else {
            navigate(
              `${TeamMembersPath.Index}${TeamMembersPath.TeamPermissions}`,
            );
          }
        }}
      >
        <ToggleGroup.Item value="members"> {t('Members')} </ToggleGroup.Item>
        <ToggleGroup.Item value="permissions">
          {t('Permission groups')}
        </ToggleGroup.Item>
      </ToggleGroup>
    </Breadcrumb.List>
  );
}
