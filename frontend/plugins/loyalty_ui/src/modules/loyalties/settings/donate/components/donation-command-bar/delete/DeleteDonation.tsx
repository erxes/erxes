import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useDeleteDonation } from '../../../hooks/useDeleteDonation';

export const DeleteDonation = ({ donationIds }: { donationIds: string[] }) => {
  const { confirm } = useConfirm();
  const { removeDonation } = useDeleteDonation();
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${donationIds.length} selected donation(s)?`,
        }).then(() => {
          removeDonation({
            variables: { _ids: donationIds },
          })
            .then(() => {
              toast({
                title: `${donationIds.length} donation(s) deleted successfully`,
                variant: 'success',
              });
            })
            .catch((e: ApolloError) => {
              toast({
                title: 'Error',
                description: e.message,
                variant: 'destructive',
              });
            });
        })
      }
    >
      <IconTrash />
      Delete
    </Button>
  );
};
