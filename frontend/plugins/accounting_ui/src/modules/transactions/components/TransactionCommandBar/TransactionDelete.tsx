import { useTransactionsBulkRemove } from '../../hooks/useTransactionsBulkRemove';
import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const TransactionDelete = ({
  transactions,
  rows,
}: {
  transactions: any[];
  rows: Row<any>[];
}) => {
  const { t } = useTranslation('accounting');
  const { confirm } = useConfirm();
  const { removeTransactions } = useTransactionsBulkRemove();

  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: t('are-you-sure-delete-selected-transactions', { count: transactions.length }),
        }).then(async () => {
          try {
            await removeTransactions(transactions);
            rows.forEach((row) => {
              row.toggleSelected(false);
            });
            toast({
              title: t('success'),
              variant: 'success',
              description: t('transaction-deleted-successfully'),
            });
          } catch (e: any) {
            toast({
              title: t('error'),
              description: e.message,
              variant: 'destructive',
            });
          }
        })
      }
    >
      <IconTrash />
      {t('delete')}
    </Button>
  );
};
