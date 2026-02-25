import { IconBuilding } from '@tabler/icons-react';
import { vendorsColumns } from './VendorsColumns';
import { useVendors } from '~/modules/insurance/hooks';
import { GenericRecordTable } from '../shared';

export const VendorsRecordTable = () => {
  const { vendors, loading } = useVendors();

  return (
    <GenericRecordTable
      columns={vendorsColumns}
      data={vendors || []}
      loading={loading}
      sessionKey="vendors-cursor"
      stickyColumns={['more', 'checkbox', 'name']}
      emptyState={{
        icon: <IconBuilding size={64} />,
        title: 'No vendors yet',
        description: 'Get started by creating your first insurance vendor.',
      }}
    />
  );
};
