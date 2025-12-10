import { Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router';
import { SETTINGS_ROUTES } from '@/erkhet-sync/settings/constants/settingRoutes';

export const SyncErkhetSidebar = () => {
  return (
    <Sidebar collapsible="none" className="border-r flex-none w-[300px]">
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {Object.entries(SETTINGS_ROUTES).map(([path, label]) => (
              <SyncErkhetSidebarItem key={path} to={path}>
                {label}
              </SyncErkhetSidebarItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};

export const SyncErkhetSidebarItem = ({
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
