import { Separator, Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router';
import { HRM_SETTINGS_ROUTES } from '../constants/routes';

export const HrmSettingsSidebar = () => (
  <Sidebar collapsible="none" className="border-r flex-none">
    <Sidebar.Group>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {Object.entries(HRM_SETTINGS_ROUTES).map(([path, label]) => (
            <HrmSettingsSidebarItem key={path} to={path}>
              {label}
            </HrmSettingsSidebarItem>
          ))}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar>
);

export const HrmSettingsSidebarItem = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => {
  const isActive = useLocation().pathname === to;

  if (!children) {
    return <Separator />;
  }

  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton asChild isActive={isActive}>
        <Link to={to}>{children}</Link>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  );
};
