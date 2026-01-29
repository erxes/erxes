import { ClientPortalUsersHeader } from '@/contacts/client-portal-users/components/ClientPortalUsersHeader';
import { ClientPortalUsersRecordTable } from '@/contacts/client-portal-users/components/ClientPortalUsersRecordTable';
import { ClientPortalUsersFilter } from '@/contacts/client-portal-users/components/ClientPortalUsersFilter';
import { PageContainer, PageSubHeader } from 'erxes-ui';
import { ContactsDetailSheet } from '@/contacts/components/ContactsDetail';
import { CPUserDetailView } from '@/contacts/client-portal-users/components/CPUserDetailView';

export const ClientPortalUsersIndexPage = () => {
  return (
    <PageContainer>
      <ClientPortalUsersHeader />
      <PageSubHeader>
        <ClientPortalUsersFilter />
      </PageSubHeader>
      <ClientPortalUsersRecordTable />
      <ContactsDetailSheet queryKey="cpUserId" title="Client Portal User">
        <CPUserDetailView />
      </ContactsDetailSheet>
    </PageContainer>
  );
};
