import { Sidebar, recordTableCursorAtomFamily } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { SYNC_ERKHET_ROUTES } from './SyncErkhetRoutes';

const SidebarItem = ({
  label,
  value,
  sessionKey,
}: (typeof SYNC_ERKHET_ROUTES)[number]) => {
  const { t } = useTranslation('mongolian');
  const { pathname } = useLocation();
  const setCursor = useSetAtom(recordTableCursorAtomFamily(sessionKey));
  const path = `/mongolian/sync-erkhet/${value}`;

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

export const SyncErkhetSidebar = () => {
  return (
    <Sidebar collapsible="none" className="flex-none border-r">
      <Sidebar.Group>
        <Sidebar.GroupLabel>ERKHET SYNC</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {SYNC_ERKHET_ROUTES.map((route) => (
              <SidebarItem key={route.value} {...route} />
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};
