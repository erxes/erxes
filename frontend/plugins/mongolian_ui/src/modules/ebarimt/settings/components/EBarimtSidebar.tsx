import { Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router';
import { SETTINGS_ROUTES } from '@/ebarimt/settings/constants/settingRoutes';

export const EBarimtSidebar = () => {
  return (
    <Sidebar collapsible="none" className="border-r flex-none">
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {Object.entries(SETTINGS_ROUTES).map(([path, label]) => (
              <EBarimtSidebarItem key={path} to={path} children={label} />
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};

export const EBarimtSidebarItem = ({
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
