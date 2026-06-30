import { Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MSDYNAMIC_ROUTES } from './MSDynamicRoutes';

const resetRecordTableSession = (sessionKey: string) => {
  sessionStorage.removeItem(sessionKey);
  sessionStorage.removeItem(`${sessionKey}_scroll`);
};

export const MSDynamicSidebar = () => {
  const { t } = useTranslation('mongolian');
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="none" className="flex-none border-r">
      <Sidebar.Group>
        <Sidebar.GroupLabel>MSDYNAMIC</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {MSDYNAMIC_ROUTES.map((route) => {
              const path = `/mongolian/msdynamic/${route.value}`;

              return (
                <Sidebar.MenuItem key={route.value}>
                  <Sidebar.MenuButton
                    asChild
                    isActive={pathname === path}
                    onClick={() => resetRecordTableSession(route.sessionKey)}
                  >
                    <Link to={path}>{t(route.label)}</Link>
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
              );
            })}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};
