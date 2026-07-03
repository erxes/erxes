import { IconCircleCheck, IconCode, IconHash } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import type { TFunction } from 'i18next';

import { MSDynamicCheckProduct } from '../types/msDynamicCheckProduct';

export const msDynamicCheckProductColumns = (t: TFunction): ColumnDef<MSDynamicCheckProduct>[] => [
  RecordTable.checkboxColumn as ColumnDef<MSDynamicCheckProduct>,
  {
    id: 'code',
    accessorKey: 'displayCode',
    header: () => <RecordTable.InlineHead label={t('code')} icon={IconCode} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue<string>()} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'name',
    accessorKey: 'displayName',
    header: () => <RecordTable.InlineHead label={t('name')} icon={IconHash} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue<string>()} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'barcodes',
    accessorKey: 'displayBarcodes',
    header: () => <RecordTable.InlineHead label={t('bar-codes')} icon={IconHash} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue<string>()} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'unitPrice',
    accessorKey: 'displayUnitPrice',
    header: () => <RecordTable.InlineHead label={t('unit-price')} icon={IconHash} />,
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
    header: () => <RecordTable.InlineHead label={t('status')} icon={IconCircleCheck} />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {row.original.isSynced ? (
          <Badge variant="success">{t('synced')}</Badge>
        ) : (
          <Badge variant="warning">{t('pending')}</Badge>
        )}
      </RecordTableInlineCell>
    ),
  },
];
