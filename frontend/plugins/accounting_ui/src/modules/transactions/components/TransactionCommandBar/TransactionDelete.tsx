import { useTransactionsBulkRemove } from '../../hooks/useTransactionsBulkRemove';
import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ITransaction } from '../../types/Transaction';

export const TransactionDelete = ({
  transactions,
  rows,
}: {
  transactions: ITransaction[];
  rows: Row<unknown>[];
}) => {
  const { t } = useTranslation('accounting');
  const { confirm } = useConfirm();
  const { removeTransactions } = useTransactionsBulkRemove();

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: t('are-you-sure-delete-selected-transactions', {
            count: transactions.length,
          }),
        }).then(async () => {
          if (await removeTransactions(transactions)) {
            rows.forEach((row) => {
              row.toggleSelected(false);
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
