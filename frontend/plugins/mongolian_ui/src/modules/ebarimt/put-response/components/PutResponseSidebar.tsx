import { Sidebar, recordTableCursorAtomFamily } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { PUT_RESPONSE_ROUTES } from './PutResponseRoutes';

const SidebarItem = ({
  label,
  value,
  sessionKey,
}: (typeof PUT_RESPONSE_ROUTES)[number]) => {
  const { t } = useTranslation('mongolian');
  const { pathname } = useLocation();
  const setCursor = useSetAtom(recordTableCursorAtomFamily(sessionKey));
  const path = `/mongolian/put-response/${value}`;

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

export const PutResponseSidebar = () => {
  return (
    <Sidebar collapsible="none" className="flex-none border-r">
      <Sidebar.Group>
        <Sidebar.GroupLabel>PUT RESPONSE</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {PUT_RESPONSE_ROUTES.map((route) => (
              <SidebarItem key={route.value} {...route} />
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};
