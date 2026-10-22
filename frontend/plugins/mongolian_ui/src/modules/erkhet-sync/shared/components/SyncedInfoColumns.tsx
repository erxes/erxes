import { IconClock } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { TextOverflowTooltip, RecordTableInlineCell } from 'erxes-ui';
import { HeaderCell } from '../../components/HeaderCell';

export const syncedInfoColumn = <
  T extends {
    syncedDate?: string | null;
    syncedBillNumber?: string | null;
    syncedCustomer?: string | null;
  },
>(
  accessorKey: 'syncedDate' | 'syncedBillNumber' | 'syncedCustomer',
  label: string,
): ColumnDef<T> => ({
  id: accessorKey,
  accessorKey,
  header: () => <HeaderCell icon={IconClock} label={label} />,
  cell: ({ cell }) => {
    const value = cell.getValue() as string | null | undefined;

    return (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={value ?? ''} />
      </RecordTableInlineCell>
    );
  },
});
