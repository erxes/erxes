import { useTranslation } from 'react-i18next';
import { Button, useConfirm, useToast, RecordTable } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useRemoveCompanies } from '@/contacts/companies/hooks/useRemoveCompanies';

export const CompaniesDelete = ({ companyIds }: { companyIds: string[] }) => {
  const { confirm } = useConfirm();
  const { removeCompanies } = useRemoveCompanies();
  const { toast } = useToast();
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const { table } = RecordTable.useRecordTable();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: t('confirm-delete-selected', { count: companyIds.length }),
        }).then(() => {
          removeCompanies({
            variables: {
              companyIds,
            },
            onError: (e: ApolloError) => {
              toast({
                title: t('error-title'),
                description: e.message,
                variant: 'destructive',
              });
            },
            onCompleted: () => {
              table.setRowSelection({});
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
    </Button>
  );
};
