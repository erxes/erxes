import { Sidebar, recordTableCursorAtomFamily } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

interface Route {
  label: string;
  value: string;
  sessionKey: string;
}

const NavSidebarItem = ({
  label,
  value,
  sessionKey,
  pathPrefix,
}: Route & { pathPrefix: string }) => {
  const { t } = useTranslation('mongolian');
  const { pathname } = useLocation();
  const setCursor = useSetAtom(recordTableCursorAtomFamily(sessionKey));
  const path = `/${pathPrefix}/${value}`;

  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton
        asChild
        isActive={pathname === path}
        onClick={() => setCursor('')}
      >
        <Link to={path}>{t(label)}</Link>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  );
};

interface NavSidebarProps {
  routes: Route[];
  pathPrefix: string;
  groupLabel: string;
}

export const NavSidebar = ({
  routes,
  pathPrefix,
  groupLabel,
}: NavSidebarProps) => {
  const { t } = useTranslation('mongolian');
  return (
    <Sidebar collapsible="none" className="flex-none border-r">
      <Sidebar.Group>
        <Sidebar.GroupLabel>{t(groupLabel)}</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {routes.map((route) => (
              <NavSidebarItem
                key={route.value}
                {...route}
                pathPrefix={pathPrefix}
              />
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};
