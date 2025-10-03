import {
  IconBuilding,
  IconChartBar,
  IconLabel,
  IconMobiledata,
  IconPhone,
  IconClock,
  IconUser,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  Badge,
} from 'erxes-ui';
import { posMoreColumn } from './posMoreColumn';
import { IPos } from '../types/pos';

export const posColumns: ColumnDef<IPos>[] = [
  posMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IPos>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconLabel} label="Name" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'isOnline',
    accessorKey: 'isOnline',
    header: () => (
      <RecordTable.InlineHead icon={IconMobiledata} label="Status" />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue() as boolean;
      return (
        <RecordTableInlineCell>
          <Badge variant={value ? 'success' : 'secondary'}>
            {value ? 'Online' : 'Offline'}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'onServer',
    accessorKey: 'onServer',
    header: () => (
      <RecordTable.InlineHead icon={IconPhone} label="Server Status" />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue() as boolean;
      return (
        <RecordTableInlineCell>
          <Badge variant="default">{value ? 'On Server' : 'Local Only'}</Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'branchTitle',
    accessorKey: 'branchTitle',
    header: () => <RecordTable.InlineHead icon={IconBuilding} label="Branch" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'departmentTitle',
    accessorKey: 'departmentTitle',
    header: () => (
      <RecordTable.InlineHead icon={IconChartBar} label="Department" />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead icon={IconClock} label="Created at" />
    ),
    cell: ({ cell }) => {
      const rawDate = cell.getValue() as string;
      const formattedDate = new Date(rawDate).toLocaleString();

      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={formattedDate} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdBy',
    accessorKey: 'createdBy',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Created by" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
];
