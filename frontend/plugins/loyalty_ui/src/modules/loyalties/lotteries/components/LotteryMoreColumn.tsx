import { Cell } from '@tanstack/react-table';
import { useMutation } from '@apollo/client';
import { useState } from 'react';
import {
  Button,
  Combobox,
  Command,
  Popover,
  RecordTable,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
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
    <>
      <Popover>
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
        <Combobox.Content
          align="start"
          className="w-[280px] min-w-0 [&>button]:cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <Command>
            <Command.List>
              <Command.Item value="edit" onSelect={() => setEditOpen(true)}>
                <IconEdit /> {t('edit')}
              </Command.Item>
              <Command.Item asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  <IconTrash className="size-4" />
                  {t('delete')}
                </Button>
              </Command.Item>
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
      {editOpen && (
        <LotteryEditSheet
          lottery={lottery}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
    </>
  );
};

export const lotteryMoreColumn = {
  id: 'more',
  header: () => <RecordTable.ColumnSelector />,
  cell: LotteryMoreColumnCell,
  size: 25,
};
