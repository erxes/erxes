import { PageHeader } from 'ui-modules';
import { ContactsBreadcrumb } from '@/contacts/components/ContactsBreadcrumb';
import { CPUserAddSheet } from '@/contacts/client-portal-users/components/CPUserAddSheet';

export const ClientPortalUsersHeader = () => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <ContactsBreadcrumb />
        <PageHeader.FavoriteToggleButton />
      </PageHeader.Start>
      <PageHeader.End>
        <CPUserAddSheet />
      </PageHeader.End>
    </PageHeader>
  );
};
