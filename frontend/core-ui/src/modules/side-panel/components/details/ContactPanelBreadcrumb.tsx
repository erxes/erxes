import { Breadcrumb } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

/** Renders the repeated contact-list link using the public breadcrumb contract. */
const ContactListBreadcrumbItem = ({
  to,
  label,
}: {
  to: string;
  label: string;
}) => (
  <Breadcrumb.Item>
    <Breadcrumb.Link asChild>
      <Link to={to}>{label}</Link>
    </Breadcrumb.Link>
  </Breadcrumb.Item>
);

/** Links a full contact page back to its list without covering the sidebar toggle. */
export const ContactPanelBreadcrumb = ({
  contentType,
  title,
}: {
  contentType: 'core:customer' | 'core:company';
  title: ReactNode;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const isCompany = contentType === 'core:company';
  return (
    <Breadcrumb className="pl-[var(--navigation-panel-toggle-space,0rem)]">
      <Breadcrumb.List>
        <ContactListBreadcrumbItem
          to="/contacts/customers"
          label={t('contacts', 'Contacts')}
        />
        <Breadcrumb.Separator />
        <ContactListBreadcrumbItem
          to={isCompany ? '/contacts/companies' : '/contacts/customers'}
          label={
            isCompany
              ? t('companies', 'Companies')
              : t('customers', 'Customers')
          }
        />
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Breadcrumb.Page className="max-w-64 truncate">
            {title}
          </Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb>
  );
};
