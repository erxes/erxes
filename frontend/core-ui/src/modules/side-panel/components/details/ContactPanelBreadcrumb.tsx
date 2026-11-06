import { ContactsPath } from '@/types/paths/ContactsPath';
import { IconBookmarksFilled } from '@tabler/icons-react';
import { Breadcrumb, Button } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

/** Uses the same ghost link controls as the contacts page header. */
const ContactListBreadcrumbItem = ({
  to,
  label,
  icon,
}: {
  to: string;
  label: string;
  icon?: ReactNode;
}) => (
  <Breadcrumb.Item className="shrink-0">
    <Button variant="ghost" asChild>
      <Link to={to} aria-label={label}>
        {icon}
        <span className={icon ? 'hidden sm:inline' : undefined}>{label}</span>
      </Link>
    </Button>
  </Breadcrumb.Item>
);

/** Keeps full contact navigation consistent with the standard contacts breadcrumb. */
export const ContactPanelBreadcrumb = ({
  contentType,
  title,
}: {
  contentType: 'core:customer' | 'core:company';
  title: ReactNode;
}) => {
  const { t } = useTranslation('contact');
  const { pathname } = useLocation();
  let listPath = ContactsPath.Customers;
  let listLabel = t('customers', 'Customers');
  if (contentType === 'core:company') {
    listPath = ContactsPath.Companies;
    listLabel = t('companies', 'Companies');
  } else if (
    pathname.startsWith(`${ContactsPath.Index}${ContactsPath.Leads}`)
  ) {
    listPath = ContactsPath.Leads;
    listLabel = t('leads', 'Leads');
  }

  return (
    <Breadcrumb className="min-w-0 pl-[var(--navigation-panel-toggle-space,0rem)]">
      <Breadcrumb.List className="min-w-0 flex-nowrap gap-1">
        <ContactListBreadcrumbItem
          to={ContactsPath.Index}
          label={t('core-modules.contacts', 'Contacts')}
          icon={<IconBookmarksFilled aria-hidden="true" />}
        />
        <Breadcrumb.Separator />
        <ContactListBreadcrumbItem
          to={`${ContactsPath.Index}${listPath}`}
          label={listLabel}
        />
        <Breadcrumb.Separator />
        <Breadcrumb.Item className="min-w-0">
          <Breadcrumb.Page
            className="block max-w-64 truncate px-3 py-1 leading-5"
            title={typeof title === 'string' ? title : undefined}
          >
            {title}
          </Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb>
  );
};
