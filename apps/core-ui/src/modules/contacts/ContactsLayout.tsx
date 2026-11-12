import { IconBuilding, IconChartFunnel, IconChevronDown, IconMagnet, IconUser } from '@tabler/icons-react';
import { AppLayout, cn, Sidebar } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { SidePanelLayout } from '~/modules/side-panel/SidePanelLayout';
import { ContactsPath } from './utils/contactDetailPath';
import { ViewsNavigation } from './views/ViewControls';

export const CONTACTS_SECTIONS = [
  // People and companies are peers; leads (of either kind) come after.
  { labelKey: 'customers', path: ContactsPath.Customers, icon: IconUser },
  { labelKey: 'companies', path: ContactsPath.Companies, icon: IconBuilding },
  { labelKey: 'leads', path: ContactsPath.Leads, icon: IconMagnet },
];

const LEADS = `${ContactsPath.Index}${ContactsPath.Leads}`;

/** The Leads group: its report first, then people and companies. */
const LEAD_ITEMS = [
  { label: 'Insights', to: `${LEADS}/insights`, icon: IconChartFunnel },
  { label: 'People', to: LEADS, icon: IconUser },
  { label: 'Companies', to: `${LEADS}/companies`, icon: IconBuilding },
];

/** Which lead item a path is in (`/leads/<id>` is a person). */
const leadItemOf = (pathname: string) =>
  pathname.startsWith(`${LEADS}/insights`) ? `${LEADS}/insights` : pathname.startsWith(`${LEADS}/companies`) ? `${LEADS}/companies` : LEADS;

const LeadsGroup = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation('contact');
  const inLeads = pathname === LEADS || pathname.startsWith(`${LEADS}/`);
  const [open, setOpen] = useState(true);
  const active = inLeads ? leadItemOf(pathname) : null;

  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton className="px-2" isActive={inLeads && !open} onClick={() => setOpen((value) => !value)}>
        <IconMagnet />
        <span className="min-w-0 flex-1 truncate capitalize">{t('leads')}</span>
        <IconChevronDown className={cn('size-4 text-muted-foreground transition-transform', !open && '-rotate-90')} />
      </Sidebar.MenuButton>
      {open && (
        <Sidebar.Sub>
          {LEAD_ITEMS.map(({ label, to, icon: Icon }) => (
            <Sidebar.SubItem key={to}>
              <Sidebar.SubButton asChild isActive={active === to}>
                <Link to={to}>
                  <Icon />
                  <span>{label}</span>
                </Link>
              </Sidebar.SubButton>
            </Sidebar.SubItem>
          ))}
        </Sidebar.Sub>
      )}
    </Sidebar.MenuItem>
  );
};

/** The Contacts sidebar, as old core-ui's core module panel; Leads opens to Insights, People and Companies. */
const ContactsNavigation = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation('contact');

  return (
    <Sidebar.Group className="px-2 py-1">
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {CONTACTS_SECTIONS.filter(({ path }) => path !== ContactsPath.Leads).map(({ labelKey, path, icon: Icon }) => {
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
          <LeadsGroup />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};

/** The open section's saved views (customers, leads or companies). */
const SectionViews = () => {
  const { pathname } = useLocation();
  const section = pathname.slice(ContactsPath.Index.length);
  // Company leads share the companies' views; lead insights have none.
  const recordType =
    section.startsWith(`${ContactsPath.Leads}/insights`)
      ? null
      : section.startsWith(ContactsPath.Companies) || section.startsWith(`${ContactsPath.Leads}/companies`)
        ? 'company'
        : section.startsWith(ContactsPath.Leads)
          ? 'lead'
          : section.startsWith(ContactsPath.Customers)
            ? 'customer'
            : null;

  return recordType ? <ViewsNavigation recordType={recordType} /> : null;
};

/**
 * The Contacts app: its sidebar and the open section. Until the app-wide side
 * panel is mounted in MainLayout, records open in this app's own.
 */
export const ContactsLayout = () => {
  const { t } = useTranslation('contact');

  return (
    <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
      <AppLayout id="contacts" title={t('core-modules.contacts')} sidebar={
          <>
            <ContactsNavigation />
            <SectionViews />
          </>
        }>
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <Outlet />
        </div>
      </AppLayout>
      <SidePanelLayout fallback />
    </div>
  );
};
