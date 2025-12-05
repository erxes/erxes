import { useState } from 'react';
import { Button, Dialog, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { usePosRemove } from '../../hooks/usePosRemove';

interface PosDeleteProps {
  posId?: string;
  onDelete?: () => void;
}

const PosDelete = ({ posId, onDelete }: PosDeleteProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { posRemove, loading } = usePosRemove();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!posId) return;

    try {
      await posRemove({ variables: { _id: posId } });

      if (onDelete) {
        onDelete();
      }

      setIsDialogOpen(false);

      navigate('/sales/pos');
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete POS. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
      >
        <IconTrash className="mr-2 w-4 h-4" />
        Remove POS
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Delete POS</Dialog.Title>
            <Dialog.Description>
              Are you sure you want to delete this POS? This action cannot be
              undone.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              <IconTrash className="mr-2 w-4 h-4" />
              {loading ? 'Deleting...' : 'Delete POS'}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </>
  );
};

export default PosDelete;
