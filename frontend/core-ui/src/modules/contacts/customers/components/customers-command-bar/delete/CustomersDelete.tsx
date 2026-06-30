import { IconTrash } from '@tabler/icons-react';
import { Button, RecordTable, useConfirm, useToast } from 'erxes-ui';
import { useRemoveCustomers } from '@/contacts/customers/hooks/useRemoveCustomers';
import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';

export const CustomersDelete = ({ customerIds }: { customerIds: string[] }) => {
  const { t } = useTranslation('contact');
  const { confirm } = useConfirm();
  const { removeCustomers } = useRemoveCustomers();
  const { table } = RecordTable.useRecordTable();
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: t('customer.delete-confirm', { count: customerIds.length }, 'Are you sure you want to delete the {{count}} selected customers?'),
        }).then(() => {
          removeCustomers(customerIds, {
            onError: (e: ApolloError) => {
              toast({
                title: t('error', 'Error'),
                description: e.message,
                variant: 'destructive',
              });
            },
            onCompleted: () => {
              table.setRowSelection({});
              toast({
                title: t('success', 'Success'),
                variant: 'success',
                description: t('customer.delete-success', 'Customers deleted successfully'),
              });
            },
          });
        })
      }
    >
      <IconTrash />
      {t('delete', 'Delete')}
    </Button>
  );
};
