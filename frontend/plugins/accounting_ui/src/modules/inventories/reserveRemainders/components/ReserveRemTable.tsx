import { useMemo } from 'react';
import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  Skeleton,
  Table,
  useConfirm,
} from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useReserveRems } from '../hooks/useReserveRems';
import { useReserveRemsRemove } from '../hooks/useReserveRemsRemove';
import { reserveRemColumns } from './ReserveRemColumns';

const ReserveRemInitialSkeleton = ({ rows = 20 }: { rows?: number }) => {
  const rowKeys = useMemo(
    () => Array.from({ length: rows }, (_, i) => `skeleton-row-${i}`),
    [rows],
  );
  return (
    <>
      {rowKeys.map((rowKey) => (
        <Table.Row key={rowKey} className="h-cell">
          {reserveRemColumns.map((col, colIndex) => (
            <Table.Cell
              key={`${rowKey}-${col.id ?? colIndex}`}
              className="border-r-0 px-2"
            >
              <Skeleton className="h-4 w-full min-w-4" />
            </Table.Cell>
          ))}
        </Table.Row>
      ))}
    </>
  );
};

export const ReserveRemTable = () => {
  const { reserveRems, loading, totalCount, handleFetchMore } =
    useReserveRems();

  const isFetchingMore = loading && (reserveRems?.length ?? 0) > 0;
  const isInitialLoading = loading && !isFetchingMore;

  return (
    <RecordTable.Provider
      columns={reserveRemColumns}
      data={isInitialLoading ? [] : reserveRems || []}
      stickyColumns={['more', 'checkbox', 'product']}
      className="m-3"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {isInitialLoading && <ReserveRemInitialSkeleton rows={20} />}
            {!isInitialLoading && totalCount > (reserveRems?.length ?? 0) && (
              <RecordTable.RowSkeleton
                rows={4}
                handleInView={handleFetchMore}
              />
            )}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      <ReserveRemCommandbar />
    </RecordTable.Provider>
  );
};

const ReserveRemCommandbar = () => {
  const { t } = useTranslation('accounting');
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { removeReserveRems, loading } = useReserveRemsRemove();
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleDelete = () =>
    confirm({
      message: t('are-you-sure'),
      options: {
        okLabel: t('delete'),
        cancelLabel: t('cancel'),
      },
    }).then(() => {
      removeReserveRems({
        variables: {
          _ids: selectedRows.map((row) => row.original._id),
        },
        onCompleted: () => {
          table.setRowSelection({});
        },
      });
    });

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {selectedRows.length} {t('selected')}
        </CommandBar.Value>
        <Separator.Inline />
        <Button variant="secondary" disabled={loading} onClick={handleDelete}>
          <IconTrash />
          {t('delete')}
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
