import { IconTrash } from '@tabler/icons-react';
import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { Can } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { useProductRulesRemove } from '@/products/settings/hooks/useProductRulesRemove';

export const ProductRuleCommandBar = () => {
  const { t } = useTranslation('product');
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeProductRules } = useProductRulesRemove();
  const confirmOptions = { confirmationValue: 'delete' };

  const handleDelete = () => {
    const selectedIds = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original._id);

    confirm({
      message: t('confirm-delete-product-rules', {
        defaultValue:
          'Are you sure you want to delete the {{count}} selected product rule(s)?',
        count: selectedIds.length,
      }),
      options: confirmOptions,
    }).then(() => {
      removeProductRules({
        variables: { _ids: selectedIds },
        onCompleted: () => {
          table.resetRowSelection();
        },
        onError: (e) => {
          toast({
            title: t('error', 'Error'),
            description: e.message,
            variant: 'destructive',
          });
        },
      });
    });
  };

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('selected', { defaultValue: '{{count}} selected', count: table.getFilteredSelectedRowModel().rows.length })}
        </CommandBar.Value>
        <Separator.Inline />
        <Can action="productRulesManage">
          <Button
            variant="secondary"
            className="text-destructive"
            onClick={handleDelete}
          >
            <IconTrash />
            {t('delete', 'Delete')}
          </Button>
        </Can>
      </CommandBar.Bar>
    </CommandBar>
  );
};
