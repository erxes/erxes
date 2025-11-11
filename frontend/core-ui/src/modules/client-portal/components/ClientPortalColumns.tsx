import { ColumnDef } from '@tanstack/table-core';
import { IClientPortal } from '@/client-portal/types/clientPortal';
import {
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  TextOverflowTooltip,
} from 'erxes-ui';
import {
  IconAlignLeft,
  IconBrowser,
  IconCalendar,
  IconKey,
} from '@tabler/icons-react';

export const clientPortalColumns: ColumnDef<IClientPortal>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconAlignLeft} label="Name" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.row.original.name} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'domain',
    accessorKey: 'domain',
    header: () => <RecordTable.InlineHead icon={IconBrowser} label="Domain" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.row.original.domain} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'token',
    accessorKey: 'token',
    header: () => <RecordTable.InlineHead icon={IconKey} label="Token" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.row.original.token} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendar} label="Created At" />
    ),
    cell: ({ cell }) => {
      return (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell>
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
  },
];
