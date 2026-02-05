import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useDeleteScore } from '../../../hooks/useLoyaltyScoreRowsRemove';

export const LoyaltyScoreDelete = ({ scoreIds }: { scoreIds: string[] }) => {
  const { confirm } = useConfirm();
  const { removeScore } = useDeleteScore();
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${
            scoreIds.length
          } selected loyalty score campaign${
            scoreIds.length === 1 ? '' : 's'
          }?`,
        }).then(() => {
          removeScore({
            variables: { _ids: scoreIds },
          })
            .then(() => {
              toast({
                title: `${scoreIds.length} loyalty score campaign${
                  scoreIds.length === 1 ? '' : 's'
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
