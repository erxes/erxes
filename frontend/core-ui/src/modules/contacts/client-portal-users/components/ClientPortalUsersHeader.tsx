import { useTranslation } from 'react-i18next';
import { PageHeader, createFavoriteBreadcrumb } from 'ui-modules';
import { ContactsBreadcrumb } from '@/contacts/components/ContactsBreadcrumb';
import { CPUserAddSheet } from '@/contacts/client-portal-users/components/CPUserAddSheet';

export const ClientPortalUsersHeader = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'clientPortalUser' });
  const favoriteBreadcrumb = createFavoriteBreadcrumb(t('client-portal-users'));

  return (
    <PageHeader>
      <PageHeader.Start>
        <ContactsBreadcrumb />
        <PageHeader.FavoriteToggleButton
          breadcrumb={favoriteBreadcrumb}
          icon="IconUser"
        />
      </PageHeader.Start>
      <PageHeader.End>
        <CPUserAddSheet />
      </PageHeader.End>
    </PageHeader>
  );
};
