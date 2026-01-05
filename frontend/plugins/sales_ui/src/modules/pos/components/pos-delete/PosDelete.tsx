import { Button, useToast, useConfirm } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { usePosRemove } from '@/pos/hooks/usePosRemove';

interface PosDeleteProps {
  posId?: string;
  onDelete?: () => void;
}

const PosDelete = ({ posId, onDelete }: PosDeleteProps) => {
  const { posRemove } = usePosRemove();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const confirmOptions = { confirmationValue: 'delete' };

  const handleDelete = async () => {
    if (!posId) return;

    confirm({
      message: 'Are you sure you want to remove the selected?',
      options: confirmOptions,
    }).then(async () => {
      try {
        await posRemove({ variables: { _id: posId } });

        if (onDelete) {
          onDelete();
        }
        toast({
          title: 'Success',
          description: 'POS has been deleted successfully.',
          variant: 'success',
        });
        navigate('/settings/pos');
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to delete POS. Please try again.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Button variant="default" size="sm" onClick={handleDelete}>
      <IconTrash className="mr-2 w-4 h-4" />
      Remove POS
    </Button>
  );
};

export default PosDelete;
