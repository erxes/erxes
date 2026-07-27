import { IconHash, IconCircle, IconCircleCheck } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
  useConfirm,
  Button,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IBundleCondition } from './types';
import { bundleConditionNameColumn } from './BundleConditionNameColumn';
import { bundleConditionMoreColumn } from './BundleConditionMoreColumn';
import { useBundleConditionDefault } from '@/products/settings/hooks/useBundleConditionDefault';

const DefaultIconCell = ({ row }: { row: any }) => {
  const { t } = useTranslation('product');
  const { confirm } = useConfirm();
  const { bundleConditionDefault, loading } = useBundleConditionDefault();
  const bundleCondition = row.original as IBundleCondition;

  const handleDefaultClick = () => {
    confirm({
      message: `This action will make the BundleCondition "${bundleCondition.name}" default. Are you sure?`,
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
        title={bundleCondition.isDefault ? t('default', 'Default') : t('make-it-default', 'Make it default')}
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
  t: (key: string) => string,
): ColumnDef<IBundleCondition>[] => [
  bundleConditionMoreColumn,
  bundleConditionNameColumn,
  RecordTable.checkboxColumn as ColumnDef<IBundleCondition>,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead icon={IconHash} label={t('code', 'Code')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={(cell.getValue() as string) || '-'} />
      </RecordTableInlineCell>
    ),
    size: 200,
  },
  {
    id: 'default',
    header: () => <RecordTable.InlineHead label={t('default', 'Default')} />,
    cell: DefaultIconCell,
    size: 100,
  },
];
