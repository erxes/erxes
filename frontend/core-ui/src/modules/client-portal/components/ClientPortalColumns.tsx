import { ColumnDef } from '@tanstack/table-core';
import { IClientPortal } from '@/client-portal/types/clientPortal';
import {
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import { IconAlignLeft } from '@tabler/icons-react';

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
    id: 'description',
    accessorKey: 'description',
    header: () => (
      <RecordTable.InlineHead icon={IconAlignLeft} label="Description" />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.row.original.description} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'domain',
    accessorKey: 'domain',
    header: () => (
      <RecordTable.InlineHead icon={IconAlignLeft} label="Domain" />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.row.original.domain} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
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
    id: 'token',
    accessorKey: 'token',
    header: () => <RecordTable.InlineHead icon={IconAlignLeft} label="Token" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.row.original.token} />
        </RecordTableInlineCell>
      );
    },
  },
];
