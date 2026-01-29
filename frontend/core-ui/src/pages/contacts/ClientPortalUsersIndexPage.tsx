import { ClientPortalUsersHeader } from '@/contacts/client-portal-users/components/ClientPortalUsersHeader';
import { ClientPortalUsersRecordTable } from '@/contacts/client-portal-users/components/ClientPortalUsersRecordTable';
import { ClientPortalUsersFilter } from '@/contacts/client-portal-users/components/ClientPortalUsersFilter';
import { CPUserDetailSheet } from '@/contacts/client-portal-users/components/CPUserDetailSheet';
import { PageContainer, PageSubHeader } from 'erxes-ui';

export const ClientPortalUsersIndexPage = () => {
  return (
    <PageContainer>
      <ClientPortalUsersHeader />
      <PageSubHeader>
        <ClientPortalUsersFilter />
      </PageSubHeader>
      <ClientPortalUsersRecordTable />
      <CPUserDetailSheet />
    </PageContainer>
  );
};
