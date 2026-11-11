import { IconBuilding, IconMagnet, IconUser } from '@tabler/icons-react';
import { AppLayout } from 'erxes-ui';
import { Outlet } from 'react-router-dom';
import { AppNavigation } from '~/components/AppNavigation';

export const CONTACTS_SECTIONS = [
  { name: 'Customers', path: 'customers', icon: IconUser },
  { name: 'Leads', path: 'leads', icon: IconMagnet },
  { name: 'Companies', path: 'companies', icon: IconBuilding },
];

/** The Contacts app: its sidebar and the open section. */
export const ContactsLayout = () => (
  <AppLayout id="contacts" title="Contacts" sidebar={<AppNavigation pathPrefix="contacts" items={CONTACTS_SECTIONS} />}>
    <Outlet />
  </AppLayout>
);
