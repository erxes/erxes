import type { ReactNode } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { IconAdjustmentsOff } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';

export const AdjustRateTable = <TRow,>({
  columns,
  rows,
  loading,
  error,
  hasNextPage,
  onFetchMore,
  addAction,
}: {
  columns: ColumnDef<TRow>[];
  rows: TRow[];
  loading: boolean;
  error?: Pick<Error, 'message'>;
  hasNextPage?: boolean;
  onFetchMore: () => void;
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
            {!loading && hasNextPage && (
              <RecordTable.RowSkeleton rows={4} handleInView={onFetchMore} />
            )}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
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
