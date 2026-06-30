import { IconTrash } from '@tabler/icons-react';
import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  useConfirm,
} from 'erxes-ui';
import { Can } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { useBundleRulesRemove } from '@/products/settings/hooks/useBundleRulesRemove';

export const BundleRuleCommandBar = () => {
  const { t } = useTranslation('product');
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { removeBundleRules } = useBundleRulesRemove();
  const confirmOptions = { confirmationValue: 'delete' };

  const handleDelete = () => {
    const selectedIds = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original._id);

    confirm({
      message: t('confirm-delete-bundle-rules', {
        defaultValue:
          'Are you sure you want to delete the {{count}} selected bundle rule(s)?',
        count: selectedIds.length,
      }),
      options: confirmOptions,
    }).then(() => {
      removeBundleRules({
        variables: { _ids: selectedIds },
        onCompleted: () => {
          table.resetRowSelection();
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
        <Can action="bundleRulesManage">
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
