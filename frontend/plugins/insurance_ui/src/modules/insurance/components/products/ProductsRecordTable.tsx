import { useMemo } from 'react';
import { IconPackage } from '@tabler/icons-react';
import { createProductsColumns } from './ProductsColumns';
import { useInsuranceProducts } from '~/modules/insurance/hooks';
import { InsuranceProduct } from '~/modules/insurance/types';
import { GenericRecordTable } from '../shared';

interface ProductsRecordTableProps {
  onEdit: (product: InsuranceProduct) => void;
  onDelete: (product: InsuranceProduct) => void;
}

export const ProductsRecordTable = ({
  onEdit,
  onDelete,
}: ProductsRecordTableProps) => {
  const { insuranceProducts, loading } = useInsuranceProducts();

  const columns = useMemo(
    () => createProductsColumns(onEdit, onDelete),
    [onEdit, onDelete],
  );

  return (
    <GenericRecordTable
      columns={columns}
      data={insuranceProducts || []}
      loading={loading}
      sessionKey="products-cursor"
      stickyColumns={['more', 'checkbox', 'name']}
      emptyState={{
        icon: <IconPackage size={64} />,
        title: 'No insurance products yet',
        description: 'Get started by creating your first insurance product.',
      }}
    />
  );
};
