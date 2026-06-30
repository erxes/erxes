import { IconHash, IconLabel } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
} from 'erxes-ui';
import { IUom } from 'ui-modules';
import { uomNameColumn } from './UomNameColumn';
import { uomMoreColumn } from './UomMoreColumn';

export const uomsColumns = (
  t: (key: string) => string,
): ColumnDef<IUom>[] => [
  uomNameColumn,
  RecordTable.checkboxColumn as ColumnDef<IUom>,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead icon={IconHash} label={t('code')} />,
    cell: ({ cell }: { cell: any }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
    size: 200,
  },
  {
    id: 'productCount',
    accessorKey: 'productCount',
    header: () => <RecordTable.InlineHead icon={IconLabel} label={t('product-count')} />,
    cell: ({ cell }: { cell: any }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(cell.getValue() || 0)} />
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  uomMoreColumn,
];
