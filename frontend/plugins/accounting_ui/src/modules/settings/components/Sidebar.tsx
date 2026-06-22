import { Separator, Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router';
import { SETTINGS_ROUTES } from '../constants/settingsRoutes';

const FIXED_ASSET_SETTINGS_ROUTES = {
  '/settings/accounting/fixed-assets/categories': 'Бүлэг',
  '/settings/accounting/fixed-assets/assets': 'Үндсэн хөрөнгө',
};

export const AccountingSidebar = () => {
  const { pathname } = useLocation();
  const routes = pathname.startsWith('/settings/accounting/fixed-assets')
    ? FIXED_ASSET_SETTINGS_ROUTES
    : SETTINGS_ROUTES;

  return (
    <Sidebar collapsible="none" className="border-r flex-none">
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {Object.entries(routes).map(([path, label]) => (
              <AccountingSidebarItem key={path} to={path} children={label} />
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};

export const AccountingSidebarItem = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => {
  const isActive = useLocation().pathname === to;

  if (!children) {
    return <Separator />
  }

  if (!to.startsWith('/')) {
    return (
      <Sidebar.GroupLabel className="h-7 px-2 pt-2">
        {children}
      </Sidebar.GroupLabel>
    );
  }

  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton asChild isActive={isActive}>
        <Link to={to}>{children}</Link>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  );
};
