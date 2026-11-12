import { ContactsBreadcrumb } from '@/contacts/components/ContactsBreadcrumb';
import { ContactsPath } from '@/types/paths/ContactsPath';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import {
  createFavoriteBreadcrumb,
  PageHeader,
  RecordPageMinimize,
} from 'ui-modules';

/** A contact page's header: the contact lists' own, with the record's name. */
export const ContactDetailHeader = ({
  contentType,
  title,
  actions,
}: {
  contentType: 'core:customer' | 'core:company' | 'core:cpUser';
  title: ReactNode;
  actions?: ReactNode;
}) => {
  const { t } = useTranslation('contact');
  const { pathname } = useLocation();
  let listLabel = t('customers', 'Customers');
  let favoriteIcon = 'IconUser';
  if (contentType === 'core:cpUser') {
    listLabel = t('client-portal-users', 'Client Portal Users');
    favoriteIcon = 'IconUserCircle';
  } else if (contentType === 'core:company') {
    listLabel = t('companies', 'Companies');
    favoriteIcon = 'IconBuilding';
  } else if (
    pathname.startsWith(`${ContactsPath.Index}${ContactsPath.Leads}`)
  ) {
    listLabel = t('leads', 'Leads');
    favoriteIcon = 'IconMagnet';
  }

  return (
    <PageHeader className="h-auto min-h-10 flex-wrap gap-x-3 gap-y-1 overflow-visible py-1">
      <PageHeader.Start className="min-w-0 flex-1 basis-64 pr-0 [&_nav]:min-w-0 [&_ol]:flex-nowrap [&_li]:min-w-0 [&>div]:shrink-0">
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
      <PageHeader.End className="ml-auto min-w-0 max-w-full">
        {actions}
        <RecordPageMinimize />
      </PageHeader.End>
    </PageHeader>
  );
};
