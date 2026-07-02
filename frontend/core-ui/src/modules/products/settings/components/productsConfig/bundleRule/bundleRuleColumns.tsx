import { IconHash } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import { IBundleRule } from './types';
import { bundleRuleNameColumn } from './BundleRuleNameColumn';
import { bundleRuleMoreColumn } from './BundleRuleMoreColumn';

export const bundleRuleColumns = (
  t: (key: string) => string,
): ColumnDef<IBundleRule>[] => [
  bundleRuleMoreColumn,
  bundleRuleNameColumn,
  RecordTable.checkboxColumn as ColumnDef<IBundleRule>,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead icon={IconHash} label={t('code', 'Code')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={(cell.getValue() as string) || ''} />
      </RecordTableInlineCell>
    ),
    size: 200,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: () => <RecordTable.InlineHead label={t('description', 'Description')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={(cell.getValue() as string) || ''} />
      </RecordTableInlineCell>
    ),
    size: 300,
  },
];
