import { Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { SETTINGS_ROUTES } from '@/ebarimt/settings/constants/settingRoutes';

export const EBarimtSidebar = () => {
  return (
    <Sidebar collapsible="none" className="border-r flex-none">
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {Object.entries(SETTINGS_ROUTES).map(([path, label]) => (
              <EBarimtSidebarItem
                key={path}
                to={path ? `/settings/mongolian/ebarimt/${path}` : '/settings/mongolian/ebarimt'}
              >
                {label}
              </EBarimtSidebarItem>
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
  const pathname = useLocation().pathname.replace(/\/$/, '');
  const normalizedTo = to.replace(/\/$/, '');
  const isActive = pathname === normalizedTo;
  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton asChild isActive={isActive}>
        <Link to={to}>{children}</Link>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  );
};
