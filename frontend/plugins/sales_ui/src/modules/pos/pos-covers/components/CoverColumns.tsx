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

import { ICover } from '../../types/Cover';
import { coverMoreColumn } from './CoversMoreColumns';

export const coverColumns: ColumnDef<ICover>[] = [
  coverMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<ICover>,
  {
    id: 'beginDate',
    accessorKey: 'beginDate',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label="Begin Date" />
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
    id: 'endDate',
    accessorKey: 'endDate',
    header: () => (
      <RecordTable.InlineHead icon={IconMobiledata} label="End Date" />
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
    id: 'pos',
    accessorKey: 'pos',
    header: () => <RecordTable.InlineHead icon={IconPhone} label="Pos" />,
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
    id: 'user',
    accessorKey: 'user',
    header: () => <RecordTable.InlineHead icon={IconBuilding} label="User" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'actions',
    accessorKey: 'actions',
    header: () => (
      <RecordTable.InlineHead icon={IconChartBar} label="Actions" />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
];
