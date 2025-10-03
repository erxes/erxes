import { Collapsible, Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { PERMISSIONS, SETTINGS_ROUTES } from '../constants/structure-routes';
import { Permissions } from 'ui-modules';

export function StructureSidebar() {
  const { pathname } = useLocation();
  return (
    <Sidebar collapsible="none" className="border-r flex-none">
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {Object.entries(SETTINGS_ROUTES).map(([path, label]) => (
              <StructureSidebarItem key={path} to={path} children={label} />
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
      <Sidebar.Separator />
      <Permissions.SidebarGroup>
        <Permissions.SidebarItem to="/settings/structures/permissions" asChild>
          {Object.entries(PERMISSIONS).map(([path, label]) => {
            return (
              <Permissions.SidebarSubItem
                key={path}
                label={label}
                path={path}
              />
            );
          })}
        </Permissions.SidebarItem>
      </Permissions.SidebarGroup>
    </Sidebar>
  );
}

export const StructureSidebarItem = ({
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
