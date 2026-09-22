import { RecordTable } from 'erxes-ui';
import { useAdjustClosing } from '../hooks/useAdjustClosing';
import { adjustClosingTableColumns } from './AdjustClosingColumns';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsAdjustClosingLeadSessionKey } from '../hooks/useAdjustClosingSessionKey';
import { AdjustClosingCommandBar } from './adjust-closing-command-bar/AdjustClosingCommandBar';

export const AdjustClosingTable = () => {
  const { adjustClosing, loading, handleFetchMore, pageInfo } =
    useAdjustClosing();

  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  const { sessionKey } = useIsAdjustClosingLeadSessionKey();

  const { t } = useTranslation('Adjust', { keyPrefix: 'Closing' });

  const columns = useMemo(() => adjustClosingTableColumns(t), [t]);

  return (
    <RecordTable.Provider
      columns={columns}
      data={adjustClosing || []}
      stickyColumns={['more', 'checkbox', 'avatar']}
      className="m-3"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={adjustClosing?.length}
        sessionKey={sessionKey}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading ? (
              <RecordTable.RowSkeleton rows={32} />
            ) : (
              <RecordTable.RowList />
            )}

            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
      <AdjustClosingCommandBar />
    </RecordTable.Provider>
  );
};
