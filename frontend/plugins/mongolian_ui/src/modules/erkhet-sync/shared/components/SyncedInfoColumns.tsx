import { IconClock } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { TextOverflowTooltip, RecordTableInlineCell } from 'erxes-ui';
import { HeaderCell } from '../../components/HeaderCell';

export const syncedInfoColumn = <T extends { syncedDate?: string; syncedBillNumber?: string; syncedCustomer?: string }>(
  accessorKey: 'syncedDate' | 'syncedBillNumber' | 'syncedCustomer',
  label: string,
): ColumnDef<T> => ({
  id: accessorKey,
  accessorKey,
  header: () => <HeaderCell icon={IconClock} label={label} />,
  cell: ({ cell }) => {
    const value = cell.getValue() as string | undefined;

    return (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={value ?? ''} />
      </RecordTableInlineCell>
    );
  },
});
