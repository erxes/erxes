import { IconUsers } from '@tabler/icons-react';
import { customersColumns } from './CustomersColumns';
import { useCustomers } from '~/modules/insurance/hooks';
import { GenericRecordTable } from '../shared';

export const CustomersRecordTable = () => {
  const { customers, loading } = useCustomers();

  return (
    <GenericRecordTable
      columns={customersColumns}
      data={customers || []}
      loading={loading}
      sessionKey="customers-cursor"
      stickyColumns={['more', 'checkbox', 'fullName']}
      emptyState={{
        icon: <IconUsers size={64} />,
        title: 'No customers yet',
        description: 'Get started by creating your first customer',
      }}
    />
  );
};
