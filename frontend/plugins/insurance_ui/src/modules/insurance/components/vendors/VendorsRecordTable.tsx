import { IconBuilding } from '@tabler/icons-react';
import { vendorsColumns } from './VendorsColumns';
import { useVendors } from '~/modules/insurance/hooks';
import { GenericRecordTable } from '../shared';
import { useTranslation } from 'react-i18next';

export const VendorsRecordTable = () => {
  const { t } = useTranslation('insurance');
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
        title: t('no-vendors-yet'),
        description: t('no-vendors-description'),
      }}
    />
  );
};
