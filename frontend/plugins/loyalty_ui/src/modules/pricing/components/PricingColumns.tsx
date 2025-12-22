import {
  IconAlignLeft,
  IconCalendarPlus,
  IconHash,
  IconTag,
  IconUser,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import { IPricing } from '@/pricing/types';
import { MembersInline } from 'ui-modules';
import { Link } from 'react-router-dom';

export const pricingColumns: ColumnDef<IPricing>[] = [
  RecordTable.checkboxColumn as ColumnDef<IPricing>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label="name" icon={IconAlignLeft} />,
    cell: ({ cell, row }) => {
      const pricingId = row.original._id;
      return (
        <RecordTableInlineCell>
          <Link
            to={`/settings/pricing/${pricingId}`}
            className="cursor-pointer hover:underline"
          >
            <Badge variant="secondary">{cell.getValue() as string}</Badge>
          </Link>
        </RecordTableInlineCell>
      );
    },
    size: 250,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead label="status" icon={IconHash} />,
    cell: ({ cell }) => {
      const status = cell.getValue() as string;
      return (
        <RecordTableInlineCell>
          <Badge
            variant={status === 'active' ? 'success' : 'secondary'}
            className="uppercase"
          >
            {status}
          </Badge>
        </RecordTableInlineCell>
      );
    },
    size: 350,
  },
  {
    id: 'isPriority',
    accessorKey: 'isPriority',
    header: () => <RecordTable.InlineHead label="isPriority" icon={IconTag} />,
    cell: ({ cell }) => {
      const value = cell.getValue() as boolean;
      return (
        <RecordTableInlineCell>
          <span className="font-mono text-xs">{String(value)}</span>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'applyType',
    accessorKey: 'applyType',
    header: () => <RecordTable.InlineHead label="apply type" icon={IconTag} />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <Badge variant="secondary" className="lowercase">
            {cell.getValue() as string}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdBy',
    accessorKey: 'createdBy',
    header: () => <RecordTable.InlineHead label="created by" icon={IconUser} />,
    cell: ({ cell }) => {
      const createdById = cell.getValue() as string;
      return (
        <RecordTableInlineCell>
          <MembersInline
            memberIds={createdById ? [createdById] : []}
            size="sm"
            allowUnassigned
          />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead label="date created" icon={IconCalendarPlus} />
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
  {
    id: 'updatedAt',
    accessorKey: 'updatedAt',
    header: () => (
      <RecordTable.InlineHead label="last updated at" icon={IconCalendarPlus} />
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
