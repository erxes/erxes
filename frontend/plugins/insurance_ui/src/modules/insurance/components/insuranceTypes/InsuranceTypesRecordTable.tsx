import { IconShieldCheck } from '@tabler/icons-react';
import { insuranceTypesColumns } from './InsuranceTypesColumns';
import { useInsuranceTypes } from '~/modules/insurance/hooks';
import { InsuranceType } from '~/modules/insurance/types';
import { useMemo } from 'react';
import { GenericRecordTable } from '../shared';
import { InsuranceTypesMoreColumn } from './InsuranceTypesMoreColumn';

interface InsuranceTypesRecordTableProps {
  onEdit?: (insuranceType: InsuranceType) => void;
  onDeleted?: () => void;
}

export const InsuranceTypesRecordTable = ({
  onEdit,
  onDeleted,
}: InsuranceTypesRecordTableProps) => {
  const { insuranceTypes, loading, refetch } = useInsuranceTypes();

  const columns = useMemo(() => {
    return insuranceTypesColumns.map((col) => {
      if (col.id === 'more') {
        return {
          ...col,
          cell: ({ cell }: { cell: any }) => (
            <InsuranceTypesMoreColumn
              cell={cell}
              onEdit={onEdit}
              onDeleted={() => {
                refetch();
                onDeleted?.();
              }}
            />
          ),
        };
      }
      return col;
    });
  }, [onEdit, onDeleted, refetch]);

  return (
    <GenericRecordTable
      columns={columns}
      data={insuranceTypes || []}
      loading={loading}
      sessionKey="insurance-types-cursor"
      stickyColumns={['more', 'checkbox', 'name']}
      emptyState={{
        icon: <IconShieldCheck size={64} />,
        title: 'No insurance types yet',
        description:
          'Create insurance types to categorize your insurance products.',
      }}
    />
  );
};
