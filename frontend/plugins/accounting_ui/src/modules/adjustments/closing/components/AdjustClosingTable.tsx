import { IconAdjustmentsOff } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';
import { AddAdjustClosing } from '@/adjustments/closing/components/AddAdjustClosing';
import { useAdjustClosing } from '@/adjustments/closing/hooks/useAdjustClosing';
import { adjustClosingTableColumns } from '@/adjustments/closing/components/AdjustClosingColumns';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsAdjustClosingLeadSessionKey } from '@/adjustments/closing/hooks/useAdjustClosingSessionKey';
import { AdjustClosingCommandBar } from '@/adjustments/closing/components/adjust-closing-command-bar/AdjustClosingCommandBar';

export const AdjustClosingTable = () => {
  const { adjustClosing, loading, error, handleFetchMore, pageInfo } =
    useAdjustClosing();

  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  const { sessionKey } = useIsAdjustClosingLeadSessionKey();

  const { t } = useTranslation('accounting');

  const columns = useMemo(() => adjustClosingTableColumns(t), [t]);

  const isEmpty = !loading && !adjustClosing?.length;

  return (
    <RecordTable.Provider
      columns={columns}
      data={adjustClosing || []}
      stickyColumns={['more', 'checkbox', 'avatar']}
      className="relative m-3"
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
      {isEmpty && (
        <AccountingEmptyState
          overlay
          error={error}
          icon={IconAdjustmentsOff}
          description={t('empty-list-description')}
          action={<AddAdjustClosing />}
        />
      )}
    </RecordTable.Provider>
  );
};
