import { Cell } from '@tanstack/react-table';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { RecordTable } from 'erxes-ui';
import { ICovers } from '@/pos/pos-covers/types/posCover';
import { renderingCoverDetailAtom } from '@/pos/states/coverDetail';
import { Popover, Combobox, Command } from 'erxes-ui';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useRemovePosCover } from '../hooks/usePosCoverRemove';
import { useToast, useConfirm } from 'erxes-ui';
import { ApolloError } from '@apollo/client';

export const useCoverMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ICovers, unknown>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setRenderingCoverDetail = useSetAtom(renderingCoverDetailAtom);
  const { _id } = cell.row.original;
  const { removePosCover } = useRemovePosCover();
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const setOpen = (orderId: string) => {
    if (!orderId) {
      console.warn('Cover ID is undefined, cannot open cover details');
      return;
    }
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('pos_cover_id', orderId);
    setSearchParams(newSearchParams);
    setRenderingCoverDetail(true);
  };

  const handleDelete = () => {
    if (!_id) return;

 

    confirm({
      message: 'Are you sure you want to delete this pos cover?',
    }).then(() => {
      removePosCover([_id], {
        onCompleted: () => {
          toast({
            title: 'Success',
            description: '1 pos cover deleted successfully.',
          });
        },
        onError: (e: ApolloError) => {
          toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
          });
        },
      });
    });
  };
  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item
              value="edit"
              onSelect={() => setOpen(_id)}
              disabled={!_id}
            >
              <IconEdit /> Edit
            </Command.Item>
            <Command.Item
              value="delete"
              onSelect={handleDelete}
              disabled={!_id}
            >
              <IconTrash /> Delete
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const coverMoreColumn = {
  id: 'more',
  cell: useCoverMoreColumnCell,
  size: 33,
};
