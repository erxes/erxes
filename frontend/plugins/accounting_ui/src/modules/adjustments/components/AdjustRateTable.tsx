import type { ReactNode } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { IconAdjustmentsOff } from '@tabler/icons-react';
import { Button, RecordTable } from 'erxes-ui';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';

export const AdjustRateTable = <TRow,>({
  columns,
  rows,
  loading,
  error,
  hasNextPage,
  onFetchMore,
  fetchMoreError,
  onRetryFetchMore,
  addAction,
}: {
  columns: ColumnDef<TRow>[];
  rows: TRow[];
  loading: boolean;
  error?: Pick<Error, 'message'>;
  hasNextPage?: boolean;
  onFetchMore: () => void;
  fetchMoreError?: Pick<Error, 'message'>;
  onRetryFetchMore: () => void;
  addAction: ReactNode;
}) => {
  const { t } = useTranslation('accounting');
  const isEmpty = !loading && !rows.length;

  return (
    <RecordTable.Provider
      columns={columns}
      data={rows}
      stickyColumns={[]}
      className="relative m-3"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {loading && <RecordTable.RowSkeleton rows={5} />}
            {!loading && hasNextPage && !fetchMoreError && (
              <RecordTable.RowSkeleton rows={4} handleInView={onFetchMore} />
            )}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      {fetchMoreError && (
        <div className="flex items-center justify-center gap-3 border-t p-3 text-sm text-destructive">
          {t(fetchMoreError.message, { nsSeparator: false })}
          <Button variant="outline" size="sm" onClick={onRetryFetchMore}>
            {t('retry')}
          </Button>
        </div>
      )}
      {isEmpty && (
        <AccountingEmptyState
          overlay
          error={error}
          icon={IconAdjustmentsOff}
          description={t('empty-list-description')}
          action={addAction}
        />
      )}
    </RecordTable.Provider>
  );
};
