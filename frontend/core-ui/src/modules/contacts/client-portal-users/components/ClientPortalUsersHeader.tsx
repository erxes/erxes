import { PageHeader } from 'ui-modules';
import { ContactsBreadcrumb } from '@/contacts/components/ContactsBreadcrumb';

export const ClientPortalUsersHeader = () => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <ContactsBreadcrumb />
        <PageHeader.FavoriteToggleButton />
      </PageHeader.Start>
    </PageHeader>
  );
};
