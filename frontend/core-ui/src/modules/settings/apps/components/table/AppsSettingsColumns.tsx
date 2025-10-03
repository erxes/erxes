import { IApp } from '@/settings/apps/types';
import { ColumnDef } from '@tanstack/table-core';
import { format } from 'date-fns';
import { RecordTableInlineCell } from 'erxes-ui';

export const appsSettingsColumns: ColumnDef<IApp>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'App Name',
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
  },
  {
    id: 'clientId',
    accessorKey: 'clientId',
    header: 'Client ID',
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
  },
  {
    id: 'clientSecret',
    accessorKey: 'clientSecret',
    header: 'Client Secret',
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {format(new Date(cell.getValue() as string), 'yyyy/MM/dd') ||
          'YYYY/MM/DD'}
      </RecordTableInlineCell>
    ),
  },
];
