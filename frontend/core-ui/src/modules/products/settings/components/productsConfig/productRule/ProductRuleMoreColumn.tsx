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
import { IProductRule } from './types';
import { useProductRulesRemove } from '@/products/settings/hooks/useProductRulesRemove';
import { ProductRuleForm } from './ProductRuleForm';

export const ProductRuleMoreColumn = (
  props: CellContext<IProductRule, unknown>,
) => {
  const productRule = props.row.original;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeProductRules, loading } = useProductRulesRemove();

  const handleEdit = () => {
    setIsEditOpen(true);
  };

  const handleDelete = () => {
    confirm({
      message: `Are you sure you want to delete "${productRule.name}"?`,
    }).then(() => {
      removeProductRules({
        variables: { _ids: [productRule._id] },
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
          <ProductRuleForm
            productRule={productRule}
            onOpenChange={setIsEditOpen}
          />
        </Sheet.View>
      </Sheet>
    </>
  );
};

export const productRuleMoreColumn: ColumnDef<IProductRule> = {
  id: 'more',
  cell: ProductRuleMoreColumn,
  size: 33,
};
