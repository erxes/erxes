import { IconUsers } from '@tabler/icons-react';
import { customersColumns } from './CustomersColumns';
import { useCustomers } from '~/modules/insurance/hooks';
import { GenericRecordTable } from '../shared';
import { useTranslation } from 'react-i18next';

export const CustomersRecordTable = () => {
  const { t } = useTranslation('insurance');
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
        title: t('no-customers-yet'),
        description: t('no-customers-description'),
      }}
    />
  );
};
