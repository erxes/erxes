import { Separator, Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router';
import { ACC_TR_CHECK_ROUTES } from '../constants/settingsRoutes';

export const AccTrCheckSidebar = () => {
  return (
    <Sidebar collapsible="none" className="border-r flex-none">
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {Object.entries(ACC_TR_CHECK_ROUTES).map(([path, label]) => (
              <AccTrCheckSidebarItem key={path} to={path}>
                {label}
              </AccTrCheckSidebarItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};

export const AccTrCheckSidebarItem = ({
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
