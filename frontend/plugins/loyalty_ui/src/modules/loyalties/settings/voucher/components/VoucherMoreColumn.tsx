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
import { useDeleteVoucher } from '../hooks/useDeleteVoucher';
import { IVoucher } from '../types/voucherTypes';

export const VoucherMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IVoucher, unknown>;
}) => {
  const { _id } = cell.row.original;
  const [, setEditVoucherId] = useQueryState('editVoucherId');
  const { removeVoucher, loading } = useDeleteVoucher();
  const { confirm } = useConfirm();
  const { toast } = useToast();

  const handleEdit = (voucherId: string) => {
    setEditVoucherId(voucherId);
  };
  const handleDelete = () => {
    if (!_id) return;

    confirm({
      message: 'Are you sure you want to delete this voucher?',
    }).then(() => {
      removeVoucher({
        variables: { _ids: [_id] },
      })
        .then(() => {
          toast({
            title: '1 voucher deleted successfully',
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

export const voucherMoreColumn = {
  id: 'more',
  cell: VoucherMoreColumnCell,
  size: 25,
};
