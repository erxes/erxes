import { IconTrash } from '@tabler/icons-react';
import { Button, CommandBar, RecordTable, useConfirm, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can, IField } from 'ui-modules';
import { useFieldsBulkRemove } from '../../hooks/useFieldsBulkRemove';

export const PropertiesCommandBar = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeFields, loading } = useFieldsBulkRemove();
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleBulkDelete = () => {
    confirm({
      message: t(
        'confirm-delete-fields',
        'Are you sure you want to delete the {{count}} selected field(s)?',
        { count: selectedRows.length },
      ),
    }).then(async () => {
      try {
        const ids = selectedRows.map((row) => (row.original as IField)._id);
        await removeFields(ids);
        table.setRowSelection({});
        toast({
          title: 'Success',
          variant: 'success',
          description: t(
            'fields-deleted',
            'Fields deleted successfully',
          ),
        });
      } catch (e: any) {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('n-selected', '{{count}} selected', {
            count: selectedRows.length,
          })}
        </CommandBar.Value>
        <Can action="fieldsManage">
          <Button
            variant="secondary"
            className="text-destructive"
            disabled={loading}
            onClick={handleBulkDelete}
          >
            <IconTrash />
            {t('delete', 'Delete')}
          </Button>
        </Can>
      </CommandBar.Bar>
    </CommandBar>
  );
};
