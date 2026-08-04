import { IconTrash } from '@tabler/icons-react';
import { Button, RecordTable, useConfirm, useToast } from 'erxes-ui';
import { useRemoveCustomers } from '@/contacts/customers/hooks/useRemoveCustomers';
import { ApolloError } from '@apollo/client';

export const CustomersDelete = ({ customerIds }: { customerIds: string[] }) => {
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
          message: `Are you sure you want to delete the ${customerIds.length} selected customers?`,
        }).then(() => {
          removeCustomers(customerIds, {
            onError: (e: ApolloError) => {
              toast({
                title: 'Error',
                description: e.message,
                variant: 'destructive',
              });
            },
            onCompleted: () => {
              table.setRowSelection({});
              toast({
                title: 'Success',
                variant: 'success',
                description: 'Customers deleted successfully',
              });
            },
          });
        })
      }
    >
      <IconTrash />
      Delete
    </Button>
  );
};
