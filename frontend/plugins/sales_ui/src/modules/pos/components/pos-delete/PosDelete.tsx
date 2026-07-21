import { Button, useToast, useConfirm } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { usePosRemove } from '@/pos/hooks/usePosRemove';
import { useTranslation } from 'react-i18next';

interface PosDeleteProps {
  posId?: string;
  onDelete?: () => void;
}

const PosDelete = ({ posId, onDelete }: PosDeleteProps) => {
  const { t } = useTranslation('sales');
  const { posRemove, loading } = usePosRemove();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const confirmOptions = { confirmationValue: 'delete' };

  const handleDelete = async () => {
    if (!posId) return;

    confirm({
      message: t('confirm-remove-selected', 'Are you sure you want to remove the selected?'),
      options: confirmOptions,
    }).then(async () => {
      try {
        await posRemove({ variables: { _id: posId } });

        if (onDelete) {
          onDelete();
        }
        toast({
          title: t('success', 'Success'),
          description: t('pos-delete-success', 'POS has been deleted successfully.'),
          variant: 'success',
        });
        navigate('/settings/sales/pos');
      } catch (e: any) {
        toast({
          title: t('error', 'Error'),
          description: e.message || t('pos-delete-failed', 'Failed to delete POS. Please try again.'),
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
    >
      <IconTrash className="w-4 h-4 mr-2" />
      {loading ? t('deleting', 'Deleting...') : t('remove-pos', 'Remove POS')}
    </Button>
  );
};

export default PosDelete;
