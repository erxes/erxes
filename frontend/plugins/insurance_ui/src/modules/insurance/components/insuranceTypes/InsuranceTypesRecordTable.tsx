import { RecordTable } from 'erxes-ui';
import { IconShieldCheck } from '@tabler/icons-react';
import { insuranceTypesColumns } from './InsuranceTypesColumns';
import { useInsuranceTypes } from '~/modules/insurance/hooks';
import { InsuranceType } from '~/modules/insurance/types';
import { useMemo } from 'react';

const INSURANCE_TYPES_CURSOR_SESSION_KEY = 'insurance-types-cursor';

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
            <InsuranceTypesMoreColumnWrapper
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
    <RecordTable.Provider
      columns={columns}
      data={insuranceTypes || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={false}
        hasNextPage={false}
        dataLength={insuranceTypes?.length}
        sessionKey={INSURANCE_TYPES_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            {loading && <RecordTable.RowSkeleton rows={40} />}
            <RecordTable.RowList />
          </RecordTable.Body>
        </RecordTable>
        {!loading && insuranceTypes?.length === 0 && (
          <div className="h-full w-full px-8 flex justify-center">
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="mb-6">
                <IconShieldCheck
                  size={64}
                  className="text-muted-foreground mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">
                  No insurance types yet
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Create insurance types to categorize your insurance products.
                </p>
              </div>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};

import { InsuranceTypesMoreColumn } from './InsuranceTypesMoreColumn';

const InsuranceTypesMoreColumnWrapper = ({
  cell,
  onEdit,
  onDeleted,
}: {
  cell: any;
  onEdit?: (insuranceType: InsuranceType) => void;
  onDeleted?: () => void;
}) => {
  return (
    <InsuranceTypesMoreColumn cell={cell} onEdit={onEdit} onDeleted={onDeleted} />
  );
};
