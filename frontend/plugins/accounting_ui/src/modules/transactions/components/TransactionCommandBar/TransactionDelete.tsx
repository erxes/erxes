import { useTransactionsBulkRemove } from '../../hooks/useTransactionsBulkRemove';
import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, useConfirm, useToast } from 'erxes-ui';

export const TransactionDelete = ({
  transactions,
  rows,
}: {
  transactions: any[];
  rows: Row<any>[];
}) => {
  const { confirm } = useConfirm();
  const { removeTransactions } = useTransactionsBulkRemove();

  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${transactions.length} selected Transaction?`,
        }).then(async () => {
          try {
            await removeTransactions(transactions);
            rows.forEach((row) => {
              row.toggleSelected(false);
            });
            toast({
              title: 'Success',
              variant: 'success',
              description: 'Transaction deleted successfully',
            });
          } catch (e: any) {
            toast({
              title: 'Error',
              description: e.message,
              variant: 'destructive',
            });
          }
        })
      }
    >
      <IconTrash />
      Delete
    </Button>
  );
};
