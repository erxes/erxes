import { ConnectionSheet } from '@/settings/connections/components/ConnectionSheet';
import { ConnectionsHeader } from '@/settings/connections/components/ConnectionsHeader';
import { ConnectionsRecordTable } from '@/settings/connections/components/ConnectionsRecordTable';

export const ConnectionsSettings = () => (
  <>
    <ConnectionsHeader />
    <ConnectionsRecordTable />
    <ConnectionSheet />
  </>
);
