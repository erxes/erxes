import { useTranslation } from 'react-i18next';
import { IconTrash } from '@tabler/icons-react';
import { Command, RecordTable, useConfirm, useToast } from 'erxes-ui';
import { useRemoveCustomers } from '@/contacts/customers/hooks/useRemoveCustomers';
import { ApolloError } from '@apollo/client';

export const CustomersDelete = ({
  customerIds,
  onCompleted,
}: {
  customerIds: string[];
  onCompleted: () => void;
}) => {
  const { confirm } = useConfirm();
  const { removeCustomers } = useRemoveCustomers();
  const { table } = RecordTable.useRecordTable();
  const { toast } = useToast();
  const { t } = useTranslation('contact', { keyPrefix: 'customer' });
  return (
    <Command.Item
      className="text-destructive"
      onSelect={() =>
        confirm({
          message: t('confirm-delete-selected', { count: customerIds.length }),
        }).then(() => {
          removeCustomers(customerIds, {
            onError: (e: ApolloError) => {
              toast({
                title: t('error-title'),
                description: e.message,
                variant: 'destructive',
              });
            },
            onCompleted: () => {
              table.setRowSelection({});
              onCompleted();
              toast({
                title: t('success-title'),
                variant: 'success',
                description: t('deleted-success'),
              });
            },
          });
        })
      }
    >
      <IconTrash />
      {t('action-delete')}
    </Command.Item>
  );
};
