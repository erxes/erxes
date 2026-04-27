import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useDeleteLottery } from '../../../hooks/useDeleteLottery';

export const DeleteLottery = ({ lotteryIds }: { lotteryIds: string[] }) => {
  const { confirm } = useConfirm();
  const { removeLottery } = useDeleteLottery();
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete ${lotteryIds.length} selected lottery(s)?`,
        }).then(() => {
          removeLottery({
            variables: { _ids: lotteryIds },
          })
            .then(() => {
              toast({
                title: `${lotteryIds.length} lottery(s) deleted successfully`,
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
