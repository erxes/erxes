import { Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { SETTINGS_ROUTES } from '@/erkhet-sync/settings/constants/settingRoutes';

export const SyncErkhetSidebar = () => {
  const { t } = useTranslation('mongolian');
  return (
    <Sidebar collapsible="none" className="border-r flex-none w-[300px]">
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {Object.entries(SETTINGS_ROUTES).map(([path, label]) => (
              <SyncErkhetSidebarItem key={path} to={path}>
                {t(label)}
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
