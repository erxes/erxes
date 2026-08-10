import { IconBuilding } from '@tabler/icons-react';
import { useMemo } from 'react';
import { createVendorsColumns } from './VendorsColumns';
import { useVendors } from '~/modules/insurance/hooks';
import { GenericRecordTable } from '../shared';
import { useTranslation } from 'react-i18next';

export const VendorsRecordTable = () => {
  const { t } = useTranslation('insurance');
  const { vendors, loading } = useVendors();
  const columns = useMemo(
    () =>
      createVendorsColumns({
        vendor: t('vendor'),
        products: t('products'),
        productsOffered: t('products-offered'),
        offeredProducts: t('offered-products'),
        createdAt: t('created-at'),
      }),
    [t],
  );

  return (
    <GenericRecordTable
      columns={columns}
      data={vendors || []}
      loading={loading}
      sessionKey="vendors-cursor"
      tableId="insurance_vendors_record_table"
      stickyColumns={['more', 'checkbox', 'name']}
      emptyState={{
        icon: <IconBuilding size={64} />,
        title: t('no-vendors-yet'),
        description: t('no-vendors-description'),
      }}
    />
  );
};
