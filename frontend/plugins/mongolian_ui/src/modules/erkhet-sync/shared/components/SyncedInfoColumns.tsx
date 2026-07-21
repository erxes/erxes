import { IconClock } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  TextOverflowTooltip,
  RecordTableInlineCell,
  RecordTable,
} from 'erxes-ui';

export const syncedInfoColumn = <
  T extends {
    syncedDate?: string;
    syncedBillNumber?: string;
    syncedCustomer?: string;
  },
>(
  accessorKey: 'syncedDate' | 'syncedBillNumber' | 'syncedCustomer',
  label: string,
): ColumnDef<T> => ({
  id: accessorKey,
  accessorKey,
  header: () => <RecordTable.InlineHead icon={IconClock} label={label} />,
  cell: ({ cell }) => {
    const value = cell.getValue() as string | undefined;

    return (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={value ?? ''} />
      </RecordTableInlineCell>
    );
  },
});
