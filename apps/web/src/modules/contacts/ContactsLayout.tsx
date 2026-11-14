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
import type { ViewRecordType } from '@erxes/core-contract';
import { useLeadsT } from '~/modules/leads/i18n';
import { NestedViews } from '~/modules/views/NestedViews';
import { paths } from '~/lib/paths';

// People and companies are peers; leads (of either kind) come after.
const CONTACTS_SECTIONS = [
  { labelKey: 'customers', to: paths.contacts.customers, icon: IconUser, views: 'customer' },
  { labelKey: 'companies', to: paths.contacts.companies, icon: IconBuilding, views: 'company' },
] as const;

const LEADS = paths.contacts.leads;

/** The Leads group: its report first, then people and companies. */
const LEAD_ITEMS: { label: string; to: string; icon: typeof IconUser; views?: ViewRecordType }[] = [
  { label: 'insights', to: paths.contacts.insights, icon: IconChartFunnel },
  { label: 'people', to: LEADS, icon: IconUser, views: 'lead' },
  {
    label: 'companies',
    to: paths.contacts.companyLeads,
    icon: IconBuilding,
    views: 'company_lead',
  },
];

/** Which lead item a path is in (`/leads/<id>` is a person). */
const leadItemOf = (pathname: string) =>
  [paths.contacts.insights, paths.contacts.companyLeads].find((to) => pathname.startsWith(to)) ??
  LEADS;

const LeadsGroup = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation('contact');
  const leadsT = useLeadsT();
  const inLeads = pathname === LEADS || pathname.startsWith(`${LEADS}/`);
  const [open, setOpen] = useState(true);
  const active = inLeads ? leadItemOf(pathname) : null;

  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton isActive={inLeads && !open} onClick={() => setOpen((value) => !value)}>
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
    <Sidebar.Group variant="flush">
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {CONTACTS_SECTIONS.map(({ labelKey, to, icon: Icon, views }) => (
            <Sidebar.MenuItem key={to}>
              <Sidebar.MenuButton
                isActive={pathname === to || pathname.startsWith(`${to}/`)}
                render={<Link to={to} />}
              >
                <Icon />
                <span className="min-w-0 flex-1 truncate capitalize">{t(labelKey)}</span>
              </Sidebar.MenuButton>
              <NestedViews recordType={views} />
            </Sidebar.MenuItem>
          ))}
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
            to={paths.contacts.settings}
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
