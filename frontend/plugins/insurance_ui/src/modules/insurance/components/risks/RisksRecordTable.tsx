import { RecordTable } from 'erxes-ui';
import { IconAlertTriangle } from '@tabler/icons-react';
import { risksColumns } from './RisksColumns';
import { useRiskTypes } from '~/modules/insurance/hooks';

const RISKS_CURSOR_SESSION_KEY = 'risks-cursor';

export const RisksRecordTable = () => {
  const { riskTypes, loading } = useRiskTypes();

  return (
    <RecordTable.Provider
      columns={risksColumns}
      data={riskTypes || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={false}
        hasNextPage={false}
        dataLength={riskTypes?.length}
        sessionKey={RISKS_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            {loading && <RecordTable.RowSkeleton rows={40} />}
            <RecordTable.RowList />
          </RecordTable.Body>
        </RecordTable>
        {!loading && riskTypes?.length === 0 && (
          <div className="h-full w-full px-8 flex justify-center">
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="mb-6">
                <IconAlertTriangle
                  size={64}
                  className="text-muted-foreground mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">No risk types yet</h3>
                <p className="text-muted-foreground max-w-md">
                  Define risk types that can be covered by insurance products.
                </p>
              </div>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
