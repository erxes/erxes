import { ContactsBreadcrumb } from '@/contacts/components/ContactsBreadcrumb';
import { ContactsPath } from '@/types/paths/ContactsPath';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { createFavoriteBreadcrumb, PageHeader } from 'ui-modules';

/** A contact page's header: the contact lists' own, with the record's name. */
export const ContactDetailHeader = ({
  contentType,
  title,
  actions,
}: {
  contentType: 'core:customer' | 'core:company';
  title: ReactNode;
  actions?: ReactNode;
}) => {
  const { t } = useTranslation('contact');
  const { pathname } = useLocation();
  let listLabel = t('customers', 'Customers');
  let favoriteIcon = 'IconUser';
  if (contentType === 'core:company') {
    listLabel = t('companies', 'Companies');
    favoriteIcon = 'IconBuilding';
  } else if (
    pathname.startsWith(`${ContactsPath.Index}${ContactsPath.Leads}`)
  ) {
    listLabel = t('leads', 'Leads');
    favoriteIcon = 'IconMagnet';
  }

  return (
    <PageHeader>
      <PageHeader.Start>
        <ContactsBreadcrumb title={title} />
        {/* The path alone: the open tab must not make it another favorite. */}
        {typeof title === 'string' && (
          <PageHeader.FavoriteToggleButton
            path={pathname}
            breadcrumb={createFavoriteBreadcrumb(listLabel, title)}
            icon={favoriteIcon}
          />
        )}
      </PageHeader.Start>
      {actions && <PageHeader.End>{actions}</PageHeader.End>}
    </PageHeader>
  );
};
