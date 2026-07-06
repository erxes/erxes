import { PageHeader, createFavoriteBreadcrumb } from 'ui-modules';
import { ContactsBreadcrumb } from '@/contacts/components/ContactsBreadcrumb';
import { CPUserAddSheet } from '@/contacts/client-portal-users/components/CPUserAddSheet';
import { useTranslation } from 'react-i18next';

export const ClientPortalUsersHeader = () => {
  const { t } = useTranslation('contact');
  const favoriteBreadcrumb = createFavoriteBreadcrumb('Client Portal Users');

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
