import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  toast,
  useConfirm,
} from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useDeleteScore } from '../hooks/useLoyaltyScoreRowsRemove';
export const LoyaltyScoreRowsCommandbar = () => {
  const { t } = useTranslation('loyalty');
  const { table } = RecordTable.useRecordTable();
  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {t('selected-count', '{{count}} selected', { count: table.getFilteredSelectedRowModel().rows.length })}
        </CommandBar.Value>
        <Separator.Inline />
        <LoyaltyScoreRowsDelete />
      </CommandBar.Bar>
    </CommandBar>
  );
};

export const LoyaltyScoreRowsDelete = () => {
  const { t } = useTranslation('loyalty');
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { removeScore, loading } = useDeleteScore();

  const handleDelete = () => {
    confirm({
      message: t('delete-score-rows-confirm', 'Are you sure you want to delete these loyalty score rows?'),
      options: {
        okLabel: t('delete', 'Delete'),
        cancelLabel: t('cancel', 'Cancel'),
      },
    }).then(() => {
      const loyaltyScoreRowIds = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original._id);

      removeScore({
        variables: { _ids: loyaltyScoreRowIds },
        onError: (error: Error) => {
          toast({
            title: t('error', 'Error'),
            description: error.message,
            variant: 'destructive',
          });
        },
        onCompleted: () => {
          table.setRowSelection({});
          toast({
            title: t('success', 'Success'),
            description: t('score-rows-deleted', 'Loyalty score rows deleted successfully'),
          });
        },
      });
    });
  };

  return (
    <Button variant="secondary" disabled={loading} onClick={handleDelete}>
      <IconTrash />
      {t('delete', 'Delete')}
    </Button>
  );
};
