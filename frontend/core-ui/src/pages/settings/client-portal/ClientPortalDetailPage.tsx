import { PageContainer } from 'erxes-ui';
import { ClientPortalDetails } from '@/client-portal/components/ClientPortalDetails';
import { ClientPortalDetailHeader } from '@/client-portal/components/ClientPortalDetailHeader';

export function ClientPortalDetailPage() {
  return (
    <PageContainer>
      <ClientPortalDetailHeader />
      <ClientPortalDetails />
    </PageContainer>
  );
}
