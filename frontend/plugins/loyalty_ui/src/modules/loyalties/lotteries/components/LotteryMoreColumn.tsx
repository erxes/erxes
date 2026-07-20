import { Cell } from '@tanstack/react-table';
import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { RecordTable, useConfirm, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { LoyaltyMoreActions } from '~/modules/loyalties/components/LoyaltyMoreActions';
import { DELETE_LOTTERY_MUTATION } from '@/loyalties/lotteries/graphql/mutations/mutations';
import { ILottery } from '@/loyalties/lotteries/types/lottery';
import { LotteryEditSheet } from './LotteryEditSheet';

export const LotteryMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ILottery, unknown>;
}) => {
  const lottery = cell.row.original;
  const [editOpen, setEditOpen] = useState(false);
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { t } = useTranslation('loyalty');

  const [deleteLottery, { loading }] = useMutation(DELETE_LOTTERY_MUTATION, {
    refetchQueries: ['LotteriesMain'],
  });

  const handleDelete = () => {
    if (!lottery._id) return;

    confirm({
      message: t('delete-lottery-confirm', { count: 1 }),
    }).then(() => {
      deleteLottery({ variables: { _ids: [lottery._id] } })
        .then(() => {
          toast({
            title: t('success'),
            variant: 'success',
            description: t('lotteries-deleted', { count: 1 }),
          });
        })
        .catch((e: Error) => {
          toast({
            title: t('error'),
            description: e.message,
            variant: 'destructive',
          });
        });
    });
  };

  return (
    <LoyaltyMoreActions
      editLabel={t('edit')}
      deleteLabel={t('delete')}
      deleteLoading={loading}
      onEdit={() => setEditOpen(true)}
      onDelete={handleDelete}
    >
      {editOpen && (
        <LotteryEditSheet
          lottery={lottery}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
    </LoyaltyMoreActions>
  );
};

export const lotteryMoreColumn = {
  id: 'more',
  header: () => <RecordTable.ColumnSelector />,
  cell: LotteryMoreColumnCell,
  size: 25,
};
