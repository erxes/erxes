import { IconBuilding, IconMagnet, IconUser } from '@tabler/icons-react';
import { AppLayout, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { SidePanelLayout } from '~/modules/side-panel/SidePanelLayout';
import { ContactsPath } from './utils/contactDetailPath';

const CONTACTS_SECTIONS = [
  { labelKey: 'customers', path: ContactsPath.Customers, icon: IconUser },
  { labelKey: 'leads', path: ContactsPath.Leads, icon: IconMagnet },
  { labelKey: 'companies', path: ContactsPath.Companies, icon: IconBuilding },
];

/** The Contacts sidebar, as old core-ui's core module panel. */
const ContactsNavigation = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation('contact');

  return (
    <Sidebar.Group className="px-2 py-1">
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {CONTACTS_SECTIONS.map(({ labelKey, path, icon: Icon }) => {
            const fullPath = `${ContactsPath.Index}${path}`;

            return (
              <Sidebar.MenuItem key={path}>
                <Sidebar.MenuButton
                  asChild
                  className="px-2"
                  isActive={pathname === fullPath || pathname.startsWith(`${fullPath}/`)}
                >
                  <Link to={fullPath}>
                    <Icon />
                    <span className="min-w-0 flex-1 truncate capitalize">{t(labelKey)}</span>
                  </Link>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            );
          })}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};

/**
 * The Contacts app: its sidebar and the open section. Until the app-wide side
 * panel is mounted in MainLayout, records open in this app's own.
 */
export const ContactsLayout = () => {
  const { t } = useTranslation('contact');

  return (
    <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
      <AppLayout id="contacts" title={t('core-modules.contacts')} sidebar={<ContactsNavigation />}>
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <Outlet />
        </div>
      </AppLayout>
      <SidePanelLayout fallback />
    </div>
  );
};
