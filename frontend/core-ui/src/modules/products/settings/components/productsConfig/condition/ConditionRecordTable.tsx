import { IconListDetails } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useProductConditions } from '@/products/settings/hooks/useProductConditions';
import { conditionMoreColumn } from './ConditionMoreColumn';
import { ConditionSheet } from './ConditionSheet';
import { IProductCondition } from './types';

const columns: ColumnDef<IProductCondition>[] = [
  conditionMoreColumn,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead label="Code" />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={row.original.code} />
      </RecordTableInlineCell>
    ),
    size: 160,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label="Name" />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={row.original.name} />
      </RecordTableInlineCell>
    ),
    size: 220,
  },
  {
    id: 'productCount',
    accessorKey: 'productCount',
    header: () => <RecordTable.InlineHead label="Products" />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {(row.original.productCount ?? 0).toLocaleString()}
      </RecordTableInlineCell>
    ),
    size: 120,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: () => <RecordTable.InlineHead label="Description" />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={row.original.description || '-'} />
      </RecordTableInlineCell>
    ),
    size: 300,
  },
];

export const ConditionRecordTable = () => {
  const { t } = useTranslation('product');
  const { conditions, loading } = useProductConditions();

  if (!loading && !conditions.length) {
    return (
      <div className="flex flex-col gap-2 justify-center items-center p-6 w-full h-full text-center">
        <IconListDetails
          size={64}
          stroke={1.5}
          className="text-muted-foreground"
        />
        <h2 className="text-lg font-semibold text-muted-foreground">
          {t('no-conditions', 'No conditions yet')}
        </h2>
        <p className="mb-4 text-md text-muted-foreground">
          {t(
            'conditions-hint',
            'The states a product can be sold in, e.g. Dented or Display unit.',
          )}
        </p>
        <ConditionSheet />
      </div>
    );
  }

  return (
    <RecordTable.Provider columns={columns} data={conditions} className="h-full">
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            {loading && <RecordTable.RowSkeleton rows={6} />}
            <RecordTable.RowList />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
    </RecordTable.Provider>
  );
};
