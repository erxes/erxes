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
import { useTranslation } from 'react-i18next';

import {
  InventoryCategoryAction,
  InventoryCategoryItem,
} from '../types/inventoryCategory';

/* Action-oos shaltgaalj erxes/dynamic category code-iig avna */
const getCategoryCode = (
  category: InventoryCategoryItem,
  action: InventoryCategoryAction,
) => (action === 'DELETE' ? category.code : category.Code) || '';

/* Action-oos shaltgaalj erxes/dynamic category name-iig avna */
const getCategoryName = (
  category: InventoryCategoryItem,
  action: InventoryCategoryAction,
) => (action === 'DELETE' ? category.name : category.Name) || '-';

/* Action-oos shaltgaalj erxes/dynamic category description-iig avna */
const getCategoryDescription = (
  category: InventoryCategoryItem,
  action: InventoryCategoryAction,
) => (action === 'DELETE' ? category.description : category.Description) || '-';

/* Sync action deer haruulah badge variant-iig songono */
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
  RecordTable.checkboxColumn as ColumnDef<InventoryCategoryItem>,
  {
    id: 'code',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconHash} label={t('code')} />;
    },
    cell: ({ row }) => (
      <RecordTableInlineCell className="font-mono text-xs">
        <TextOverflowTooltip value={getCategoryCode(row.original, action)} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'name',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconCategory} label={t('name')} />;
    },
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={getCategoryName(row.original, action)} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'description',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconFileDescription} label={t('description')} />;
    },
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
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconStatusChange} label={t('status')} />;
    },
    cell: ({ row }) => {
      const { t } = useTranslation('mongolian');
      return (
        <RecordTableInlineCell>
          {row.original.syncStatus === true ? (
            <Badge variant={getStatusBadgeVariant(action)}>{t('synced')}</Badge>
          ) : (
            <Badge variant="warning">{t('pending')}</Badge>
          )}
        </RecordTableInlineCell>
      );
    },
  },
];
