import { IconFileX } from '@tabler/icons-react';
import { contractsColumns } from './ContractsColumns';
import { useContracts } from '~/modules/insurance/hooks';
import { GenericRecordTable } from '../shared';

export const ContractsRecordTable = () => {
  const { contracts, loading } = useContracts();

  return (
    <GenericRecordTable
      columns={contractsColumns}
      data={contracts || []}
      loading={loading}
      sessionKey="contracts-cursor"
      stickyColumns={['more', 'checkbox', 'contractNumber']}
      emptyState={{
        icon: <IconFileX size={64} />,
        title: 'No contracts yet',
        description: 'Get started by creating your first insurance contract.',
      }}
    />
  );
};
