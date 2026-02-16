import { IconFileX } from '@tabler/icons-react';
import { carInsuranceColumns } from './CarInsuranceColumns';
import { useContracts } from '~/modules/insurance/hooks';
import { GenericRecordTable } from '../shared';

export const CarInsuranceRecordTable = () => {
  const { contracts, loading } = useContracts();

  return (
    <GenericRecordTable
      columns={carInsuranceColumns}
      data={contracts || []}
      loading={loading}
      sessionKey="car-insurance-cursor"
      stickyColumns={['more', 'checkbox', 'contractNumber']}
      emptyState={{
        icon: <IconFileX size={64} />,
        title: 'No contracts yet',
        description:
          'Get started by creating your first car insurance contract.',
      }}
    />
  );
};
