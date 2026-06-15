import { IconCircleCheck, IconCode, IconHash } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';

import { MSDynamicCheckProduct } from '../types/msDynamicCheckProduct';

export const msDynamicCheckProductColumns: ColumnDef<MSDynamicCheckProduct>[] =
  [
    RecordTable.checkboxColumn as ColumnDef<MSDynamicCheckProduct>,
    {
      id: 'code',
      accessorKey: 'displayCode',
      header: () => <RecordTable.InlineHead label="Code" icon={IconCode} />,
      cell: ({ cell }) => (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue<string>()} />
        </RecordTableInlineCell>
      ),
    },
    {
      id: 'name',
      accessorKey: 'displayName',
      header: () => <RecordTable.InlineHead label="Name" icon={IconHash} />,
      cell: ({ cell }) => (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue<string>()} />
        </RecordTableInlineCell>
      ),
    },
    {
      id: 'barcodes',
      accessorKey: 'displayBarcodes',
      header: () => (
        <RecordTable.InlineHead label="Bar codes" icon={IconHash} />
      ),
      cell: ({ cell }) => (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue<string>()} />
        </RecordTableInlineCell>
      ),
    },
    {
      id: 'unitPrice',
      accessorKey: 'displayUnitPrice',
      header: () => (
        <RecordTable.InlineHead label="Unit price" icon={IconHash} />
      ),
      cell: ({ cell }) => (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={String(cell.getValue<string | number>())}
          />
        </RecordTableInlineCell>
      ),
    },
    {
      id: 'status',
      accessorKey: 'isSynced',
      header: () => (
        <RecordTable.InlineHead label="Status" icon={IconCircleCheck} />
      ),
      cell: ({ row }) => (
        <RecordTableInlineCell>
          {row.original.isSynced && (
            <span className="text-green-600 font-medium">Synced</span>
          )}
        </RecordTableInlineCell>
      ),
    },
  ];
