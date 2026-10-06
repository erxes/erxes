import { useTranslation } from 'react-i18next';
import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  toast,
  useConfirm,
} from 'erxes-ui';
import { useVatRowsRemove } from '../hooks/useVatRowsRemove';
import { IconTrash } from '@tabler/icons-react';

export const VatRowsCommandbar = () => {
  const { t } = useTranslation('accounting');

  const { table } = RecordTable.useRecordTable();
  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {table.getFilteredSelectedRowModel().rows.length} {t('selected-4')}
        </CommandBar.Value>
        <Separator.Inline />
        <VatRowsDelete />
      </CommandBar.Bar>
    </CommandBar>
  );
};

export const VatRowsDelete = () => {
  const { t } = useTranslation('accounting');

  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { removeVatRows, loading } = useVatRowsRemove();

  const handleDelete = () => {
    confirm({
      message: t('are-you-sure-you-want-to-delete-the-selected-vat-rules'),
      options: {
        okLabel: t('delete'),
        cancelLabel: t('cancel'),
      },
    }).then(() => {
      const vatRowIds = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original._id);

      removeVatRows({
        variables: { vatRowIds },
        onError: (error: Error) => {
          toast({
            title: t('error'),
            description: error.message,
            variant: 'destructive',
          });
        },
        onCompleted: () => {
          table.setRowSelection({});
          toast({
            title: t('success'),
            description: t('vat-rules-deleted-successfully'),
          });
        },
      });
    });
  };

  return (
    <Button variant="secondary" disabled={loading} onClick={handleDelete}>
      <IconTrash />
      {t('delete')}
    </Button>
  );
};
