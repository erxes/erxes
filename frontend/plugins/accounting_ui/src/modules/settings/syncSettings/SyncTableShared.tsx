import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  RecordTableInlineCell,
  Skeleton,
  Table,
  useQueryState,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useMemo } from 'react';
import { ACCOUNTING_SETTINGS_CODES } from '../constants/settingsRoutes';
import { accountingConfigDetailAtom } from '../states/accountingConfigState';
import { IConfig } from '../types/Config';
import { useAccountingConfigs } from '../hooks/useAccountingConfigs';
import { EditAccountingConfig } from './EditAccountingConfig';

export const SyncInitialSkeleton = ({
  rows = 20,
  columns,
}: {
  rows?: number;
  columns: ColumnDef<IConfig>[];
}) => {
  const rowKeys = useMemo(
    () => Array.from({ length: rows }, () => crypto.randomUUID()),
    [rows],
  );
  return (
    <>
      {rowKeys.map((rowKey) => (
        <Table.Row key={rowKey} className="h-cell">
          {columns.map((col, colIndex) => (
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

export const SyncLinkCell = ({
  row,
  renderVal,
}: {
  row: any;
  renderVal: string;
}) => {
  const [, setOpen] = useQueryState('configId', { defaultValue: '' });
  const setAccountDetail = useSetAtom(accountingConfigDetailAtom);
  return (
    <RecordTableInlineCell
      onClick={() => {
        setAccountDetail(row.original.value);
        setOpen(row.original._id);
      }}
    >
      {renderVal}
    </RecordTableInlineCell>
  );
};

export const syncBaseColumns: ColumnDef<IConfig>[] = [
  RecordTable.checkboxColumn as ColumnDef<IConfig>,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead label="Код" />,
    cell: ({ cell }) => (
      <SyncLinkCell row={cell.row} renderVal={cell.row.original?.code} />
    ),
    size: 250,
  },
  {
    id: 'title',
    accessorKey: 'title',
    header: () => <RecordTable.InlineHead label="Гарчиг" />,
    cell: ({ cell }) => (
      <SyncLinkCell
        row={cell.row}
        renderVal={cell.row.original?.value?.title}
      />
    ),
  },
];

export const SyncConfigTable = ({
  code,
  columns,
  stickyColumns = ['more', 'checkbox', 'code'],
}: {
  code: ACCOUNTING_SETTINGS_CODES;
  columns: ColumnDef<IConfig>[];
  stickyColumns?: string[];
}) => {
  const { configs, loading } = useAccountingConfigs({ variables: { code } });
  const isInitialLoading = loading && !configs?.length;

  return (
    <RecordTable.Provider
      columns={columns}
      data={isInitialLoading ? [] : configs || []}
      stickyColumns={stickyColumns}
    >
      <RecordTable>
        <RecordTable.Header />
        <RecordTable.Body>
          <RecordTable.RowList />
          {isInitialLoading && (
            <SyncInitialSkeleton rows={20} columns={columns} />
          )}
        </RecordTable.Body>
      </RecordTable>
      <EditAccountingConfig code={code} />
    </RecordTable.Provider>
  );
};
