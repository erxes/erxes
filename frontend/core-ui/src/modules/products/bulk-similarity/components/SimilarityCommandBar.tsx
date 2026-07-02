import { IconTrash } from '@tabler/icons-react';
import { Button, CommandBar, RecordTable, useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useRemoveSimilarity } from '../hooks/useRemoveSimilarity';

export const SimilarityCommandBar = () => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const { table } = RecordTable.useRecordTable();
  const { remove } = useRemoveSimilarity();
  const { confirm } = useConfirm();

  const selectedIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original._id);

  const handleDelete = () => {
    confirm({
      message: t('confirm-delete', {
        count: selectedIds.length,
        defaultValue:
          'Are you sure you want to delete the {{count}} selected group(s)? Generated products are not deleted.',
      }),
      options: { confirmationValue: 'delete' },
    }).then(async () => {
      await Promise.all(selectedIds.map((id) => remove(id)));
      table.resetRowSelection();
    });
  };

  return (
    <CommandBar open={selectedIds.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('selected', {
            count: selectedIds.length,
            defaultValue: '{{count}} selected',
          })}
        </CommandBar.Value>
        <Button
          variant="secondary"
          className="text-destructive"
          onClick={handleDelete}
        >
          <IconTrash />
          {t('delete', 'Delete')}
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
