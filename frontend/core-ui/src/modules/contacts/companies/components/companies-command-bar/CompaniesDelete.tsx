import { Button, useConfirm, useToast, RecordTable } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useRemoveCompanies } from '@/contacts/companies/hooks/useRemoveCompanies';
import { useTranslation } from 'react-i18next';

export const CompaniesDelete = ({ companyIds }: { companyIds: string[] }) => {
  const { t } = useTranslation('contact');
  const { confirm } = useConfirm();
  const { removeCompanies } = useRemoveCompanies();
  const { toast } = useToast();
  const { table } = RecordTable.useRecordTable();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: t('company.delete-confirm', 'Are you sure you want to delete the {{count}} selected companies?', { count: companyIds.length }),
        }).then(() => {
          removeCompanies({
            variables: {
              companyIds,
            },
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
                description: t('company.delete-success', 'Companies deleted successfully'),
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
