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
import { IconEdit, IconTrash, IconTicket } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useDeleteVoucher } from '../hooks/useDeleteVoucher';
import { IVoucher } from '../types/voucherTypes';

export const VoucherMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IVoucher, unknown>;
}) => {
  const { t } = useTranslation('loyalty');
  const { _id } = cell.row.original;
  const [, setEditVoucherId] = useQueryState('editVoucherId');
  const { removeVoucher, loading } = useDeleteVoucher();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEdit = (voucherId: string) => {
    setEditVoucherId(voucherId);
  };

  const handleSeeVouchers = () => {
    navigate(`/loyalty/vouchers?voucherCampaignId=${_id}`);
  };
  const handleDelete = () => {
    if (!_id) return;

    confirm({
      message: t('delete-voucher-single-confirm'),
    }).then(() => {
      removeVoucher({
        variables: { _ids: [_id] },
      })
        .then(() => {
          toast({
            title: t('vouchers-deleted', { count: 1 }),
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
              <IconEdit /> {t('edit')}
            </Command.Item>
            <Command.Item value="see-vouchers" onSelect={handleSeeVouchers}>
              <IconTicket /> {t('see-vouchers')}
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
  );
};

export const voucherMoreColumn = {
  id: 'more',
  cell: VoucherMoreColumnCell,
  size: 25,
};
