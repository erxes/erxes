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
          {t('selected-count', { count: table.getFilteredSelectedRowModel().rows.length })}
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
      message: t('delete-score-rows-confirm'),
      options: {
        okLabel: t('delete'),
        cancelLabel: t('cancel'),
      },
    }).then(() => {
      const loyaltyScoreRowIds = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original._id);

      removeScore({
        variables: { _ids: loyaltyScoreRowIds },
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
            description: t('score-rows-deleted'),
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
