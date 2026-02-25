import {
  RecordTable,
  Combobox,
  Popover,
  Command,
  useConfirm,
  useToast,
  Sheet,
} from 'erxes-ui';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { IBundleRule } from './types';
import { useBundleRulesRemove } from '@/products/settings/hooks/useBundleRulesRemove';
import { BundleRuleForm } from './BundleRuleForm';

export const BundleRuleMoreColumn = (
  props: CellContext<IBundleRule, unknown>,
) => {
  const bundleRule = props.row.original;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeBundleRules, loading } = useBundleRulesRemove();
  const confirmOptions = { confirmationValue: 'delete' };

  const handleEdit = () => {
    setIsEditOpen(true);
  };

  const handleDelete = () => {
    confirm({
      message: `Are you sure you want to delete "${bundleRule.name}"?`,
      options: confirmOptions,
    }).then(() => {
      removeBundleRules({
        variables: { _ids: [bundleRule._id] },
        onError: (e) => {
          toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
          });
        },
      });
    });
  };

  return (
    <>
      <Popover>
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
        <Combobox.Content>
          <Command shouldFilter={false}>
            <Command.List>
              <Command.Item value="edit" onSelect={handleEdit}>
                <IconEdit className="w-4 h-4" />
                Edit
              </Command.Item>
              <Command.Item
                value="delete"
                onSelect={handleDelete}
                disabled={loading}
              >
                <IconTrash className="w-4 h-4" />
                Delete
              </Command.Item>
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>

      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen} modal>
        <Sheet.View className="p-0 sm:max-w-lg">
          <BundleRuleForm
            bundleRule={bundleRule}
            onOpenChange={setIsEditOpen}
          />
        </Sheet.View>
      </Sheet>
    </>
  );
};

export const bundleRuleMoreColumn: ColumnDef<IBundleRule> = {
  id: 'more',
  cell: BundleRuleMoreColumn,
  size: 33,
};
