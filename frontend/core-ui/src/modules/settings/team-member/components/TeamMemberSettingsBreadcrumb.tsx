import { IconInfoCircle, IconUsersGroup } from '@tabler/icons-react';
import { Breadcrumb, Button, Tooltip, ToggleGroup } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { TeamMembersPath } from '../constants/teamMemberRoutes';
import { useLocation } from 'react-router';

export function TeamMemberSettingsBreadcrumb() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation('settings');

  const isMembers =
    pathname === `${TeamMembersPath.Index}${TeamMembersPath.TeamMembers}`;
  const helpUrl =
    'https://erxes.io/guides/68ef769c1a9ddbd30aec6c35/6992b1cd5cac46b2ff76af71';

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
      <div className="flex items-center gap-1">
        <ToggleGroup
          type="single"
          variant="outline"
          value={isMembers ? 'members' : 'permissions'}
          onValueChange={(value) => {
            if (value === 'members') {
              navigate(
                `${TeamMembersPath.Index}${TeamMembersPath.TeamMembers}`,
              );
            } else {
              navigate(
                `${TeamMembersPath.Index}${TeamMembersPath.TeamPermissions}`,
              );
            }
          }}
        >
          <ToggleGroup.Item value="members">{t('Members')}</ToggleGroup.Item>
          <ToggleGroup.Item value="permissions">
            {t('Permission groups')}
          </ToggleGroup.Item>
        </ToggleGroup>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <Link to={helpUrl} target="_blank">
              <IconInfoCircle className="size-4 text-accent-foreground" />
            </Link>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <p>Add/manage user accounts</p>
          </Tooltip.Content>
        </Tooltip>
      </div>
    </Breadcrumb.List>
  );
}
