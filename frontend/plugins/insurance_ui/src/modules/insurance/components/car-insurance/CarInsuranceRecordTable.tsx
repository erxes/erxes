import { RecordTable } from 'erxes-ui';
import { IconFileX } from '@tabler/icons-react';
import { carInsuranceColumns } from './CarInsuranceColumns';
import { useContracts } from '~/modules/insurance/hooks';

const CAR_INSURANCE_CURSOR_SESSION_KEY = 'car-insurance-cursor';

export const CarInsuranceRecordTable = () => {
  const { contracts, loading } = useContracts();

  return (
    <RecordTable.Provider
      columns={carInsuranceColumns}
      data={contracts || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'contractNumber']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={false}
        hasNextPage={false}
        dataLength={contracts?.length}
        sessionKey={CAR_INSURANCE_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            {loading && <RecordTable.RowSkeleton rows={40} />}
            <RecordTable.RowList />
          </RecordTable.Body>
        </RecordTable>
        {!loading && contracts?.length === 0 && (
          <div className="h-full w-full px-8 flex justify-center">
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="mb-6">
                <IconFileX
                  size={64}
                  className="text-muted-foreground mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">
                  No contracts yet
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Get started by creating your first car insurance contract.
                </p>
              </div>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
