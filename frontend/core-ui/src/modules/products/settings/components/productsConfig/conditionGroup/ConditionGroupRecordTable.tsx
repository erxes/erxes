import { IconListDetails } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useProductConditionGroups } from '@/products/settings/hooks/useProductConditionGroups';
import { conditionGroupMoreColumn } from './ConditionGroupMoreColumn';
import { ConditionGroupSheet } from './ConditionGroupSheet';
import { IProductConditionGroup } from './types';

const columns: ColumnDef<IProductConditionGroup>[] = [
  conditionGroupMoreColumn,
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
    id: 'conditions',
    accessorKey: 'conditions',
    header: () => <RecordTable.InlineHead label="Conditions" />,
    cell: ({ row }) => (
      <RecordTableInlineCell className="gap-1">
        {row.original.conditions.map((condition) => (
          <Badge key={condition._id} variant="secondary">
            {condition.name}
          </Badge>
        ))}
      </RecordTableInlineCell>
    ),
    size: 420,
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

export const ConditionGroupRecordTable = () => {
  const { t } = useTranslation('product');
  const { conditionGroups, loading } = useProductConditionGroups();

  if (!loading && !conditionGroups.length) {
    return (
      <div className="flex flex-col gap-2 justify-center items-center p-6 w-full h-full text-center">
        <IconListDetails
          size={64}
          stroke={1.5}
          className="text-muted-foreground"
        />
        <h2 className="text-lg font-semibold text-muted-foreground">
          {t('no-condition-groups', 'No condition groups yet')}
        </h2>
        <p className="mb-4 text-md text-muted-foreground">
          {t(
            'condition-groups-hint',
            'Group the states a product can be sold in, e.g. Dented or Display unit.',
          )}
        </p>
        <ConditionGroupSheet />
      </div>
    );
  }

  return (
    <RecordTable.Provider
      columns={columns}
      data={conditionGroups}
      className="h-full"
    >
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
