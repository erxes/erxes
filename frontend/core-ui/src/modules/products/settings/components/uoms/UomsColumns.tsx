import { IconHash, IconLabel } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  Badge,
} from 'erxes-ui';
import { IUom } from 'ui-modules';
import { uomMoreColumn } from './UomMoreColumn';

export const uomsColumns: ColumnDef<IUom>[] = [
  uomMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IUom>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconLabel} label="Name" />,
    cell: ({ cell }: { cell: any }) => {
      return (
        <RecordTableInlineCell>
          <Badge variant="secondary">
            <TextOverflowTooltip value={cell.getValue() as string} />
          </Badge>
        </RecordTableInlineCell>
      );
    },
    size: 250,
  },
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead icon={IconHash} label="Code" />,
    cell: ({ cell }: { cell: any }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 200,
  },
  {
    id: 'productCount',
    accessorKey: 'productCount',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label="Product Count" />
    ),
    cell: ({ cell }: { cell: any }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={String(cell.getValue() || 0)} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
];
