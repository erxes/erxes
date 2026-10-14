import { useTranslation } from 'react-i18next';
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
import { useProductRulesRemove } from '@/products/settings/hooks/useProductRulesRemove';

export const ProductRuleCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { t } = useTranslation('product', { keyPrefix: 'product-rules' });
  const { toast } = useToast();
  const { removeProductRules } = useProductRulesRemove();
  const confirmOptions = { confirmationValue: 'delete' };

  const handleDelete = () => {
    const selectedIds = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original._id);

    confirm({
      message: t('confirm-delete-selected', { count: selectedIds.length }),
      options: confirmOptions,
    }).then(() => {
      removeProductRules({
        variables: { _ids: selectedIds },
        onCompleted: () => {
          table.resetRowSelection();
        },
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
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('selected', {
            count: table.getFilteredSelectedRowModel().rows.length,
          })}
        </CommandBar.Value>
        <Separator.Inline />
        <Can action="productRulesManage">
          <Button
            variant="secondary"
            className="text-destructive"
            onClick={handleDelete}
          >
            <IconTrash />
            {t('delete')}
          </Button>
        </Can>
      </CommandBar.Bar>
    </CommandBar>
  );
};
