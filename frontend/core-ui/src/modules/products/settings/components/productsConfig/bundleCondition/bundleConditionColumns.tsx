import { IconHash, IconCheck } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
  useConfirm,
} from 'erxes-ui';
import { IBundleCondition } from './types';
import { bundleConditionNameColumn } from './BundleConditionNameColumn';
import { useBundleConditionDefault } from '@/products/settings/hooks/useBundleConditionDefault';

const DefaultIconCell = ({ row }: { row: any }) => {
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
      <button
        onClick={handleDefaultClick}
        disabled={loading}
        className="p-1 rounded transition-colors hover:bg-muted"
        title={bundleCondition.isDefault ? 'Default' : 'Make it default'}
      >
        <IconCheck
          size={20}
          className={
            bundleCondition.isDefault
              ? 'text-green-500'
              : 'text-muted-foreground'
          }
        />
      </button>
    </RecordTableInlineCell>
  );
};

export const bundleConditionColumns: ColumnDef<IBundleCondition>[] = [
  bundleConditionNameColumn,
  RecordTable.checkboxColumn as ColumnDef<IBundleCondition>,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead icon={IconHash} label="Code" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={(cell.getValue() as string) || '-'} />
      </RecordTableInlineCell>
    ),
    size: 200,
  },
  {
    id: 'default',
    header: () => <RecordTable.InlineHead icon={IconCheck} label="Default" />,
    cell: DefaultIconCell,
    size: 100,
  },
];
