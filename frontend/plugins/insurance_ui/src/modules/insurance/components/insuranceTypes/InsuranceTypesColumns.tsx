import { IconShieldCheck, IconCalendar, IconList } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  Badge,
} from 'erxes-ui';
import { InsuranceType } from '~/modules/insurance/types';
import { InsuranceTypesMoreColumn } from './InsuranceTypesMoreColumn';
import { formatDate } from '../shared';

export const insuranceTypesColumns: ColumnDef<InsuranceType>[] = [
  {
    id: 'more',
    accessorKey: 'more',
    header: '',
    cell: ({ cell }) => <InsuranceTypesMoreColumn cell={cell} />,
    size: 26,
  },
  RecordTable.checkboxColumn as ColumnDef<InsuranceType>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => (
      <RecordTable.InlineHead icon={IconShieldCheck} label="Name" />
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
    id: 'attributes',
    accessorKey: 'attributes',
    header: () => <RecordTable.InlineHead icon={IconList} label="Attributes" />,
    cell: ({ cell }) => {
      const attributes = cell.getValue() as any[];
      return (
        <RecordTableInlineCell>
          <Badge variant="secondary">
            {attributes?.length || 0} attributes
          </Badge>
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
        <RecordTableInlineCell>
          <TextOverflowTooltip value={formatDate(cell.getValue() as Date)} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'updatedAt',
    accessorKey: 'updatedAt',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendar} label="Updated At" />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={formatDate(cell.getValue() as Date)} />
        </RecordTableInlineCell>
      );
    },
  },
];
