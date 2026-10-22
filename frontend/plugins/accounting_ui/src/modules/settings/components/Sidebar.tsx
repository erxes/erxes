import { Separator, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { SETTINGS_ROUTES } from '../constants/settingsRoutes';

export const AccountingSidebar = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation('accounting');

  if (pathname.startsWith('/accounting/settings/fixed-assets')) {
    return null;
  }

  return (
    <Sidebar.Panel className="border-r flex-none" label={t('accounting')}>
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {Object.entries(SETTINGS_ROUTES).map(([path, label]) => (
              <AccountingSidebarItem key={path} to={path}>
                {label && t(label)}
              </AccountingSidebarItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar.Panel>
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
    return <Separator />;
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
