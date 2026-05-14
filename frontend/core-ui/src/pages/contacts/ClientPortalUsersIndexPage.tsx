import { ClientPortalUsersHeader } from '@/contacts/client-portal-users/components/ClientPortalUsersHeader';
import { ClientPortalUsersRecordTable } from '@/contacts/client-portal-users/components/ClientPortalUsersRecordTable';
import { ClientPortalUsersFilter } from '@/contacts/client-portal-users/components/ClientPortalUsersFilter';
import { CPUserDetail } from '@/contacts/client-portal-users/cp-user-detail/components/CPUserDetail';
import { PageContainer, PageSubHeader } from 'erxes-ui';

export const ClientPortalUsersIndexPage = () => {
  return (
    <PageContainer>
      <ClientPortalUsersHeader />
      <PageSubHeader>
        <ClientPortalUsersFilter />
      </PageSubHeader>
      <ClientPortalUsersRecordTable />
      <CPUserDetail />
    </PageContainer>
  );
};
