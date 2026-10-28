import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { useTranslation } from 'react-i18next';
import {
  RecordTable,
  Combobox,
  Popover,
  Command,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { IBundleRule } from '@/products/settings/components/productsConfig/bundleRule/types';
import { useBundleRulesRemove } from '@/products/settings/hooks/useBundleRulesRemove';
import { BundleRuleForm } from '@/products/settings/components/productsConfig/bundleRule/BundleRuleForm';
import { Can } from 'ui-modules';

export const BundleRuleMoreColumn = (
  props: CellContext<IBundleRule, unknown>,
) => {
  const bundleRule = props.row.original;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { confirm } = useConfirm();
  const { t } = useTranslation('product', { keyPrefix: 'bundle-rules' });
  const { toast } = useToast();
  const { removeBundleRules, loading } = useBundleRulesRemove();
  const confirmOptions = { confirmationValue: 'delete' };

  const handleEdit = () => {
    setIsEditOpen(true);
  };

  const handleDelete = () => {
    confirm({
      message: t('confirm-delete', { name: bundleRule.name }),
      options: confirmOptions,
    }).then(() => {
      removeBundleRules({
        variables: { _ids: [bundleRule._id] },
        onError: (e) => {
          toast({
            title: t('error'),
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
        <Can action="bundleRulesManage">
          <Popover.Trigger asChild>
            <RecordTable.MoreButton className="w-full h-full" />
          </Popover.Trigger>
        </Can>
        <Combobox.Content>
          <Command shouldFilter={false}>
            <Command.List>
              <Command.Item value="edit" onSelect={handleEdit}>
                <IconEdit className="w-4 h-4" />
                {t('edit')}
              </Command.Item>
              <Command.Item
                value="delete"
                onSelect={handleDelete}
                disabled={loading}
              >
                <IconTrash className="w-4 h-4" />
                {t('delete')}
              </Command.Item>
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>

      <CoreModulePanel
        name={`products/settings/productsConfig/bundleRule/BundleRuleMoreColumn/${bundleRule._id}`}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        modal
      >
        <CoreModulePanel.View className="p-0 sm:max-w-lg">
          <BundleRuleForm
            bundleRule={bundleRule}
            onOpenChange={setIsEditOpen}
          />
        </CoreModulePanel.View>
      </CoreModulePanel>
    </>
  );
};

export const bundleRuleMoreColumn: ColumnDef<IBundleRule> = {
  id: 'more',
  cell: BundleRuleMoreColumn,
  size: 33,
};
