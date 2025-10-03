import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useRemoveCompanies } from '@/contacts/companies/hooks/useRemoveCompanies';
import { Row } from '@tanstack/table-core';
import { TCompany } from '@/contacts/types/companyType';

export const CompaniesDelete = ({
  companyIds,
  rows,
}: {
  companyIds: string[];
  rows: Row<TCompany>[];
}) => {
  const { confirm } = useConfirm();
  const { removeCompanies } = useRemoveCompanies();
  const { toast } = useToast();
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
              rows.forEach((row) => {
                row.toggleSelected(false);
              });
              toast({
                title: 'Success',
                variant: 'default',
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
