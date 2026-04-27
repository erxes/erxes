import { Button, useConfirm, useToast, RecordTable } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useRemoveCompanies } from '@/contacts/companies/hooks/useRemoveCompanies';

export const CompaniesDelete = ({ companyIds }: { companyIds: string[] }) => {
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
          message: `Are you sure you want to delete the ${companyIds.length} selected companies?`,
        }).then(() => {
          removeCompanies({
            variables: {
              companyIds,
            },
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
                description: 'Companies deleted successfully',
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
