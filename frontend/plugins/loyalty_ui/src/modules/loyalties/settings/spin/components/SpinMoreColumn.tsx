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
import { useDeleteSpin } from '../hooks/useDeleteSpin';
import { ISpin } from '../types/spinTypes';

export const SpinMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ISpin, unknown>;
}) => {
  const { t } = useTranslation('loyalty');
  const { _id } = cell.row.original;
  const [, setEditSpinId] = useQueryState('editSpinId');
  const { removeSpin, loading } = useDeleteSpin();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEdit = (spinId: string) => {
    setEditSpinId(spinId);
  };

  const handleSeeSpins = () => {
    navigate(`/loyalty/spins?voucherCampaignId=${_id}`);
  };
  const handleDelete = () => {
    if (!_id) return;

    confirm({
      message: t('delete-spin-campaign-confirm'),
    }).then(() => {
      removeSpin({
        variables: { _ids: [_id] },
      })
        .then(() => {
          toast({
            title: t('spins-deleted', { count: 1 }),
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
            <Command.Item value="see-spins" onSelect={handleSeeSpins}>
              <IconTicket /> {t('see-spins')}
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

export const spinMoreColumn = {
  id: 'more',
  cell: SpinMoreColumnCell,
  size: 25,
};
