import {
  IconCategory,
  IconFileDescription,
  IconHash,
  IconStatusChange,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';

import { InventoryCategoryMoreColumn } from './InventoryCategoryMoreColumn';
import {
  InventoryCategoryAction,
  InventoryCategoryItem,
} from '../types/inventoryCategory';

const getCategoryCode = (
  category: InventoryCategoryItem,
  action: InventoryCategoryAction,
) => (action === 'DELETE' ? category.code : category.Code) || '';

const getCategoryName = (
  category: InventoryCategoryItem,
  action: InventoryCategoryAction,
) => (action === 'DELETE' ? category.name : category.Name) || '-';

const getCategoryDescription = (
  category: InventoryCategoryItem,
  action: InventoryCategoryAction,
) => (action === 'DELETE' ? category.description : category.Description) || '-';

const getStatusBadgeVariant = (action: InventoryCategoryAction) => {
  if (action === 'DELETE') {
    return 'destructive';
  }

  return action === 'CREATE' ? 'success' : 'info';
};

/* Builds RecordTable columns for the selected MSDynamic category action. */
export const getInventoryCategoryColumns = (
  action: InventoryCategoryAction,
): ColumnDef<InventoryCategoryItem>[] => [
  InventoryCategoryMoreColumn,
  {
    id: 'code',
    header: () => <RecordTable.InlineHead icon={IconHash} label="Code" />,
    cell: ({ row }) => (
      <RecordTableInlineCell className="font-mono text-xs">
        <TextOverflowTooltip value={getCategoryCode(row.original, action)} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'name',
    header: () => <RecordTable.InlineHead icon={IconCategory} label="Name" />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={getCategoryName(row.original, action)} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'description',
    header: () => (
      <RecordTable.InlineHead icon={IconFileDescription} label="Description" />
    ),
    cell: ({ row }) => (
      <RecordTableInlineCell className="text-muted-foreground">
        <TextOverflowTooltip
          value={getCategoryDescription(row.original, action)}
        />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'status',
    header: () => (
      <RecordTable.InlineHead icon={IconStatusChange} label="Status" />
    ),
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {row.original.syncStatus !== false ? (
          <Badge variant={getStatusBadgeVariant(action)}>Synced</Badge>
        ) : (
          <Badge variant="warning">Pending</Badge>
        )}
      </RecordTableInlineCell>
    ),
  },
];
