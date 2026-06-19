import {
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import { ColumnDef } from '@tanstack/react-table';
import { IconCalendar } from '@tabler/icons-react';

/**
 * Shared column definition for relative date fields (createdAt / updatedAt)
 * used across the CMS record tables.
 */
export const createDateColumn = <T,>({
  id,
  label,
  icon = IconCalendar,
  size,
}: {
  id: string;
  label: string;
  icon?: typeof IconCalendar;
  size?: number;
}): ColumnDef<T> => ({
  id,
  header: () => <RecordTable.InlineHead icon={icon} label={label} />,
  accessorKey: id,
  ...(size !== undefined ? { size } : {}),
  cell: ({ cell }) => (
    <RelativeDateDisplay value={cell.getValue() as string} asChild>
      <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
        <RelativeDateDisplay.Value value={cell.getValue() as string} />
      </RecordTableInlineCell>
    </RelativeDateDisplay>
  ),
});
