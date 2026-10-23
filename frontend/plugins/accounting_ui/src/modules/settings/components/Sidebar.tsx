import { Separator, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import {
  INVENTORY_SETTINGS_ROUTES,
  SETTINGS_ROUTES,
} from '../constants/settingsRoutes';

const FIXED_ASSET_SETTINGS_ROUTES = {
  '/accounting/settings/fixed-assets/accounts-config': 'account-configuration',
  '/accounting/settings/fixed-assets/categories': 'category-label',
  '/accounting/settings/fixed-assets/assets': 'fixed-assets',
};

export const AccountingSidebar = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation('accounting');
  const isFixedAssetSettings = pathname.startsWith(
    '/accounting/settings/fixed-assets',
  );
  const accountingRoutes = pathname.startsWith(
    '/accounting/settings/inventories',
  )
    ? INVENTORY_SETTINGS_ROUTES
    : SETTINGS_ROUTES;
  const routes = isFixedAssetSettings
    ? FIXED_ASSET_SETTINGS_ROUTES
    : accountingRoutes;

  return (
    <Sidebar.Panel
      className="border-r flex-none"
      label={t(isFixedAssetSettings ? 'fixed-asset' : 'accounting')}
    >
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {Object.entries(routes).map(([path, label]) => (
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
