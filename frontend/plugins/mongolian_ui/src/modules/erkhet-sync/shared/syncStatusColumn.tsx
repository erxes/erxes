import { IconArrowsExchange } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { RecordTable, RecordTableInlineCell } from 'erxes-ui';

export type SyncStatus = 'create' | 'update' | 'delete' | 'synced';

export const SYNC_STATUS_STYLES: Record<SyncStatus, string> = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
  synced: 'bg-gray-100 text-gray-600',
};

export function makeSyncStatusColumn<T>(): ColumnDef<T> {
  return {
    id: 'status',
    accessorKey: 'status',
    size: 90,
    header: () => <RecordTable.InlineHead label="Status" icon={IconArrowsExchange} />,
    cell: ({ cell }) => {
      const status = cell.getValue() as SyncStatus;
      return (
        <RecordTableInlineCell>
          <span
            className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium capitalize ${SYNC_STATUS_STYLES[status] ?? ''}`}
          >
            {status}
          </span>
        </RecordTableInlineCell>
      );
    },
  };
}
