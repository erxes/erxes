import { Cell } from '@tanstack/react-table';
import {
  Button,
  Combobox,
  Command,
  Popover,
  RecordTable,
  useConfirm,
  useToast,
  useQueryState,
} from 'erxes-ui';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useDeleteLottery } from '../hooks/useDeleteLottery';
import { ILottery } from '../types/lotteryTypes';

export const LotteryMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ILottery, unknown>;
}) => {
  const { _id } = cell.row.original;
  const [, setEditLotteryId] = useQueryState('editLotteryId');
  const { removeLottery, loading } = useDeleteLottery();
  const { confirm } = useConfirm();
  const { toast } = useToast();

  const handleEdit = (lotteryId: string) => {
    setEditLotteryId(lotteryId);
  };
  const handleDelete = () => {
    if (!_id) return;

    confirm({
      message: 'Are you sure you want to delete this lottery?',
    }).then(() => {
      removeLottery({
        variables: { _ids: [_id] },
      })
        .then(() => {
          toast({
            title: '1 lottery deleted successfully',
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
    });
  };

  return (
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
            <Command.Item value="edit" onSelect={() => handleEdit(_id)}>
              <IconEdit /> Edit
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
                Delete
              </Button>
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const lotteryMoreColumn = {
  id: 'more',
  cell: LotteryMoreColumnCell,
  size: 25,
};
