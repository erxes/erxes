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
  Button,
} from 'erxes-ui';

import { ICovers } from '../types/posCover';
import { coverMoreColumn } from './CoversMoreColumns';

export const coverColumns: ColumnDef<ICovers>[] = [
  coverMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<ICovers>,
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
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'pos',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconPhone} label="Pos" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'user.email',
    accessorKey: 'createdBy',
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
      return <RecordTableInlineCell></RecordTableInlineCell>;
    },
  },
];
