import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useDeleteLottery } from '../../../hooks/useDeleteLottery';

export const DeleteLottery = ({ lotteryIds }: { lotteryIds: string[] }) => {
  const { t } = useTranslation('loyalty');
  const { confirm } = useConfirm();
  const { removeLottery } = useDeleteLottery();
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: t('delete-lottery-confirm', { count: lotteryIds.length }),
        }).then(() => {
          removeLottery({
            variables: { _ids: lotteryIds },
          })
            .then(() => {
              toast({
                title: t('lotteries-deleted', { count: lotteryIds.length }),
                variant: 'success',
              });
            })
            .catch((e: ApolloError) => {
              toast({
                title: t('error'),
                description: e.message,
                variant: 'destructive',
              });
            });
        })
      }
    >
      <IconTrash />
      {t('delete')}
    </Button>
  );
};
