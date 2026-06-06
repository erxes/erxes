import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { DELETE_LOTTERY_MUTATION } from '@/loyalties/lotteries/graphql/mutations/mutations';
import { ILottery } from '@/loyalties/lotteries/types/lottery';

export const LotteryRemove = ({
  lotteryIds,
  rows,
}: {
  lotteryIds: string[];
  rows: Row<ILottery>[];
}) => {
  const { confirm } = useConfirm();
  const { toast } = useToast();

  const [deleteLottery] = useMutation(DELETE_LOTTERY_MUTATION, {
    refetchQueries: ['LotteriesMain'], // matches query name in LOTTERIES_QUERY
  });

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete ${lotteryIds.length} selected lottery(s)?`,
        }).then(async () => {
          try {
            await deleteLottery({ variables: { _ids: lotteryIds } });
            rows.forEach((row) => row.toggleSelected(false));
            toast({
              title: 'Success',
              variant: 'success',
              description: `${lotteryIds.length} lottery(s) deleted successfully`,
            });
          } catch (e: unknown) {
            toast({
              title: 'Error',
              description: e instanceof Error ? e.message : String(e),
              variant: 'destructive',
            });
          }
        })
      }
    >
      <IconTrash />
      Delete
    </Button>
  );
};
