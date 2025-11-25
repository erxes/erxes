import { IconTrash } from '@tabler/icons-react';
import { useToast, Dialog, Button } from 'erxes-ui';
import { ApolloError } from '@apollo/client';
import { useRemovePos } from '@/pos/hooks/usePosRemove';
import { useState } from 'react';

interface PosDeleteProps {
  posIds: string;
  onDeleteSuccess?: () => void;
}

export const PosDelete = ({ posIds, onDeleteSuccess }: PosDeleteProps) => {
  const { removePos, loading } = useRemovePos();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const posCount = posIds.includes(',') ? posIds.split(',').length : 1;

  return (
    <>
      <Button
        variant="secondary"
        className="text-destructive"
        onClick={() => setOpen(true)}
      >
        <IconTrash />
        Delete
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content className="sm:max-w-md">
          <Dialog.Header>
            <div className="flex gap-3 items-center">
              <div className="p-2 rounded-full bg-destructive/10">
                <IconTrash size={20} className="text-destructive" />
              </div>
              <Dialog.Title className="text-lg font-bold">
                Delete POS
              </Dialog.Title>
            </div>
          </Dialog.Header>

          <div className="space-y-4">
            <div className="p-3 rounded-lg border shadow-sm bg-background">
              <p className="text-sm font-medium text-foreground">
                Are you sure you want to permanently delete the {posCount}{' '}
                selected POS?
              </p>
            </div>
          </div>

          <Dialog.Footer>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                removePos(posIds, {
                  onError: (e: ApolloError) => {
                    toast({
                      title: 'Error',
                      description: e.message,
                      variant: 'destructive',
                    });
                  },
                  onCompleted: () => {
                    toast({
                      title: 'Success',
                      description: 'POS deleted successfully.',
                    });
                    setOpen(false);
                    if (onDeleteSuccess) onDeleteSuccess();
                  },
                })
              }
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Yes, Delete'}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
