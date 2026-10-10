import { Separator, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { SETTINGS_ROUTES } from '../constants/settingsRoutes';

const FIXED_ASSET_SETTINGS_ROUTES = {
  '/settings/accounting/fixed-assets/accounts-config': 'Дансны багц',
  '/settings/accounting/fixed-assets/categories': 'Бүлэг',
  '/settings/accounting/fixed-assets/assets': 'Үндсэн хөрөнгө',
};

export const AccountingSidebar = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation('accounting');
  const isFixedAssetSettings = pathname.startsWith(
    '/settings/accounting/fixed-assets',
  );
  const routes = isFixedAssetSettings
    ? FIXED_ASSET_SETTINGS_ROUTES
    : SETTINGS_ROUTES;

  return (
    <Sidebar.Panel
      className="border-r flex-none"
      label={t(isFixedAssetSettings ? 'fixed-asset' : 'accounting')}
    >
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {Object.entries(routes).map(([path, label]) => (
              <AccountingSidebarItem key={path} to={path} children={label} />
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
