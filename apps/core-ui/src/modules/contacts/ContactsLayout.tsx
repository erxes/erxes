import {
  IconBuilding,
  IconChartFunnel,
  IconChevronDown,
  IconMagnet,
  IconSettings,
  IconUser,
} from '@tabler/icons-react';
import { AppLayout, AppLayoutFooterLink, cn, Sidebar } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { PageOutlet } from '~/components/CrashBoundary';
import { SidePanelLayout } from '~/modules/side-panel/SidePanelLayout';
import { ContactsPath } from './utils/contactDetailPath';
import type { ViewRecordType } from '@erxes/core-contract';
import { useLeadsT } from '~/modules/leads/i18n';
import { NestedViews } from '~/modules/views/NestedViews';
import { CONTACT_SETTINGS_PATH } from './settings/paths';

const CONTACTS_SECTIONS = [
  // People and companies are peers; leads (of either kind) come after.
  { labelKey: 'customers', path: ContactsPath.Customers, icon: IconUser },
  { labelKey: 'companies', path: ContactsPath.Companies, icon: IconBuilding },
  { labelKey: 'leads', path: ContactsPath.Leads, icon: IconMagnet },
];

const LEADS = `${ContactsPath.Index}${ContactsPath.Leads}`;

/** The Leads group: its report first, then people and companies. */
const LEAD_ITEMS: { label: string; to: string; icon: typeof IconUser; views?: ViewRecordType }[] = [
  { label: 'insights', to: `${LEADS}/insights`, icon: IconChartFunnel },
  { label: 'people', to: LEADS, icon: IconUser, views: 'lead' },
  { label: 'companies', to: `${LEADS}/companies`, icon: IconBuilding, views: 'company_lead' },
];

/** Which lead item a path is in (`/leads/<id>` is a person). */
const leadItemOf = (pathname: string) =>
  pathname.startsWith(`${LEADS}/insights`)
    ? `${LEADS}/insights`
    : pathname.startsWith(`${LEADS}/companies`)
      ? `${LEADS}/companies`
      : LEADS;

const LeadsGroup = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation('contact');
  const leadsT = useLeadsT();
  const inLeads = pathname === LEADS || pathname.startsWith(`${LEADS}/`);
  const [open, setOpen] = useState(true);
  const active = inLeads ? leadItemOf(pathname) : null;

  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton
        className="px-2"
        isActive={inLeads && !open}
        onClick={() => setOpen((value) => !value)}
      >
        <IconMagnet />
        <span className="min-w-0 flex-1 truncate capitalize">{t('leads')}</span>
        <IconChevronDown
          className={cn('size-4 text-muted-foreground transition-transform', !open && '-rotate-90')}
        />
      </Sidebar.MenuButton>
      {open && (
        <Sidebar.Sub>
          {LEAD_ITEMS.map(({ label, to, icon: Icon, views }) => (
            <Sidebar.SubItem key={to}>
              <Sidebar.SubButton isActive={active === to} render={<Link to={to} />}>
                <Icon />
                <span>{leadsT(label)}</span>
              </Sidebar.SubButton>
              {views && <NestedViews recordType={views} indent />}
            </Sidebar.SubItem>
          ))}
        </Sidebar.Sub>
      )}
    </Sidebar.MenuItem>
  );
};

/** The Contacts sidebar; Leads opens to Insights, People and Companies. */
const ContactsNavigation = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation('contact');

  return (
    <Sidebar.Group className="px-2 py-1">
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {CONTACTS_SECTIONS.filter(({ path }) => path !== ContactsPath.Leads).map(
            ({ labelKey, path, icon: Icon }) => {
              const fullPath = `${ContactsPath.Index}${path}`;

              return (
                <Sidebar.MenuItem key={path}>
                  <Sidebar.MenuButton
                    className="px-2"
                    isActive={pathname === fullPath || pathname.startsWith(`${fullPath}/`)}
                    render={<Link to={fullPath} />}
                  >
                    <Icon />
                    <span className="min-w-0 flex-1 truncate capitalize">{t(labelKey)}</span>
                  </Sidebar.MenuButton>
                  <NestedViews
                    recordType={path === ContactsPath.Companies ? 'company' : 'customer'}
                  />
                </Sidebar.MenuItem>
              );
            },
          )}
          <LeadsGroup />
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
  const { t: sidebarT } = useTranslation('common', { keyPrefix: 'sidebar' });

  return (
    <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
      <AppLayout
        id="contacts"
        title={t('core-modules.contacts')}
        // Pinned at the foot, as erxes plugins do: opens Contacts › Settings.
        footer={
          <AppLayoutFooterLink
            path={CONTACT_SETTINGS_PATH}
            name={sidebarT('settings', 'Settings')}
            icon={IconSettings}
          />
        }
        sidebar={
          <>
            <ContactsNavigation />
          </>
        }
      >
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <PageOutlet />
        </div>
      </AppLayout>
      <SidePanelLayout fallback />
    </div>
  );
};
