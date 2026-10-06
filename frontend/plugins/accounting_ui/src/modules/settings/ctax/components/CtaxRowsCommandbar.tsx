import { useTranslation } from 'react-i18next';
import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  toast,
  useConfirm,
} from 'erxes-ui';
import { useCtaxRowsRemove } from '../hooks/useCtaxRowsRemove';
import { IconTrash } from '@tabler/icons-react';

export const CtaxRowsCommandbar = () => {
  const { t } = useTranslation('accounting');

  const { table } = RecordTable.useRecordTable();
  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {table.getFilteredSelectedRowModel().rows.length} {t('selected-4')}
        </CommandBar.Value>
        <Separator.Inline />
        <CtaxRowsDelete />
      </CommandBar.Bar>
    </CommandBar>
  );
};

export const CtaxRowsDelete = () => {
  const { t } = useTranslation('accounting');

  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { removeCtaxRows, loading } = useCtaxRowsRemove();

  const handleDelete = () => {
    confirm({
      message: t('are-you-sure-you-want-to-delete-the-selected-city-tax-rules'),
      options: {
        okLabel: t('delete'),
        cancelLabel: t('cancel'),
      },
    }).then(() => {
      const ctaxRowIds = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original._id);

      removeCtaxRows({
        variables: { ctaxRowIds },
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
            description: t('city-tax-rules-deleted-successfully'),
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
