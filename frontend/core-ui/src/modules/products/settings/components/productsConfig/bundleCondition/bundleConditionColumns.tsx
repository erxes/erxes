import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { IconHash, IconCircle, IconCircleCheck } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
  useConfirm,
  Button,
} from 'erxes-ui';
import { IBundleCondition } from './types';
import { bundleConditionNameColumn } from './BundleConditionNameColumn';
import { bundleConditionMoreColumn } from './BundleConditionMoreColumn';
import { useBundleConditionDefault } from '@/products/settings/hooks/useBundleConditionDefault';

const DefaultIconCell = ({ row }: { row: any }) => {
  const { confirm } = useConfirm();
  const { t } = useTranslation('product', { keyPrefix: 'bundle-conditions' });
  const { bundleConditionDefault, loading } = useBundleConditionDefault();
  const bundleCondition = row.original as IBundleCondition;

  const handleDefaultClick = () => {
    confirm({
      message: t('confirm-default', { name: bundleCondition.name }),
    }).then(() => {
      bundleConditionDefault({
        variables: { _id: bundleCondition._id },
      });
    });
  };

  return (
    <RecordTableInlineCell>
      <Button
        onClick={handleDefaultClick}
        disabled={loading}
        variant="ghost"
        title={bundleCondition.isDefault ? t('default') : t('make-default')}
        className="text-success"
      >
        {bundleCondition.isDefault ? (
          <IconCircleCheck size={20} />
        ) : (
          <IconCircle size={20} />
        )}
      </Button>
    </RecordTableInlineCell>
  );
};

export const bundleConditionColumns = (
  t: TFunction,
): ColumnDef<IBundleCondition>[] => [
  bundleConditionMoreColumn,
  bundleConditionNameColumn,
  RecordTable.checkboxColumn as ColumnDef<IBundleCondition>,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead icon={IconHash} label={t('code')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={(cell.getValue() as string) || '-'} />
      </RecordTableInlineCell>
    ),
    size: 200,
  },
  {
    id: 'default',
    header: () => <RecordTable.InlineHead label={t('default')} />,
    cell: DefaultIconCell,
    size: 100,
  },
];
