import { useTranslation } from 'react-i18next';
import { IconPackageOff } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';
import { AddSafeRemainder } from '@/inventories/safeRemainders/components/SafeRemainderForm';
import { safeRemainderColumns } from '@/inventories/safeRemainders/components/SafeRemainderColumns';
import { ISafeRemainder } from '@/inventories/safeRemainders/types/SafeRemainder';

export const SafeRemainderTable = ({
  handleFetchMore,
  loading,
  error,
  safeRemainders,
  totalCount,
}: {
  handleFetchMore: () => void;
  loading: boolean;
  error?: { message: string };
  safeRemainders?: ISafeRemainder[];
  totalCount?: number;
}) => {
  const { t } = useTranslation('accounting');
  const isFetchingMore = loading && (safeRemainders?.length ?? 0) > 0;
  const isInitialLoading = loading && !isFetchingMore;
  const safeRemaindersCount = safeRemainders?.length ?? 0;
  const totalSafeRemaindersCount = totalCount ?? 0;

  const isEmpty = !loading && !safeRemaindersCount;

  return (
    <RecordTable.Provider
      columns={safeRemainderColumns(t)}
      data={isInitialLoading ? [] : safeRemainders || []}
      stickyColumns={['more']}
      tableId="accounting_safe_remainders_record_table"
      className="relative m-3"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {isInitialLoading && <RecordTable.RowSkeleton rows={20} />}
            {!isInitialLoading &&
              totalSafeRemaindersCount > safeRemaindersCount && (
                <RecordTable.RowSkeleton
                  rows={4}
                  handleInView={handleFetchMore}
                />
              )}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      {isEmpty && (
        <AccountingEmptyState
          overlay
          error={error}
          icon={IconPackageOff}
          description={t('empty-list-description')}
          action={<AddSafeRemainder />}
        />
      )}
    </RecordTable.Provider>
  );
};
