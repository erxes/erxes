import { Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { TeamMembersPath } from '../constants/teamMemberRoutes';
import { useTranslation } from 'react-i18next';

export function TeamMemberSidebar() {
  const { t } = useTranslation('settings');

  return (
    <Sidebar collapsible="none" className="flex-none border-r">
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            <TeamMemberSidebarItem
              to={`${TeamMembersPath.Index}${TeamMembersPath.TeamMembers}`}
            >
              {t('Members')}
            </TeamMemberSidebarItem>
            <TeamMemberSidebarItem
              to={`${TeamMembersPath.Index}${TeamMembersPath.TeamPermissions}`}
            >
              {t('Permission groups')}
            </TeamMemberSidebarItem>
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
}

const TeamMemberSidebarItem = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => {
  const isActive = useLocation().pathname === to;
  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton asChild isActive={isActive}>
        <Link to={to}>{children}</Link>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  );
};
