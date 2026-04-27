import { ClientPortalHeader } from '@/client-portal/components/ClientPortalHeader';
import { ClientPortalRecordTable } from '@/client-portal/components/ClientPortalRecordTable';

export const ClientPortalView = () => {
  return (
    <>
      <ClientPortalHeader />
      <ClientPortalRecordTable />
    </>
  );
};
