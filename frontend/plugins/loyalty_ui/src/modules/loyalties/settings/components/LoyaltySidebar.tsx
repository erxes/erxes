import { Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { SETTINGS_ROUTES } from '../constants/settingRoutes';

export const LoyaltySidebar = () => {
  const { t } = useTranslation('loyalty');
  return (
    <Sidebar collapsible="none" className="border-r flex-none w-[250px]">
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {Object.entries(SETTINGS_ROUTES).map(([path, label]) => (
              <LoyaltySidebarItem key={path} to={path}>
                {t(label)}
              </LoyaltySidebarItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};

export const LoyaltySidebarItem = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => {
  const { pathname } = useLocation();
  const normalizePath = (value: string) => value.replace(/\/+$/, '');
  const isActive = normalizePath(pathname) === normalizePath(to);
  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton asChild isActive={isActive}>
        <Link to={to}>{children}</Link>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  );
};
