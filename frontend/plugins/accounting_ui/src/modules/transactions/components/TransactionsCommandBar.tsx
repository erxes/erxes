import { IconTrash } from '@tabler/icons-react';
import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  useConfirm,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useTrRecordsRemove } from '../hooks/useTrRecordsRemove';

export const TransactionsCommandbar = () => {
  const { t } = useTranslation('accounting');
  const { table } = RecordTable.useRecordTable();
  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {table.getFilteredSelectedRowModel().rows.length} {t('selected')}
        </CommandBar.Value>
        <Separator.Inline />
        <TransactionsDelete />
      </CommandBar.Bar>
    </CommandBar>
  );
};

export const TransactionsDelete = () => {
  const { t } = useTranslation('accounting');
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { removeTrRecords, loading } = useTrRecordsRemove();

  const handleDelete = () =>
    confirm({
      message: t('are-you-sure-delete-tr-records'),
      options: {
        okLabel: t('delete'),
        cancelLabel: t('cancel'),
      },
    }).then(() => {
      const selectedRows = table.getFilteredSelectedRowModel().rows;

      // Delete each transaction record by parentId
      selectedRows.forEach((row) => {
        if (row.original.parentId) {
          removeTrRecords(row.original.parentId);
        }
      });

      // Clear selection after deletion
      table.setRowSelection({});
    });

  return (
    <Button variant="secondary" disabled={loading} onClick={handleDelete}>
      <IconTrash />
      {t('delete')}
    </Button>
  );
};
