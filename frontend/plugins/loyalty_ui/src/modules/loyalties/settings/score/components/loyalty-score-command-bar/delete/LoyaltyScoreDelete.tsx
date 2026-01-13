import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useLoyaltyScoreRowsRemove } from '../../../hooks/useLoyaltyScoreRowsRemove';

export const LoyaltyScoreDelete = ({
  productIds,
}: {
  productIds: string[];
}) => {
  const { confirm } = useConfirm();
  const { removeLoyaltyScoreRows } = useLoyaltyScoreRowsRemove();
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${
            productIds.length
          } selected loyalty score campaign${
            productIds.length === 1 ? '' : 's'
          }?`,
        }).then(() => {
          const deletePromises = productIds.map((id) =>
            removeLoyaltyScoreRows({
              variables: { _id: id },
            }),
          );

          Promise.all(deletePromises)
            .then(() => {
              toast({
                title: `${productIds.length} loyalty score campaign${
                  productIds.length === 1 ? '' : 's'
                } deleted successfully`,
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
